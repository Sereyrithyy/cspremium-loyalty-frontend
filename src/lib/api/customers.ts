import { apiFetch, downloadWithAuth } from "../api-client";
import type { Customer, Paginated, PointTransaction } from "@/types";

export interface RegisterCustomerInput {
  name: string;
  phone: string;
  email?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  status?: "active" | "inactive";
  tier?: "Silver" | "Gold" | "Platinum";
}

export interface ListCustomersParams {
  q?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "createdAt" | "totalPoints";
  sortDir?: "asc" | "desc";
}

// ---------------------------------------------------------------------------
// Public — no auth
// ---------------------------------------------------------------------------

export async function registerCustomer(input: RegisterCustomerInput): Promise<Customer> {
  return apiFetch<Customer>("/customer/register", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export async function searchCustomerByPhone(phone: string): Promise<Customer> {
  return apiFetch<Customer>("/customer/search", {
    method: "POST",
    body: { phone },
    auth: false,
  });
}

export async function getCustomerByToken(
  token: string
): Promise<{ customer: Customer; transactions: PointTransaction[] }> {
  return apiFetch(`/customer/card/${encodeURIComponent(token)}`, { auth: false });
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function listCustomers(params: ListCustomersParams = {}): Promise<Paginated<Customer>> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDir) query.set("sortDir", params.sortDir);

  return apiFetch<Paginated<Customer>>(`/customers?${query.toString()}`);
}

export async function getCustomerById(
  id: string
): Promise<{ customer: Customer; transactions: PointTransaction[] }> {
  return apiFetch(`/customers/${id}`);
}

export async function createCustomer(input: RegisterCustomerInput): Promise<Customer> {
  return apiFetch<Customer>("/customers", { method: "POST", body: input });
}

export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`, { method: "PUT", body: input });
}

export async function deactivateCustomer(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}/deactivate`, { method: "PATCH" });
}

export async function reactivateCustomer(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}/reactivate`, { method: "PATCH" });
}

export async function regenerateQrToken(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}/regenerate-qr-token`, { method: "PATCH" });
}

export async function deleteCustomer(id: string): Promise<void> {
  return apiFetch<void>(`/customers/${id}`, { method: "DELETE" });
}

export async function exportCustomersCsv(
  params: Pick<ListCustomersParams, "q" | "status"> = {}
): Promise<void> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  await downloadWithAuth(`/customers/export/csv?${query.toString()}`, "customers.csv");
}
