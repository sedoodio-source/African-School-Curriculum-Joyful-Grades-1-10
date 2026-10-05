import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface DailyStudyGoalProps {
  user: User;
  history?: { topicId: string; score: number; date: number }[];
}

export default function DailyStudyGoal({ user, history = [] }: DailyStudyGoalProps) {
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem(`daily_study_goal_${user.id}`);
    return saved ? parseInt(saved, 10) || 3 : 3;
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Save goal changes
  const handleSetGoal = (newGoal: number) => {
    const target = Math.max(1, Math.min(20, newGoal));
    setDailyGoal(target);
    localStorage.setItem(`daily_study_goal_${user.id}`, target.toString());
  };

  // Calculate lessons completed today
  const todayString = new Date().toDateString();
  const completedToday = history.filter(h => {
    if (!h.date) return false;
    // Exclude drill sessions if only lesson topics count towards daily lesson goal
    if (h.topicId.startsWith('DRILLS-') || h.topicId.includes('DRILLS')) return false;
    return new Date(h.date).toDateString() === todayString;
  }).length;

  const percentage = Math.min(100, Math.round((completedToday / dailyGoal) * 100));
  const isGoalAchieved = completedToday >= dailyGoal;

  // SVG Circle math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-surface-container relative overflow-hidden transition-all">
      {/* Background ambient decorative glow */}
      <div 
        className={cn(
          "absolute -right-12 -bottom-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500",
          isGoalAchieved ? "bg-emerald-500" : "bg-primary"
        )}
      />

      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        {/* Circular Progress Bar */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Outer track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-surface-container-high"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              className={cn(
                "transition-colors duration-500",
                isGoalAchieved ? "text-emerald-500" : "text-primary"
              )}
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black font-headline text-on-surface leading-none">
              {completedToday}
              <span className="text-sm font-bold text-on-surface-variant">/{dailyGoal}</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant mt-1">
              Lessons
            </span>
            {isGoalAchieved && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md"
              >
                <span className="material-symbols-outlined text-base block" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </motion.span>
            )}
          </div>
        </div>

        {/* Info & Target Control */}
        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  target
                </span>
                <h3 className="font-headline font-black text-xl text-on-surface">Daily Study Goal</h3>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant mt-0.5">
                Target lessons to complete today
              </p>
            </div>

            <button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Adjust your daily target"
            >
              <span className="material-symbols-outlined text-base">
                {isEditingGoal ? 'close' : 'edit'}
              </span>
              <span className="hidden sm:inline">{isEditingGoal ? 'Done' : 'Change'}</span>
            </button>
          </div>

          {/* Status badge / motivator */}
          <div className="pt-1">
            {isGoalAchieved ? (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl flex items-center gap-3 text-xs font-bold"
              >
                <span className="material-symbols-outlined text-emerald-600 text-xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  celebration
                </span>
                <span>Goal Achieved Today! Fantastic dedication, {user.name}! 🎉</span>
              </motion.div>
            ) : (
              <div className="bg-surface-container-low border border-surface-container p-3 rounded-2xl flex items-center gap-3 text-xs font-semibold text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                <span>
                  {completedToday === 0 ? (
                    `Complete your first lesson today to reach your ${dailyGoal}-lesson target!`
                  ) : (
                    `${dailyGoal - completedToday} more lesson${dailyGoal - completedToday > 1 ? 's' : ''} to reach today's goal!`
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Target editor drawer / buttons */}
          <AnimatePresence>
            {isEditingGoal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2"
              >
                <div className="p-3 bg-surface-container-lowest rounded-2xl border border-surface-container space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Daily Target:</span>
                    <span className="text-sm font-black text-primary">{dailyGoal} Lessons / day</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSetGoal(dailyGoal - 1)}
                      disabled={dailyGoal <= 1}
                      className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high disabled:opacity-40 font-black text-lg flex items-center justify-center transition-all cursor-pointer"
                    >
                      -
                    </button>

                    <div className="flex gap-1.5 flex-1 justify-center">
                      {[1, 2, 3, 5, 8].map(num => (
                        <button
                          key={num}
                          onClick={() => handleSetGoal(num)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            dailyGoal === num
                              ? "bg-primary text-white shadow-sm"
                              : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSetGoal(dailyGoal + 1)}
                      disabled={dailyGoal >= 20}
                      className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high disabled:opacity-40 font-black text-lg flex items-center justify-center transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
