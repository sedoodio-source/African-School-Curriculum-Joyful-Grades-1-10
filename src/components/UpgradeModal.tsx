import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  Building, 
  Smartphone, 
  Check, 
  ArrowRight, 
  Bot, 
  Search, 
  FileText, 
  FlaskConical, 
  Mic, 
  BarChart3, 
  Music, 
  Calendar, 
  AlertCircle, 
  Info,
  Gift
} from 'lucide-react';
import { User } from '../types';
import { useUpgradeStatus, activateUpgrade, simulateExpireUpgrade, resetUpgradeStatus } from '../utils/upgradeManager';
import { cn } from '../lib/utils';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function UpgradeModal({ isOpen, onClose, user }: UpgradeModalProps) {
  const status = useUpgradeStatus(user);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!isOpen) return null;

  const isFreeUpgrade = !status.hasUsedFreeUpgrade;

  const handleFreeUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      activateUpgrade(user, 'free');
      setIsProcessing(false);
      setStep('success');

      // Voice greeting
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `Congratulations ${user.name}! Your free welcome monthly upgrade is now active. All curriculum AI tools and Miss Kelechi are fully unlocked!`
        );
        utterance.lang = 'en-GB';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error(e);
      }
    }, 1000);
  };

  const handlePaidUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      activateUpgrade(user, 'paid_1000');
      setIsProcessing(false);
      setStep('success');

      // Voice greeting
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `Payment of 1,000 Naira confirmed! Your monthly curriculum upgrade is active. Miss Kelechi AI, live Google search, and all interactive features are ready for you!`
        );
        utterance.lang = 'en-GB';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error(e);
      }
    }, 1200);
  };

  const UPGRADE_BENEFITS = [
    {
      icon: <Bot className="w-6 h-6 text-indigo-400" />,
      tag: "24/7 AI Tutor",
      title: "Miss Kelechi AI Teacher",
      desc: "Unlimited real-time interactive teaching, adaptive voice lessons, and step-by-step academic explanations across all Grade 1-10 subjects."
    },
    {
      icon: <Search className="w-6 h-6 text-amber-400" />,
      tag: "Live Grounding",
      title: "Google-Grounded AI Search",
      desc: "Real-time research explorer grounded in live Google Search data with verified sources, African context, and Nigerian Naira (₦) examples."
    },
    {
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
      tag: "Instant Grading",
      title: "Smart Worksheets & Feedback",
      desc: "Automated scoring of multiple-choice and theoretical written answers with teacherly corrections, mastery feedback, and redo checks."
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-purple-400" />,
      tag: "Hands-on STEM",
      title: "AI STEM Lab & Projects",
      desc: "Mentored science experiments, African engineering challenges, and creative projects with smart step-by-step guidance."
    },
    {
      icon: <Mic className="w-6 h-6 text-blue-400" />,
      tag: "Omnipresent",
      title: "Omni Floating Voice Tutor",
      desc: "Miss Kelechi available everywhere across the app for instant homework solutions, vocabulary help, and scripture devotionals."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-rose-400" />,
      tag: "Mastery Drills",
      title: "Speed Drills & Timetable",
      desc: "Access to daily speed drill exercises, mastery tracking, timetable scheduling, and Grade Final Exam certification."
    },
    {
      icon: <Music className="w-6 h-6 text-teal-400" />,
      tag: "Faith & Arts",
      title: "Christian Worship & Cinema",
      desc: "Full access to Christian songs (Robin Mark, William McDowell, Nosa, etc.), lyrics analysis, and moral video reflections."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
      tag: "Certification",
      title: "Terminal Report Card & Awards",
      desc: "Official printable term report cards, subject mastery certificates, and personalized academic award tracking."
    }
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] w-full h-full bg-slate-950 text-slate-100 overflow-y-auto"
      >
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
          
          {/* Full Screen Top Navigation Bar */}
          <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline font-black text-base sm:text-lg text-white">
                    Curriculum & AI Upgrade
                  </h1>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300">
                    Monthly Plan
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Anne-Sam Christian Academy • 30-Day Scholar Access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {status.isUpgraded ? (
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Active: {status.daysRemaining} days remaining</span>
                </div>
              ) : isFreeUpgrade ? (
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Free 1st Month Available</span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>₦1,000 / Month</span>
                </div>
              )}

              <button 
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-white/10 shadow-sm"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </nav>

          {/* Full Screen Scrollable Body Content */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
            
            {/* Hero Header Section */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 border border-white/15 p-6 sm:p-10 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Scholastic Intelligence & Faith Academy
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Unlock the Complete 24/7 AI Teacher & Curriculum Power
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  Scholars upgrade <strong className="text-amber-300">once every month (30 days)</strong> to fuel continuous interactive teaching with Miss Kelechi, live Google search grounding, instant worksheet corrections, and academic certifications.
                </p>

                {/* Status Indicator Bar */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>
                      Subscription Cycle: <strong className="text-white">30 Days (1 Month)</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      Account Status: {status.isUpgraded ? (
                        <span className="text-emerald-400 font-black">Active ({status.daysRemaining} days remaining)</span>
                      ) : (
                        <span className="text-amber-400 font-black">
                          {status.hasUsedFreeUpgrade ? 'Renew for ₦1,000' : '100% Free 1st Month'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Main Hero Action Button */}
                {step === 'info' && (
                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    {isFreeUpgrade ? (
                      <button
                        onClick={handleFreeUpgrade}
                        disabled={isProcessing}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <span>Activating Free Upgrade...</span>
                        ) : (
                          <>
                            <Gift className="w-5 h-5" />
                            <span>Activate 1st Month Free Upgrade (₦0)</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    ) : status.isUpgraded ? (
                      <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/30 px-6 py-3.5 rounded-2xl text-emerald-300 font-bold text-sm">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <span>Curriculum Upgraded & Active — Scholars upgrade once a month!</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setStep('payment')}
                        className="px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-400/25 flex items-center gap-3 transition-all active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
                        <span>Upgrade for 1,000 Naira (30 Days)</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* If In Info Step: Show All 8 Benefits in Full Cards */}
            {step === 'info' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                      <Sparkles className="w-6 h-6 text-amber-400" />
                      What You Unlock When You Upgrade (All 8 Features)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                      Every feature below is fully included in the monthly curriculum upgrade.
                    </p>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 bg-white/10 text-amber-300 rounded-full border border-white/10 shrink-0">
                    Full Access Package
                  </span>
                </div>

                {/* 8 Full Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                  {UPGRADE_BENEFITS.map((benefit, idx) => (
                    <div 
                      key={idx}
                      className="p-6 rounded-3xl bg-slate-800/80 border border-white/10 hover:border-amber-400/40 hover:bg-slate-800 transition-all shadow-lg flex items-start gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-400/20 group-hover:border-amber-400/40 transition-all">
                        {benefit.icon}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-black text-white text-base group-hover:text-amber-300 transition-colors">
                            {benefit.title}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-amber-300 border border-white/10 shrink-0">
                            {benefit.tag}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Academic Continuity Policy Box */}
                <div className="p-6 rounded-3xl bg-slate-800/50 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-300">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h5 className="font-black text-white text-sm">Academic Continuity & Subscription Policy</h5>
                    <p className="leading-relaxed text-xs">
                      The Upgrade button is always available at the top navigation bar. If a month expires without renewal, AI tools (Miss Kelechi voice tutor and live search) will pause until renewed for <strong>1,000 Naira</strong>. All curriculum texts, notes, and reading materials remain available.
                    </p>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-800 to-indigo-950 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                  <div>
                    <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">Ready for Academic Excellence?</span>
                    <h4 className="text-xl font-black text-white mt-1">
                      {isFreeUpgrade ? "Activate Your Free 30-Day Scholar Upgrade" : "Renew Curriculum Upgrade for ₦1,000"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Instant activation • 30-day continuous learning
                    </p>
                  </div>

                  <div>
                    {isFreeUpgrade ? (
                      <button
                        onClick={handleFreeUpgrade}
                        disabled={isProcessing}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base rounded-2xl shadow-xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Gift className="w-5 h-5" />
                        <span>Activate Free (₦0)</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : status.isUpgraded ? (
                      <button
                        onClick={onClose}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-2xl border border-white/20 flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Active ({status.daysRemaining} days left) — Continue Learning</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setStep('payment')}
                        className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl flex items-center gap-3 transition-all active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
                        <span>Proceed to Upgrade (₦1,000)</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Developer / Testing Switcher */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                  <span>Testing and Demo Utilities:</span>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => simulateExpireUpgrade(user)}
                      className="text-slate-400 hover:text-amber-400 underline cursor-pointer"
                    >
                      Simulate Expired Month
                    </button>
                    <button 
                      onClick={() => resetUpgradeStatus(user)}
                      className="text-slate-400 hover:text-blue-400 underline cursor-pointer"
                    >
                      Reset to Free New Scholar (₦0)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Step: 1,000 Naira Checkout */}
            {step === 'payment' && (
              <div className="max-w-2xl mx-auto space-y-8 bg-slate-800/90 border border-white/15 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      Payment Checkout: ₦1,000
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      1-Month Complete Curriculum & AI Access (30 Days)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-amber-400">₦1,000</span>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-black">Monthly</span>
                  </div>
                </div>

                {/* Method Tabs */}
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase text-slate-300 tracking-wider">
                    Select Preferred Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={cn(
                        "p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer",
                        paymentMethod === 'card'
                          ? "border-amber-400 bg-amber-400/15 text-amber-300 ring-2 ring-amber-400/30"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      )}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="text-xs font-bold">Debit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={cn(
                        "p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer",
                        paymentMethod === 'transfer'
                          ? "border-amber-400 bg-amber-400/15 text-amber-300 ring-2 ring-amber-400/30"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      )}
                    >
                      <Building className="w-6 h-6" />
                      <span className="text-xs font-bold">Bank Transfer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ussd')}
                      className={cn(
                        "p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer",
                        paymentMethod === 'ussd'
                          ? "border-amber-400 bg-amber-400/15 text-amber-300 ring-2 ring-amber-400/30"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      )}
                    >
                      <Smartphone className="w-6 h-6" />
                      <span className="text-xs font-bold">USSD / OPay</span>
                    </button>
                  </div>
                </div>

                {/* Card Fields */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 bg-slate-900/80 p-6 rounded-2xl border border-white/10">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Card Number</label>
                      <input 
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="5399 •••• •••• 4242 (Mastercard / Visa / Verve)"
                        className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-white/20 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Expiry Date</label>
                        <input 
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY (e.g. 12/28)"
                          className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-white/20 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">CVV / CVC</label>
                        <input 
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={4}
                          placeholder="123"
                          className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-white/20 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {paymentMethod === 'transfer' && (
                  <div className="space-y-3 bg-blue-950/40 p-6 rounded-2xl border border-blue-500/30 text-slate-200 text-sm">
                    <p className="font-bold text-blue-300 text-sm">Transfer ₦1,000 to Academy Treasury Account:</p>
                    <div className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs text-slate-300">
                      <div><strong>Bank:</strong> GTBank / Zenith Bank</div>
                      <div><strong>Account Number:</strong> 0124893721</div>
                      <div><strong>Account Name:</strong> Anne-Sam Christian Academy</div>
                      <div><strong>Reference:</strong> SCHOLAR-{user.name.toUpperCase().replace(/\s+/g, '')}</div>
                    </div>
                    <p className="text-xs text-blue-400">Account verified automatically upon payment transfer.</p>
                  </div>
                )}

                {/* USSD Details */}
                {paymentMethod === 'ussd' && (
                  <div className="space-y-3 bg-amber-950/40 p-6 rounded-2xl border border-amber-500/30 text-slate-200 text-sm">
                    <p className="font-bold text-amber-300 text-sm">Dial USSD Code on registered phone:</p>
                    <div className="bg-slate-950 p-5 rounded-xl border border-white/10 font-mono text-center text-lg font-black text-amber-400 tracking-wider">
                      *737*50*1000*8492#
                    </div>
                    <p className="text-xs text-amber-400 text-center">Supports GTBank, Zenith, Access, UBA, and OPay.</p>
                  </div>
                )}

                {/* Security Guarantee */}
                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>256-Bit SSL Encrypted & Nigerian Banking Compliant</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/10 text-white font-bold text-sm cursor-pointer"
                  >
                    Back to Benefits
                  </button>
                  <button
                    type="button"
                    onClick={handlePaidUpgrade}
                    disabled={isProcessing}
                    className="flex-1 py-4 px-8 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span>Processing Payment...</span>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Confirm ₦1,000 Payment (30 Days)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="max-w-xl mx-auto text-center py-12 space-y-6 bg-slate-800/80 border border-white/15 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-emerald-500/30 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white">
                    Curriculum Upgrade Activated!
                  </h3>
                  <p className="text-slate-300 text-sm font-medium">
                    Your monthly upgrade is now active for <strong className="text-white">30 days</strong>. Miss Kelechi 24/7 AI tutoring, live Google search grounding, and smart worksheets are ready!
                  </p>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-500/30 p-4 rounded-2xl text-xs text-emerald-300 font-bold">
                  🌟 Miss Kelechi: "Splendid work, {user.name}! I am ready to guide you on your journey of academic excellence and Christian character."
                </div>

                <button
                  onClick={() => {
                    setStep('info');
                    onClose();
                  }}
                  className="w-full max-w-sm mx-auto py-4 px-8 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all active:scale-95 block cursor-pointer"
                >
                  Start Learning Now
                </button>
              </div>
            )}
          </main>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
