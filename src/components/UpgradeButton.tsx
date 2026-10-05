import React, { useState } from 'react';
import { Sparkles, Gift, Check, Lock, ChevronRight } from 'lucide-react';
import { User } from '../types';
import { useUpgradeStatus } from '../utils/upgradeManager';
import UpgradeModal from './UpgradeModal';
import { cn } from '../lib/utils';

interface UpgradeButtonProps {
  user: User;
  variant?: 'header' | 'banner' | 'card' | 'compact' | 'pill' | 'locked';
  className?: string;
  label?: string;
}

export default function UpgradeButton({ 
  user, 
  variant = 'header',
  className,
  label
}: UpgradeButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const status = useUpgradeStatus(user);

  const isFree = !status.hasUsedFreeUpgrade;
  const isUpgraded = status.isUpgraded;

  const defaultLabel = isFree 
    ? "Free Upgrade" 
    : isUpgraded 
      ? "Upgraded" 
      : "Upgrade for ₦1,000";

  const buttonText = label || (
    variant === 'header' 
      ? (isFree ? "Upgrade (Free)" : isUpgraded ? "Curriculum Upgraded" : "Upgrade (₦1,000)")
      : defaultLabel
  );

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            "group relative px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-xs",
            isFree
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110 shadow-emerald-500/20"
              : isUpgraded
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300/80 hover:bg-emerald-200"
                : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-105 shadow-amber-500/25 ring-2 ring-amber-400/40 animate-pulse",
            className
          )}
          title="Curriculum & AI Upgrade"
        >
          {isFree ? (
            <Gift className="w-3.5 h-3.5" />
          ) : isUpgraded ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          )}
          <span>{buttonText}</span>
          {!isUpgraded && (
            <span className="w-2 h-2 rounded-full bg-amber-950 inline-block animate-ping" />
          )}
        </button>
      )}

      {variant === 'banner' && (
        <div className={cn(
          "w-full p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all",
          isUpgraded 
            ? "bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200" 
            : isFree 
              ? "bg-gradient-to-r from-indigo-50 via-purple-50/50 to-white border-indigo-200" 
              : "bg-gradient-to-r from-amber-50 via-yellow-50/60 to-white border-amber-300",
          className
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs border",
              isUpgraded 
                ? "bg-emerald-100 border-emerald-300 text-emerald-800" 
                : isFree 
                  ? "bg-indigo-100 border-indigo-300 text-indigo-800" 
                  : "bg-amber-100 border-amber-300 text-amber-900"
            )}>
              {isUpgraded ? (
                <Check className="w-5 h-5" />
              ) : isFree ? (
                <Gift className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 text-slate-700">
                  Curriculum Status
                </span>
                <span className={cn(
                  "text-xs font-black",
                  isUpgraded ? "text-emerald-700" : isFree ? "text-indigo-700" : "text-amber-800"
                )}>
                  {isUpgraded 
                    ? `Active (${status.daysRemaining}d left)` 
                    : isFree 
                      ? "Free 1st Month Available" 
                      : "Upgrade Required (₦1,000)"}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {isUpgraded 
                  ? "All 8 curriculum AI features and Miss Kelechi unlocked." 
                  : isFree 
                    ? "Click to activate your 1st month upgrade for ₦0." 
                    : "Renew for ₦1,000 to resume 24/7 AI tutoring & live search."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className={cn(
              "px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-sm cursor-pointer",
              isUpgraded 
                ? "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50" 
                : isFree 
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
            )}
          >
            {isUpgraded ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>View 8 Benefits</span>
              </>
            ) : isFree ? (
              <>
                <Gift className="w-3.5 h-3.5" />
                <span>Activate Free (₦0)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade (₦1,000)</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {variant === 'compact' && (
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer",
            isFree 
              ? "bg-emerald-600 text-white hover:bg-emerald-500" 
              : isUpgraded 
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                : "bg-amber-400 text-slate-950 hover:bg-amber-300",
            className
          )}
        >
          {isFree ? <Gift className="w-3 h-3" /> : isUpgraded ? <Check className="w-3 h-3 text-emerald-600" /> : <Sparkles className="w-3 h-3" />}
          <span>{buttonText}</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-sm",
            isFree 
              ? "bg-emerald-600 text-white hover:bg-emerald-500" 
              : isUpgraded 
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200" 
                : "bg-amber-500 text-slate-950 hover:bg-amber-400",
            className
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>{buttonText}</span>
        </button>
      )}

      {variant === 'card' && (
        <div className={cn(
          "p-6 rounded-3xl border transition-all relative overflow-hidden",
          isUpgraded 
            ? "bg-gradient-to-br from-emerald-50 to-teal-50/40 border-emerald-200" 
            : isFree 
              ? "bg-gradient-to-br from-indigo-50 to-blue-50/60 border-indigo-200" 
              : "bg-gradient-to-br from-amber-50 to-yellow-50/60 border-amber-300 shadow-lg shadow-amber-500/5",
          className
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 border text-[11px] font-black uppercase tracking-wider text-slate-700">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Monthly Curriculum Status
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {isUpgraded 
                  ? "Monthly AI & Curriculum Active" 
                  : isFree 
                    ? "🎁 Free Welcome Upgrade Available" 
                    : "🔒 Monthly Upgrade Required for AI"}
              </h3>
              <p className="text-xs text-slate-600 font-medium max-w-md">
                {isUpgraded 
                  ? `Full AI Teacher, live Google Search grounding, and drills active (${status.daysRemaining} days remaining).`
                  : isFree 
                    ? "Activate your first month of unlimited 24/7 AI tutoring and curriculum tools with no payments."
                    : "Your monthly upgrade has ended. Upgrade for 1,000 Naira to unlock 24/7 Miss Kelechi AI."}
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className={cn(
                "px-6 py-3.5 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95",
                isUpgraded 
                  ? "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50" 
                  : isFree 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" 
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/40"
              )}
            >
              {isUpgraded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>View Upgrade Details</span>
                </>
              ) : isFree ? (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Activate Free Upgrade (₦0)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade for 1,000 Naira</span>
                </>
              )}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {variant === 'locked' && (
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            "w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl",
            isFree
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25"
              : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-105 shadow-amber-500/25 ring-4 ring-amber-400/30",
            className
          )}
        >
          {isFree ? (
            <>
              <Gift className="w-5 h-5" />
              <span>Activate Free Upgrade to Unlock AI (₦0)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Upgrade for 1,000 Naira to Unlock AI</span>
            </>
          )}
        </button>
      )}

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
