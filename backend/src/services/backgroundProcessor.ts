import { WebhookRequestBody } from "../types/api";
import {
  markTransactionProcessed,
  markTransactionFailed,
} from "./transactionService";

const PROCESSING_DELAY_MS = 30_000; // 30 seconds — simulates external API call

/**
 * Schedules background processing for a transaction.
 *
 * Design notes:
 * - We intentionally use setTimeout (in-process queue) to keep the
 *   architecture simple and free-tier friendly. For production, replace
 *   with a proper message queue (SQS, BullMQ, etc.).
 * - The function returns immediately so the HTTP handler can respond with 202.
 * - Errors inside the background task are caught and stored as FAILED so
 *   they don't silently disappear.
 */
export function scheduleProcessing(payload: WebhookRequestBody): void {
  const { transaction_id } = payload;

  console.log(
    `[BG] Scheduled processing for ${transaction_id} in ${PROCESSING_DELAY_MS / 1000}s`
  );

  setTimeout(async () => {
    try {
      console.log(`[BG] Processing transaction ${transaction_id} …`);

      // Simulate work (external API call, validation, ledger update, etc.)
      await simulateExternalApiCall(payload);

      await markTransactionProcessed(transaction_id);
      console.log(`[BG] Transaction ${transaction_id} → PROCESSED`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[BG] Transaction ${transaction_id} failed: ${message}`);
      await markTransactionFailed(transaction_id);
    }
  }, PROCESSING_DELAY_MS);
}

/**
 * Placeholder for any real external-API work.
 * Swap this out for actual business logic during the interview.
 */
async function simulateExternalApiCall(
  payload: WebhookRequestBody
): Promise<void> {
  // Validation rules you might add here:
  // - Verify source_account exists
  // - Verify destination_account exists
  // - Check for sufficient funds
  // - Call a payment gateway confirmation API
  console.log(
    `[BG] Simulating external API call for amount ${payload.amount} ${payload.currency}`
  );
  // No additional delay needed — the setTimeout above already waited 30 s
}
