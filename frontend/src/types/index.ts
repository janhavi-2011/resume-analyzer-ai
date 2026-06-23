// src/types/index.ts

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}


// ... existing types ...

export interface ResumeUploadResponse {
  id: string;
  filename: string;
  file_url: string;
  page_count: number;
  total_words: number;
  total_characters: number;
  is_parseable: boolean;
  extracted_text_preview: string;
  created_at: string;
}

export interface ResumeListItem {
  id: string;
  filename: string;
  page_count: number;
  total_words: number;
  is_parseable: boolean;
  created_at: string;
}

export interface ResumeListResponse {
  resumes: ResumeListItem[];
  total: number;
}

export interface ResumeDetailResponse {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  page_count: number;
  total_words: number;
  total_characters: number;
  is_parseable: boolean;
  full_text: string;
  pages: { page_number: number; text: string }[];
  created_at: string;
}



// ... keep all existing types, add these:

export interface AnalysisRequest {
  job_description?: string | null;
}

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
}

export interface AnalysisListItem {
  id: string;
  resume_id: string;
  score: number | null;
  has_jd: boolean;
  model_used: string;
  created_at: string;
}

export interface AnalysisListResponse {
  analyses: AnalysisListItem[];
  total: number;
}

export interface AnalysisDetail {
  id: string;
  resume_id: string;
  score: number | null;
  full_text: string;
  sections: Record<string, string>;
  job_description: string | null;
  model_used: string;
  created_at: string;
}

export type SSEEvent = {
  type: "start" | "chunk" | "score" | "complete" | "error";
  content?: string;
  message?: string;
  score?: number;
  analysis_id?: string;
  sections?: Record<string, string>;
  remaining?: number;
};
// src/types/index.ts

// ... keep ALL existing types, add these at the bottom:

// ───────── PLAN ─────────

export interface PlanInfo {
  plan: string;
  plan_label: string;
  used: number;
  limit: number;
  remaining: number;
}

// ───────── HISTORY ─────────

export interface HistoryItem {
  id: string;
  resume_id: string;
  resume_filename: string;
  score: number | null;
  has_jd: boolean;
  model_used: string;
  created_at: string;
}

export interface HistoryResponse {
  analyses: HistoryItem[];
  total: number;
}

// ───────── TRENDS ─────────

export interface TrendPoint {
  date: string;
  score: number;
  resume_filename: string;
  analysis_id: string;
}

export interface TrendResponse {
  trends: TrendPoint[];
}

// ───────── KEYWORD GAP ─────────

export interface KeywordData {
  matched: string[];
  missing: string[];
  match_percentage: number | null;
  raw_text: string;
}

export interface KeywordGapResponse {
  analysis_id: string;
  resume_id: string;
  has_jd: boolean;
  keywords: KeywordData | null;
}