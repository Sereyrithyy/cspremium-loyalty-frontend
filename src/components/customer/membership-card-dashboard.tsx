"use client";

import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatPoints } from "@/lib/utils";
import type { Customer } from "@/types";
import Image from "next/image";

type MembershipCardProps = {
  customer: Pick<Customer, "name" | "memberId" | "phone" | "totalPoints" | "tier" | "qrToken" | "status">;
  className?: string;
};

export const MembershipCardDashboard = forwardRef<HTMLDivElement, MembershipCardProps>(
  function MembershipCard({ customer, className }, ref) {
    // Replace your current qrValue with this:
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
      }
      if (typeof window !== "undefined") {
        return window.location.origin;
      }
      // Fallback for SSR
      return "https://yourdomain.com";
    };

    const qrValue = `${getBaseUrl()}/member/${customer.qrToken}`;

    // Tier color mapping
    const tierColors = {
      bronze: "from-amber-700/20 to-amber-700/5 border-amber-600/30 text-amber-400",
      standard: "from-gray-300/20 to-gray-300/5 border-gray-400/30 text-gray-300",
      gold: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
      vip: "from-blue-400/20 to-blue-400/5 border-blue-400/30 text-blue-300",
      diamond: "from-cyan-400/20 to-cyan-400/5 border-cyan-400/30 text-cyan-300",
    };

    const tierColor = tierColors[customer.tier.toLowerCase() as keyof typeof tierColors] || tierColors.gold;

    return (
      <div ref={ref} className={`group relative ${className ?? ""}`}>
        {/* Outer glow effect */}
        <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-gold-dim/20 via-gold/10 to-gold-dim/20 blur-xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        
        <div className="relative aspect-[1.62/1] w-full overflow-hidden rounded-2xl bg-linear-to-br from-gold/40 via-gold/40 to-gold/40 p-px">
          {/* Inner card with premium texture */}
          <div className="relative h-full w-full rounded-2xl bg-linear-to-br from-[#1e1a24] via-[#16131c] to-[#0d0b10] px-5 py-4">
            {/* Subtle pattern overlay */}
           
            
            {/* Corner accents */}
        
            <div className="relative flex h-full flex-col justify-between">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative mb-2">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={80}  
                      height={80}
                      priority
                      className="h-12 w-12 sm:h-13 sm:w-13 object-contain transition-opacity hover:opacity-80"
                    />
                  </div>
                  {/* <div>
                    <p className="text-[10px] font-light uppercase tracking-[0.3em] text-mist/50">
                      Loyalty
                    </p>
                    <p className="text-[10px] font-light uppercase tracking-[0.3em] text-mist/50">
                      Membership
                    </p>
                  </div> */}
                </div>
                
                {/* Tier badge with gradient */}
                <div className={`rounded-full bg-linear-to-br ${tierColor} px-3 py-1 text-[9px] font-semibold uppercase tracking-widest ring-1 ring-gold/20 backdrop-blur-sm`}>
                  {customer.tier}
                </div>
              </div>

              {/* Main content */}
              <div className="flex items-end justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-light tracking-tight uppercase text-ivory sm:text-2xl">
                    {customer.name}
                  </p>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] tracking-wider">
                    {/* <span className="flex items-center gap-1.5">
                      <span className="text-gold/50">◆</span>
                      {customer.memberId}
                    </span>
                    <span className="text-gold/20">|</span> */}
                    <span className="flex items-center gap-1.5">
                      {/* <span className="text-gold/50">◉</span> */}
                      {customer.phone}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end gap-3">
                    <div>
                      <p className="text-[8px] font-light uppercase tracking-[0.25em] text-mist/110">
                        Points Balance
                      </p>
                      <p className="font-display text-4xl font-light tracking-tight text-gold-bright sm:text-3xl">
                        {formatPoints(customer.totalPoints)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code with improved styling */}
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  <div className="relative rounded-xl bg-white/5 p-1 ring-1 ring-gold/10 backdrop-blur-sm transition-all duration-300 hover:ring-gold/30">
                    <div className="absolute inset-0 rounded-xl bg-linear-to-br from-gold/5 to-transparent" />
                    <QRCodeSVG 
                      value={qrValue}
                      size={56} 
                      fgColor="#1a161f" 
                      bgColor="#f3efe4"
                      level="H"
                      includeMargin={false}
                      className="relative"
                    />
                  </div>
                  <p className="text-[7px] font-light uppercase tracking-[0.2em] text-center leading-tight">
                    Scan to open
                  </p>
                </div>
              </div>

              {/* Bottom decorative line */}    
            </div>
          </div>
        </div>
      </div>
    );
  }
);