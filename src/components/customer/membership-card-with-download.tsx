"use client";

import { useRef } from "react";
import { MembershipCard } from "@/components/customer/membership-card";
import { DownloadCardButton } from "@/components/customer/download-card-button";
import type { Customer } from "@/types";

export function MembershipCardWithDownload({
  customer,
}: {
  customer: Pick<Customer, "name" | "memberId" | "phone" | "totalPoints" | "tier" | "qrToken">;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <MembershipCard ref={cardRef} customer={customer} />
      <DownloadCardButton
        cardRef={cardRef}
        filename={`${customer.memberId}-membership-card.png`}
        className="mt-3"
      />
    </div>
  );
}
