import React, { useEffect, useState, useCallback } from "react";
import { Transaction, ToastMessage } from "../types";
import { supabase } from "../supabaseClient";
import StatusBadge from "./StatusBadge";
import "./TransactionTable.css";

interface Props {
  refreshKey: number;
  onToast: (message: string, type: ToastMessage["type"]) => void;
}

const PAGE_SIZE = 20;

const TransactionTable: React.FC<Props> = ({ refreshKey, onToast }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      if (!supabase) {
        // Supabase not configured — show empty state
        setTransactions([]);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw new Error(error.message);
      setTransactions((data as Transaction[]) ?? []);
      setLastRefresh(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load transactions";
      onToast(`❌ ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  // Fetch on mount and whenever refreshKey changes
  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions, refreshKey]);

  // Supabase real-time subscription — updates status without a full reload
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("transactions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTransactions((prev) => [payload.new as Transaction, ...prev].slice(0, PAGE_SIZE));
          } else if (payload.eventType === "UPDATE") {
            setTransactions((prev) =>
              prev.map((t) =>
                t.transaction_id === (payload.new as Transaction).transaction_id
                  ? (payload.new as Transaction)
                  : t
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return <span className="table__null">—</span>;
    const d = new Date(iso);
    return (
      <time dateTime={iso} title={d.toISOString()}>
        {d.toLocaleDateString()} {d.toLocaleTimeString()}
      </time>
    );
  };

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="card table-card">
      <div className="table-card__header">
        <div>
          <h2 className="card__title">Transactions</h2>
          <p className="card__desc">
            {supabase
              ? "Live via Supabase Realtime · last 20 records"
              : "Configure VITE_SUPABASE_* env vars to enable live data"}
          </p>
        </div>
        <div className="table-card__actions">
          <span className="table-card__timestamp">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            className="btn btn--ghost"
            onClick={() => void fetchTransactions()}
            disabled={loading}
            aria-label="Refresh transactions"
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : "↻ Refresh"}
          </button>
        </div>
      </div>

      {!supabase ? (
        <div className="table-card__empty">
          <p>
            Set <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code> file
            to see live transactions here.
          </p>
        </div>
      ) : loading && transactions.length === 0 ? (
        <div className="table-card__loading" role="status" aria-label="Loading transactions">
          <span className="spinner spinner--lg" aria-hidden="true" />
          <span>Loading transactions…</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="table-card__empty">
          <p>No transactions yet. Send a webhook to get started.</p>
        </div>
      ) : (
        <div className="table-wrapper" role="region" aria-label="Transactions list" tabIndex={0}>
          <table className="table" aria-label="Transactions">
            <thead>
              <tr>
                <th scope="col">Transaction ID</th>
                <th scope="col">From</th>
                <th scope="col">To</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col">Processed</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transaction_id} className={`table__row table__row--${t.status.toLowerCase()}`}>
                  <td>
                    <code className="table__id">{t.transaction_id}</code>
                  </td>
                  <td>{t.source_account}</td>
                  <td>{t.destination_account}</td>
                  <td className="table__amount">
                    {formatAmount(t.amount, t.currency)}
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>{formatDate(t.created_at)}</td>
                  <td>{formatDate(t.processed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
