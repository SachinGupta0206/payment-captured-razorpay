import React, { useState } from "react";
import Header from "./components/Header";
import WebhookForm from "./components/WebhookForm";
import TransactionTable from "./components/TransactionTable";
import TransactionLookup from "./components/TransactionLookup";
import Toast from "./components/Toast";
import { ToastMessage } from "./types";
import "./styles/app.css";

const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: ToastMessage["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleWebhookSent = () => {
    // Trigger a table refresh after a new webhook is submitted
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <div className="app__grid">
          {/* Left column: form + lookup */}
          <aside className="app__sidebar">
            <WebhookForm onSuccess={handleWebhookSent} onToast={showToast} />
            <TransactionLookup onToast={showToast} />
          </aside>

          {/* Right column: live transaction table */}
          <section className="app__content">
            <TransactionTable refreshKey={refreshKey} onToast={showToast} />
          </section>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;
