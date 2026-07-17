"use client";

import { useEffect, useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { LoadingBlock, ErrorBlock } from "@/components/ui/loading";
import { listAuditLog } from "@/lib/api/audit";
import { ApiClientError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogEntry } from "@/types";
import { ScrollText } from "lucide-react";

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listAuditLog(1, 30)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load audit log."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminTopbar title="Audit Log" subtitle="Every action taken by an admin account" />

      <div className="px-6 py-6 md:px-8">
        {error && <ErrorBlock message={error} />}
        {loading && !error && <LoadingBlock label="Loading audit log…" />}

        {!loading && !error && (
          <Card className="divide-y divide-line-soft">
            {items.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-mist">
                  <ScrollText size={14} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13.5px] text-ivory">
                    <span className="text-gold-bright">{entry.actor}</span> {entry.action}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-mist-dim">{entry.target}</p>
                </div>
                <span className="ml-auto shrink-0 text-[12px] text-mist-dim">{formatDateTime(entry.createdAt)}</span>
              </div>
            ))}
            {items.length === 0 && (
              <p className="py-10 text-center text-[13px] text-mist-dim">No audit entries yet.</p>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
