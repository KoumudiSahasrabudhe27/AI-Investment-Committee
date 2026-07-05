import React from "react";
import { CheckCircle, XCircle, Award, Star, Activity, MessageSquare } from "lucide-react";

interface AgentCardProps {
  agentName: string;
  scoreLabel: string;
  scoreValue: string | number;
  ratingStatus?: string;
  bullPoints: string[];
  bearPoints: string[];
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agentName,
  scoreLabel,
  scoreValue,
  ratingStatus,
  bullPoints,
  bearPoints,
}) => {
  const getAgentIcon = () => {
    switch (agentName) {
      case "Fundamental Analyst":
        return <Award size={20} color="var(--color-primary)" />;
      case "Technical Analyst":
        return <Activity size={20} color="var(--color-accent)" />;
      case "Market News Analyst":
        return <MessageSquare size={20} color="var(--color-warning)" />;
      default:
        return <Star size={20} color="var(--text-secondary)" />;
    }
  };

  const getStatusClass = (status?: string) => {
    if (!status) return "";
    const clean = status.toLowerCase();
    if (clean.includes("buy") || clean.includes("undervalued") || clean.includes("bullish") || clean.includes("positive")) {
      return "badge-buy";
    }
    if (clean.includes("sell") || clean.includes("overvalued") || clean.includes("bearish") || clean.includes("negative")) {
      return "badge-sell";
    }
    return "badge-hold";
  };

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "100%", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {getAgentIcon()}
          <h4 style={{ fontSize: "1.1rem" }}>{agentName}</h4>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {scoreLabel}: <strong style={{ color: "var(--text-primary)" }}>{scoreValue}</strong>
          </span>
          {ratingStatus && (
            <span className={`badge ${getStatusClass(ratingStatus)}`}>
              {ratingStatus}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flex: 1 }}>
        {/* Bull points */}
        <div style={{ background: "rgba(16, 185, 129, 0.03)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.08)" }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: "bold",
            color: "var(--color-success)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "8px",
            textTransform: "uppercase"
          }}>
            <CheckCircle size={12} />
            Strengths / Catalysts
          </span>
          <ul style={{ paddingLeft: "14px", fontSize: "0.825rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "6px" }}>
            {bullPoints.slice(0, 4).map((pt, idx) => (
              <li key={idx} style={{ listStyleType: "square", paddingLeft: "2px" }}>{pt}</li>
            ))}
            {bullPoints.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>None listed</span>}
          </ul>
        </div>

        {/* Bear points */}
        <div style={{ background: "rgba(239, 68, 68, 0.03)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.08)" }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: "bold",
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "8px",
            textTransform: "uppercase"
          }}>
            <XCircle size={12} />
            Risks / Concerns
          </span>
          <ul style={{ paddingLeft: "14px", fontSize: "0.825rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "6px" }}>
            {bearPoints.slice(0, 4).map((pt, idx) => (
              <li key={idx} style={{ listStyleType: "square", paddingLeft: "2px" }}>{pt}</li>
            ))}
            {bearPoints.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>None listed</span>}
          </ul>
        </div>
      </div>
    </div>
  );
};
