import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "gold" | "emerald" | "rust" | "neutral";
}) {
  const tones: Record<string, string> = {
    gold: "bg-gold/10 text-gold-bright",
    emerald: "bg-emerald/10 text-emerald",
    rust: "bg-rust/10 text-rust",
    neutral: "bg-surface-3 text-mist",
  };
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-medium text-mist">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tones[tone])}>
          <Icon size={16} strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl text-ivory">{value}</p>
    </div>
  );
}
