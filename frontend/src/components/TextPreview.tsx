// src/components/TextPreview.tsx

"use client";

import { useState } from "react";
import { ResumeUploadResponse } from "@/types";

interface TextPreviewProps {
  resume: ResumeUploadResponse;
}

export default function TextPreview({ resume }: TextPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900 border border-green-800 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        {/* Check icon */}
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-green-400 font-semibold">Text Extracted Successfully</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">Pages</p>
          <p className="text-white font-bold text-lg">{resume.page_count}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">Words</p>
          <p className="text-white font-bold text-lg">{resume.total_words}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">Characters</p>
          <p className="text-white font-bold text-lg">{resume.total_characters}</p>
        </div>
      </div>

      {/* Text Preview */}
      <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">
            Extracted Text Preview
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-400 text-xs hover:underline"
          >
            {expanded ? "Show less" : "Show full text"}
          </button>
        </div>
        <pre className={`text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed ${!expanded ? "max-h-40 overflow-hidden relative" : ""}`}>
          {resume.extracted_text_preview}
          {!expanded && resume.extracted_text_preview.length >= 1000 && (
            <span className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-950 to-transparent" />
          )}
        </pre>
      </div>

      <p className="text-gray-500 text-xs mt-3">
        📄 {resume.filename} • Uploaded {new Date(resume.created_at).toLocaleString()}
      </p>
    </div>
  );
}