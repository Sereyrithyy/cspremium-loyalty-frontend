"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/card";
import { registerCustomer, searchCustomerByPhone } from "@/lib/api/customers";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Tab = "find" | "join";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("find");

  const [phone, setPhone] = useState("");
  const [findError, setFindError] = useState("");
  const [findLoading, setFindLoading] = useState(false);

  const [name, setName] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joined, setJoined] = useState<{ memberId: string; name: string; qrToken: string } | null>(
    null
  );

  async function handleFind(e: FormEvent) {
    e.preventDefault();
    setFindError("");
    setFindLoading(true);
    try {
      const customer = await searchCustomerByPhone(phone);
      router.push(`/member/${customer.qrToken}`);
    } catch (err) {
      setFindError(
        err instanceof ApiClientError
          ? err.message
          : "We couldn't find a membership with that phone number."
      );
    } finally {
      setFindLoading(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setJoinError("");
    if (name.trim().length < 2) {
      setJoinError("Enter the member's full name.");
      return;
    }
    if (joinPhone.replace(/\D/g, "").length < 8) {
      setJoinError("Enter a valid phone number.");
      return;
    }
    setJoinLoading(true);
    try {
      const customer = await registerCustomer({ name: name.trim(), phone: joinPhone });
      setJoined({ memberId: customer.memberId, name: customer.name, qrToken: customer.qrToken });
    } catch (err) {
      setJoinError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <section className="pattern-guilloche relative overflow-hidden border-b border-line-soft px-6 pb-16 pt-20 sm:pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold-dim/60 to-transparent" />
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-gold-dim">
            Meridian Corporate Gifts
          </p>
          <h1 className="text-balance mt-5 font-display text-4xl leading-[1.08] text-ivory sm:text-6xl">
            Every gift comes back <span className="italic text-gold-bright">around.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-mist sm:text-base">
            One point for every dollar spent on corporate gifting. No password, no app —
            just your phone number and a card that remembers every order.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-md px-6 pb-24">
        <div className="rounded-2xl border border-line bg-surface p-1.5 shadow-2xl shadow-black/40">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
            <button
              onClick={() => {
                setTab("find");
                setJoined(null);
              }}
              className={cn(
                "rounded-lg py-2.5 text-[13px] font-medium transition-colors",
                tab === "find" ? "bg-gold text-ink" : "text-mist hover:text-ivory"
              )}
            >
              Find your card
            </button>
            <button
              onClick={() => setTab("join")}
              className={cn(
                "rounded-lg py-2.5 text-[13px] font-medium transition-colors",
                tab === "join" ? "bg-gold text-ink" : "text-mist hover:text-ivory"
              )}
            >
              Join the program
            </button>
          </div>

          <div className="p-5">
            {tab === "find" && (
              <form onSubmit={handleFind} className="space-y-4">
                <div>
                  <Label htmlFor="find-phone">Phone number</Label>
                  <Input
                    id="find-phone"
                    inputMode="tel"
                    placeholder="097 712 3456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {findError && <p className="text-[13px] text-rust">{findError}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={findLoading}>
                  {findLoading ? "Searching…" : "View my membership"}
                </Button>
                <p className="text-center text-[12px] text-mist-dim">
                  Try a demo number — <span className="font-mono text-mist">0977123456</span>
                </p>
              </form>
            )}

            {tab === "join" && !joined && (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <Label htmlFor="join-name">Full name</Label>
                  <Input
                    id="join-name"
                    placeholder="Sokha Chan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="join-phone">Phone number</Label>
                  <Input
                    id="join-phone"
                    inputMode="tel"
                    placeholder="097 712 3456"
                    value={joinPhone}
                    onChange={(e) => setJoinPhone(e.target.value)}
                  />
                </div>
                {joinError && <p className="text-[13px] text-rust">{joinError}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={joinLoading}>
                  {joinLoading ? "Creating…" : "Create my membership"}
                </Button>
                <p className="text-center text-[12px] text-mist-dim">
                  Free to join. Points are added by our team after each purchase.
                </p>
              </form>
            )}

            {tab === "join" && joined && (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald/40 bg-emerald/10 text-emerald">
                  ✓
                </div>
                <div>
                  <p className="font-display text-xl text-ivory">Welcome, {joined.name.split(" ")[0]}.</p>
                  <p className="mt-1 text-[13px] text-mist">
                    Your membership <span className="font-mono text-gold-bright">{joined.memberId}</span> is
                    ready. Points appear here after your next purchase.
                  </p>
                </div>
                <Button className="w-full" size="lg" onClick={() => router.push(`/member/${joined.qrToken}`)}>
                  View my membership card
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/admin/login" className="text-[12px] text-mist-dim underline decoration-line underline-offset-4 hover:text-mist">
            Staff admin sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
