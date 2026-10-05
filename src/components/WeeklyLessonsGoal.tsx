import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { Target, Trophy, Calendar, CheckCircle2, Flame, Edit3, ArrowUpRight, Sparkles } from 'lucide-react';

interface WeeklyLessonsGoalProps {
  user: User;
  history?: { topicId: string; score: number; date: number }[];
}

export default function WeeklyLessonsGoal({ user, history = [] }: WeeklyLessonsGoalProps) {
  const [weeklyGoal, setWeeklyGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`weekly_lessons_goal_${user.id}`);
      return saved ? parseInt(saved, 10) || 10 : 10;
    } catch (e) {
      return 10;
    }
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Save weekly goal changes
  const handleSetWeeklyGoal = (newGoal: number) => {
    const target = Math.max(1, Math.min(50, newGoal));
    setWeeklyGoal(target);
    try {
      localStorage.setItem(`weekly_lessons_goal_${user.id}`, target.toString());
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to get start and end of current week (Monday to Sunday)
  const getCurrentWeekBounds = () => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    
    const startOfWeek = new Date(now.setDate(diffToMon));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getCurrentWeekBounds();

  // Filter lessons completed during this current week
  const validHistory = history.filter(h => {
    if (!h.date) return false;
    // Exclude drill sessions
    if (h.topicId.startsWith('DRILLS-') || h.topicId.includes('DRILLS')) return false;
    const lessonDate = new Date(h.date);
    return lessonDate >= startOfWeek && lessonDate <= endOfWeek;
  });

  const completedThisWeek = validHistory.length;
  const percentage = Math.min(100, Math.round((completedThisWeek / weeklyGoal) * 100));
  const isGoalAchieved = completedThisWeek >= weeklyGoal;

  // Calculate days remaining in current week
  const today = new Date();
  const dayOfWeekIndex = today.getDay(); // 0 is Sun, 1 is Mon...
  const daysLeftInWeek = dayOfWeekIndex === 0 ? 1 : (7 - dayOfWeekIndex + 1);

  // Daily breakdown for the current week (Mon - Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyBreakdown = daysOfWeek.map((dayName, idx) => {
    // Mon is index 0 in our array, corresponding to startOfWeek + idx days
    const currentDayDate = new Date(startOfWeek);
    currentDayDate.setDate(startOfWeek.getDate() + idx);
    const dateStr = currentDayDate.toDateString();

    const count = validHistory.filter(h => new Date(h.date).toDateString() === dateStr).length;
    const isToday = today.toDateString() === dateStr;

    return {
      dayName,
      count,
      isToday
    };
  });

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 shadow-xl border-2 border-indigo-500/30 text-white relative overflow-hidden transition-all">
      {/* Background Glow */}
      <div 
        className={cn(
          "absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-500",
          isGoalAchieved ? "bg-emerald-400" : "bg-amber-400"
        )}
      />

      <div className="flex flex-col lg:flex-row items-stretch gap-6 relative z-10">
        {/* Left Section: Goal Ring & Summary */}
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 bg-white/5 p-5 rounded-2xl border border-white/10">
          {/* Progress Ring */}
          <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-white/10"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                className={cn(
                  "transition-colors duration-500",
                  isGoalAchieved ? "text-emerald-400" : "text-amber-400"
                )}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 50}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 50) - (percentage / 100) * (2 * Math.PI * 50) }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-headline text-white leading-none">
                {completedThisWeek}
                <span className="text-sm font-bold text-white/60">/{weeklyGoal}</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 mt-1">
                Weekly Goal
              </span>
              {isGoalAchieved && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Details & Motivator */}
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg border border-amber-400/30">
                    <Trophy className="w-4 h-4" />
                  </span>
                  <h3 className="font-headline font-black text-xl text-white">Weekly Goal Tracker</h3>
                </div>
                <p className="text-xs font-semibold text-white/70 mt-1">
                  Target lessons to complete each week
                </p>
              </div>

              <button
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingGoal ? 'Close' : 'Set Goal'}</span>
              </button>
            </div>

            {/* Goal Achieved or Progress Message */}
            {isGoalAchieved ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center gap-3 text-xs font-bold text-emerald-200">
                <Sparkles className="w-5 h-5 text-emerald-300 shrink-0" />
                <span>Weekly Target Reached! Outstanding consistency, {user.name}! 🎉</span>
              </div>
            ) : (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-xs font-medium text-white/80">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {completedThisWeek === 0 ? (
                    `Complete your first lesson this week to start working towards your ${weeklyGoal}-lesson target!`
                  ) : (
                    `Only ${weeklyGoal - completedThisWeek} more lesson${weeklyGoal - completedThisWeek > 1 ? 's' : ''} to hit this week's target!`
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-bold text-white/60 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{daysLeftInWeek} day{daysLeftInWeek > 1 ? 's' : ''} remaining this week</span>
              </span>
              <span className="text-amber-300 font-extrabold">{percentage}% Completed</span>
            </div>
          </div>
        </div>

        {/* Right Section: Weekly Daily Activity Bars */}
        <div className="w-full lg:w-72 bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>This Week's Activity</span>
            </span>
            <span className="text-[10px] font-bold text-white/50">Mon - Sun</span>
          </div>

          {/* Bar Chart */}
          <div className="grid grid-cols-7 gap-1.5 items-end h-24 pt-2">
            {dailyBreakdown.map((d, i) => {
              const maxBarVal = Math.max(1, ...dailyBreakdown.map(db => db.count));
              const heightPercent = d.count > 0 ? Math.max(25, Math.round((d.count / maxBarVal) * 100)) : 10;

              return (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  {/* Lesson count badge on top if > 0 */}
                  <span className={cn(
                    "text-[10px] font-black",
                    d.count > 0 ? "text-amber-300" : "text-white/30"
                  )}>
                    {d.count}
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full bg-white/10 rounded-lg h-16 flex items-end p-0.5 relative overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={cn(
                        "w-full rounded-md transition-colors",
                        d.count > 0 
                          ? d.isToday ? "bg-gradient-to-t from-amber-500 to-amber-300" : "bg-gradient-to-t from-indigo-500 to-indigo-300"
                          : "bg-white/5"
                      )}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    d.isToday ? "text-amber-300 font-black underline underline-offset-2" : "text-white/50"
                  )}>
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target Editor Controls */}
      <AnimatePresence>
        {isEditingGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-4 mt-4 border-t border-white/10"
          >
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Select Your Weekly Lessons Goal:</span>
                <span className="text-sm font-black text-amber-300">{weeklyGoal} Lessons / week</span>
              </div>
              
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSetWeeklyGoal(weeklyGoal - 1)}
                  disabled={weeklyGoal <= 1}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 font-black text-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  -
                </button>

                <div className="flex gap-2 flex-1 justify-center overflow-x-auto py-1">
                  {[5, 10, 15, 20, 25, 30].map(num => (
                    <button
                      key={num}
                      onClick={() => handleSetWeeklyGoal(num)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap",
                        weeklyGoal === num
                          ? "bg-amber-400 text-slate-950 shadow-lg scale-105"
                          : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                      )}
                    >
                      {num} Lessons
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleSetWeeklyGoal(weeklyGoal + 1)}
                  disabled={weeklyGoal >= 50}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 font-black text-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
