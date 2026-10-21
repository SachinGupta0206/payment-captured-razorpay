import React from "react";
import { TransactionStatus } from "../types";
import "./StatusBadge.css";

interface Props {
  status: TransactionStatus;
}

const STATUS_LABELS: Record<TransactionStatus, string> = {
  PROCESSING: "Processing",
  PROCESSED: "Processed",
  FAILED: "Failed",
};

const StatusBadge: React.FC<Props> = ({ status }) => {
  return (
    <span
      className={`status-badge status-badge--${status.toLowerCase()}`}
      role="img"
      aria-label={`Status: ${STATUS_LABELS[status]}`}
    >
      {status === "PROCESSING" && (
        <span className="status-badge__spinner" aria-hidden="true" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
};

export default StatusBadge;
