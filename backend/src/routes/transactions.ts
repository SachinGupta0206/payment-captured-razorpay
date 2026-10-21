import { Router, Request, Response } from "express";
import { getTransactionById } from "../services/transactionService";

const router = Router();

/**
 * GET /v1/transactions/:transaction_id
 *
 * Query endpoint for testing — retrieves all records with the given
 * transaction_id (there should only ever be one due to idempotency).
 */
router.get("/:transaction_id", async (req: Request, res: Response): Promise<void> => {
  const { transaction_id } = req.params;

  if (!transaction_id || transaction_id.trim() === "") {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "transaction_id path parameter is required",
    });
    return;
  }

  try {
    const transactions = await getTransactionById(transaction_id);

    if (transactions.length === 0) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: `No transaction found with id: ${transaction_id}`,
      });
      return;
    }

    res.status(200).json(transactions);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[GET /transactions/:id]", message);
    res.status(500).json({ error: "INTERNAL_ERROR", message });
  }
});

export default router;
