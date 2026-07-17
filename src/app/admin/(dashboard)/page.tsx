"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { StatCard } from "@/components/admin/stat-card";
import { PointsChart, NewMembersChart } from "@/components/admin/dashboard-charts";
import { Card, Badge } from "@/components/ui/card";
import { LoadingBlock, ErrorBlock } from "@/components/ui/loading";
import { Users, Coins, Gift, Wallet } from "lucide-react";
import { getDashboard } from "@/lib/api/dashboard";
import { ApiClientError } from "@/lib/api-client";
import { formatPoints, formatDate } from "@/lib/utils";
import type { DashboardData, TransactionType } from "@/types";

const typeTone: Record<TransactionType, "emerald" | "rust" | "gold"> = {
  earn: "emerald",
  redeem: "rust",
  adjustment: "gold",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((d) => !cancelled && setData(d))
      .catch((err) =>
        !cancelled && setError(err instanceof ApiClientError ? err.message : "Failed to load dashboard.")
      );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <AdminTopbar title="Dashboard" subtitle="Overview of the loyalty program" />

      {error && <ErrorBlock message={error} />}
      {!error && !data && <LoadingBlock label="Loading dashboard…" />}

      {data && (
        <div className="space-y-6 px-6 py-6 md:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Members" value={formatPoints(data.stats.totalMembers)} icon={Users} tone="gold" />
            <StatCard label="Total Points Issued" value={formatPoints(data.stats.totalPointsIssued)} icon={Coins} tone="emerald" />
            <StatCard label="Total Redeemed" value={formatPoints(data.stats.totalRedeemed)} icon={Gift} tone="rust" />
            <StatCard label="Total Active Points" value={formatPoints(data.stats.totalActivePoints)} icon={Wallet} tone="gold" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PointsChart data={data.monthlyPoints} />
            <NewMembersChart data={data.monthlyMembers} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-ivory">Recent Transactions</h3>
                <Link href="/admin/transactions" className="text-[12.5px] text-gold-bright hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-1">
                {data.recentTransactions.length === 0 && (
                  <p className="py-6 text-center text-[13px] text-mist-dim">No transactions yet.</p>
                )}
                {data.recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 border-b border-line-soft py-3 last:border-none">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] text-ivory">{t.customerName}</p>
                      <p className="mt-0.5 truncate text-[12px] text-mist-dim">{t.reason}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone={typeTone[t.type]}>{t.type}</Badge>
                      <span className={`w-16 text-right font-mono text-[13px] ${t.points >= 0 ? "text-emerald" : "text-rust"}`}>
                        {t.points >= 0 ? "+" : ""}
                        {formatPoints(t.points)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-ivory">Recent Members</h3>
                <Link href="/admin/customers" className="text-[12.5px] text-gold-bright hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-1">
                {data.recentMembers.length === 0 && (
                  <p className="py-6 text-center text-[13px] text-mist-dim">No members yet.</p>
                )}
                {data.recentMembers.map((m) => (
                  <Link
                    key={m.id}
                    href={`/admin/customers/${m.id}`}
                    className="flex items-center justify-between gap-3 border-b border-line-soft py-3 last:border-none hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] text-ivory">{m.name}</p>
                      <p className="mt-0.5 font-mono text-[12px] text-mist-dim">{m.memberId}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[12px] text-mist-dim">{formatDate(m.createdAt)}</span>
                      <span className="font-mono text-[13px] text-gold-bright">{formatPoints(m.totalPoints)} pts</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
