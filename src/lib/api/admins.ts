import { apiFetch } from "../api-client";
import type { AdminAccount } from "@/types";

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

export async function listAdmins(): Promise<AdminAccount[]> {
  return apiFetch<AdminAccount[]>("/admins");
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminAccount> {
  return apiFetch<AdminAccount>("/admins", { method: "POST", body: input });
}

export async function deleteAdmin(id: string): Promise<void> {
  return apiFetch<void>(`/admins/${id}`, { method: "DELETE" });
}
