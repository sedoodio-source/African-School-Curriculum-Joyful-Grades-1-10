import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { checkAllGradesFinished, unlockAllGrades, lockAllGrades } from '../utils/gradeCompletion';
import { 
  Lock, ShieldAlert, Award, GraduationCap, CheckCircle2, 
  ArrowRight, BookOpen, Key, AlertTriangle, Sparkles, School, ChevronRight
} from 'lucide-react';

interface WaecJambLockedProps {
  user: User;
  history?: any[];
  onBack?: () => void;
  onUnlocked?: () => void;
}

export default function WaecJambLocked({ user, history = [], onBack, onUnlocked }: WaecJambLockedProps) {
  const status = checkAllGradesFinished(user, history);
  const [showTeacherOverride, setShowTeacherOverride] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  const handleAdminUnlock = () => {
    unlockAllGrades(user.id);
    setOverrideSuccess(true);
    setTimeout(() => {
      if (onUnlocked) {
        onUnlocked();
      } else {
        window.location.reload();
      }
    }, 800);
  };

  const handleAdminLock = () => {
    lockAllGrades(user.id);
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-[2.5rem] shadow-2xl p-6 sm:p-10 md:p-12 text-white relative overflow-hidden">
        
        {/* Background Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Security / Academic Lock Crest */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          
          <div className="relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-1 shadow-[0_0_50px_rgba(245,158,11,0.4)] flex items-center justify-center"
            >
              <div className="w-full h-full bg-slate-950 rounded-[1.4rem] flex flex-col items-center justify-center text-amber-400">
                <Lock className="w-12 h-12 stroke-[2.2] animate-pulse" />
              </div>
            </motion.div>
            <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/30 shadow-lg flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Locked
            </div>
          </div>

          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <School className="w-3.5 h-3.5" />
              Academic Prerequisite Enforcement
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline tracking-tight text-white">
              WAEC & JAMB Center is Locked
            </h1>
            <p className="text-amber-200/90 font-bold text-base sm:text-lg">
              WAEC and JAMB will <span className="underline decoration-amber-400 decoration-2 underline-offset-4 text-white">NOT open</span> until <span className="text-amber-300 font-extrabold">ALL grades (1 through 10)</span> are finished.
            </p>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Under national examination standards, WAEC (WASSCE) and JAMB (UTME) are senior exit examinations reserved for scholars who have completed Grade 10 and earned the Academy Completion Award.
            </p>
          </div>

          {/* Current Scholar Standing Badge */}
          <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-lg">
                G{user.grade}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Academic Standing</p>
                <h4 className="text-lg font-black text-white">
                  {user.name} • <span className="text-amber-400">Grade {user.grade} (In Progress)</span>
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Grades 1-10 Not Yet Completed
              </span>
            </div>
          </div>

          {/* 10-Grade Progress Roadmap */}
          <div className="w-full space-y-3 text-left">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                10-Grade Curriculum Progression
              </h4>
              <span className="text-xs font-bold text-amber-400">
                Target: Complete Grade 10
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((gradeNum) => {
                const isPassed = gradeNum < user.grade || status.completedGrades.includes(gradeNum);
                const isCurrent = gradeNum === user.grade;
                const isFuture = gradeNum > user.grade;

                return (
                  <div 
                    key={gradeNum}
                    className={`rounded-xl p-2.5 text-center border transition-all flex flex-col items-center justify-between min-h-[72px] ${
                      isPassed 
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                        : isCurrent
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      G{gradeNum}
                    </span>
                    <div className="my-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="relative flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                        </span>
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <span className="text-[9px] font-bold">
                      {isPassed ? 'Done' : isCurrent ? 'Active' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Miss Kelechi's Pedagogical Counsel */}
          <div className="w-full bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 text-left relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  Counsel from Miss Kelechi
                </p>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
                  "My dear scholar {user.name}, excellence is built layer upon layer! WAEC and JAMB examine senior secondary mastery. To ensure you graduate with flying colors (A1 and 300+), you must complete all foundational lessons from Grade 1 through Grade 10 first. Study with joy and diligence today — your graduation day is coming!"
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-2">
            {onBack && (
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <BookOpen className="w-5 h-5" />
                Return to Grade {user.grade} Curriculum
              </button>
            )}

            <button
              onClick={() => setShowTeacherOverride(!showTeacherOverride)}
              className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4 text-amber-400" />
              Parent / Teacher Verification
            </button>
          </div>

          {/* Teacher / Administrator Testing Override Panel */}
          {showTeacherOverride && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-6 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Academic Prerequisite Administration & Testing
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold">
                  Teacher Mode
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                By rule, WAEC and JAMB will remain locked until the scholar finishes all 10 grades. For evaluators, parents, or teachers testing the WAEC & JAMB features, you can simulate Grade 10 graduation completion below.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleAdminUnlock}
                  disabled={overrideSuccess}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {overrideSuccess ? 'Unlocked! Refreshing...' : 'Simulate All 10 Grades Finished'}
                </button>

                <button
                  onClick={handleAdminLock}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Reset to Strictly Locked
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
