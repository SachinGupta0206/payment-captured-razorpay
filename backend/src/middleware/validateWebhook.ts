import { Request, Response, NextFunction } from "express";
import { WebhookRequestBody } from "../types/api";

const REQUIRED_FIELDS: (keyof WebhookRequestBody)[] = [
  "transaction_id",
  "source_account",
  "destination_account",
  "amount",
  "currency",
];

/**
 * Validates incoming webhook payloads before they reach the route handler.
 * Returns 400 with a descriptive error if validation fails.
 */
export function validateWebhookBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as Partial<WebhookRequestBody>;

  // Check all required fields are present
  const missing = REQUIRED_FIELDS.filter(
    (field) => body[field] === undefined || body[field] === null
  );

  if (missing.length > 0) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: `Missing required fields: ${missing.join(", ")}`,
    });
    return;
  }

  // Validate types
  if (typeof body.transaction_id !== "string" || body.transaction_id.trim() === "") {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "transaction_id must be a non-empty string",
    });
    return;
  }

  if (typeof body.amount !== "number" || body.amount <= 0) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "amount must be a positive number",
    });
    return;
  }

  if (typeof body.currency !== "string" || body.currency.trim() === "") {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "currency must be a non-empty string",
    });
    return;
  }

  next();
}
