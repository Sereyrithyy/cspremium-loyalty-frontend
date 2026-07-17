"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminTopbar } from "@/components/admin/topbar";
import { CustomerPicker } from "@/components/admin/customer-picker";
import { Card, Input, Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCustomerById } from "@/lib/api/customers";
import { redeemPoints } from "@/lib/api/points";
import { listRewards } from "@/lib/api/rewards";
import { ApiClientError } from "@/lib/api-client";
import { formatPoints } from "@/lib/utils";
import type { Customer, Reward } from "@/types";
import { CheckCircle2 } from "lucide-react";

function RedeemForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardId, setRewardId] = useState("");
  const [points, setPoints] = useState("");
  const [notes, setNotes] = useState("");
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
    listRewards("active")
      .then(setRewards)
      .catch(() => setRewards([]));
  }, [params]);

  function handleRewardChange(id: string) {
    setRewardId(id);
    const reward = rewards.find((r) => r.id === id);
    if (reward) setPoints(String(reward.requiredPoints));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!customer) {
      setError("Select a customer to redeem points for.");
      return;
    }
    const p = Number(points);
    if (!p || p <= 0) {
      setError("Enter a positive number of points.");
      return;
    }
    if (p > customer.totalPoints) {
      setError(`Cannot redeem more than the available balance (${formatPoints(customer.totalPoints)} pts).`);
      return;
    }
    setSaving(true);
    try {
      const result = await redeemPoints({
        customerId: customer.id,
        points: p,
        rewardId: rewardId || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccess({ points: p, balance: result.customer.totalPoints });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to redeem points.");
    } finally {
      setSaving(false);
    }
  }

  if (success && customer) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-dim/50 bg-gold/10 text-gold-bright">
          <CheckCircle2 size={22} />
        </div>
        <h2 className="mt-4 font-display text-xl text-ivory">
          −{formatPoints(success.points)} points redeemed
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
              setRewardId("");
              setPoints("");
              setNotes("");
            }}
          >
            Redeem another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <CustomerPicker value={customer} onChange={setCustomer} />

        <div>
          <Label htmlFor="reward">Reward</Label>
          <select
            id="reward"
            value={rewardId}
            onChange={(e) => handleRewardChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-line bg-surface-2 px-3.5 text-sm text-ivory outline-none focus:border-gold-dim focus:ring-1 focus:ring-gold-dim"
          >
            <option value="">Custom redemption — no catalog reward</option>
            {rewards.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.requiredPoints} pts
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="redeem-points">Points to redeem</Label>
          <Input id="redeem-points" inputMode="numeric" placeholder="120" value={points} onChange={(e) => setPoints(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="redeem-notes">Notes (optional)</Label>
          <Input id="redeem-notes" placeholder="Handed to customer at pickup" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {customer && (
          <p className="text-[12.5px] text-mist-dim">
            Available balance: <span className="font-mono text-ivory">{formatPoints(customer.totalPoints)}</span> pts
          </p>
        )}

        {error && <p className="text-[13px] text-rust">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? "Redeeming…" : "Redeem points"}
        </Button>
      </form>
    </Card>
  );
}

export default function RedeemPointsPage() {
  return (
    <>
      <AdminTopbar title="Redeem Points" subtitle="Redeem points on behalf of a customer" />
      <div className="px-6 py-6 md:px-8">
        <Suspense>
          <RedeemForm />
        </Suspense>
      </div>
    </>
  );
}
