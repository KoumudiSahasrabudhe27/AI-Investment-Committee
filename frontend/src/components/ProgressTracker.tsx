import React from "react";
import type { ProgressLog } from "../types";
import { Database, ShieldAlert, FileText, ChevronRight, Terminal } from "lucide-react";

interface ProgressTrackerProps {
  progressLogs: ProgressLog[];
  currentStep: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progressLogs, currentStep }) => {
  const steps = [
    { key: "data_fetch", label: "Market Data Fetching", icon: Database },
    { key: "analyst_phase", label: "Analyst Core Deliberations", icon: Terminal },
    { key: "risk_analysis", label: "Risk Assessment Suitability", icon: ShieldAlert },
    { key: "recommendation", label: "Portfolio Recommendation", icon: FileText }
  ];

  const getStepStatus = (stepKey: string) => {
    if (currentStep === "completed" || currentStep === "finished") return "completed";
    
    if (stepKey === "data_fetch") {
      if (currentStep === "initiating" || currentStep === "data_fetch") return "active";
      return "completed";
    }

    if (stepKey === "analyst_phase") {
      if (["fundamental_analysis", "technical_analysis", "news_analysis"].includes(currentStep)) return "active";
      if (["initiating", "data_fetch"].includes(currentStep)) return "pending";
      return "completed";
    }

    if (stepKey === "risk_analysis") {
      if (currentStep === "risk_analysis" || currentStep === "risk_complete") return "active";
      if (["initiating", "data_fetch", "fundamental_analysis", "technical_analysis", "news_analysis", "analysts_complete"].includes(currentStep)) return "pending";
      return "completed";
    }

    if (stepKey === "recommendation") {
      if (currentStep === "recommendation") return "active";
      return "pending";
    }

    return "pending";
  };

  const getLogAgentColor = (agent: string) => {
    switch (agent) {
      case "Fundamental Analyst": return "var(--color-primary)";
      case "Technical Analyst": return "var(--color-accent)";
      case "Market News Analyst": return "var(--color-warning)";
      case "Risk Manager": return "var(--color-danger)";
      case "Portfolio Manager": return "#ec4899"; // pink
      default: return "var(--text-secondary)";
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "28px", height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "1.25rem" }}>
        <Terminal size={20} color="var(--color-primary)" />
        Committee Session Live Status
      </h3>

      {/* Step Tracker Visual Line */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", padding: "10px 0" }}>
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const status = getStepStatus(s.key);
          const isActive = status === "active";
          const isCompleted = status === "completed";
          
          return (
            <React.Fragment key={s.key}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isCompleted ? "rgba(16, 185, 129, 0.15)" : isActive ? "rgba(56, 189, 248, 0.15)" : "rgba(31, 41, 55, 0.5)",
                  border: `2px solid ${isCompleted ? "var(--color-success)" : isActive ? "var(--color-primary)" : "var(--glass-border)"}`,
                  color: isCompleted ? "var(--color-success)" : isActive ? "var(--color-primary)" : "var(--text-muted)",
                  boxShadow: isActive ? "0 0 15px rgba(56, 189, 248, 0.3)" : "none",
                  transition: "all 0.3s ease",
                  zIndex: 2
                }}>
                  <Icon size={18} className={isActive ? "pulsing-icon" : ""} />
                </div>
                <span style={{
                  fontSize: "0.75rem",
                  marginTop: "8px",
                  color: isActive ? "var(--text-primary)" : isCompleted ? "var(--text-secondary)" : "var(--text-muted)",
                  fontWeight: isActive || isCompleted ? 600 : 400,
                  textAlign: "center",
                  maxWidth: "100px",
                  lineHeight: 1.2
                }}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{
                  flex: 0.5,
                  height: "2px",
                  background: isCompleted ? "var(--color-success)" : "var(--glass-border)",
                  marginTop: "21px",
                  alignSelf: "start",
                  zIndex: 1
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Terminal logs list */}
      <div style={{
        flex: 1,
        background: "rgba(0, 0, 0, 0.4)",
        borderRadius: "8px",
        padding: "16px",
        fontFamily: "monospace",
        fontSize: "0.825rem",
        overflowY: "auto",
        maxHeight: "350px",
        minHeight: "220px",
        border: "1px solid var(--glass-border)"
      }}>
        {progressLogs.length === 0 ? (
          <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px", height: "100%", justifyContent: "center" }}>
            <ChevronRight size={16} />
            Waiting to convene committee...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {progressLogs.map((log, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "6px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>[{new Date().toLocaleTimeString()}]</span>
                <span style={{ color: getLogAgentColor(log.agent), fontWeight: "bold" }}>{log.agent}:</span>
                <span style={{ color: "var(--text-primary)" }}>{log.message}</span>
              </div>
            ))}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--color-primary)",
              fontSize: "0.8rem",
              marginTop: "4px"
            }}>
              <span style={{
                width: "6px",
                height: "6px",
                backgroundColor: "var(--color-primary)",
                borderRadius: "50%",
                animation: "pulse 1s infinite alternate"
              }} />
              System streaming deliberations...
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pulsing-icon {
          animation: scalePulse 1.5s infinite ease-in-out;
        }
        @keyframes scalePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
