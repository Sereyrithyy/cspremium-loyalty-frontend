"use client";

import { useMemo, useState } from "react";
import { Card, Badge } from "@/components/ui/card";
import { formatDate, formatPoints } from "@/lib/utils";
import type { PointTransaction, TransactionType } from "@/types";

const typeTone: Record<TransactionType, "emerald" | "rust" | "gold"> = {
  earn: "emerald",
  redeem: "rust",
  adjustment: "gold",
};

const typeLabel: Record<TransactionType, string> = {
  earn: "Earned",
  redeem: "Redeemed",
  adjustment: "Adjusted",
};

type Filter = "all" | "earn" | "redeem";

const PAGE_SIZE = 8;

function monthKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function ActivityHistory({ transactions }: { transactions: PointTransaction[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const counts = useMemo(
    () => ({
      all: transactions.length,
      earn: transactions.filter((t) => t.type === "earn").length,
      redeem: transactions.filter((t) => t.type === "redeem").length,
    }),
    [transactions]
  );

  function handleFilterChange(next: Filter) {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
  }

  // Group the currently visible slice by month so long histories read in chunks
  // instead of one undifferentiated wall of rows.
  const groups = useMemo(() => {
    const map = new Map<string, PointTransaction[]>();
    for (const t of visible) {
      const key = monthKey(t.createdAt);
      const list = map.get(key);
      if (list) list.push(t);
      else map.set(key, [t]);
    }
    return Array.from(map.entries());
  }, [visible]);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ivory">Activity</h2>
        <div className="flex gap-1.5 rounded-lg border border-line bg-surface-2 p-1">
          {(
            [
              ["all", "All"],
              ["earn", "Earned"],
              ["redeem", "Redeemed"],
            ] as [Filter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                filter === value ? "bg-gold text-ink" : "text-mist hover:text-ivory"
              }`}
            >
              {label}
              <span className={`ml-1.5 font-mono text-[11px] ${filter === value ? "text-ink/60" : "text-mist-dim"}`}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <Card className="p-6 text-center text-[13px] text-mist-dim">
            {filter === "redeem"
              ? "No rewards redeemed yet."
              : filter === "earn"
              ? "No points earned yet."
              : "No activity yet. Points appear here after your first purchase."}
          </Card>
        ) : (
          <div className="space-y-6">
            {groups.map(([month, items]) => (
              <div key={month}>
                <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.15em] text-mist-dim">
                  {month}
                </p>
                <Card className="divide-y divide-line-soft overflow-hidden p-0">
                  {items.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge tone={typeTone[t.type]}>{typeLabel[t.type]}</Badge>
                          <span className="hidden font-mono text-[11px] text-mist-dim sm:inline">
                            {t.reference}
                          </span>
                        </div>
                        <p className="mt-1.5 truncate text-[14px] text-ivory">
                          {t.type === "redeem" ? t.reason.replace(/^Redeemed:\s*/, "") : t.reason}
                        </p>
                        <p className="mt-0.5 text-[12px] text-mist-dim">{formatDate(t.createdAt)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`font-display text-lg ${t.points >= 0 ? "text-emerald" : "text-rust"}`}>
                          {t.points >= 0 ? "+" : ""}
                          {formatPoints(t.points)}
                        </p>
                        <p className="text-[11px] text-mist-dim">balance {formatPoints(t.balanceAfter)}</p>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            className="mt-4 w-full rounded-lg border border-line bg-surface-2 py-2.5 text-[13px] font-medium text-mist hover:border-gold-dim hover:text-ivory"
          >
            Show more — {filtered.length - visibleCount} remaining
          </button>
        )}
      </div>
    </section>
  );
}
