import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Sparkles, AlertCircle, Bot, Gift, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { useUpgradeStatus } from '../utils/upgradeManager';
import UpgradeModal from './UpgradeModal';
import { cn } from '../lib/utils';

interface AIUpgradeLockedBannerProps {
  user: User;
  featureName?: string;
  className?: string;
  compact?: boolean;
}

export default function AIUpgradeLockedBanner({
  user,
  featureName = "AI Teacher (Miss Kelechi)",
  className,
  compact = false
}: AIUpgradeLockedBannerProps) {
  const [showModal, setShowModal] = useState(false);
  const status = useUpgradeStatus(user);

  const isFree = !status.hasUsedFreeUpgrade;

  if (status.isUpgraded) {
    return null;
  }

  if (compact) {
    return (
      <>
        <div className={cn(
          "p-4 rounded-2xl border border-amber-300 bg-amber-50/90 text-slate-800 flex items-center justify-between gap-3 text-xs shadow-sm",
          className
        )}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-slate-900 block">{featureName} is Paused</span>
              <span className="text-slate-600">
                {isFree ? "First month upgrade is free!" : "Monthly upgrade (₦1,000) required."}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl font-black text-xs shrink-0 transition-all active:scale-95 shadow-xs flex items-center gap-1.5",
              isFree 
                ? "bg-emerald-600 text-white hover:bg-emerald-500" 
                : "bg-amber-500 text-slate-950 hover:bg-amber-400"
            )}
          >
            {isFree ? (
              <>
                <Gift className="w-3.5 h-3.5" />
                <span>Free Upgrade</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade (₦1,000)</span>
              </>
            )}
          </button>
        </div>

        {showModal && (
          <UpgradeModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            user={user} 
          />
        )}
      </>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-700 shadow-2xl relative overflow-hidden text-center space-y-5",
          className
        )}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            AI Feature Unavailable
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {featureName} is Currently Locked
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {isFree 
              ? `Welcome ${user.name}! Activate your Free First Month Upgrade (₦0) to unlock Miss Kelechi 24/7 AI tutoring, live search, and interactive feedback.`
              : `Your monthly curriculum upgrade period has ended. AI is temporarily unavailable. Upgrade for 1,000 Naira to resume full 24/7 AI access.`}
          </p>
        </div>

        <div className="pt-2 max-w-md mx-auto">
          <button
            onClick={() => setShowModal(true)}
            className={cn(
              "w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl",
              isFree
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110 shadow-emerald-500/25"
                : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-105 shadow-amber-500/25 ring-4 ring-amber-400/30"
            )}
          >
            {isFree ? (
              <>
                <Gift className="w-5 h-5" />
                <span>Activate Free Upgrade (₦0)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>Upgrade for 1,000 Naira</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          The Upgrade button is always available in your header and dashboard navigation.
        </p>
      </motion.div>

      {showModal && (
        <UpgradeModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          user={user} 
        />
      )}
    </>
  );
}
