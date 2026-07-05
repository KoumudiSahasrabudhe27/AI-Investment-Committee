import React, { useState } from "react";
import type { UserAnalysisRequest } from "../types";
import { Play, TrendingUp, AlertTriangle } from "lucide-react";

interface AnalysisFormProps {
  onSubmit: (params: UserAnalysisRequest) => void;
  loading: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ onSubmit, loading }) => {
  const [ticker, setTicker] = useState("");
  const [amount, setAmount] = useState("10000");
  const [horizon, setHorizon] = useState("Long");
  const [risk, setRisk] = useState("Medium");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const tickerClean = ticker.trim().toUpperCase();
    if (!tickerClean) {
      setValidationError("Please enter a stock ticker symbol.");
      return;
    }
    if (!/^[A-Z0-9.-]{1,10}$/.test(tickerClean)) {
      setValidationError("Invalid ticker format. (Use letters, numbers, dots, or dashes).");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setValidationError("Please enter a valid investment amount greater than 0.");
      return;
    }

    onSubmit({
      ticker: tickerClean,
      investment_amount: amountNum,
      investment_horizon: horizon,
      risk_tolerance: risk,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel pulse-border" style={{ padding: "28px" }}>
      <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "1.25rem" }}>
        <TrendingUp size={20} color="var(--color-primary)" />
        Committee Setup
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label htmlFor="ticker">Stock Ticker</label>
          <input
            id="ticker"
            type="text"
            placeholder="e.g. TSLA, NVDA, AAPL"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="amount">Investment Capital ($)</label>
          <input
            id="amount"
            type="number"
            placeholder="Capital in USD"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="horizon">Investment Horizon</label>
          <select
            id="horizon"
            value={horizon}
            onChange={(e) => setHorizon(e.target.value)}
            disabled={loading}
          >
            <option value="Short">Short Term (&lt; 1 Year)</option>
            <option value="Medium">Medium Term (1 - 3 Years)</option>
            <option value="Long">Long Term (3+ Years)</option>
          </select>
        </div>

        <div>
          <label htmlFor="risk">Risk Tolerance</label>
          <select
            id="risk"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            disabled={loading}
          >
            <option value="Low">Low Risk (Capital Preservation)</option>
            <option value="Medium">Medium Risk (Balanced Growth)</option>
            <option value="High">High Risk (Aggressive Growth)</option>
          </select>
        </div>

        {validationError && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-danger)",
            fontSize: "0.875rem",
            background: "rgba(239, 68, 68, 0.08)",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            <AlertTriangle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: "100%", marginTop: "10px" }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{
                width: "18px",
                height: "18px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }} />
              Deliberating...
            </>
          ) : (
            <>
              <Play size={16} fill="#fff" />
              Convene Committee
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
};
