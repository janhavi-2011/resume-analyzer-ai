// src/components/ResumeDropzone.tsx

"use client";
import toast from "react-hot-toast";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadResume } from "@/api/resume";
import { ResumeUploadResponse } from "@/types";

interface ResumeDropzoneProps {
  onUploadSuccess: (resume: ResumeUploadResponse) => void;
}

export default function ResumeDropzone({ onUploadSuccess }: ResumeDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      const file = acceptedFiles[0];

      if (!file) return;

      // Client-side validation
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB");
        return;
      }

      setUploading(true);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const result = await uploadResume(file);
        setProgress(100);
        clearInterval(progressInterval);
        onUploadSuccess(result);
        toast.success(`"${file.name}" uploaded and parsed successfully!`);
      } catch (err: any) {
        clearInterval(progressInterval);
        setProgress(0);
        const msg = err.response?.data?.detail || "Upload failed. Please try again.";
        setError(msg);
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? "border-blue-400 bg-blue-950/30"
            : "border-gray-700 bg-gray-900/50 hover:border-gray-500 hover:bg-gray-900"
          }
          ${uploading ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {/* Upload Icon */}
          <svg
            className={`w-12 h-12 ${isDragActive ? "text-blue-400" : "text-gray-500"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {uploading ? (
            <div className="w-full max-w-xs">
              <p className="text-sm text-gray-300 mb-2">Uploading & parsing...</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-blue-300 font-medium">Drop your PDF here...</p>
          ) : (
            <>
              <p className="text-gray-300 font-medium">
                Drag & drop your resume PDF here
              </p>
              <p className="text-gray-500 text-sm">
                or click to browse — max 5MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}