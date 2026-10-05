import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Subject } from '../types';
import { 
  VirtualBadge, 
  LeaderboardEntry, 
  BadgeCategory, 
  getScholarLevel, 
  getUserBadges, 
  calculateUserPoints, 
  getLeaderboard,
  ActivityLog,
  getActivityLogs
} from '../utils/gamification';
import { cn } from '../lib/utils';

interface GamificationCenterProps {
  user: User;
  history: { topicId: string; score: number; date: number }[];
  worksheetHistory?: any[];
  onBack?: () => void;
  onSelectSubject?: (subject: Subject) => void;
  initialTab?: 'badges' | 'leaderboard' | 'points';
}

export default function GamificationCenter({
  user,
  history,
  worksheetHistory = [],
  onBack,
  onSelectSubject,
  initialTab = 'badges'
}: GamificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard' | 'points'>(initialTab);
  
  // Badges filter states
  const [badgeCategory, setBadgeCategory] = useState<BadgeCategory | 'all' | 'unlocked'>('all');
  const [badgeSearch, setBadgeSearch] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<VirtualBadge | null>(null);

  // Leaderboard filter states
  const [leaderboardGrade, setLeaderboardGrade] = useState<number | 'all'>(user.grade || 'all');
  const [timeFilter, setTimeFilter] = useState<'all-time' | 'weekly'>('all-time');

  // Load activity logs
  const activityLogs: ActivityLog[] = useMemo(() => {
    return getActivityLogs(user.id);
  }, [user.id]);

  // Calculations
  const pointsData = useMemo(() => {
    return calculateUserPoints(user, history, worksheetHistory, activityLogs);
  }, [user, history, worksheetHistory, activityLogs]);

  const scholarLevel = useMemo(() => {
    return getScholarLevel(pointsData.totalPoints);
  }, [pointsData.totalPoints]);

  const badges = useMemo(() => {
    return getUserBadges(user, history, worksheetHistory, activityLogs);
  }, [user, history, worksheetHistory, activityLogs]);

  const unlockedBadgesCount = useMemo(() => {
    return badges.filter(b => b.isUnlocked).length;
  }, [badges]);

  const { leaderboard, userRank } = useMemo(() => {
    return getLeaderboard(user, pointsData.totalPoints, unlockedBadgesCount, leaderboardGrade, timeFilter);
  }, [user, pointsData.totalPoints, unlockedBadgesCount, leaderboardGrade, timeFilter]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter(b => {
      // Category filter
      if (badgeCategory === 'unlocked' && !b.isUnlocked) return false;
      if (badgeCategory !== 'all' && badgeCategory !== 'unlocked' && b.category !== badgeCategory) return false;

      // Search filter
      if (badgeSearch.trim()) {
        const q = badgeSearch.toLowerCase().trim();
        return (
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.subject && b.subject.toLowerCase().includes(q)) ||
          b.tier.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [badges, badgeCategory, badgeSearch]);

  const tierColors: Record<string, { bg: string; text: string; border: string }> = {
    Bronze: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    Silver: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
    Gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' },
    Diamond: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-400' }
  };

  return (
    <div className="space-y-8 pb-24 text-on-surface">
      {/* Gamification Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-container/30 to-slate-950 p-8 sm:p-10 rounded-[2.5rem] border border-primary/20 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-0" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-secondary/20 rounded-full blur-[80px] pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-black tracking-wider uppercase border border-white/10">
              <span className="material-symbols-outlined text-sm">emoji_events</span>
              <span>Gamification & Academic Excellence Center</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Hall of Fame & Leaderboard
            </h1>
            <p className="text-white/80 font-medium text-sm sm:text-base leading-relaxed">
              Earn virtual badges for subject mastery, gain points for completing lessons and activities, and see your name rise on the pan-African leaderboard!
            </p>
          </div>

          {/* User Fast Stats Card */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex flex-col sm:flex-row items-center gap-6 self-start lg:self-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg font-black text-2xl">
                <span className="material-symbols-outlined text-3xl">{scholarLevel.icon}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                  Level {scholarLevel.level}
                </span>
                <h3 className="font-headline font-black text-lg text-white leading-tight">
                  {scholarLevel.title}
                </h3>
                <span className="text-xs font-bold text-amber-300">
                  {pointsData.totalPoints.toLocaleString()} Total XP
                </span>
              </div>
            </div>

            <div className="h-10 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-6 text-center">
              <div>
                <span className="text-2xl font-black text-white">{unlockedBadgesCount}</span>
                <span className="text-[10px] font-bold text-white/70 uppercase block">Badges</span>
              </div>
              <div>
                <span className="text-2xl font-black text-amber-300">#{userRank}</span>
                <span className="text-[10px] font-bold text-white/70 uppercase block">Rank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress Bar in Header */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-bold text-white/80 mb-2">
            <span>Level {scholarLevel.level} Progress</span>
            <span>{scholarLevel.currentXP} / {scholarLevel.nextLevelXP} XP ({scholarLevel.nextLevelXP - scholarLevel.currentXP} XP to Level {scholarLevel.level + 1})</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${scholarLevel.progressPercent}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-surface-container pb-4">
        <button
          onClick={() => setActiveTab('badges')}
          className={cn(
            "px-6 py-3 rounded-2xl font-headline font-black text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm",
            activeTab === 'badges'
              ? "bg-primary text-white scale-105 shadow-md"
              : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <span className="material-symbols-outlined text-lg">military_tech</span>
          <span>Virtual Badges ({unlockedBadgesCount}/{badges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            "px-6 py-3 rounded-2xl font-headline font-black text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm",
            activeTab === 'leaderboard'
              ? "bg-secondary text-white scale-105 shadow-md"
              : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <span className="material-symbols-outlined text-lg">leaderboard</span>
          <span>Pan-African Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('points')}
          className={cn(
            "px-6 py-3 rounded-2xl font-headline font-black text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm",
            activeTab === 'points'
              ? "bg-tertiary text-white scale-105 shadow-md"
              : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <span className="material-symbols-outlined text-lg">stars</span>
          <span>Points & Milestones ({pointsData.totalPoints} XP)</span>
        </button>
      </div>

      {/* ================= TAB 1: VIRTUAL BADGES ================= */}
      {activeTab === 'badges' && (
        <div className="space-y-8">
          {/* Filters Bar */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline font-black text-2xl text-on-surface">Virtual Badges Collection</h2>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Awarded for subject completion, flawless 100% quiz scores, and active participation in interactive labs.
                </p>
              </div>

              {/* Badge Search */}
              <div className="relative w-full md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search badges or subjects..."
                  value={badgeSearch}
                  onChange={(e) => setBadgeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-xl text-xs font-semibold placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary border border-transparent"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setBadgeCategory('all')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  badgeCategory === 'all'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                All Badges ({badges.length})
              </button>
              <button
                onClick={() => setBadgeCategory('unlocked')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1",
                  badgeCategory === 'unlocked'
                    ? "bg-secondary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>Unlocked ({unlockedBadgesCount})</span>
              </button>
              <button
                onClick={() => setBadgeCategory('subject')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  badgeCategory === 'subject'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Subject Mastery
              </button>
              <button
                onClick={() => setBadgeCategory('high-score')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  badgeCategory === 'high-score'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                High Scores & Streaks
              </button>
              <button
                onClick={() => setBadgeCategory('activity')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  badgeCategory === 'activity'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Interactive Labs
              </button>
              <button
                onClick={() => setBadgeCategory('milestone')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  badgeCategory === 'milestone'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Milestones & Super Badge
              </button>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => {
              const tierStyle = tierColors[badge.tier] || tierColors.Gold;

              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={() => setSelectedBadge(badge)}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-sm",
                    badge.isUnlocked
                      ? "bg-surface-container-lowest border-amber-400 shadow-md ring-1 ring-amber-400/20"
                      : "bg-surface-container-low/70 border-surface-container opacity-85 hover:opacity-100"
                  )}
                >
                  {/* Glowing background shimmer if unlocked */}
                  {badge.isUnlocked && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -z-0 pointer-events-none" />
                  )}

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border",
                        tierStyle.bg, tierStyle.text, tierStyle.border
                      )}>
                        {badge.tier} Tier • +{badge.pointsReward} XP
                      </span>

                      {badge.isUnlocked ? (
                        <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-sm">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          <span>Unlocked</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-outline-variant font-bold text-[10px] uppercase">
                          <span className="material-symbols-outlined text-xs">lock</span>
                          <span>In Progress</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110",
                        badge.isUnlocked
                          ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-md"
                          : "bg-surface-container-high text-outline-variant"
                      )}>
                        <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
                      </div>
                      <div>
                        <h3 className={cn(
                          "font-headline font-black text-lg leading-tight transition-colors",
                          badge.isUnlocked ? "text-on-surface group-hover:text-primary" : "text-on-surface-variant"
                        )}>
                          {badge.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant font-medium mt-1 line-clamp-2">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Requirement */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-on-surface-variant">{badge.requirement}</span>
                        <span className={badge.isUnlocked ? "text-secondary font-black" : "text-outline-variant"}>
                          {badge.currentCount}/{badge.targetCount} ({badge.progressPercent}%)
                        </span>
                      </div>
                      <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            badge.isUnlocked ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-primary/50"
                          )}
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs font-bold text-primary">
                    <span>Click to view details</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: LEADERBOARD ================= */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-8">
          {/* Leaderboard Header & Filters */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline font-black text-2xl text-on-surface">Pan-African Honor Roll</h2>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Celebrate academic effort alongside fellow scholars across Lagos, Accra, Nairobi, Johannesburg, Kigali, and beyond.
                </p>
              </div>

              {/* Time Switcher */}
              <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl self-start md:self-auto">
                <button
                  onClick={() => setTimeFilter('all-time')}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                    timeFilter === 'all-time' ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  All-Time Honor Roll
                </button>
                <button
                  onClick={() => setTimeFilter('weekly')}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                    timeFilter === 'weekly' ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  Weekly Sprint
                </button>
              </div>
            </div>

            {/* Grade Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-surface-container">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-1">
                Filter by Grade:
              </span>
              <button
                onClick={() => setLeaderboardGrade('all')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  leaderboardGrade === 'all'
                    ? "bg-secondary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                All Grades
              </button>
              {[1, 2, 3, 4, 5].map(g => (
                <button
                  key={g}
                  onClick={() => setLeaderboardGrade(g)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                    leaderboardGrade === g
                      ? "bg-secondary text-white shadow-sm"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {leaderboard.slice(0, 3).map((scholar, idx) => {
              const medals = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
              const podiumBorders = ['border-yellow-400 bg-yellow-50/50', 'border-slate-300 bg-slate-50/50', 'border-amber-600 bg-amber-50/30'];
              const crownColors = ['text-yellow-500', 'text-slate-400', 'text-amber-700'];

              return (
                <motion.div
                  key={scholar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-6 rounded-3xl border-2 text-center flex flex-col justify-between relative shadow-sm",
                    podiumBorders[idx],
                    scholar.isCurrentUser && "ring-4 ring-primary shadow-lg"
                  )}
                >
                  <div className="space-y-4">
                    <span className="font-headline font-black text-xs uppercase px-3 py-1 rounded-full bg-white shadow-sm inline-block">
                      {medals[idx]}
                    </span>

                    <div className="relative inline-block mx-auto">
                      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-3xl shadow-md border-2 border-white mx-auto">
                        <span className="material-symbols-outlined text-4xl text-primary">
                          {scholar.avatar === 'girl' ? 'face_3' : scholar.avatar === 'boy' ? 'face_6' : 'school'}
                        </span>
                      </div>
                      <span className={cn("material-symbols-outlined absolute -top-3 -right-2 text-3xl", crownColors[idx])}>
                        crown
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-base">{scholar.countryFlag}</span>
                        <h4 className="font-headline font-black text-lg text-on-surface">
                          {scholar.name}
                        </h4>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        Grade {scholar.grade} • {scholar.location}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-2xl shadow-sm space-y-1">
                      <span className="text-2xl font-black text-primary block">
                        {scholar.points.toLocaleString()} XP
                      </span>
                      <div className="flex items-center justify-center gap-4 text-xs font-bold text-on-surface-variant">
                        <span>🎖️ {scholar.badgesCount} Badges</span>
                        <span>🔥 {scholar.streakDays}d Streak</span>
                      </div>
                    </div>
                  </div>

                  {scholar.isCurrentUser && (
                    <span className="mt-4 text-[11px] font-black uppercase text-primary tracking-widest bg-primary/10 py-1 rounded-full">
                      You are on the podium! 🎉
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Full Leaderboard Table */}
          <div className="bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm overflow-hidden">
            <div className="p-4 bg-surface-container-low font-headline font-black text-xs text-on-surface-variant uppercase tracking-wider grid grid-cols-12 gap-2">
              <span className="col-span-1 text-center">Rank</span>
              <span className="col-span-6 md:col-span-5">Scholar</span>
              <span className="hidden md:inline col-span-3">Location & Grade</span>
              <span className="col-span-2 text-center">Badges</span>
              <span className="col-span-3 md:col-span-1 text-right">Points</span>
            </div>

            <div className="divide-y divide-surface-container">
              {leaderboard.map((scholar) => (
                <div
                  key={scholar.id}
                  className={cn(
                    "p-4 grid grid-cols-12 gap-2 items-center transition-colors",
                    scholar.isCurrentUser
                      ? "bg-primary/5 font-bold border-l-4 border-primary"
                      : "hover:bg-surface-container-low/50"
                  )}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center font-headline font-black text-base">
                    {scholar.rank === 1 ? '🥇' : scholar.rank === 2 ? '🥈' : scholar.rank === 3 ? '🥉' : `#${scholar.rank}`}
                  </div>

                  {/* Scholar Info */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-xl shrink-0">
                      <span className="material-symbols-outlined text-primary">
                        {scholar.avatar === 'girl' ? 'face_3' : scholar.avatar === 'boy' ? 'face_6' : 'school'}
                      </span>
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline font-black text-sm text-on-surface truncate">
                          {scholar.name}
                        </span>
                        {scholar.isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-primary text-white shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium block md:hidden">
                        {scholar.countryFlag} Grade {scholar.grade}
                      </span>
                    </div>
                  </div>

                  {/* Location & Grade */}
                  <div className="hidden md:flex col-span-3 items-center gap-2 text-xs font-semibold text-on-surface-variant">
                    <span>{scholar.countryFlag}</span>
                    <span>{scholar.location}</span>
                    <span className="text-outline-variant">• Grade {scholar.grade}</span>
                  </div>

                  {/* Badges count */}
                  <div className="col-span-2 text-center text-xs font-black text-amber-700">
                    🎖️ {scholar.badgesCount}
                  </div>

                  {/* Points */}
                  <div className="col-span-3 md:col-span-1 text-right font-headline font-black text-sm sm:text-base text-primary">
                    {scholar.points.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Miss Kelechi Encouragement */}
          <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-headline font-black text-sm text-secondary uppercase tracking-wider">
                Miss Kelechi’s Encouragement
              </h4>
              <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                "Proverbs 27:17 teaches us: 'As iron sharpens iron, so one person sharpens another.' Our leaderboard is about inspiring one another to study with diligence, honesty, and joyful excellence!"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: POINTS & MILESTONES ================= */}
      {activeTab === 'points' && (
        <div className="space-y-8">
          {/* Points Breakdown Hero */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container pb-6">
              <div>
                <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">
                  Academic Point System
                </span>
                <h2 className="font-headline font-black text-3xl text-on-surface mt-1">
                  {pointsData.totalPoints.toLocaleString()} Total XP Points
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
                  Earn points automatically each time you complete lessons, fill out worksheets, or participate in interactive activities!
                </p>
              </div>

              <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-center">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Scholar Standing</span>
                <span className="font-headline font-black text-2xl text-primary">{scholarLevel.title}</span>
              </div>
            </div>

            {/* Points Sources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">menu_book</span>
                </div>
                <h4 className="font-headline font-black text-sm text-on-surface">Lesson Quizzes</h4>
                <p className="text-xs text-on-surface-variant font-medium">100 XP base + up to 50 XP bonus for scores 90% or higher</p>
                <span className="text-lg font-black text-primary block pt-2">+{pointsData.lessonsPoints} XP</span>
              </div>

              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container space-y-2">
                <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">edit_note</span>
                </div>
                <h4 className="font-headline font-black text-sm text-on-surface">Worksheets</h4>
                <p className="text-xs text-on-surface-variant font-medium">75 XP for each completed digital practice worksheet</p>
                <span className="text-lg font-black text-secondary block pt-2">+{pointsData.worksheetsPoints} XP</span>
              </div>

              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container space-y-2">
                <div className="w-10 h-10 rounded-xl bg-tertiary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">extension</span>
                </div>
                <h4 className="font-headline font-black text-sm text-on-surface">Interactive Labs</h4>
                <p className="text-xs text-on-surface-variant font-medium">50 XP for matching games, videos & rapid short quizzes</p>
                <span className="text-lg font-black text-tertiary block pt-2">+{pointsData.activitiesPoints} XP</span>
              </div>

              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">bolt</span>
                </div>
                <h4 className="font-headline font-black text-sm text-on-surface">Mastery Drills & Streak</h4>
                <p className="text-xs text-on-surface-variant font-medium">Timed rapid fire recall and daily study goal achievements</p>
                <span className="text-lg font-black text-amber-600 block pt-2">+{pointsData.drillsPoints + pointsData.bonusPoints} XP</span>
              </div>
            </div>
          </div>

          {/* How to Earn More Points & Milestones Guide */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <h3 className="font-headline font-black text-xl text-on-surface">
              Ways to Boost Your Points & Climb the Leaderboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-surface-container-low rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl mt-0.5">verified</span>
                <div>
                  <h4 className="font-headline font-black text-sm text-on-surface">Aim for 100% on Lesson Quizzes</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">
                    Scoring 100% awards a +50 XP perfection bonus and unlocks the Centurion Badge!
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl mt-0.5">extension</span>
                <div>
                  <h4 className="font-headline font-black text-sm text-on-surface">Complete the Interactive Labs</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">
                    Every lesson has Drag & Drop Matching, Educational Videos, and Rapid Quizzes for an easy +150 XP per lesson!
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-2xl mt-0.5">military_tech</span>
                <div>
                  <h4 className="font-headline font-black text-sm text-on-surface">Unlock Subject Mastery Badges</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">
                    Each subject badge awards +200 to +400 XP straight into your total points score!
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 text-2xl mt-0.5">flash_on</span>
                <div>
                  <h4 className="font-headline font-black text-sm text-on-surface">Play Rapid Subject Drills</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">
                    Sharpen your reflexes under pressure with fast-paced drills to rack up bonus points every day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Details Modal Popup */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest max-w-md w-full p-8 rounded-[2.5rem] border-2 border-surface-container shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container text-outline-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="text-center space-y-3">
                <div className={cn(
                  "w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-xl",
                  selectedBadge.isUnlocked
                    ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950"
                    : "bg-surface-container-high text-outline-variant"
                )}>
                  <span className="material-symbols-outlined text-5xl">{selectedBadge.icon}</span>
                </div>

                <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                  {selectedBadge.tier} Tier • +{selectedBadge.pointsReward} XP
                </div>

                <h3 className="font-headline font-black text-2xl text-on-surface">
                  {selectedBadge.title}
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="bg-surface-container-low p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-on-surface-variant">Requirement:</span>
                  <span className="text-on-surface">{selectedBadge.requirement}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-on-surface-variant">Current Progress:</span>
                  <span className={selectedBadge.isUnlocked ? "text-secondary font-black" : "text-primary"}>
                    {selectedBadge.currentCount} / {selectedBadge.targetCount} ({selectedBadge.progressPercent}%)
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-on-surface-variant">Status:</span>
                  <span className={selectedBadge.isUnlocked ? "text-secondary font-black" : "text-amber-600"}>
                    {selectedBadge.isUnlocked ? 'Unlocked & Claimed! 🎉' : 'In Progress'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedBadge(null);
                  if (selectedBadge.subject && onSelectSubject) {
                    onSelectSubject(selectedBadge.subject);
                  }
                }}
                className="w-full py-3.5 bg-primary text-white rounded-2xl font-headline font-black text-sm shadow-md hover:bg-primary-dim transition-all cursor-pointer"
              >
                {selectedBadge.isUnlocked ? 'Close Details' : selectedBadge.subject ? `Practice ${selectedBadge.subject} Now` : 'Keep Learning'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
