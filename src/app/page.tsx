"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/card";
import { registerCustomer } from "@/lib/api/customers";
import { ApiClientError } from "@/lib/api-client";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [joined, setJoined] = useState<{
    memberId: string;
    name: string;
    qrToken: string;
  } | null>(null);

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 8) {
      setError("Enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      const customer = await registerCustomer({
        name: name.trim(),
        phone,
      });

      setJoined({
        memberId: customer.memberId,
        name: customer.name,
        qrToken: customer.qrToken,
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <section className="pattern-guilloche relative overflow-hidden border-b border-line-soft px-6 py-7 mb-7">
        <div className="mx-auto max-w-3xl text-center">
          <Image
                                          src="/logo.png"
                                          alt="Logo"
                                          width={100}
                                          height={100}
                                          priority
                                          className="h-24 w-24 sm:h-28 sm:w-28 object-contain transition-opacity hover:opacity-80 mx-auto"
                                        />

          <h1 className="mt-5 font-display text-4xl text-ivory sm:text-6xl">
            Join Our Loyalty Program
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-mist">
            Register with your name and phone number once to enjoy earning loyalty points on every purchase.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-md px-6 pb-24">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/40">

          {!joined ? (
            <form onSubmit={handleJoin} className="space-y-4">

              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Rithy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="016727570"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-rust">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Creating..." : "Join the Program"}
              </Button>

              <p className="text-center text-xs text-mist-dim">
                Membership is free. Points are added after every purchase.
              </p>

            </form>
          ) : (
            <div className="space-y-4 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald/40 bg-emerald/10 text-emerald">
                ✓
              </div>

              <div>
                <h2 className="font-display text-2xl text-ivory">
                  Welcome, {joined.name}!
                </h2>

                {/* <p className="mt-2 text-sm text-mist">
                  Your membership ID is{" "}
                  <span className="font-mono text-gold-bright">
                    {joined.memberId}
                  </span>
                </p> */}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  router.push(`/member/${joined.qrToken}`)
                }
              >
                View My Membership Card
              </Button>

            </div>
          )}
        </div>
      </section>
    </main>
  );
}