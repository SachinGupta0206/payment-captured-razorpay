import { Transaction, WebhookPayload } from "./types";

// In dev the Vite proxy forwards /v1 to localhost:3001.
// In production VITE_API_BASE_URL is set to the Render backend URL.
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function checkHealth(): Promise<{
  status: string;
  current_time: string;
}> {
  // Use explicit backend port in dev since Vite proxy only covers /v1 routes
  const healthUrl = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL as string}/`
    : "http://localhost:3001/";
  const res = await fetch(healthUrl, { method: "GET" });
  return handleResponse(res);
}

export async function sendWebhook(
  payload: WebhookPayload,
): Promise<{ message: string; transaction_id: string }> {
  const res = await fetch(`${BASE_URL}/v1/webhooks/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getTransaction(
  transactionId: string,
): Promise<Transaction[]> {
  const res = await fetch(
    `${BASE_URL}/v1/transactions/${encodeURIComponent(transactionId)}`,
  );
  return handleResponse(res);
}
