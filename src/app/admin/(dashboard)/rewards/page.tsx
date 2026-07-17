"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, Input, Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/ui/loading";
import {
  listRewards,
  createReward,
  updateReward,
  deleteReward,
  uploadRewardImage,
} from "@/lib/api/rewards";
import { ApiClientError, getAssetUrl } from "@/lib/api-client";
import { formatPoints } from "@/lib/utils";
import type { Reward } from "@/types";
import { Plus, Pencil, Trash2, Gift, X, ImageUp, Loader2 } from "lucide-react";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<Reward | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Image upload state — a File queued for a not-yet-created reward, or an
  // in-flight upload against an existing one.
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listRewards();
      setRewards(data);
      setError("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load rewards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // Revoke local object URLs when they're replaced or the modal closes.
    return () => {
      if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    };
  }, [pendingImagePreview]);

  function resetImageState() {
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openNew() {
    setEditing({
      id: "",
      name: "",
      description: "",
      requiredPoints: 0,
      image: null,
      status: "active",
      createdAt: "",
      updatedAt: "",
    });
    setFormError("");
    resetImageState();
    setShowForm(true);
  }

  function openEdit(r: Reward) {
    setEditing(r);
    setFormError("");
    resetImageState();
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    resetImageState();
  }

  async function handleDelete(id: string) {
    try {
      await deleteReward(id);
      setRewards((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete reward.");
    }
  }

  async function toggleStatus(r: Reward) {
    try {
      const updated = await updateReward(r.id, { status: r.status === "active" ? "inactive" : "active" });
      setRewards((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update reward.");
    }
  }

  function validateImageFile(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type)) return "Only JPEG, PNG, WEBP, or GIF images are allowed.";
    if (file.size > MAX_IMAGE_BYTES) return "Image must be 5MB or smaller.";
    return null;
  }

  async function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setImageError(validationError);
      return;
    }
    setImageError("");

    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    const previewUrl = URL.createObjectURL(file);
    setPendingImagePreview(previewUrl);

    if (editing.id) {
      // Existing reward — upload immediately so the card updates right away.
      setImageUploading(true);
      try {
        const updated = await uploadRewardImage(editing.id, file);
        setEditing(updated);
        setRewards((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setPendingImageFile(null);
      } catch (err) {
        setImageError(err instanceof ApiClientError ? err.message : "Failed to upload image.");
      } finally {
        setImageUploading(false);
      }
    } else {
      // New reward — queue the file, upload once the reward exists.
      setPendingImageFile(file);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setFormError("");
    if (editing.name.trim().length < 2) {
      setFormError("Enter a reward name.");
      return;
    }
    if (!editing.requiredPoints || editing.requiredPoints <= 0) {
      setFormError("Required points must be a positive number.");
      return;
    }
    setSaving(true);
    try {
      let saved: Reward;
      if (editing.id) {
        saved = await updateReward(editing.id, {
          name: editing.name,
          description: editing.description,
          requiredPoints: editing.requiredPoints,
        });
      } else {
        saved = await createReward({
          name: editing.name,
          description: editing.description,
          requiredPoints: editing.requiredPoints,
        });
      }

      if (pendingImageFile) {
        try {
          saved = await uploadRewardImage(saved.id, pendingImageFile);
        } catch (err) {
          // Reward itself saved fine — surface the image failure but don't block close.
          setImageError(err instanceof ApiClientError ? err.message : "Reward saved, but the image failed to upload.");
        }
      }

      setRewards((prev) => {
        const exists = prev.some((r) => r.id === saved.id);
        return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved];
      });
      closeForm();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to save reward.");
    } finally {
      setSaving(false);
    }
  }

  const modalImageUrl = pendingImagePreview ?? getAssetUrl(editing?.image);

  return (
    <>
      <AdminTopbar title="Rewards" subtitle="Manage the redemption catalog" />

      <div className="space-y-4 px-6 py-6 md:px-8">
        <div className="flex justify-end">
          <Button onClick={openNew}>
            <Plus size={16} /> New reward
          </Button>
        </div>

        {error && <p className="text-[13px] text-rust">{error}</p>}
        {loading && <LoadingBlock label="Loading rewards…" />}

        {!loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => {
              const imageUrl = getAssetUrl(r.image);
              return (
                <Card key={r.id} className="flex flex-col overflow-hidden p-0">
                  <div className="relative h-36 w-full bg-surface-2">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={r.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gold-dim">
                        <Gift size={28} strokeWidth={1.5} />
                      </div>
                    )}
                    <Badge
                      tone={r.status === "active" ? "emerald" : "neutral"}
                      className="absolute right-3 top-3 backdrop-blur"
                    >
                      {r.status}
                    </Badge>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg text-ivory">{r.name}</h3>
                    <p className="mt-1 flex-1 text-[13px] text-mist">{r.description}</p>
                    <div className="mt-4 flex items-center justify-between text-[12.5px]">
                      <span className="font-mono text-gold-bright">{formatPoints(r.requiredPoints)} pts</span>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-line-soft pt-4">
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(r)}>
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(r)}>
                        {r.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                        <Trash2 size={14} className="text-rust" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            {rewards.length === 0 && (
              <p className="col-span-full py-10 text-center text-[13px] text-mist-dim">No rewards yet.</p>
            )}
          </div>
        )}
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-6">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-ivory">{editing.id ? "Edit reward" : "New reward"}</h3>
              <button onClick={closeForm} className="text-mist hover:text-ivory">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2">
                    {imageUploading ? (
                      <Loader2 size={20} className="animate-spin text-gold-dim" />
                    ) : modalImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={modalImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Gift size={20} className="text-gold-dim" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="reward-image-input"
                    />
                    <label
                      htmlFor="reward-image-input"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-medium text-mist hover:text-ivory"
                    >
                      <ImageUp size={14} />
                      {modalImageUrl ? "Change image" : "Upload image"}
                    </label>
                    <p className="mt-1.5 text-[11px] text-mist-dim">JPEG, PNG, WEBP, or GIF · up to 5MB</p>
                    {!editing.id && pendingImageFile && (
                      <p className="mt-1 text-[11px] text-gold-bright">Will upload once the reward is saved.</p>
                    )}
                  </div>
                </div>
                {imageError && <p className="mt-2 text-[13px] text-rust">{imageError}</p>}
              </div>

              <div>
                <Label htmlFor="r-name">Name</Label>
                <Input id="r-name" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="r-desc">Description</Label>
                <Input id="r-desc" required value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="r-points">Required points</Label>
                <Input
                  id="r-points"
                  type="number"
                  required
                  value={editing.requiredPoints || ""}
                  onChange={(e) => setEditing({ ...editing, requiredPoints: Number(e.target.value) })}
                />
              </div>
              {formError && <p className="text-[13px] text-rust">{formError}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={saving}>
                {saving ? "Saving…" : "Save reward"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
