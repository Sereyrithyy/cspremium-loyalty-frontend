import { apiFetch } from "../api-client";
import type { Reward, RewardStatus } from "@/types";

export interface CreateRewardInput {
  name: string;
  description?: string;
  requiredPoints: number;
  status?: RewardStatus;
}

export type UpdateRewardInput = Partial<CreateRewardInput>;

export async function listRewards(status?: RewardStatus): Promise<Reward[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<Reward[]>(`/rewards${query}`, { auth: false });
}

export async function getReward(id: string): Promise<Reward> {
  return apiFetch<Reward>(`/rewards/${id}`, { auth: false });
}

export async function createReward(input: CreateRewardInput): Promise<Reward> {
  return apiFetch<Reward>("/rewards", { method: "POST", body: input });
}

export async function updateReward(id: string, input: UpdateRewardInput): Promise<Reward> {
  return apiFetch<Reward>(`/rewards/${id}`, { method: "PUT", body: input });
}

export async function deleteReward(id: string): Promise<void> {
  return apiFetch<void>(`/rewards/${id}`, { method: "DELETE" });
}

export async function uploadRewardImage(id: string, file: File): Promise<Reward> {
  const formData = new FormData();
  formData.append("image", file);
  return apiFetch<Reward>(`/rewards/${id}/image`, { method: "POST", body: formData });
}
