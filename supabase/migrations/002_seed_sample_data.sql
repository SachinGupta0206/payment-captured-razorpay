-- ============================================================
-- Migration: 002_seed_sample_data  (OPTIONAL — dev only)
-- Inserts a few sample rows so the frontend has data on first load.
-- Run ONLY in development / staging, never in production.
-- ============================================================

INSERT INTO public.transactions
  (transaction_id, source_account, destination_account, amount, currency, status, created_at, processed_at)
VALUES
  ('txn_sample_001', 'acc_user_001', 'acc_merchant_001', 1500.00, 'INR',  'PROCESSED',  NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 59 minutes 30 seconds'),
  ('txn_sample_002', 'acc_user_002', 'acc_merchant_002',  250.75, 'USD',  'PROCESSED',  NOW() - INTERVAL '1 hour',  NOW() - INTERVAL '59 minutes 30 seconds'),
  ('txn_sample_003', 'acc_user_003', 'acc_merchant_001',  999.00, 'INR',  'PROCESSING', NOW() - INTERVAL '10 seconds', NULL),
  ('txn_sample_004', 'acc_user_001', 'acc_merchant_003',   50.00, 'EUR',  'FAILED',     NOW() - INTERVAL '3 hours', NULL)
ON CONFLICT (transaction_id) DO NOTHING;
