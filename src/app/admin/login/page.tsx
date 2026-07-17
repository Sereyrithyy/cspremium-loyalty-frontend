"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/card";
import { login } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pattern-guilloche flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-2 w-2 rounded-full bg-gold" />
          <p className="font-display text-xl italic text-ivory">CSPremiumSolutions</p>
          <p className="mt-1 text-[13px] text-mist-dim">Sign in to manage members and points</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/40">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@meridiangifts.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-[13px] text-rust">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-[12px] text-mist-dim">
            Demo login — admin@meridiangifts.com / password123
          </p>
        </form>

        <p className="mt-6 text-center">
          <Link href="/" className="text-[12px] text-mist-dim underline decoration-line underline-offset-4 hover:text-mist">
            ← Back to member site
          </Link>
        </p>
      </div>
    </main>
  );
}
