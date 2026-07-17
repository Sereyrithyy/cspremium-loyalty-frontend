"use client";

import { useEffect, useRef, useState } from "react";
import { Input, Label } from "@/components/ui/card";
import { listCustomers } from "@/lib/api/customers";
import { formatPhone, formatPoints } from "@/lib/utils";
import type { Customer } from "@/types";

export function CustomerPicker({
  value,
  onChange,
}: {
  value: Customer | null;
  onChange: (c: Customer) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      listCustomers({ q: query || undefined, pageSize: 6 })
        .then((res) => !cancelled && setResults(res.items))
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, open]);

  return (
    <div ref={ref} className="relative">
      <Label htmlFor="customer-picker">Customer</Label>
      <Input
        id="customer-picker"
        placeholder="Search by name, phone, or member ID"
        value={value ? `${value.name} · ${value.memberId}` : query}
        onChange={(e) => {
          onChange(null as unknown as Customer);
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-line bg-surface-2 shadow-xl">
          {loading && <p className="px-3.5 py-3 text-[13px] text-mist-dim">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="px-3.5 py-3 text-[13px] text-mist-dim">No matching customers.</p>
          )}
          {!loading &&
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] hover:bg-surface-3"
              >
                <span>
                  <span className="text-ivory">{c.name}</span>
                  <span className="ml-2 font-mono text-[11.5px] text-mist-dim">{formatPhone(c.phone)}</span>
                </span>
                <span className="font-mono text-[12px] text-gold-bright">{formatPoints(c.totalPoints)} pts</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
