"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminAuthContext } from "@/lib/admin-auth-context";
import { useMobileSidebar } from "@/lib/mobile-sidebar-context";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  MinusCircle,
  Gift,
  Receipt,
  ScrollText,
  UserCog,
  LogOut,
  X,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/points/add", label: "Add Points", icon: PlusCircle },
  { href: "/admin/points/redeem", label: "Redeem Points", icon: MinusCircle },
  { href: "/admin/rewards", label: "Rewards", icon: Gift },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/admins", label: "Admins", icon: UserCog },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuthContext();
  const { open, close } = useMobileSidebar();

  // Close the mobile drawer automatically whenever the route changes.
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Backdrop — mobile only, shown while the drawer is open */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line-soft bg-surface transition-transform duration-200 ease-out md:w-60 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-line-soft px-5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gold" />
            <span className="font-display text-[17px] italic text-ivory">CSPremiumSolutions</span>
          </div>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-md text-mist hover:text-ivory md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-gold/12 text-gold-bright"
                    : "text-mist hover:bg-surface-2 hover:text-ivory"
                )}
              >
                <Icon size={17} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line-soft p-3">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-mist hover:bg-surface-2 hover:text-ivory"
          >
            <LogOut size={17} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
