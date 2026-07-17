import { apiFetch } from "../api-client";
import type { DashboardData } from "@/types";

export async function getDashboard(): Promise<DashboardData> {
  return apiFetch<DashboardData>("/dashboard");
}
