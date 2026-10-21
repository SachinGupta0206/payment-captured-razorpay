import React, { useState } from "react";
import { sendWebhook } from "../api";
import { WebhookPayload, ToastMessage } from "../types";
import "./WebhookForm.css";

interface Props {
  onSuccess: () => void;
  onToast: (message: string, type: ToastMessage["type"]) => void;
}

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "SGD", "AED"];

function generateTxnId(): string {
  return `txn_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

const defaultForm: WebhookPayload = {
  transaction_id: generateTxnId(),
  source_account: "acc_user_789",
  destination_account: "acc_merchant_456",
  amount: 1500,
  currency: "INR",
};

const WebhookForm: React.FC<Props> = ({ onSuccess, onToast }) => {
  const [form, setForm] = useState<WebhookPayload>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleRandomId = () => {
    setForm((prev) => ({ ...prev, transaction_id: generateTxnId() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setLastResponse(null);

    try {
      const res = await sendWebhook(form);
      setLastResponse(res.message);
      onToast(`✅ ${res.message}`, "success");
      onSuccess();
      // Generate a fresh ID for the next submission
      setForm((prev) => ({ ...prev, transaction_id: generateTxnId() }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      onToast(`❌ ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card webhook-form">
      <h2 className="card__title">Send Test Webhook</h2>
      <p className="card__desc">
        POST&nbsp;
        <code>/v1/webhooks/transactions</code>
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="transaction_id" className="form-label">
            Transaction ID
          </label>
          <div className="form-row">
            <input
              id="transaction_id"
              name="transaction_id"
              type="text"
              className="form-input"
              value={form.transaction_id}
              onChange={handleChange}
              required
              aria-describedby="txn-hint"
            />
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              onClick={handleRandomId}
              title="Generate new ID"
              aria-label="Generate new transaction ID"
            >
              🔀
            </button>
          </div>
          <span id="txn-hint" className="form-hint">
            Re-submit the same ID to test idempotency
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="source_account" className="form-label">
            Source Account
          </label>
          <input
            id="source_account"
            name="source_account"
            type="text"
            className="form-input"
            value={form.source_account}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination_account" className="form-label">
            Destination Account
          </label>
          <input
            id="destination_account"
            name="destination_account"
            type="text"
            className="form-input"
            value={form.destination_account}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row form-row--half">
          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              className="form-input"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="currency" className="form-label">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              className="form-input form-select"
              value={form.currency}
              onChange={handleChange}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className={`btn btn--primary btn--full ${loading ? "btn--loading" : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send Webhook"
          )}
        </button>
      </form>

      {lastResponse && (
        <p className="webhook-form__response" role="status">
          {lastResponse}
        </p>
      )}
    </div>
  );
};

export default WebhookForm;
