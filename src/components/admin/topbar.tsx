"use client";

import { Menu } from "lucide-react";
import { useAdminAuthContext } from "@/lib/admin-auth-context";
import { useMobileSidebar } from "@/lib/mobile-sidebar-context";

export function AdminTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAdminAuthContext();
  const { toggle } = useMobileSidebar();
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="flex flex-col gap-4 border-b border-line-soft px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-mist hover:text-ivory md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="font-display text-2xl text-ivory">{title}</h1>
          {subtitle && <p className="mt-1 text-[13.5px] text-mist">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-mist hover:text-ivory">
          <Bell size={16} strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
        </button> */}
        <div className="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 font-display text-[12px] text-gold-bright">
            {initial}
          </div>
          <span className="text-[13px] text-ivory">{user?.name ?? "Admin"}</span>
        </div>
      </div>
    </header>
  );
}
