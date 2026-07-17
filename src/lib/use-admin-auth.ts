"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, getStoredToken, getStoredUser, logout as apiLogout } from "@/lib/api/auth";
import type { AdminUser } from "@/types";

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = getStoredToken();
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const cached = getStoredUser();
      if (cached) setUser(cached);

      try {
        const freshUser = await fetchMe();
        if (!cancelled) {
          setUser(freshUser);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          router.replace("/admin/login");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = useCallback(async () => {
    await apiLogout();
    router.replace("/admin/login");
  }, [router]);

  return { user, loading, logout };
}
