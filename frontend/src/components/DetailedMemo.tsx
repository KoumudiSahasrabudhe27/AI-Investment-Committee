import React, { useState } from "react";
import type { CommitteeResult } from "../types";
import {
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  PieChart,
  FileText,
  Activity,
  MessageCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface DetailedMemoProps {
  result: CommitteeResult;
}

export const DetailedMemo: React.FC<DetailedMemoProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<"pm" | "fundamental" | "technical" | "news" | "risk">("pm");
  const [showRatios, setShowRatios] = useState(false);

  const { recommendation, fundamentals, technicals, news, risk } = result;
  const pmRec = recommendation;

  // Colors based on rating
  const getRatingColor = (rec: string) => {
    switch (rec.toUpperCase()) {
      case "BUY": return "var(--color-success)";
      case "SELL": return "var(--color-danger)";
      default: return "var(--color-warning)";
    }
  };

  const activeColor = getRatingColor(pmRec.recommendation);

  // Markdown Formatter (Zero-dependency implementation)
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Clean strings and sanitize HTML characters safely
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 style="margin: 16px 0 8px 0; color: #fff; font-size: 1rem;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="margin: 22px 0 10px 0; color: #fff; font-size: 1.15rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="margin: 26px 0 12px 0; color: var(--color-primary); font-size: 1.35rem;">$1</h2>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fff; font-weight: 600;">$1</strong>');

    // Bullet points
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-left: 16px; margin-bottom: 6px; list-style-type: square;">$1</li>');

    // Paragraphs
    const paragraphs = html.split('\n');
    let insideList = false;
    const processed = paragraphs.map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith('<li') || trimmed.endsWith('</li>')) {
        if (!insideList) {
          insideList = true;
          return '<ul style="margin: 10px 0; padding-left: 8px;">' + trimmed;
        }
        return trimmed;
      } else {
        if (insideList) {
          insideList = false;
          return '</ul>' + (trimmed ? `<p style="margin-bottom: 12px; color: var(--text-secondary); line-height: 1.6;">${trimmed}</p>` : '');
        }
        return trimmed ? `<p style="margin-bottom: 12px; color: var(--text-secondary); line-height: 1.6;">${trimmed}</p>` : '';
      }
    });

    let parsedHtml = processed.join('\n');
    if (insideList) {
      parsedHtml += '</ul>';
    }

    return (
      <div 
        style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
        dangerouslySetInnerHTML={{ __html: parsedHtml }} 
      />
    );
  };

  // SVG Radial Gauge for Confidence Score
  const renderConfidenceGauge = (score: number) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          {/* Base circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="8"
          />
          {/* Active progress */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={activeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "1.3rem", fontWeight: "bold", fontFamily: "var(--font-heading)", color: "#fff" }}>
            {score}%
          </span>
        </div>
      </div>
    );
  };

  const getRatiosList = () => {
    const ratios = result.fundamentals.ratios;
    if (!ratios || Object.keys(ratios).length === 0) return null;
    
    const fmt = (val: any, type: 'percent' | 'currency' | 'ratio' | 'raw' = 'raw') => {
      if (val === undefined || val === null) return "N/A";
      const num = Number(val);
      if (type === 'percent') return `${(num * 100).toFixed(2)}%`;
      if (type === 'currency') return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      if (type === 'ratio') return `${num.toFixed(2)}x`;
      return num.toLocaleString();
    };

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginTop: "12px" }}>
        <div className="ratio-item"><span>Market Cap</span><strong>{fmt(ratios.market_cap)}</strong></div>
        <div className="ratio-item"><span>P/E Ratio</span><strong>{fmt(ratios.pe_ratio, 'ratio')}</strong></div>
        <div className="ratio-item"><span>PEG Ratio</span><strong>{fmt(ratios.peg_ratio, 'ratio')}</strong></div>
        <div className="ratio-item"><span>Price to Sales</span><strong>{fmt(ratios.price_to_sales, 'ratio')}</strong></div>
        <div className="ratio-item"><span>Price to Book</span><strong>{fmt(ratios.price_to_book, 'ratio')}</strong></div>
        <div className="ratio-item"><span>Debt to Equity</span><strong>{fmt(ratios.debt_to_equity, 'ratio')}</strong></div>
        <div className="ratio-item"><span>Current Ratio</span><strong>{fmt(ratios.current_ratio, 'ratio')}</strong></div>
        <div className="ratio-item"><span>Operating Margin</span><strong>{fmt(ratios.operating_margin, 'percent')}</strong></div>
        <div className="ratio-item"><span>ROE</span><strong>{fmt(ratios.return_on_equity, 'percent')}</strong></div>
        <div className="ratio-item"><span>Dividend Yield</span><strong>{fmt(ratios.dividend_yield, 'percent')}</strong></div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Banner Recommendation Details */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--glass-border)",
        paddingBottom: "24px"
      }}>
        <div>
          <h2 style={{ fontSize: "1.85rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText color="var(--color-primary)" size={26} />
            Investment Memorandum
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Compiled by AI Investment Committee for ticker <strong>{result.request.ticker}</strong>
          </span>
        </div>

        {/* Big Recommendation Card */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          background: `rgba(${pmRec.recommendation.toUpperCase() === 'BUY' ? '16, 185, 129' : pmRec.recommendation.toUpperCase() === 'SELL' ? '239, 68, 68' : '245, 158, 11'}, 0.06)`,
          border: `1px solid ${activeColor}`,
          padding: "12px 28px",
          borderRadius: "12px",
          boxShadow: `0 0 15px 0 rgba(${pmRec.recommendation.toUpperCase() === 'BUY' ? '16, 185, 129' : pmRec.recommendation.toUpperCase() === 'SELL' ? '239, 68, 68' : '245, 158, 11'}, 0.15)`
        }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", display: "block" }}>
              Committee Action
            </span>
            <strong style={{ fontSize: "2rem", color: activeColor, letterSpacing: "0.05em", fontFamily: "var(--font-heading)" }}>
              {pmRec.recommendation}
            </strong>
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "16px" }}>
            {renderConfidenceGauge(pmRec.confidence_score)}
          </div>
        </div>
      </div>

      {/* Tabs Selectors */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--glass-border)",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "1px"
      }}>
        {[
          { id: "pm", label: "Executive Memo", icon: BookOpen },
          { id: "fundamental", label: "Fundamental Report", icon: Award },
          { id: "technical", label: "Technical View", icon: Activity },
          { id: "news", label: "News Catalysts", icon: MessageCircle },
          { id: "risk", label: "Risk Matrix", icon: ShieldCheck }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: isActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
                border: "none",
                borderBottom: `2px solid ${isActive ? "var(--color-primary)" : "transparent"}`,
                color: isActive ? "#fff" : "var(--text-secondary)",
                fontFamily: "var(--font-heading)",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }}
            >
              <Icon size={16} color={isActive ? "var(--color-primary)" : "var(--text-muted)"} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div style={{ flex: 1, minHeight: "300px" }}>
        
        {/* PM / Executive Memo Tab */}
        {activeTab === "pm" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              
              {/* Allocation panel */}
              <div className="glass-card" style={{ background: "rgba(139, 92, 246, 0.03)", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "12px" }}>
                  <PieChart size={14} />
                  Suggested Allocation Strategy
                </span>
                <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>
                  {pmRec.portfolio_allocation}
                </p>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Calculated based on investment capital <strong>${result.request.investment_amount.toLocaleString()}</strong>, investment horizon <strong>{result.request.investment_horizon}</strong>, and <strong>{result.request.risk_tolerance}</strong> risk tolerance.
                </span>
              </div>

              {/* Risk manager Verdict */}
              <div className="glass-card" style={{
                background: risk.alignment_verdict ? "rgba(16, 185, 129, 0.03)" : "rgba(239, 68, 68, 0.03)",
                border: `1px solid ${risk.alignment_verdict ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`
              }}>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  color: risk.alignment_verdict ? "var(--color-success)" : "var(--color-danger)",
                  textTransform: "uppercase",
                  marginBottom: "12px"
                }}>
                  <ShieldCheck size={14} />
                  Risk Suitability Check
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <strong style={{
                    fontSize: "1.1rem",
                    color: "#fff"
                  }}>
                    {risk.alignment_verdict ? "SUITABLE / ALIGNED" : "WARNING: RISK MISMATCH"}
                  </strong>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {risk.alignment_reasoning}
                </span>
              </div>

            </div>

            {/* Core investment Thesis */}
            <div>
              <h3 style={{ marginBottom: "12px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "6px" }}>Core Investment Thesis</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                {pmRec.investment_thesis}
              </p>
            </div>

            {/* Bull vs Bear Case breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "12px" }}>
                <h4 style={{ color: "var(--color-success)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <TrendingUp size={16} />
                  Bull Case (Upside Targets)
                </h4>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                  {pmRec.bull_case}
                </p>
              </div>

              <div style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.1)", padding: "20px", borderRadius: "12px" }}>
                <h4 style={{ color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <AlertTriangle size={16} />
                  Bear Case (Downside Invalidation)
                </h4>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                  {pmRec.bear_case}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fundamental Analyst detailed markdown report */}
        {activeTab === "fundamental" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "14px" }}>
              <button 
                onClick={() => setShowRatios(!showRatios)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "transparent",
                  border: "none",
                  color: "var(--color-primary)",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.85rem"
                }}
              >
                {showRatios ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showRatios ? "Hide Company Valuation Ratios" : "Show Company Valuation Ratios"}
              </button>
              {showRatios && getRatiosList()}
            </div>
            {renderMarkdown(fundamentals.detailed_analysis)}
          </div>
        )}

        {/* Technical Analyst detailed markdown report */}
        {activeTab === "technical" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "24px", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Estimated Support</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--color-success)" }}>
                  {technicals.support_levels.map(s => `$${s.toFixed(2)}`).join(" / ")}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Estimated Resistance</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--color-danger)" }}>
                  {technicals.resistance_levels.map(s => `$${s.toFixed(2)}`).join(" / ")}
                </strong>
              </div>
            </div>
            {renderMarkdown(technicals.detailed_analysis)}
          </div>
        )}

        {/* News Analyst detailed markdown report */}
        {activeTab === "news" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {renderMarkdown(news.detailed_summary)}
          </div>
        )}

        {/* Risk Manager detailed markdown report */}
        {activeTab === "risk" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Overall Risk Assessment</span>
                <strong style={{ fontSize: "1.1rem", color: risk.risk_rating === 'High' ? 'var(--color-danger)' : risk.risk_rating === 'Low' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {risk.risk_rating} Risk
                </strong>
              </div>
              {risk.stop_loss_recommendation && (
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Stop Loss Limit Protection</span>
                  <strong style={{ fontSize: "1.1rem", color: "#fff" }}>
                    ${risk.stop_loss_recommendation.toFixed(2)}
                  </strong>
                </div>
              )}
            </div>
            {renderMarkdown(risk.detailed_risk_analysis)}
          </div>
        )}

      </div>

      <style>{`
        .ratio-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          font-size: 0.8rem;
          border: 1px solid var(--glass-border);
        }
        .ratio-item span {
          color: var(--text-secondary);
        }
        .ratio-item strong {
          color: #fff;
        }
      `}</style>
    </div>
  );
};
