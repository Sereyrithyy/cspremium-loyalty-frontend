import { notFound } from "next/navigation";
import MemberPageClient from "./MemberPageClient";
import type { Customer, PointTransaction, Reward } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type MemberResult =
  | { status: "ok"; customer: Customer; transactions: PointTransaction[] }
  | { status: "not_found" }
  | { status: "inactive"; message: string };

async function getMember(token: string): Promise<MemberResult> {
  try {
    const res = await fetch(`${API_URL}/customer/card/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });

    if (res.status === 404) return { status: "not_found" };

    if (res.status === 403) {
      const body = (await res.json()) as { error?: { message?: string } };
      return {
        status: "inactive",
        message: body.error?.message ?? "This membership is currently inactive.",
      };
    }

    if (!res.ok) {
      console.error('API Error:', await res.text());
      throw new Error("Failed to load membership.");
    }

    const response = await res.json();
    console.log('Member API response:', response);

    if (!response || !response.data) {
      console.error('Invalid response structure:', response);
      throw new Error("Invalid response from server");
    }

    return { 
      status: "ok", 
      customer: response.data.customer, 
      transactions: response.data.transactions || [] 
    };
  } catch (error) {
    console.error('Error fetching member:', error);
    throw error;
  }
}

async function getActiveRewards(): Promise<Reward[]> {
  try {
    const res = await fetch(`${API_URL}/rewards?status=active`, { 
      cache: "no-store" 
    });
    if (!res.ok) return [];
    const response = await res.json();
    return response.data || [];
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  try {
    const { token } = await params;
    const [result, rewards] = await Promise.all([getMember(token), getActiveRewards()]);

    if (result.status === "not_found") notFound();

    if (result.status === "inactive") {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rust/40 bg-rust/10 text-rust">
            !
          </div>
          <h1 className="mt-5 font-display text-2xl text-ivory">Membership inactive</h1>
          <p className="mt-2 max-w-sm text-[14px] text-mist">{result.message}</p>
        </main>
      );
    }

    return (
      <MemberPageClient
        initialCustomer={result.customer}
        initialTransactions={result.transactions}
        initialRewards={rewards}
        token={token}
      />
    );
  } catch (error) {
    console.error('Page error:', error);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
        <div className="text-ivory">
          <h1 className="text-2xl font-display">Something went wrong</h1>
          <p className="text-mist mt-2">Please try again later</p>
        </div>
      </main>
    );
  }
}