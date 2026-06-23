// src/components/AnalysisHistory.tsx

"use client";

import { useEffect, useState } from "react";
import { getAnalysisHistory } from "@/api/analytics";
import { HistoryItem } from "@/types";
import Link from "next/link";

export default function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAnalysisHistory(page, 10)
      .then((data) => {
        setAnalyses(data.analyses);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / 10);

  const getScoreColor = (score: number) => {
    if (score >= 81) return "text-green-400";
    if (score >= 61) return "text-yellow-400";
    if (score >= 41) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 81) return "bg-green-900/20 border-green-800";
    if (score >= 61) return "bg-yellow-900/20 border-yellow-800";
    if (score >= 41) return "bg-orange-900/20 border-orange-800";
    return "bg-red-900/20 border-red-800";
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400 text-center">Loading history...</p>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500">No analyses yet. Analyze a resume to see your history!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Analysis History</h3>
        <span className="text-gray-400 text-sm">{total} total</span>
      </div>

      <div className="space-y-3">
        {analyses.map((analysis) => (
          <Link
            key={analysis.id}
            href={`/dashboard/resume/${analysis.resume_id}?analysis=${analysis.id}`}
            className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Score Badge */}
                {analysis.score !== null ? (
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${getScoreBg(analysis.score)}`}>
                    <span className={`font-bold text-sm ${getScoreColor(analysis.score)}`}>
                      {analysis.score}
                    </span>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-gray-700 bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">—</span>
                  </div>
                )}

                <div>
                  <p className="text-white text-sm font-medium">{analysis.resume_filename}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-gray-500 text-xs">
                      {new Date(analysis.created_at).toLocaleDateString()} at{" "}
                      {new Date(analysis.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {analysis.has_jd && (
                      <span className="bg-blue-900/30 text-blue-400 text-[10px] px-1.5 py-0.5 rounded">
                        JD Match
                      </span>
                    )}
                    <span className="text-gray-600 text-[10px]">{analysis.model_used}</span>
                  </div>
                </div>
              </div>

              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}