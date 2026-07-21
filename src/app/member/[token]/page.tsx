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

// Tier configuration
const TIERS = {
  standard: {
    name: "Standard",
    threshold: 0,
    nextTier: "Gold",
    nextThreshold: 500,
    color: "from-gray-300/20 to-gray-300/5 border-gray-400/30 text-gray-300",
    progressColor: "bg-gray-400",
  },
  gold: {
    name: "Gold",
    threshold: 500,
    nextTier: "Vip",
    nextThreshold: 1000,
    color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
    progressColor: "bg-yellow-500",
  },
  vip: {
    name: "Vip",
    threshold: 1000,
    nextTier: null,
    nextThreshold: null,
    color: "from-blue-400/20 to-blue-400/5 border-blue-400/30 text-blue-300",
    progressColor: "bg-blue-400",
  }
} as const;

type TierKey = keyof typeof TIERS;

// IMPORTANT: Tier is based on totalEarned, NOT totalPoints
function getTier(totalEarned: number): TierKey {
  if (totalEarned >= 1000) return "vip";
  if (totalEarned >= 500) return "gold";
  return "standard";
}

function getTierInfo(totalEarned: number) {
  const tierKey = getTier(totalEarned);
  const tier = TIERS[tierKey];
  
  const progress = tier.nextThreshold 
    ? ((totalEarned - tier.threshold) / (tier.nextThreshold - tier.threshold)) * 100
    : 100;
  
  return {
    currentTier: tierKey,
    ...tier,
    progress: Math.min(Math.max(progress, 0), 100),
    pointsNeeded: tier.nextThreshold ? tier.nextThreshold - totalEarned : 0
  };
}

// Tier Progress Component
function TierProgress({ totalEarned }: { totalEarned: number }) {
  const tierInfo = getTierInfo(totalEarned);
  
  // Extract color classes for the card
  const [gradientFrom, gradientTo, border, textColor] = tierInfo.color.split(' ');
  
  return (
    <Card className={`p-5 bg-linear-to-r ${gradientFrom} ${gradientTo} border ${border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Current Tier</p>
          <p className={`font-display text-2xl ${textColor}`}>
            {tierInfo.name}
          </p>
        </div>
        {tierInfo.nextTier && (
          <div className="text-right">
            <p className="text-sm text-white/50">Next Tier</p>
            <p className="font-display text-xl text-white/80">
              {tierInfo.nextTier}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>{tierInfo.name}</span>
          {tierInfo.nextTier && <span>{tierInfo.nextTier}</span>}
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${tierInfo.progressColor}`}
            style={{ width: `${tierInfo.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/50 mt-1">
          <span>{formatPoints(tierInfo.threshold)}</span>
          {tierInfo.nextThreshold ? (
            <span>{formatPoints(tierInfo.nextThreshold)}</span>
          ) : (
            <span className="text-emerald">MAX LEVEL</span>
          )}
        </div>
      </div>
      
      <p className="text-xs text-white/50 mt-2">
        {tierInfo.pointsNeeded} more points needed
      </p>
      
      {tierInfo.currentTier === "vip" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-blue-300">
          <span>👑</span>
          <span>{"You've reached the highest tier!"}</span>
        </div>
      )}
    </Card>
  );
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

        {/* Tier Progress - based on totalEarned */}
        <div className="mt-6">
          <TierProgress totalEarned={customer.totalEarned} />
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