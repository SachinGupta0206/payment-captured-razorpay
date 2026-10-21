export type TransactionStatus = "PROCESSING" | "PROCESSED" | "FAILED";

export interface Transaction {
  transaction_id: string;
  source_account: string;
  destination_account: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  created_at: string;
  processed_at: string | null;
}

export interface WebhookPayload {
  transaction_id: string;
  source_account: string;
  destination_account: string;
  amount: number;
  currency: string;
}

export interface ToastMessage {
  message: string;
  type: "success" | "error" | "info";
}
