"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, Input, Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingBlock, ErrorBlock } from "@/components/ui/loading";
import { DownloadCardButton } from "@/components/customer/download-card-button";
import {
  getCustomerById,
  deactivateCustomer,
  reactivateCustomer,
  updateCustomer,
  regenerateQrToken,
  deleteCustomer,
} from "@/lib/api/customers";
import { ApiClientError } from "@/lib/api-client";
import { formatPoints, formatPhone, formatDate } from "@/lib/utils";
import type { Customer, PointTransaction, TransactionType } from "@/types";
import { X, RefreshCw, Trash2 } from "lucide-react";
import { MembershipCardDashboard } from "@/components/customer/membership-card-dashboard";

const typeTone: Record<TransactionType, "emerald" | "rust" | "gold"> = {
  earn: "emerald",
  redeem: "rust",
  adjustment: "gold",
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [txns, setTxns] = useState<PointTransaction[]>([]);
  const [error, setError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  async function load() {
    try {
      const { customer, transactions } = await getCustomerById(params.id);
      setCustomer(customer);
      setTxns(transactions);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        router.replace("/admin/customers");
        return;
      }
      setError(err instanceof ApiClientError ? err.message : "Failed to load customer.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function toggleStatus() {
    if (!customer) return;
    setStatusSaving(true);
    try {
      const updated =
        customer.status === "active"
          ? await deactivateCustomer(customer.id)
          : await reactivateCustomer(customer.id);
      setCustomer(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update status.");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleRegenerateToken() {
    if (!customer) return;
    setRegenerating(true);
    setError("");
    try {
      const updated = await regenerateQrToken(customer.id);
      setCustomer(updated);
      setConfirmRegenerate(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to regenerate QR token.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteCustomer(customer.id);
      router.push("/admin/customers");
    } catch (err) {
      setDeleteError(
        err instanceof ApiClientError ? err.message : "Failed to delete customer."
      );
    } finally {
      setDeleting(false);
    }
  }

  function openEdit() {
    if (!customer) return;
    setEditName(customer.name);
    setEditEmail(customer.email ?? "");
    setEditError("");
    setShowEdit(true);
  }

  async function handleEditSave(e: FormEvent) {
    e.preventDefault();
    if (!customer) return;
    setEditError("");
    if (editName.trim().length < 2) {
      setEditError("Enter a valid name.");
      return;
    }
    setEditSaving(true);
    try {
      const updated = await updateCustomer(customer.id, {
        name: editName.trim(),
        email: editEmail || undefined,
      });
      setCustomer(updated);
      setShowEdit(false);
    } catch (err) {
      setEditError(err instanceof ApiClientError ? err.message : "Failed to save changes.");
    } finally {
      setEditSaving(false);
    }
  }

  if (error) return <ErrorBlock message={error} />;
  if (!customer) return <LoadingBlock label="Loading customer…" />;

  return (
    <>
      <AdminTopbar title={customer.name} subtitle={`${customer.memberId} · ${formatPhone(customer.phone)}`} />

      <div className="grid gap-6 px-6 py-6 md:px-8 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <MembershipCardDashboard ref={cardRef} customer={customer} />
          <DownloadCardButton
            cardRef={cardRef}
            filename={`${customer.memberId}-membership-card.png`}
          />

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] uppercase tracking-wide text-mist-dim">Status</p>
              <Badge tone={customer.status === "active" ? "emerald" : "neutral"}>{customer.status}</Badge>
            </div>
            <dl className="mt-4 space-y-3 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-mist">Tier</dt>
                <dd className="text-ivory">{customer.tier}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Email</dt>
                <dd className="text-ivory">{customer.email ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Joined</dt>
                <dd className="text-ivory">{formatDate(customer.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Last activity</dt>
                <dd className="text-ivory">{formatDate(customer.updatedAt)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={openEdit}>
                Edit
              </Button>
              <Button
                variant={customer.status === "active" ? "danger" : "secondary"}
                size="sm"
                className="flex-1"
                onClick={toggleStatus}
                disabled={statusSaving}
              >
                {statusSaving ? "Saving…" : customer.status === "active" ? "Deactivate" : "Reactivate"}
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[12.5px] uppercase tracking-wide text-mist-dim">QR &amp; card security</p>
            <p className="mt-2 text-[12.5px] text-mist">
              Lost or compromised physical card? Regenerating replaces this customer&rsquo;s
              QR code — the old card and any previously downloaded image stop working
              immediately.
            </p>
            {!confirmRegenerate ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setConfirmRegenerate(true)}
              >
                <RefreshCw size={14} /> Regenerate QR code
              </Button>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-[12.5px] text-rust">
                  This invalidates the current card/QR. Continue?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfirmRegenerate(false)}
                    disabled={regenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={handleRegenerateToken}
                    disabled={regenerating}
                  >
                    {regenerating ? "Regenerating…" : "Yes, regenerate"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="border-rust/30 p-5">
            <p className="text-[12.5px] uppercase tracking-wide text-rust">Danger zone</p>
            <p className="mt-2 text-[12.5px] text-mist">
              Permanently deletes this customer. Only allowed if they have{" "}
              <span className="text-ivory">zero transaction history</span> — the ledger
              is immutable, so anyone with real activity must be deactivated instead.
            </p>
            {!confirmDelete ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-rust hover:bg-rust/10"
                onClick={() => {
                  setConfirmDelete(true);
                  setDeleteError("");
                }}
              >
                <Trash2 size={14} /> Delete customer
              </Button>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-[12.5px] text-rust">
                  This can&rsquo;t be undone. Delete {customer.name}?
                </p>
                {deleteError && <p className="text-[12.5px] text-rust">{deleteError}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="flex gap-2">
            <Link href={`/admin/points/add?customer=${customer.id}`} className="flex-1">
              <Button className="w-full" size="sm">Add points</Button>
            </Link>
            <Link href={`/admin/points/redeem?customer=${customer.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">Redeem</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 self-start">
          <Card className="col-span-3 p-5 sm:col-span-1">
            <p className="text-[12px] uppercase tracking-wide text-mist-dim">Available</p>
            <p className="mt-1 font-display text-3xl text-ivory">{formatPoints(customer.totalPoints)}</p>
          </Card>
          <Card className="col-span-3 p-5 sm:col-span-1">
            <p className="text-[12px] uppercase tracking-wide text-mist-dim">Total Earned</p>
            <p className="mt-1 font-display text-3xl text-emerald">{formatPoints(customer.totalEarned)}</p>
          </Card>
          <Card className="col-span-3 p-5 sm:col-span-1">
            <p className="text-[12px] uppercase tracking-wide text-mist-dim">Total Redeemed</p>
            <p className="mt-1 font-display text-3xl text-rust">{formatPoints(customer.totalRedeemed)}</p>
          </Card>

          <Card className="col-span-3 overflow-hidden">
            <div className="border-b border-line-soft px-5 py-4">
              <h3 className="font-display text-lg text-ivory">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line-soft text-[11.5px] uppercase tracking-wide text-mist-dim">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Reference</th>
                    <th className="px-5 py-3 text-right font-medium">Points</th>
                    <th className="px-5 py-3 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t) => (
                    <tr key={t.id} className="border-b border-line-soft last:border-none">
                      <td className="px-5 py-3.5 text-mist-dim">{formatDate(t.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={typeTone[t.type]}>{t.type}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-ivory">{t.reason}</td>
                      <td className="px-5 py-3.5 font-mono text-mist-dim">{t.reference}</td>
                      <td className={`px-5 py-3.5 text-right font-mono ${t.points >= 0 ? "text-emerald" : "text-rust"}`}>
                        {t.points >= 0 ? "+" : ""}
                        {formatPoints(t.points)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-mist">{formatPoints(t.balanceAfter)}</td>
                    </tr>
                  ))}
                  {txns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-mist-dim">
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-6">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-ivory">Edit customer</h3>
              <button onClick={() => setShowEdit(false)} className="text-mist hover:text-ivory">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="edit-name">Full name</Label>
                <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              {editError && <p className="text-[13px] text-rust">{editError}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={editSaving}>
                {editSaving ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
