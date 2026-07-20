// import Link from "next/link";
import { notFound } from "next/navigation";
import { MembershipCardWithDownload } from "@/components/customer/membership-card-with-download";
import { ActivityHistory } from "@/components/customer/activity-history";
import { RewardsCatalog } from "@/components/customer/rewards-catalog";
import { Card } from "@/components/ui/card";
import { formatPoints, formatCurrency } from "@/lib/utils";
import type { Customer, PointTransaction, Reward } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type MemberResult =
  | { status: "ok"; customer: Customer; transactions: PointTransaction[] }
  | { status: "not_found" }
  | { status: "inactive"; message: string };

async function getMember(token: string): Promise<MemberResult> {
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

  if (!res.ok) throw new Error("Failed to load membership.");

  const { data } = (await res.json()) as {
    data: { customer: Customer; transactions: PointTransaction[] };
  };
  return { status: "ok", customer: data.customer, transactions: data.transactions };
}

async function getActiveRewards(): Promise<Reward[]> {
  try {
    const res = await fetch(`${API_URL}/rewards?status=active`, { cache: "no-store" });
    if (!res.ok) return [];
    const { data } = (await res.json()) as { data: Reward[] };
    return data;
  } catch {
    // Rewards catalog is a nice-to-have on this page — never let it break the lookup.
    return [];
  }
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
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
        {/* <Link
          href="/"
          className="mt-6 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-ink hover:bg-gold-bright"
        >
          Back to home
        </Link> */}
      </main>
    );
  }

  const { customer, transactions } = result;

  return (
    <main className="min-h-screen bg-ink pb-24">
      <div className="mx-auto max-w-2xl px-6 pt-10">

        <div className="mt-6">
          <MembershipCardWithDownload customer={customer} />
        </div>

        {/* Stat row */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="font-display text-2xl text-ivory">{formatPoints(customer.totalPoints)}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-mist-dim">Available</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="font-display text-2xl text-emerald">{formatPoints(customer.totalEarned)}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-mist-dim">Total Earned</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="font-display text-2xl text-rust">{formatPoints(customer.totalRedeemed)}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-mist-dim">Total Redeemed</p>
          </Card>
        </div>

        <RewardsCatalog rewards={rewards} availablePoints={customer.totalPoints} />

        <ActivityHistory transactions={transactions} />

        <p className="mt-10 text-center text-[12px] text-mist-dim">
          1 point = {formatCurrency(1)} · Ask our team to add points after your next purchase.
        </p>
      </div>
    </main>
  );
}
