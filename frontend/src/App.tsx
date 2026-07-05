import { useCommitteeStream } from "./hooks/useCommitteeStream";
import { AnalysisForm } from "./components/AnalysisForm";
import { ProgressTracker } from "./components/ProgressTracker";
import { AgentCard } from "./components/AgentCard";
import { ValuationChart } from "./components/ValuationChart";
import { DetailedMemo } from "./components/DetailedMemo";
import { AlertCircle, Brain, RefreshCw, BarChart2 } from "lucide-react";

function App() {
  const {
    loading,
    progressLogs,
    currentStep,
    result,
    error,
    startAnalysis,
  } = useCommitteeStream();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-container">
          <div className="logo-glow" />
          <Brain size={24} color="var(--color-primary)" />
          <h1 className="logo-text">AI Investment Committee</h1>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="badge" style={{ background: "rgba(56, 189, 248, 0.1)", color: "var(--color-primary)", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
            Gemini 1.5 Powered
          </span>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid-2col">
        {/* Sidebar Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AnalysisForm onSubmit={startAnalysis} loading={loading} />
          
          {(loading || progressLogs.length > 0) && (
            <ProgressTracker progressLogs={progressLogs} currentStep={currentStep} />
          )}

          {error && (
            <div className="glass-panel" style={{
              padding: "20px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.05)",
              display: "flex",
              gap: "12px"
            }}>
              <AlertCircle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#fff", display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>Deliberation Error</strong>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Panel View */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Default Landing Page if no session started */}
          {!loading && !result && !error && (
            <div className="glass-panel" style={{
              padding: "60px 40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "20px",
              minHeight: "450px"
            }}>
              <div style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "rgba(56, 189, 248, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.15)",
                marginBottom: "10px"
              }}>
                <BarChart2 size={32} color="var(--color-primary)" />
              </div>
              <h2 style={{ fontSize: "1.75rem", fontFamily: "var(--font-heading)" }}>Convene the Investment Committee</h2>
              <p style={{ color: "var(--text-secondary)", maxWidth: "520px", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Analyze public equities using specialized, collaborative AI agents. Provide a stock ticker and capital constraints, and watch the agents retrieve data, reason, debate, and compile an investment memo in real-time.
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                width: "100%",
                maxWidth: "600px",
                marginTop: "20px"
              }}>
                <div className="glass-card" style={{ fontSize: "0.8rem", textAlign: "left", padding: "16px" }}>
                  <strong style={{ color: "var(--color-primary)", display: "block", marginBottom: "4px" }}>1. Data Retrieval</strong>
                  Scrapes fundamentals, pricing metrics, and news from yfinance.
                </div>
                <div className="glass-card" style={{ fontSize: "0.8rem", textAlign: "left", padding: "16px" }}>
                  <strong style={{ color: "var(--color-accent)", display: "block", marginBottom: "4px" }}>2. Multi-Agent Audit</strong>
                  Agents review chart patterns, valuations, catalysts, and portfolio risk.
                </div>
                <div className="glass-card" style={{ fontSize: "0.8rem", textAlign: "left", padding: "16px" }}>
                  <strong style={{ color: "var(--color-success)", display: "block", marginBottom: "4px" }}>3. Actionable Memo</strong>
                  Outputs recommendations, allocation suggestion, and stop-loss logic.
                </div>
              </div>
            </div>
          )}

          {/* Loading Session View (if result not yet generated) */}
          {loading && !result && (
            <div className="glass-panel animate-pulse" style={{
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              minHeight: "450px"
            }}>
              <RefreshCw size={40} className="spin-animation" color="var(--color-primary)" />
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1.25rem", color: "#fff", marginBottom: "8px" }}>Deliberations in Progress</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "400px" }}>
                  The committee members are currently evaluating the stock ticker. Please review the live logs in the panel.
                </p>
              </div>
              <style>{`
                .spin-animation {
                  animation: spin 2s linear infinite;
                }
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Result view (Investment Memo dashboard) */}
          {result && (
            <>
              {/* Technical Chart */}
              {result.technicals.chart_data && (
                <ValuationChart
                  chartData={result.technicals.chart_data || []}
                  ticker={result.request.ticker}
                  currentPrice={result.technicals.current_price || 0}
                />
              )}

              {/* Committee Members Highlights Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <AgentCard
                  agentName="Fundamental Analyst"
                  scoreLabel="Valuation Score"
                  scoreValue={`${result.fundamentals.fundamental_score}/10`}
                  ratingStatus={result.fundamentals.valuation_status}
                  bullPoints={result.fundamentals.bull_points}
                  bearPoints={result.fundamentals.bear_points}
                />
                <AgentCard
                  agentName="Technical Analyst"
                  scoreLabel="Momentum Score"
                  scoreValue={`${result.technicals.momentum_score}/10`}
                  ratingStatus={result.technicals.technical_trend}
                  bullPoints={result.fundamentals.bull_points} // fallback/mix helper
                  bearPoints={result.fundamentals.bear_points}
                />
                <AgentCard
                  agentName="Market News Analyst"
                  scoreLabel="Sentiment Score"
                  scoreValue={`${result.news.sentiment_score}/10`}
                  ratingStatus={result.news.news_sentiment}
                  bullPoints={result.news.key_catalysts}
                  bearPoints={result.news.market_concerns}
                />
              </div>

              {/* Detailed Consolidated Investment Memo */}
              <DetailedMemo result={result} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
