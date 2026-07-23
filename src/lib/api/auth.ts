import { apiFetch, setToken, clearToken } from "../api-client";
import type { AdminUser } from "@/types";

interface LoginResponse {
  user: AdminUser;
  token: string;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const result = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setToken(result.token);
  if (typeof window !== "undefined") {
    localStorage.setItem("cspremium_user", JSON.stringify(result.user));
  }
  return result.user;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("cspremium_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cspremium_token");
}

export async function fetchMe(): Promise<AdminUser> {
  const result = await apiFetch<{ user: AdminUser }>("/auth/me");
  return result.user;
}
