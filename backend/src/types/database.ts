// Auto-generated types matching the Supabase `transactions` table schema.
// Re-generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

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

// Supabase Database generic shape
export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "created_at"> & { created_at?: string };
        Update: Partial<Transaction>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      transaction_status: TransactionStatus;
    };
  };
};
