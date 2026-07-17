import { cn } from "@/lib/utils";
import { type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, forwardRef } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface",
        className
      )}
      {...props}
    />
  );
}

type BadgeTone = "gold" | "emerald" | "rust" | "neutral";

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    gold: "bg-gold/12 text-gold-bright border-gold-dim/40",
    emerald: "bg-emerald/12 text-emerald border-emerald/30",
    rust: "bg-rust/12 text-rust border-rust/30",
    neutral: "bg-surface-3 text-mist border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-line bg-surface-2 px-3.5 text-sm text-ivory placeholder:text-mist-dim outline-none transition-colors focus:border-gold-dim focus:ring-1 focus:ring-gold-dim",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-medium text-mist", className)}
      {...props}
    />
  );
}
