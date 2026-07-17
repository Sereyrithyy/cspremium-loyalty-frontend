import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-ink hover:bg-gold-bright disabled:bg-gold-dim disabled:text-ink-soft/60",
  secondary:
    "bg-surface-3 text-ivory hover:bg-surface-3/70 border border-line",
  outline:
    "bg-transparent text-gold border border-gold-dim hover:border-gold hover:bg-gold/5",
  ghost: "bg-transparent text-mist hover:text-ivory hover:bg-surface-2",
  danger: "bg-rust text-ivory hover:bg-rust/85",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-[15px] rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
