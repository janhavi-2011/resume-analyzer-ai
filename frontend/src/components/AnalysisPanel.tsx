// src/components/AnalysisPanel.tsx

"use client";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAnalysisStream } from "@/hooks/useAnalysisStream";
import { getUsage, getAnalysesForResume, getAnalysisDetail } from "@/api/analysis";
import { UsageInfo, AnalysisListItem, AnalysisDetail } from "@/types";
import ScoreBadge from "./ScoreBadge";
import SectionCards from "./SectionCards";

interface AnalysisPanelProps {
  resumeId: string;
}

export default function AnalysisPanel({ resumeId }: AnalysisPanelProps) {
  const [showJD, setShowJD] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<AnalysisListItem[]>([]);
  const [selectedPast, setSelectedPast] = useState<AnalysisDetail | null>(null);

  const {
    isAnalyzing,
    streamedText,
    score,
    sections,
    remaining,
    error,
    isComplete,
    analyze,
    reset,
  } = useAnalysisStream();

  // Add a useEffect inside AnalysisPanel:
  useEffect(() => {
    if (isComplete) {
      toast.success("Analysis complete!");
    }
    if (error) {
      toast.error(error, { duration: 5000 });
    }
  }, [isComplete, error]);

  // Load usage and past analyses
  useEffect(() => {
    getUsage().then(setUsage).catch(() => { });
    getAnalysesForResume(resumeId).then((data) => setPastAnalyses(data.analyses)).catch(() => { });
  }, [resumeId, isComplete]);

  const handleAnalyze = async () => {
    setSelectedPast(null);
    toast.loading("Starting AI analysis...", { id: "analysis", duration: 2000 });
    await analyze(resumeId, showJD ? jobDescription : undefined);
  };

  const handleViewPast = async (analysisId: string) => {
    try {
      const detail = await getAnalysisDetail(analysisId);
      setSelectedPast(detail);
    } catch { }
  };

  // Determine what to display
  const displayScore = selectedPast ? selectedPast.score : score;
  const displaySections = selectedPast ? selectedPast.sections : sections;
  const displayText = selectedPast ? selectedPast.full_text : streamedText;

  const isLimitReached = usage !== null && usage.remaining <= 0;

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI Analysis</h2>
        {usage && (
          <span className={`text-sm px-3 py-1 rounded-full ${usage.remaining > 3
            ? "bg-gray-800 text-gray-300"
            : usage.remaining > 0
              ? "bg-yellow-900/30 text-yellow-400"
              : "bg-red-900/30 text-red-400"
            }`}>
            {usage.remaining}/{usage.limit} analyses remaining today
          </span>
        )}
      </div>

      {/* Job Description Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowJD(!showJD)}
          className="text-sm text-blue-400 hover:underline flex items-center gap-1"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showJD ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Match against a job description?
        </button>

        {showJD && (
          <div className="mt-3">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to see how well your resume matches..."
              className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-vertical placeholder:text-gray-500"
            />
            <p className="text-gray-500 text-xs mt-1">
              Optional — AI will analyze keyword match and JD alignment
            </p>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || isLimitReached}
          className={`px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${isAnalyzing
            ? "bg-blue-800 cursor-not-allowed"
            : isLimitReached
              ? "bg-gray-700 cursor-not-allowed text-gray-400"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : isLimitReached ? (
            "Limit Reached"
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze Resume
            </>
          )}
        </button>

        {(isAnalyzing || isComplete || selectedPast) && (
          <button
            onClick={() => {
              reset();
              setSelectedPast(null);
            }}
            className="px-4 py-3 rounded-lg text-sm bg-gray-800 hover:bg-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Streaming Text Display */}
      {(isAnalyzing || (isComplete && !selectedPast)) && displayText && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${isAnalyzing ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              {isAnalyzing ? "AI is thinking..." : "Analysis Complete"}
            </span>
          </div>
          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {displayText}
            {isAnalyzing && <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5" />}
          </pre>
        </div>
      )}

      {/* Score + Section Cards (shown after completion) */}
      {(isComplete || selectedPast) && displayScore !== null && (
        <div className="space-y-6">
          {/* Score */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center">
            <ScoreBadge score={displayScore} size="lg" />
            <p className="text-gray-400 text-sm mt-3">
              {selectedPast ? "Previous Analysis" : "Resume Score"}
            </p>
            {selectedPast?.job_description && (
              <span className="text-xs text-blue-400 mt-1">• Matched against JD</span>
            )}
            {!selectedPast && showJD && jobDescription && (
              <span className="text-xs text-blue-400 mt-1">• Matched against JD</span>
            )}
          </div>

          {/* Section Cards */}
          <SectionCards sections={displaySections} />

          {/* Remaining count */}
          {remaining !== null && !selectedPast && (
            <p className="text-center text-gray-500 text-xs">
              {remaining} analyses remaining today • Powered by Gemini 2.5 Flash
            </p>
          )}
        </div>
      )}

      {/* Past Analyses */}
      {pastAnalyses.length > 0 && (
        <div className="mt-10 border-t border-gray-800 pt-6">
          <h3 className="text-lg font-semibold mb-4">Previous Analyses</h3>
          <div className="space-y-2">
            {pastAnalyses.map((analysis) => (
              <button
                key={analysis.id}
                onClick={() => handleViewPast(analysis.id)}
                className={`w-full text-left bg-gray-900 border rounded-lg p-4 flex items-center justify-between hover:border-gray-600 transition-colors ${selectedPast?.id === analysis.id ? "border-blue-500" : "border-gray-800"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-900/30 p-2 rounded">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      Score: {analysis.score ?? "—"}
                      {analysis.has_jd && (
                        <span className="text-blue-400 text-xs ml-2">• JD Match</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(analysis.created_at).toLocaleString()} • {analysis.model_used}
                    </p>
                  </div>
                </div>
                <span className="text-gray-500 text-xs">View →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}