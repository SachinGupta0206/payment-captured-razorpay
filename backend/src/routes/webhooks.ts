import { Router, Request, Response } from "express";
import { validateWebhookBody } from "../middleware/validateWebhook";
import { createTransactionIfNew } from "../services/transactionService";
import { scheduleProcessing } from "../services/backgroundProcessor";
import { WebhookRequestBody, WebhookAckResponse } from "../types/api";

const router = Router();

/**
 * POST /v1/webhooks/transactions
 *
 * Accepts a payment-processor webhook, acknowledges it immediately (202),
 * and dispatches background processing.
 *
 * Idempotency: if the transaction_id already exists in the DB (unique constraint),
 * the insert is silently skipped and we still return 202 so the caller doesn't retry.
 */
router.post(
  "/transactions",
  validateWebhookBody,
  async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as WebhookRequestBody;

    try {
      const inserted = await createTransactionIfNew(payload);

      if (inserted === null) {
        // Duplicate webhook — idempotent 202 with a hint in the body
        const ack: WebhookAckResponse = {
          message: "Duplicate webhook received — transaction already queued",
          transaction_id: payload.transaction_id,
        };
        res.status(202).json(ack);
        return;
      }

      // New transaction: schedule background processing (non-blocking)
      scheduleProcessing(payload);

      const ack: WebhookAckResponse = {
        message: "Webhook received — transaction queued for processing",
        transaction_id: payload.transaction_id,
      };
      res.status(202).json(ack);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      console.error("[POST /webhooks/transactions]", message);
      res.status(500).json({ error: "INTERNAL_ERROR", message });
    }
  }
);

export default router;
