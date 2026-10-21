import express from "express";
import cors from "cors";
import { config } from "./config";
import healthRouter from "./routes/health";
import webhooksRouter from "./routes/webhooks";
import transactionsRouter from "./routes/transactions";

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin) return callback(null, true);
      if (config.allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check at root
app.use("/", healthRouter);

// Webhook ingestion
app.use("/v1/webhooks", webhooksRouter);

// Transaction query (for testing)
app.use("/v1/transactions", transactionsRouter);

// ─── 404 catch-all ───────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Route not found" });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[Unhandled Error]", err.message);
    res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }
);

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`✅ Server running on port ${config.port} [${config.nodeEnv}]`);
  console.log(`   Health:       GET  http://localhost:${config.port}/`);
  console.log(`   Webhook:      POST http://localhost:${config.port}/v1/webhooks/transactions`);
  console.log(`   Query:        GET  http://localhost:${config.port}/v1/transactions/:id`);
});

export default app;
