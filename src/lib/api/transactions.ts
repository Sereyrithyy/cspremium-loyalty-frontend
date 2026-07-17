import { apiFetch, downloadWithAuth } from "../api-client";
import type { Paginated, TransactionType, TransactionWithCustomer } from "@/types";

export interface ListTransactionsParams {
  q?: string;
  type?: "all" | TransactionType;
  customerId?: string;
  page?: number;
  pageSize?: number;
}

function buildQuery(params: ListTransactionsParams): string {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.type) query.set("type", params.type);
  if (params.customerId) query.set("customerId", params.customerId);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  return query.toString();
}

export async function listTransactions(
  params: ListTransactionsParams = {}
): Promise<Paginated<TransactionWithCustomer>> {
  return apiFetch<Paginated<TransactionWithCustomer>>(`/transactions?${buildQuery(params)}`);
}

export async function exportTransactionsCsv(params: ListTransactionsParams = {}): Promise<void> {
  await downloadWithAuth(`/transactions/export/csv?${buildQuery(params)}`, "transactions.csv");
}
