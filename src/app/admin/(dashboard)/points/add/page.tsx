"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminTopbar } from "@/components/admin/topbar";
import { CustomerPicker } from "@/components/admin/customer-picker";
import { Card, Input, Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCustomerById } from "@/lib/api/customers";
import { addPoints } from "@/lib/api/points";
import { ApiClientError } from "@/lib/api-client";
import { formatPoints } from "@/lib/utils";
import type { Customer } from "@/types";
import { CheckCircle2 } from "lucide-react";

function AddPointsForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("Corporate Gift Purchase");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<{ points: number; balance: number } | null>(null);

  useEffect(() => {
    const cid = params.get("customer");
    if (cid) {
      getCustomerById(cid)
        .then(({ customer }) => setCustomer(customer))
        .catch(() => {});
    }
  }, [params]);

  function handlePurchaseAmount(v: string) {
    setPurchaseAmount(v);
    const n = Number(v);
    if (!Number.isNaN(n) && v !== "") setPoints(String(Math.floor(n)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!customer) {
      setError("Select a customer to add points to.");
      return;
    }
    const p = Number(points);
    if (!p || p <= 0) {
      setError("Enter a positive number of points.");
      return;
    }
    if (!reason.trim()) {
      setError("Add a reason for this transaction.");
      return;
    }
    setSaving(true);
    try {
      const result = await addPoints({
        customerId: customer.id,
        points: p,
        reason: reason.trim(),
        reference: reference.trim() || undefined,
        purchaseAmount: purchaseAmount ? Number(purchaseAmount) : undefined,
        notes: notes.trim() || undefined,
        date,
      });
      setSuccess({ points: p, balance: result.customer.totalPoints });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to add points.");
    } finally {
      setSaving(false);
    }
  }

  if (success && customer) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald/40 bg-emerald/10 text-emerald">
          <CheckCircle2 size={22} />
        </div>
        <h2 className="mt-4 font-display text-xl text-ivory">
          +{formatPoints(success.points)} points added
        </h2>
        <p className="mt-1 text-[13.5px] text-mist">
          {customer.name}&rsquo;s new balance is <span className="font-mono text-gold-bright">{formatPoints(success.balance)}</span> pts.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
            View customer
          </Button>
          <Button
            onClick={() => {
              setSuccess(null);
              setCustomer(null);
              setPurchaseAmount("");
              setPoints("");
              setReference("");
              setNotes("");
            }}
          >
            Add another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <CustomerPicker value={customer} onChange={setCustomer} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchase">Purchase amount (USD)</Label>
            <Input
              id="purchase"
              inputMode="decimal"
              placeholder="350"
              value={purchaseAmount}
              onChange={(e) => handlePurchaseAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="points">Points to add</Label>
            <Input
              id="points"
              inputMode="numeric"
              placeholder="350"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="reason">Reason</Label>
          <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reference">Invoice number</Label>
            <Input id="reference" placeholder="INV-10245" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input id="notes" placeholder="Anything worth remembering about this order" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {customer && (
          <p className="text-[12.5px] text-mist-dim">
            Current balance: <span className="font-mono text-ivory">{formatPoints(customer.totalPoints)}</span> pts
          </p>
        )}

        {error && <p className="text-[13px] text-rust">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? "Adding…" : "Add points"}
        </Button>
      </form>
    </Card>
  );
}

export default function AddPointsPage() {
  return (
    <>
      <AdminTopbar title="Add Points" subtitle="Credit points after a customer purchase" />
      <div className="px-6 py-6 md:px-8">
        <Suspense>
          <AddPointsForm />
        </Suspense>
      </div>
    </>
  );
}
