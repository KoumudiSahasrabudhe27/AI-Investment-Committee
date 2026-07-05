import { useState, useCallback } from "react";
import type {
UserAnalysisRequest,
CommitteeResult,
ProgressLog
} from "../types";

export const useCommitteeStream = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [result, setResult] = useState<CommitteeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async (params: UserAnalysisRequest) => {
    setLoading(true);
    setProgressLogs([]);
    setCurrentStep("initiating");
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedErr = "Failed to start analysis server stream.";
        try {
          const errObj = JSON.parse(errorText);
          parsedErr = errObj.detail || parsedErr;
        } catch {
          parsedErr = errorText || parsedErr;
        }
        throw new Error(parsedErr);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to initialize response stream reader.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Split on SSE event boundaries
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || ""; // keep remainder in buffer

        for (const part of parts) {
          if (!part.trim()) continue;
          
          const lines = part.split("\n");
          let event = "";
          let dataText = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              event = line.replace("event: ", "").trim();
            } else if (line.startsWith("data: ")) {
              dataText = line.replace("data: ", "").trim();
            }
          }

          if (event && dataText) {
            try {
              const data = JSON.parse(dataText);
              
              if (event === "progress") {
                const log = data as ProgressLog;
                setProgressLogs((prev) => [...prev, log]);
                setCurrentStep(log.step);
              } else if (event === "result") {
                setResult(data as CommitteeResult);
                setCurrentStep("completed");
              } else if (event === "error") {
                setError(data.message || "An unknown agent error occurred.");
                setLoading(false);
                return;
              }
            } catch (jsonErr) {
              console.error("Error parsing SSE JSON payload:", jsonErr, dataText);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "A networking error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    progressLogs,
    currentStep,
    result,
    error,
    startAnalysis,
  };
};
