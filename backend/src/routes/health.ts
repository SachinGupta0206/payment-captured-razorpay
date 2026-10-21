import { Router, Request, Response } from "express";
import { HealthCheckResponse } from "../types/api";

const router = Router();

/**
 * GET /
 * Health check endpoint — must always respond quickly.
 */
router.get("/", (_req: Request, res: Response) => {
  const response: HealthCheckResponse = {
    status: "HEALTHY",
    current_time: new Date().toISOString(),
  };
  res.status(200).json(response);
});

export default router;
