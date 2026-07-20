import { Card } from "@/components/ui/card";
import { getAssetUrl } from "@/lib/api-client";
import { formatPoints } from "@/lib/utils";
import type { Reward } from "@/types";
import { Gift, Check } from "lucide-react";

export function RewardsCatalog({
  rewards,
  availablePoints,
}: {
  rewards: Reward[];
  availablePoints: number;
}) {
  if (rewards.length === 0) {
    return (
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl text-ivory">Rewards</h2>
          <p className="text-[12px] text-mist-dim">Redeemed by our team on your behalf</p>
        </div>
        <Card className="mt-4 p-6 text-center text-[13px] text-mist-dim">
          No rewards available at the moment. Check back soon!
        </Card>
      </section>
    );
  }

  const sorted = [...rewards].sort((a, b) => a.requiredPoints - b.requiredPoints);

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl text-ivory">Rewards</h2>
        <p className="text-[12px] text-mist-dim">Redeemed by our team on your behalf</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sorted.map((reward) => {
          const imageUrl = getAssetUrl(reward.image);
          const achievable = availablePoints >= reward.requiredPoints;
          const progress = Math.min(100, Math.round((availablePoints / reward.requiredPoints) * 100));
          const remaining = reward.requiredPoints - availablePoints;

          return (
            <Card
              key={reward.id}
              className={`flex gap-3 overflow-hidden p-3 ${achievable ? "border-gold-dim/50" : ""}`}
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={reward.name} className="h-full w-full object-cover" />
                ) : (
                  <Gift size={20} className="text-gold-dim" strokeWidth={1.5} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[14px] text-ivory">{reward.name}</p>
                  {achievable && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald/12 px-2 py-0.5 text-[10px] font-medium text-emerald">
                      <Check size={10} strokeWidth={2.5} />
                      Ready
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12px] text-mist-dim">{reward.description}</p>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-gold-bright">{formatPoints(reward.requiredPoints)} pts</span>
                  {!achievable && (
                    <span className="text-mist-dim">{formatPoints(remaining)} more to go</span>
                  )}
                </div>

                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={`h-full rounded-full ${achievable ? "bg-emerald" : "bg-gold-dim"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}