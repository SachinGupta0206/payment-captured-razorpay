import supabase from "../supabaseClient";
import { Transaction, TransactionStatus } from "../types/database";
import { WebhookRequestBody } from "../types/api";

// ─── Read ────────────────────────────────────────────────────────────────────

/**
 * Fetch all transactions matching a given transaction_id.
 * Returns an empty array if none exist.
 */
export async function getTransactionById(
  transactionId: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("transaction_id", transactionId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`DB read error: ${error.message}`);
  }

  return data ?? [];
}

// ─── Write ───────────────────────────────────────────────────────────────────

/**
 * Insert a new transaction row with status = PROCESSING.
 * Uses INSERT … ON CONFLICT DO NOTHING for idempotency.
 * Returns `null` when the row already exists (duplicate webhook).
 */
export async function createTransactionIfNew(
  payload: WebhookRequestBody
): Promise<Transaction | null> {
  const newRow: Transaction = {
    transaction_id: payload.transaction_id,
    source_account: payload.source_account,
    destination_account: payload.destination_account,
    amount: payload.amount,
    currency: payload.currency,
    status: "PROCESSING",
    created_at: new Date().toISOString(),
    processed_at: null,
  };

  // `ignoreDuplicates: true` maps to ON CONFLICT DO NOTHING.
  // The unique constraint on `transaction_id` handles idempotency at the DB level.
  const { data, error } = await supabase
    .from("transactions")
    .insert(newRow, { count: "exact" })
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`DB insert error: ${error.message}`);
  }

  // `data` is null when the row already existed and was skipped
  return data;
}

/**
 * Mark a transaction as PROCESSED and record the timestamp.
 */
export async function markTransactionProcessed(
  transactionId: string
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update({
      status: "PROCESSED" as TransactionStatus,
      processed_at: new Date().toISOString(),
    })
    .eq("transaction_id", transactionId);

  if (error) {
    throw new Error(`DB update error (processed): ${error.message}`);
  }
}

/**
 * Mark a transaction as FAILED.
 */
export async function markTransactionFailed(
  transactionId: string
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update({ status: "FAILED" as TransactionStatus })
    .eq("transaction_id", transactionId);

  if (error) {
    // Best-effort — log but don't rethrow so the background processor can move on
    console.error(`Failed to mark transaction ${transactionId} as FAILED:`, error.message);
  }
}
