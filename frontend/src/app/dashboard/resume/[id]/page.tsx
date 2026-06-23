// src/app/dashboard/resume/[id]/page.tsx

"use client";
import { ResumeDetailSkeleton } from "@/components/Skeleton";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getResumeById } from "@/api/resume";
import { getAnalysisDetail } from "@/api/analysis";
import { ResumeDetailResponse, AnalysisDetail } from "@/types";
import { exportAnalysisPdf } from "@/utils/exportPdf";
import Link from "next/link";
import AnalysisPanel from "@/components/AnalysisPanel";
import KeywordGapChart from "@/components/KeywordGapChart";

export default function ResumeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [resume, setResume] = useState<ResumeDetailResponse | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState<number | null>(null);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    getResumeById(id)
      .then((data) => {
        setResume(data);
        if (data.pages.length > 0) setActivePage(0);
      })
      .catch(() => setError("Resume not found"))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Load analysis from query param if present
  useEffect(() => {
    const analysisId = searchParams.get("analysis");
    if (analysisId) {
      getAnalysisDetail(analysisId)
        .then(setSelectedAnalysis)
        .catch(() => { });
    }
  }, [searchParams]);

  if (loading) {
    return <ResumeDetailSkeleton />;
  }

  if (error || !resume) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-red-400 mb-4">{error || "Resume not found"}</p>
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard" className="text-blue-400 text-sm hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">{resume.filename}</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* PDF Export Button */}
          {selectedAnalysis && (
            <button
              onClick={() => exportAnalysisPdf(selectedAnalysis, resume!.filename)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          )}
          <button
            onClick={async () => {
              try {
                const response = await fetch(resume.file_url);
                const blob = await response.blob();

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = url;

                // filename ke end me .pdf ensure karo
                const filename = resume.filename.endsWith(".pdf")
                  ? resume.filename
                  : `${resume.filename}.pdf`;

                link.download = filename;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error("Download failed", err);
              }
            }}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-xs">Pages</p>
          <p className="text-white font-bold text-xl">{resume.page_count}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-xs">Words</p>
          <p className="text-white font-bold text-xl">{resume.total_words}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-xs">Characters</p>
          <p className="text-white font-bold text-xl">{resume.total_characters}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-xs">Parseable</p>
          <p className={`font-bold text-xl ${resume.is_parseable ? "text-green-400" : "text-red-400"}`}>
            {resume.is_parseable ? "Yes" : "No"}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Extracted Text */}
        <div>
          {resume.pages.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {resume.pages.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePage(idx)}
                  className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${activePage === idx ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                >
                  Page {page.page_number}
                </button>
              ))}
              <button
                onClick={() => setActivePage(null)}
                className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${activePage === null ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
              >
                All
              </button>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">
              Extracted Text
            </h3>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-[600px] overflow-y-auto">
              {activePage !== null && resume.pages[activePage]
                ? resume.pages[activePage].text
                : resume.full_text}
            </pre>
          </div>
        </div>

        {/* Right: AI Analysis Panel */}
        <div>
          <AnalysisPanel resumeId={resume.id} />

          {/* Keyword Gap Chart (shown when an analysis is selected) */}
          {selectedAnalysis && selectedAnalysis.job_description && (
            <div className="mt-6">
              <KeywordGapChart analysisId={selectedAnalysis.id} />
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-xs mt-6">
        Uploaded on {new Date(resume.created_at).toLocaleString()}
      </p>
    </div>
  );
}