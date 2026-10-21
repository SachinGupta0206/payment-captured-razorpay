import React, { useEffect, useState } from "react";
import { checkHealth } from "../api";
import "./Header.css";

const Header: React.FC = () => {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      checkHealth()
        .then(() => setHealthy(true))
        .catch(() => setHealthy(false));
    };
    check();
    // Re-check every 10 seconds
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header__brand">
        <img
          src="/favicon.svg"
          alt="PaymentCaptured logo"
          className="header__logo"
          width={36}
          height={36}
        />
        <h1 className="header__title">PaymentCaptured</h1>
        <span className="header__subtitle">Webhook Dashboard</span>
      </div>
      <div className="header__status">
        <span
          className={`header__pill ${healthy === null
            ? "header__pill--pending"
            : healthy
              ? "header__pill--healthy"
              : "header__pill--unhealthy"
            }`}
          role="status"
          aria-label={`Backend status: ${healthy === null ? "checking" : healthy ? "healthy" : "unreachable"}`}
        >
          <span className="header__dot" aria-hidden="true" />
          {healthy === null ? "Checking…" : healthy ? "API Online" : "API Offline"}
        </span>
      </div>
    </header>
  );
};

export default Header;
