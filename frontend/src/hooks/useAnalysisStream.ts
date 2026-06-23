// src/hooks/useAnalysisStream.ts

import { useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import { SSEEvent } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UseAnalysisStreamReturn {
  isAnalyzing: boolean;
  streamedText: string;
  score: number | null;
  sections: Record<string, string>;
  analysisId: string | null;
  remaining: number | null;
  error: string;
  isComplete: boolean;
  analyze: (resumeId: string, jobDescription?: string) => Promise<void>;
  reset: () => void;
}

export function useAnalysisStream(): UseAnalysisStreamReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setStreamedText("");
    setScore(null);
    setSections({});
    setAnalysisId(null);
    setRemaining(null);
    setError("");
    setIsComplete(false);
  }, []);

  const analyze = useCallback(async (resumeId: string, jobDescription?: string) => {
    // Reset state
    setIsAnalyzing(true);
    setStreamedText("");
    setScore(null);
    setSections({});
    setAnalysisId(null);
    setRemaining(null);
    setError("");
    setIsComplete(false);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const token = Cookies.get("access_token");

      const response = await fetch(`${API_URL}/analysis/analyze/${resumeId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_description: jobDescription || null }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Analysis failed");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const event: SSEEvent = JSON.parse(data);

            switch (event.type) {
              case "chunk":
                if (event.content) {
                  setStreamedText((prev) => prev + event.content);
                }
                break;
              case "score":
                if (event.score !== undefined) {
                  setScore(event.score);
                }
                break;
              case "complete":
                if (event.sections) setSections(event.sections);
                if (event.analysis_id) setAnalysisId(event.analysis_id);
                if (event.remaining !== undefined) setRemaining(event.remaining);
                setIsComplete(true);
                break;
              case "error":
                setError(event.message || "Analysis failed");
                break;
            }
          } catch {
            // Ignore malformed JSON
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    streamedText,
    score,
    sections,
    analysisId,
    remaining,
    error,
    isComplete,
    analyze,
    reset,
  };
}
