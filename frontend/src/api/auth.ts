// src/api/auth.ts

import api from "@/lib/axios";
import { AuthResponse, LoginPayload, RegisterPayload } from "@/types";
import Cookies from "js-cookie";

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  const { access_token, refresh_token } = response.data;

  Cookies.set("access_token", access_token, { secure: true, sameSite: "strict" });
  Cookies.set("refresh_token", refresh_token, { secure: true, sameSite: "strict" });

  return response.data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  const { access_token, refresh_token } = response.data;

  Cookies.set("access_token", access_token, { secure: true, sameSite: "strict" });
  Cookies.set("refresh_token", refresh_token, { secure: true, sameSite: "strict" });

  return response.data;
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.href = "/login";
  }
}

export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}