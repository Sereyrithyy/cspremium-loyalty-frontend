"use client";

import { useEffect, useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listTransactions, exportTransactionsCsv } from "@/lib/api/transactions";
import { ApiClientError } from "@/lib/api-client";
import { formatPoints, formatDateTime } from "@/lib/utils";
import type { TransactionType, TransactionWithCustomer } from "@/types";
import { Search, Download } from "lucide-react";

const typeTone: Record<TransactionType, "emerald" | "rust" | "gold"> = {
  earn: "emerald",
  redeem: "rust",
  adjustment: "gold",
};

const PAGE_SIZE = 15;

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<TransactionWithCustomer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      listTransactions({ q: query || undefined, type, page, pageSize: PAGE_SIZE })
        .then((res) => {
          if (cancelled) return;
          setItems(res.items);
          setTotalPages(res.totalPages);
          setError("");
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof ApiClientError ? err.message : "Failed to load transactions.");
        })
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, type, page]);

  async function handleExport() {
    setExporting(true);
    try {
      await exportTransactionsCsv({ q: query || undefined, type });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <AdminTopbar title="Transactions" subtitle="Every earn, redeem, and adjustment across the program" />

      <div className="space-y-4 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-dim" />
              <Input
                placeholder="Search customer, reason, or reference"
                className="pl-9"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex gap-1.5 rounded-lg border border-line bg-surface-2 p-1">
              {(["all", "earn", "redeem"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    setPage(1);
                  }}
                  className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
                    type === t ? "bg-gold text-ink" : "text-mist hover:text-ivory"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button variant="secondary" onClick={handleExport} disabled={exporting}>
            <Download size={15} /> {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>

        {error && <p className="text-[13px] text-rust">{error}</p>}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-line-soft text-[11.5px] uppercase tracking-wide text-mist-dim">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 text-right font-medium">Points</th>
                  <th className="px-5 py-3 font-medium">By</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  items.map((t) => (
                    <tr key={t.id} className="border-b border-line-soft last:border-none hover:bg-surface-2/60">
                      <td className="px-5 py-3.5 text-mist-dim">{formatDateTime(t.createdAt)}</td>
                      <td className="px-5 py-3.5 text-ivory">{t.customerName}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={typeTone[t.type]}>{t.type}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-mist">{t.reason}</td>
                      <td className="px-5 py-3.5 font-mono text-mist-dim">{t.reference}</td>
                      <td className={`px-5 py-3.5 text-right font-mono ${t.points >= 0 ? "text-emerald" : "text-rust"}`}>
                        {t.points >= 0 ? "+" : ""}
                        {formatPoints(t.points)}
                      </td>
                      <td className="px-5 py-3.5 text-mist-dim">{t.createdBy}</td>
                    </tr>
                  ))}
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-mist-dim">
                      Loading transactions…
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-mist-dim">
                      No transactions match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line-soft px-5 py-3.5">
              <p className="text-[12.5px] text-mist-dim">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-line px-3 py-1.5 text-[12.5px] text-mist hover:text-ivory disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border border-line px-3 py-1.5 text-[12.5px] text-mist hover:text-ivory disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
