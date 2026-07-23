"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { MembershipCardWithDownload } from "@/components/customer/membership-card-with-download";
import { ActivityHistory } from "@/components/customer/activity-history";
import { RewardsCatalog } from "@/components/customer/rewards-catalog";
import { Card } from "@/components/ui/card";
import { formatPoints, formatCurrency } from "@/lib/utils";
import type { Customer, PointTransaction, Reward } from "@/types";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Tier configuration
const TIERS = {
  standard: {
    name: "Standard",
    threshold: 0,
    nextTier: "Gold",
    nextThreshold: 500,
    color: "from-gray-300/20 to-gray-300/5 border-gray-400/30 text-gray-300",
    progressColor: "bg-gray-400",
  },
  gold: {
    name: "Gold",
    threshold: 500,
    nextTier: "Vip",
    nextThreshold: 1000,
    color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
    progressColor: "bg-yellow-500",
  },
  vip: {
    name: "Vip",
    threshold: 1000,
    nextTier: null,
    nextThreshold: null,
    color: "from-blue-400/20 to-blue-400/5 border-blue-400/30 text-blue-300",
    progressColor: "bg-blue-400",
  }
} as const;

type TierKey = keyof typeof TIERS;

function getTier(totalEarned: number): TierKey {
  if (totalEarned >= 1000) return "vip";
  if (totalEarned >= 500) return "gold";
  return "standard";
}

function getTierInfo(totalEarned: number) {
  const tierKey = getTier(totalEarned);
  const tier = TIERS[tierKey];
  
  const progress = tier.nextThreshold 
    ? ((totalEarned - tier.threshold) / (tier.nextThreshold - tier.threshold)) * 100
    : 100;
  
  return {
    currentTier: tierKey,
    ...tier,
    progress: Math.min(Math.max(progress, 0), 100),
    pointsNeeded: tier.nextThreshold ? tier.nextThreshold - totalEarned : 0
  };
}

function TierProgress({ totalEarned }: { totalEarned: number }) {
  const tierInfo = getTierInfo(totalEarned);
  const [gradientFrom, gradientTo, border, textColor] = tierInfo.color.split(' ');
  
  return (
    <Card className={`p-5 bg-linear-to-r ${gradientFrom} ${gradientTo} border ${border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Current Tier</p>
          <p className={`font-display text-2xl ${textColor}`}>
            {tierInfo.name}
          </p>
        </div>
        {tierInfo.nextTier && (
          <div className="text-right">
            <p className="text-sm text-white/50">Next Tier</p>
            <p className="font-display text-xl text-white/80">
              {tierInfo.nextTier}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>{tierInfo.name}</span>
          {tierInfo.nextTier && <span>{tierInfo.nextTier}</span>}
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${tierInfo.progressColor}`}
            style={{ width: `${tierInfo.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/50 mt-1">
          <span>{formatPoints(tierInfo.threshold)}</span>
          {tierInfo.nextThreshold ? (
            <span>{formatPoints(tierInfo.nextThreshold)}</span>
          ) : (
            <span className="text-emerald">MAX LEVEL</span>
          )}
        </div>
      </div>
      
      <p className="text-xs text-white/50 mt-2">
        {tierInfo.pointsNeeded > 0 ? `${tierInfo.pointsNeeded} more points needed` : "Maximum level reached!"}
      </p>
      
      {tierInfo.currentTier === "vip" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-blue-300">
          <span>{"You've reached the highest tier!"}</span>
        </div>
      )}
    </Card>
  );
}

// Fetcher function with error handling
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  const data = await res.json();
  return data;
};

// Firework Celebration Component
function FireworkCelebration({ 
  show, 
  onComplete 
}: { 
  show: boolean; 
  onComplete: () => void;
}) {
  useEffect(() => {
    if (show) {
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onComplete} // Click outside to close
      />
      <div className="relative z-10 flex flex-col items-center">
        {/* Lottie Animation */}
        <div className="w-85 h-85 pointer-events-auto">
          <DotLottieReact
            src="https://lottie.host/29be9e8d-2947-4513-805b-6697b598c64c/GgKsbH2FBj.lottie"
            loop={false} // Play once for celebration
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        <div className="mt-4 text-center pointer-events-auto">
          <h2 className="text-4xl font-display text-white animate-bounce">
            🎉 Congratulations!
          </h2>
          <p className="text-xl text-white/80 mt-2">
            {"You've reached a new tier!"}
          </p>
          <button
            onClick={onComplete}
            className="mt-6 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all pointer-events-auto"
          >
            Continue
          </button>
        </div>
      </div>
    </div>  
  );
}

interface MemberPageClientProps {
  initialCustomer: Customer;
  initialTransactions: PointTransaction[];
  initialRewards: Reward[];
  token: string;
}

export default function MemberPageClient({
  initialCustomer,
  initialTransactions,
  initialRewards,
  token,
}: MemberPageClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [showNotification, setShowNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [previousTier, setPreviousTier] = useState<TierKey>(() => 
    getTier(initialCustomer.totalEarned || 0)
  );

  useEffect(() => {
    setMounted(true);

    // Track page visibility
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // SWR for customer data - smart polling based on visibility
  const { data: customerData, error: customerError } = useSWR(
    mounted && isPageVisible ? `${API_URL}/customer/card/${encodeURIComponent(token)}` : null,
    fetcher,
    {
      fallbackData: { data: { customer: initialCustomer, transactions: initialTransactions } },
      refreshInterval: isPageVisible ? 30000 : 60000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      onSuccess: (data) => {
        if (data?.data?.customer) {
          const newPoints = data.data.customer.totalPoints;
          const oldPoints = customerData?.data?.customer?.totalPoints || initialCustomer.totalPoints;
          
          // Check if points changed
          if (newPoints !== oldPoints) {
            const diff = newPoints - oldPoints;
            setShowNotification({
              message: diff > 0 ? `+${diff} points added!` : `${diff} points redeemed`,
              type: diff > 0 ? 'success' : 'info'
            });
            
            // Auto-hide notification after 3 seconds
            setTimeout(() => setShowNotification(null), 3000);
          }

          // Check for tier upgrade
          const currentTotalEarned = data.data.customer.totalEarned || 0;
          const newTier = getTier(currentTotalEarned);
          
          // If tier changed and it's an upgrade (not downgrade)
          if (newTier !== previousTier) {
            const tierLevels = ['standard', 'gold', 'vip'];
            const prevIndex = tierLevels.indexOf(previousTier);
            const newIndex = tierLevels.indexOf(newTier);
            
            // Only show fireworks if it's an upgrade
            if (newIndex > prevIndex) {
              setShowFireworks(true);
            }
            
            // Update previous tier
            setPreviousTier(newTier);
          }
        }
      }
    }
  );

  // SWR for rewards data
  const { data: rewardsData } = useSWR(
    mounted && isPageVisible ? `${API_URL}/rewards?status=active` : null,
    fetcher,
    {
      fallbackData: { data: initialRewards },
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  // Extract data with fallbacks
  const customer = customerData?.data?.customer ?? initialCustomer;
  const transactions = customerData?.data?.transactions ?? initialTransactions;
  const rewards = rewardsData?.data ?? initialRewards;

  // Handle error state
  if (customerError) {
    console.error('Error fetching customer data:', customerError);
    // Continue with initial data
  }

  // Render component with animation when data changes
  const renderContent = () => (
    <>
      {/* Firework Celebration */}
      <FireworkCelebration 
        show={showFireworks} 
        onComplete={() => setShowFireworks(false)} 
      />

      {/* Notification Banner */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 ${
          showNotification.type === 'success' 
            ? 'bg-emerald-500/90 text-white' 
            : 'bg-blue-500/90 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{showNotification.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span className="font-medium">{showNotification.message}</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-ink pb-24">
        <div className="mx-auto max-w-2xl px-6 pt-10">
          <div className="mt-6 transition-all duration-300 hover:scale-[1.01]">
            <MembershipCardWithDownload customer={customer} />
          </div>

          <div className="mt-6 transition-all duration-300 hover:scale-[1.01]">
            <TierProgress totalEarned={customer.totalEarned || 0} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Card className="p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <p className="font-display text-2xl text-ivory transition-all duration-300">
                {formatPoints(customer.totalPoints || 0)}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-mist-dim">Available</p>
            </Card>
            <Card className="p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <p className="font-display text-2xl text-emerald transition-all duration-300">
                {formatPoints(customer.totalEarned || 0)}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-mist-dim">Total Earned</p>
            </Card>
            <Card className="p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <p className="font-display text-2xl text-rust transition-all duration-300">
                {formatPoints(customer.totalRedeemed || 0)}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-mist-dim">Total Redeemed</p>
            </Card>
          </div>

          <div className="mt-6 transition-all duration-300">
            <RewardsCatalog rewards={rewards} availablePoints={customer.totalPoints || 0} />
          </div>

          <div className="mt-6 transition-all duration-300">
            <ActivityHistory transactions={transactions || []} />
          </div>

          <p className="mt-10 text-center text-[12px] text-mist-dim">
            1 point = {formatCurrency(1)} · Ask our team to add points after your next purchase.
          </p>
          
          {/* Connection status indicator */}
          <div className="mt-4 flex justify-center items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${customerError ? 'bg-rust' : 'bg-emerald'} transition-all duration-300`} />
            <span className="text-[12px] text-mist-dim">
              {customerError ? 'Connection issue' : 'Live updates active'}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return renderContent();
}