"use client";

import { useState, type RefObject } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadCardButton({
  cardRef,
  filename,
  className,
  variant = "secondary",
  size = "sm",
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  filename: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    if (!cardRef.current) return;
    setError("");
    setDownloading(true);
    try {
      // pixelRatio bumps resolution so the exported PNG stays crisp — the card
      // renders fairly small on screen but should look good printed or zoomed in.
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } catch {
      setError("Couldn't generate the card image. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={className}>
      <Button variant={variant} size={size} className="w-full" onClick={handleDownload} disabled={downloading}>
        {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {downloading ? "Preparing…" : "Download card"}
      </Button>
      {error && <p className="mt-1.5 text-[12px] text-rust">{error}</p>}
    </div>
  );
}
