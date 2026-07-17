"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, Input, Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listCustomers, createCustomer, exportCustomersCsv } from "@/lib/api/customers";
import { ApiClientError } from "@/lib/api-client";
import { formatPoints, formatPhone, formatDate } from "@/lib/utils";
import type { Customer } from "@/types";
import { Search, Plus, ChevronLeft, ChevronRight, X, Download } from "lucide-react";

const PAGE_SIZE = 6;

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      listCustomers({ q: query || undefined, status, page, pageSize: PAGE_SIZE })
        .then((res) => {
          if (cancelled) return;
          setItems(res.items);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setError("");
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof ApiClientError ? err.message : "Failed to load customers.");
        })
        .finally(() => !cancelled && setLoading(false));
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, status, page]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (formName.trim().length < 2) {
      setFormError("Enter the customer's full name.");
      return;
    }
    if (formPhone.replace(/\D/g, "").length < 8) {
      setFormError("Enter a valid phone number.");
      return;
    }
    setFormSaving(true);
    try {
      await createCustomer({ name: formName.trim(), phone: formPhone, email: formEmail || undefined });
      setShowForm(false);
      setFormName("");
      setFormPhone("");
      setFormEmail("");
      setQuery((q) => q); // trigger nothing, refetch via page reset below
      setPage(1);
      // force refetch since query/status/page might not change
      const res = await listCustomers({ q: query || undefined, status, page: 1, pageSize: PAGE_SIZE });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create customer.");
    } finally {
      setFormSaving(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportCustomersCsv({ q: query || undefined, status });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <AdminTopbar title="Customers" subtitle={`${total} member${total === 1 ? "" : "s"} enrolled`} />

      <div className="space-y-4 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-dim" />
              <Input
                placeholder="Search by name, phone, or member ID"
                className="pl-9"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex gap-1.5 rounded-lg border border-line bg-surface-2 p-1">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
                    status === s ? "bg-gold text-ink" : "text-mist hover:text-ivory"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={handleExport} disabled={exporting}>
              <Download size={16} /> {exporting ? "Exporting…" : "Export CSV"}
            </Button>
            <Button size="md" onClick={() => setShowForm(true)}>
              <Plus size={16} /> New customer
            </Button>
          </div>
        </div>

        {error && <p className="text-[13px] text-rust">{error}</p>}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-line-soft text-[11.5px] uppercase tracking-wide text-mist-dim">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Tier</th>
                  <th className="px-5 py-3 font-medium">Points</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  items.map((c) => (
                    <tr key={c.id} className="border-b border-line-soft last:border-none hover:bg-surface-2/60">
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/customers/${c.id}`} className="block">
                          <p className="font-medium text-ivory">{c.name}</p>
                          <p className="font-mono text-[11.5px] text-mist-dim">{c.memberId}</p>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-mist">{formatPhone(c.phone)}</td>
                      <td className="px-5 py-3.5 text-mist">{c.tier}</td>
                      <td className="px-5 py-3.5 font-mono text-gold-bright">{formatPoints(c.totalPoints)}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={c.status === "active" ? "emerald" : "neutral"}>{c.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-mist-dim">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-mist-dim">
                      Loading customers…
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-mist-dim">
                      No customers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line-soft px-5 py-3.5">
            <p className="text-[12.5px] text-mist-dim">
              Page {page} of {totalPages} · {total} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-mist hover:text-ivory disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-mist hover:text-ivory disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-6">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-ivory">New customer</h3>
              <button onClick={() => setShowForm(false)} className="text-mist hover:text-ivory">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="new-name">Full name</Label>
                <Input id="new-name" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new-phone">Phone number</Label>
                <Input id="new-phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new-email">Email (optional)</Label>
                <Input id="new-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              {formError && <p className="text-[13px] text-rust">{formError}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={formSaving}>
                {formSaving ? "Creating…" : "Create customer"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
