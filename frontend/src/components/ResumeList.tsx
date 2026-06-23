// src/components/ResumeList.tsx

"use client";

import { useState, useEffect } from "react";
import { getResumes, deleteResume } from "@/api/resume";
import { ResumeListItem } from "@/types";
import Link from "next/link";

export default function ResumeList() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await getResumes();
      setResumes(data.resumes);
    } catch {
      setError("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete resume");
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-8">Loading resumes...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 rounded text-sm">
        {error}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No resumes uploaded yet. Upload your first one above!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">
        Your Resumes ({resumes.length})
      </h3>

      {resumes.map((resume) => (
        <div
          key={resume.id}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* PDF Icon */}
            <div className="bg-red-900/50 p-2 rounded">
              <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                <path d="M8 12h8v1H8zm0 2h8v1H8zm0 2h5v1H8z" />
              </svg>
            </div>

            <div>
              <p className="text-white font-medium text-sm">{resume.filename}</p>
              <p className="text-gray-500 text-xs">
                {resume.page_count} page{resume.page_count !== 1 ? "s" : ""} • {resume.total_words} words •{" "}
                {new Date(resume.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/resume/${resume.id}`}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-medium"
            >
              View
            </Link>
            <button
              onClick={() => handleDelete(resume.id)}
              className="bg-gray-800 hover:bg-red-600 px-3 py-1.5 rounded text-xs font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}