import supabase from "../supabaseClient";
import { Transaction, TransactionStatus } from "../types/database";
import { WebhookRequestBody } from "../types/api";

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getTransactionById(
  transactionId: string,
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("transaction_id", transactionId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`DB read error: ${error.message}`);
  }

  return (data as Transaction[]) ?? [];
}

// ─── Write ───────────────────────────────────────────────────────────────────

export async function createTransactionIfNew(
  payload: WebhookRequestBody,
): Promise<Transaction | null> {
  const newRow = {
    transaction_id: payload.transaction_id,
    source_account: payload.source_account,
    destination_account: payload.destination_account,
    amount: payload.amount,
    currency: payload.currency,
    status: "PROCESSING" as TransactionStatus,
    created_at: new Date().toISOString(),
    processed_at: null,
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert(newRow as never)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`DB insert error: ${error.message}`);
  }

  return (data as Transaction) ?? null;
}

export async function markTransactionProcessed(
  transactionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update({
      status: "PROCESSED" as TransactionStatus,
      processed_at: new Date().toISOString(),
    } as never)
    .eq("transaction_id", transactionId);

  if (error) {
    throw new Error(`DB update error (processed): ${error.message}`);
  }
}

export async function markTransactionFailed(
  transactionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update({ status: "FAILED" as TransactionStatus } as never)
    .eq("transaction_id", transactionId);

  if (error) {
    console.error(
      `Failed to mark transaction ${transactionId} as FAILED:`,
      error.message,
    );
  }
}
