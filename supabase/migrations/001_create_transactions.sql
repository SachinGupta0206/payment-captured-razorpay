-- ============================================================
-- Migration: 001_create_transactions
-- Creates the transactions table with idempotency constraint,
-- status enum, and RLS policies.
-- Run this in Supabase: SQL Editor → paste → Run
-- ============================================================

-- 1. Create the status enum (idempotent)
DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('PROCESSING', 'PROCESSED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create the transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  transaction_id      TEXT                PRIMARY KEY,   -- natural PK ensures idempotency
  source_account      TEXT                NOT NULL,
  destination_account TEXT                NOT NULL,
  amount              NUMERIC(18, 2)      NOT NULL CHECK (amount > 0),
  currency            TEXT                NOT NULL,
  status              transaction_status  NOT NULL DEFAULT 'PROCESSING',
  created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ         -- NULL while still processing
);

-- 3. Index for fast status-based lookups
CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON public.transactions (status);

-- 4. Index for time-ordered queries from the frontend
CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON public.transactions (created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS policy: backend service role bypasses RLS automatically.
--    Allow anonymous SELECT only (frontend uses the anon key for reads).
CREATE POLICY "Allow anon read" ON public.transactions
  FOR SELECT
  TO anon
  USING (true);

-- No INSERT/UPDATE policy for anon — writes go through the backend
-- which uses the service_role key (bypasses RLS entirely).

-- 7. Add a comment so future devs understand the idempotency design
COMMENT ON TABLE public.transactions IS
  'Payment transactions received via webhook. transaction_id is a natural PK
   so duplicate webhooks are silently ignored at the DB level (ON CONFLICT DO NOTHING).';
