import React, { useState } from "react";
import { getTransaction } from "../api";
import { Transaction, ToastMessage } from "../types";
import StatusBadge from "./StatusBadge";
import "./TransactionLookup.css";

interface Props {
  onToast: (message: string, type: ToastMessage["type"]) => void;
}

const TransactionLookup: React.FC<Props> = ({ onToast }) => {
  const [txnId, setTxnId] = useState("");
  const [results, setResults] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnId.trim() || loading) return;
    setLoading(true);
    setResults(null);

    try {
      const data = await getTransaction(txnId.trim());
      setResults(data);
      if (data.length === 0) {
        onToast("No transaction found with that ID", "info");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lookup failed";
      onToast(`❌ ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString() : "—";

  return (
    <div className="card lookup">
      <h2 className="card__title">Look Up Transaction</h2>
      <p className="card__desc">
        GET&nbsp;
        <code>/v1/transactions/:id</code>
      </p>

      <form onSubmit={handleLookup} className="lookup__form">
        <input
          type="text"
          className="form-input"
          placeholder="txn_abc123def456"
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          aria-label="Transaction ID to look up"
          required
        />
        <button
          type="submit"
          className={`btn btn--secondary ${loading ? "btn--loading" : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? <span className="spinner" aria-hidden="true" /> : "Look Up"}
        </button>
      </form>

      {results && results.length > 0 && (
        <dl className="lookup__result" role="region" aria-label="Transaction details">
          {results.map((t) => (
            <div key={t.transaction_id} className="lookup__entry">
              <div className="lookup__row">
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={t.status} />
                </dd>
              </div>
              <div className="lookup__row">
                <dt>ID</dt>
                <dd>
                  <code>{t.transaction_id}</code>
                </dd>
              </div>
              <div className="lookup__row">
                <dt>Amount</dt>
                <dd>
                  {t.amount} {t.currency}
                </dd>
              </div>
              <div className="lookup__row">
                <dt>From</dt>
                <dd>{t.source_account}</dd>
              </div>
              <div className="lookup__row">
                <dt>To</dt>
                <dd>{t.destination_account}</dd>
              </div>
              <div className="lookup__row">
                <dt>Created</dt>
                <dd>{formatDate(t.created_at)}</dd>
              </div>
              <div className="lookup__row">
                <dt>Processed</dt>
                <dd>{formatDate(t.processed_at)}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export default TransactionLookup;
