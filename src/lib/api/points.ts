import { apiFetch } from "../api-client";
import type { Customer, PointTransaction } from "@/types";

export interface AddPointsInput {
  customerId: string;
  points: number;
  reason: string;
  reference?: string;
  purchaseAmount?: number;
  notes?: string;
  date?: string;
}

export interface RedeemPointsInput {
  customerId: string;
  points: number;
  rewardId?: string;
  notes?: string;
}

interface PointsResult {
  customer: Customer;
  transaction: PointTransaction;
}

export async function addPoints(input: AddPointsInput): Promise<PointsResult> {
  return apiFetch<PointsResult>("/points/add", { method: "POST", body: input });
}

export async function redeemPoints(input: RedeemPointsInput): Promise<PointsResult> {
  return apiFetch<PointsResult>("/points/redeem", { method: "POST", body: input });
}
