// Request / Response shape contracts for the API

export interface WebhookRequestBody {
  transaction_id: string;
  source_account: string;
  destination_account: string;
  amount: number;
  currency: string;
}

export interface WebhookAckResponse {
  message: string;
  transaction_id: string;
}

export interface HealthCheckResponse {
  status: "HEALTHY";
  current_time: string;
}

export interface ApiError {
  error: string;
  message: string;
}
