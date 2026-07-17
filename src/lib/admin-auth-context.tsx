"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, getStoredToken, getStoredUser, logout as apiLogout } from "@/lib/api/auth";
import type { AdminUser } from "@/types";

interface AdminAuthValue {
  user: AdminUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
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
      if (cached && !cancelled) setUser(cached);

      try {
        const freshUser = await fetchMe();
        if (!cancelled) {
          setUser(freshUser);
          setLoading(false);
        }
      } catch {
        if (!cancelled) router.replace("/admin/login");
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

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout }}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuthContext() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuthContext must be used within AdminAuthProvider");
  return ctx;
}
