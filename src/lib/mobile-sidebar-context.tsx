"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface MobileSidebarValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarValue | null>(null);

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider
      value={{
        open,
        toggle: () => setOpen((v) => !v),
        close: () => setOpen(false),
      }}
    >
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx) throw new Error("useMobileSidebar must be used within MobileSidebarProvider");
  return ctx;
}
