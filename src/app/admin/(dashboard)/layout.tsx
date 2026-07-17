"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminAuthProvider, useAdminAuthContext } from "@/lib/admin-auth-context";
import { MobileSidebarProvider } from "@/lib/mobile-sidebar-context";

function Gate({ children }: { children: React.ReactNode }) {
  const { loading } = useAdminAuthContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-dim border-t-gold-bright" />
          <p className="text-[13px] text-mist-dim">Checking your session…</p>
        </div>
      </div>
    );
  }

  return (
    <MobileSidebarProvider>
      <div className="min-h-screen bg-ink">
        <AdminSidebar />
        <div className="md:pl-60">{children}</div>
      </div>
    </MobileSidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <Gate>{children}</Gate>
    </AdminAuthProvider>
  );
}
