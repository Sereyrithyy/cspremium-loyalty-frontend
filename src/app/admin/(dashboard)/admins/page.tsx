"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, Input, Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/ui/loading";
import { useAdminAuthContext } from "@/lib/admin-auth-context";
import { listAdmins, createAdmin, deleteAdmin } from "@/lib/api/admins";
import { ApiClientError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { AdminAccount } from "@/types";
import { Plus, Trash2, UserCog, X } from "lucide-react";

export default function AdminsPage() {
  const { user: currentUser } = useAdminAuthContext();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listAdmins();
      setAdmins(data);
      setError("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load admins.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openForm() {
    setName("");
    setEmail("");
    setPassword("");
    setFormError("");
    setShowForm(true);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (name.trim().length < 2) {
      setFormError("Enter the admin's full name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      const created = await createAdmin({ name: name.trim(), email: email.trim(), password });
      setAdmins((prev) => [...prev, created]);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create admin.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");
    try {
      await deleteAdmin(id);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to remove admin.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminTopbar title="Admins" subtitle="Manage who can sign in to this dashboard" />

      <div className="space-y-4 px-6 py-6 md:px-8">
        <div className="flex justify-end">
          <Button onClick={openForm}>
            <Plus size={16} /> New admin
          </Button>
        </div>

        {error && <p className="text-[13px] text-rust">{error}</p>}
        {loading && <LoadingBlock label="Loading admins…" />}

        {!loading && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line-soft text-[11.5px] uppercase tracking-wide text-mist-dim">
                    <th className="px-5 py-3 font-medium">Admin</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Added</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => {
                    const isSelf = a.id === currentUser?.id;
                    return (
                      <tr key={a.id} className="border-b border-line-soft last:border-none">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/12 font-display text-[12px] text-gold-bright">
                              {a.name.trim()[0]?.toUpperCase() ?? "A"}
                            </div>
                            <div>
                              <p className="text-ivory">{a.name}</p>
                              {isSelf && (
                                <Badge tone="gold" className="mt-0.5">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-mist">{a.email}</td>
                        <td className="px-5 py-3.5 text-mist-dim">{formatDate(a.createdAt)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSelf || deletingId === a.id}
                            onClick={() => handleDelete(a.id)}
                            title={isSelf ? "You can't remove your own account" : "Remove admin"}
                          >
                            <Trash2 size={14} className={isSelf ? "text-mist-dim" : "text-rust"} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-mist-dim">
                        No admins yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-6">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog size={18} className="text-gold-bright" />
                <h3 className="font-display text-lg text-ivory">New admin</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-mist hover:text-ivory">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="admin-name">Full name</Label>
                <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <p className="mt-1.5 text-[11px] text-mist-dim">At least 6 characters.</p>
              </div>
              {formError && <p className="text-[13px] text-rust">{formError}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={saving}>
                {saving ? "Creating…" : "Create admin"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
