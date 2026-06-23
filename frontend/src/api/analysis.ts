// src/api/analysis.ts

import api from "@/lib/axios";
import { UsageInfo, AnalysisListResponse, AnalysisDetail } from "@/types";

export async function getUsage(): Promise<UsageInfo> {
  const response = await api.get<UsageInfo>("/analysis/usage");
  return response.data;
}

export async function getAnalysesForResume(resumeId: string): Promise<AnalysisListResponse> {
  const response = await api.get<AnalysisListResponse>(`/analysis/resume/${resumeId}`);
  return response.data;
}

export async function getAnalysisDetail(analysisId: string): Promise<AnalysisDetail> {
  const response = await api.get<AnalysisDetail>(`/analysis/${analysisId}`);
  return response.data;
}

export async function deleteAnalysis(analysisId: string): Promise<void> {
  await api.delete(`/analysis/${analysisId}`);
}