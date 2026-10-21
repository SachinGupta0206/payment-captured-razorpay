import React, { useEffect, useState } from "react";
import { ToastMessage } from "../types";
import "./Toast.css";

interface Props {
  message: string;
  type: ToastMessage["type"];
  onClose: () => void;
}

const Toast: React.FC<Props> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // wait for exit animation
  };

  return (
    <div
      className={`toast toast--${type} ${visible ? "toast--visible" : ""}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
