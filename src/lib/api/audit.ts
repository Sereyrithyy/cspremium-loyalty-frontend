import { apiFetch } from "../api-client";
import type { AuditLogEntry, Paginated } from "@/types";

export async function listAuditLog(page = 1, pageSize = 20): Promise<Paginated<AuditLogEntry>> {
  return apiFetch<Paginated<AuditLogEntry>>(`/audit-log?page=${page}&pageSize=${pageSize}`);
}
