// src/api/analytics.ts

import api from "@/lib/axios";
import {
  PlanInfo,
  HistoryResponse,
  TrendResponse,
  KeywordGapResponse,
} from "@/types";

// ───────── PLAN ─────────

export async function getPlan(): Promise<PlanInfo> {
  const response = await api.get<PlanInfo>("/plan/");
  return response.data;
}

export async function upgradeToPro(): Promise<{ message: string; plan: string }> {
  const response = await api.post("/plan/upgrade");
  return response.data;
}

export async function downgradeToFree(): Promise<{ message: string; plan: string }> {
  const response = await api.post("/plan/downgrade");
  return response.data;
}

// ───────── HISTORY ─────────

export async function getAnalysisHistory(page: number = 1, limit: number = 20): Promise<HistoryResponse> {
  const response = await api.get<HistoryResponse>("/analysis/history", {
    params: { page, limit },
  });
  return response.data;
}

// ───────── TRENDS ─────────

export async function getScoreTrends(): Promise<TrendResponse> {
  const response = await api.get<TrendResponse>("/analysis/trends");
  return response.data;
}

// ───────── KEYWORD GAP ─────────

export async function getKeywordGap(analysisId: string): Promise<KeywordGapResponse> {
  const response = await api.get<KeywordGapResponse>(`/analysis/keywords/${analysisId}`);
  return response.data;
}