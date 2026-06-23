// src/api/resume.ts

import api from "@/lib/axios";
import {
  ResumeUploadResponse,
  ResumeListResponse,
  ResumeDetailResponse,
} from "@/types";

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ResumeUploadResponse>("/resumes/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getResumes(page: number = 1, limit: number = 10): Promise<ResumeListResponse> {
  const response = await api.get<ResumeListResponse>("/resumes/", {
    params: { page, limit },
  });
  return response.data;
}

export async function getResumeById(id: string): Promise<ResumeDetailResponse> {
  const response = await api.get<ResumeDetailResponse>(`/resumes/${id}`);
  return response.data;
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete(`/resumes/${id}`);
}