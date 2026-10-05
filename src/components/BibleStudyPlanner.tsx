import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, Square, Check, Flame, Trophy, Calendar, 
  BookOpen, Sparkles, Plus, Trash2, ChevronRight, ChevronDown, 
  Search, Filter, Bookmark, Clock, ArrowRight, RotateCcw,
  Star, Share2, Compass, Award, PenTool, CheckCircle2,
  Info, Sparkle, Target
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { BIBLE_BOOKS_CATALOG } from '../data/bibleData';
import { 
  CURATED_STUDY_PLANS, 
  CuratedStudyPlan, 
  StudyPlanSession,
  BibleReadingProgress 
} from '../data/biblePlannerData';

interface BibleStudyPlannerProps {
  user: User;
  onOpenChapter: (bookId: string, chapterNumber: number) => void;
  onAskAi: (question: string) => void;
  readChapters: Record<string, number[]>;
  onToggleChapterRead: (bookId: string, chapterNumber: number) => void;
  onMarkAllBookChapters: (bookId: string, totalChapters: number, markRead: boolean) => void;
  completedSessions: Record<string, { completedAt: string; reflection?: string; prayer?: string }>;
  onToggleSessionCompleted: (sessionId: string, reflection?: string) => void;
  customSessions: Array<{
    id: string;
    title: string;
    bookId: string;
    bookName: string;
    chapters: number[];
    dateAdded: string;
    notes?: string;
  }>;
  onAddCustomSession: (session: { title: string; bookId: string; bookName: string; chapters: number[]; notes?: string }) => void;
  onDeleteCustomSession: (id: string) => void;
}

export default function BibleStudyPlanner({
  user,
  onOpenChapter,
  onAskAi,
  readChapters,
  onToggleChapterRead,
  onMarkAllBookChapters,
  completedSessions,
  onToggleSessionCompleted,
  customSessions,
  onAddCustomSession,
  onDeleteCustomSession
}: BibleStudyPlannerProps) {
  // Planner Sub-tabs
  const [plannerTab, setPlannerTab] = useState<'plans' | 'tracker' | 'custom'>('plans');

  // Active Curated Plan
  const [activePlanId, setActivePlanId] = useState<string>(CURATED_STUDY_PLANS[0].id);
  const activePlan = CURATED_STUDY_PLANS.find(p => p.id === activePlanId) || CURATED_STUDY_PLANS[0];

  // Reflection Modal or expander
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [reflectionInputs, setReflectionInputs] = useState<Record<string, string>>({});

  // 66-Book Tracker Filter & Search
  const [trackerTestament, setTrackerTestament] = useState<'all' | 'Old Testament' | 'New Testament'>('all');
  const [trackerSearch, setTrackerSearch] = useState('');
  const [selectedBookForTracker, setSelectedBookForTracker] = useState<string>('proverbs');

  // Custom Session Creator Form
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customBookId, setCustomBookId] = useState('proverbs');
  const [customChaptersStr, setCustomChaptersStr] = useState('1');
  const [customNotes, setCustomNotes] = useState('');

  // Daily Goal setting
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`asc_bible_daily_goal_${user.id}`);
      return saved ? parseInt(saved, 10) : 2;
    } catch {
      return 2;
    }
  });

  // Calculate Overall Statistics
  const stats = useMemo(() => {
    let totalChaptersReadCount = 0;
    let totalOldTestamentRead = 0;
    let totalNewTestamentRead = 0;
    let booksCompletedCount = 0;

    const TOTAL_BIBLE_CHAPTERS = 1189;
    const TOTAL_OT_CHAPTERS = 929;
    const TOTAL_NT_CHAPTERS = 260;

    BIBLE_BOOKS_CATALOG.forEach(book => {
      const readList = readChapters[book.id] || [];
      const readCount = readList.length;
      totalChaptersReadCount += readCount;

      if (book.testament === 'Old Testament') {
        totalOldTestamentRead += readCount;
      } else {
        totalNewTestamentRead += readCount;
      }

      if (readCount >= book.totalChapters && book.totalChapters > 0) {
        booksCompletedCount++;
      }
    });

    const percentTotal = Math.min(100, Math.round((totalChaptersReadCount / TOTAL_BIBLE_CHAPTERS) * 100));
    const percentOT = Math.min(100, Math.round((totalOldTestamentRead / TOTAL_OT_CHAPTERS) * 100));
    const percentNT = Math.min(100, Math.round((totalNewTestamentRead / TOTAL_NT_CHAPTERS) * 100));

    // Sessions completed count
    const totalSessionsFinished = Object.keys(completedSessions).length;

    return {
      totalChaptersReadCount,
      percentTotal,
      percentOT,
      percentNT,
      booksCompletedCount,
      totalSessionsFinished,
      totalOldTestamentRead,
      totalNewTestamentRead
    };
  }, [readChapters, completedSessions]);

  // Active Plan Progress
  const activePlanProgress = useMemo(() => {
    if (!activePlan) return { completed: 0, total: 0, percent: 0 };
    const total = activePlan.sessions.length;
    let completed = 0;
    activePlan.sessions.forEach(s => {
      const sessionId = `${activePlan.id}-day-${s.day}`;
      if (completedSessions[sessionId]) completed++;
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [activePlan, completedSessions]);

  // Selected Book for Tracker
  const currentTrackerBook = BIBLE_BOOKS_CATALOG.find(b => b.id === selectedBookForTracker) || BIBLE_BOOKS_CATALOG[19]; // default Proverbs
  const currentBookReadList = readChapters[currentTrackerBook.id] || [];

  // Filtered Books for Tracker
  const filteredTrackerBooks = useMemo(() => {
    return BIBLE_BOOKS_CATALOG.filter(book => {
      const matchesTestament = trackerTestament === 'all' || book.testament === trackerTestament;
      const matchesSearch = book.name.toLowerCase().includes(trackerSearch.toLowerCase());
      return matchesTestament && matchesSearch;
    });
  }, [trackerTestament, trackerSearch]);

  const handleCreateCustomSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const bookObj = BIBLE_BOOKS_CATALOG.find(b => b.id === customBookId) || BIBLE_BOOKS_CATALOG[0];
    const parsedChapters = customChaptersStr
      .split(/[, -]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0 && n <= bookObj.totalChapters);

    onAddCustomSession({
      title: customTitle.trim(),
      bookId: customBookId,
      bookName: bookObj.name,
      chapters: parsedChapters.length > 0 ? parsedChapters : [1],
      notes: customNotes.trim()
    });

    setCustomTitle('');
    setCustomNotes('');
    setCustomChaptersStr('1');
    setIsAddingCustom(false);
  };

  const handleUpdateGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    try {
      localStorage.setItem(`asc_bible_daily_goal_${user.id}`, newGoal.toString());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="bible-study-planner-container" className="space-y-8">
      {/* 1. Header Overview & Progress Dashboard */}
      <div className="bg-gradient-to-r from-amber-600 via-indigo-700 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
              <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>Personal Bible Study & Chapter Tracker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-headline font-black text-white">
              Scholar Scripture Reading Planner
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm font-medium leading-relaxed">
              Build a lifelong habit of meditating on God’s Word. Check off daily study sessions, track chapters read across all 66 books, and celebrate your spiritual growth!
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-300 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-black">{stats.totalChaptersReadCount}</span>
              </div>
              <p className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">Chapters Read</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-300 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-black">{stats.booksCompletedCount}</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Books Done</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-300 mb-1">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xl sm:text-2xl font-black">{stats.totalSessionsFinished}</span>
              </div>
              <p className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">Sessions Done</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1 text-cyan-300 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-black">{stats.percentTotal}%</span>
              </div>
              <p className="text-[11px] font-bold text-cyan-100 uppercase tracking-wider">Bible Explored</p>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-amber-100">
              <span>Old Testament Progress ({stats.totalOldTestamentRead} / 929 ch.)</span>
              <span>{stats.percentOT}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(2, stats.percentOT)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-cyan-100">
              <span>New Testament Progress ({stats.totalNewTestamentRead} / 260 ch.)</span>
              <span>{stats.percentNT}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-300 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(2, stats.percentNT)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            id="planner-tab-plans"
            onClick={() => setPlannerTab('plans')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              plannerTab === 'plans' 
                ? "bg-white text-indigo-900 shadow-md scale-[1.02]" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Curated Study Plans</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
              {CURATED_STUDY_PLANS.length} Plans
            </span>
          </button>

          <button
            id="planner-tab-tracker"
            onClick={() => setPlannerTab('tracker')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              plannerTab === 'tracker' 
                ? "bg-white text-indigo-900 shadow-md scale-[1.02]" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>66 Books Chapter Tracker</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black">
              Grid View
            </span>
          </button>

          <button
            id="planner-tab-custom"
            onClick={() => setPlannerTab('custom')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              plannerTab === 'custom' 
                ? "bg-white text-indigo-900 shadow-md scale-[1.02]" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Custom Study Sessions</span>
            {customSessions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                {customSessions.length}
              </span>
            )}
          </button>
        </div>

        {/* Daily Reading Goal Setter */}
        <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-2xl border border-amber-200 text-xs">
          <span className="font-bold text-amber-900 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-600" />
            Daily Goal:
          </span>
          {[1, 2, 3, 5].map(num => (
            <button
              key={num}
              onClick={() => handleUpdateGoal(num)}
              className={cn(
                "px-2 py-0.5 rounded-md font-black transition-all",
                dailyGoal === num 
                  ? "bg-amber-600 text-white shadow-sm" 
                  : "bg-white text-amber-800 hover:bg-amber-100 border border-amber-200"
              )}
            >
              {num} {num === 1 ? 'Ch' : 'Chs'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {/* ========================================================================= */}
      {/* VIEW A: CURATED STUDY PLANS */}
      {/* ========================================================================= */}
      {plannerTab === 'plans' && (
        <div className="space-y-8">
          {/* Plan Selector Carousel/Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline font-black text-slate-900 text-lg sm:text-xl">
                  Choose Your Bible Study Journey
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select a guided plan with structured daily sessions, focus verses, and reflection questions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURATED_STUDY_PLANS.map(plan => {
                const isSelected = plan.id === activePlanId;
                // Calculate progress for this plan
                let done = 0;
                plan.sessions.forEach(s => {
                  if (completedSessions[`${plan.id}-day-${s.day}`]) done++;
                });
                const pct = plan.sessions.length > 0 ? Math.round((done / plan.sessions.length) * 100) : 0;

                return (
                  <button
                    key={plan.id}
                    id={`select-plan-${plan.id}`}
                    onClick={() => setActivePlanId(plan.id)}
                    className={cn(
                      "text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between group",
                      isSelected 
                        ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20" 
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-100 text-slate-600"
                        )}>
                          {plan.category}
                        </span>
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {plan.durationDays} Days
                        </span>
                      </div>

                      <div>
                        <h4 className={cn(
                          "font-headline font-black text-base transition-colors",
                          isSelected ? "text-amber-950" : "text-slate-900 group-hover:text-amber-700"
                        )}>
                          {plan.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {plan.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar inside Card */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>{done} of {plan.sessions.length} sessions completed</span>
                        <span className={cn(pct === 100 ? "text-emerald-600" : "text-slate-700")}>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-300", isSelected ? "bg-amber-500" : "bg-indigo-600")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Plan Detail & Interactive Checkbox Sessions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                    Active Plan
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {activePlanProgress.completed} of {activePlanProgress.total} Sessions Completed
                  </span>
                </div>
                <h3 className="text-2xl font-headline font-black text-slate-900">
                  {activePlan.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  {activePlan.description}
                </p>
              </div>

              {/* Completion Badge */}
              {activePlanProgress.percent === 100 && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-2xl font-black text-xs">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Plan Completed! Well done! 🎉</span>
                </div>
              )}
            </div>

            {/* Daily Sessions Checkbox List */}
            <div className="space-y-4">
              {activePlan.sessions.map((session) => {
                const sessionId = `${activePlan.id}-day-${session.day}`;
                const isCompleted = !!completedSessions[sessionId];
                const sessionRecord = completedSessions[sessionId];
                const isExpanded = expandedSessionId === sessionId;

                return (
                  <div
                    key={session.day}
                    id={`study-session-card-${session.day}`}
                    className={cn(
                      "rounded-2xl border-2 transition-all p-5",
                      isCompleted 
                        ? "bg-emerald-50/40 border-emerald-200/80" 
                        : "bg-white border-slate-200/90 hover:border-slate-300 shadow-sm"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Checkbox & Title */}
                      <div className="flex items-start gap-4">
                        <button
                          id={`toggle-session-checkbox-${session.day}`}
                          onClick={() => {
                            const reflection = reflectionInputs[sessionId] || sessionRecord?.reflection;
                            onToggleSessionCompleted(sessionId, reflection);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 mt-0.5",
                            isCompleted 
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105" 
                              : "border-2 border-slate-300 hover:border-amber-500 bg-white text-transparent hover:text-amber-500"
                          )}
                          title={isCompleted ? "Mark session incomplete" : "Mark session completed"}
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                              Day {session.day}
                            </span>
                            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {session.bookName} {session.chapters.join(', ')}
                            </span>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Completed
                              </span>
                            )}
                          </div>

                          <h4 className={cn(
                            "font-headline font-black text-base sm:text-lg",
                            isCompleted ? "text-emerald-950 line-through decoration-emerald-500/50" : "text-slate-900"
                          )}>
                            {session.title}
                          </h4>

                          <p className="text-xs text-slate-600 font-medium">
                            🎯 <strong>Objective:</strong> {session.learningObjective}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        {/* Open in Reader Button */}
                        <button
                          id={`read-session-btn-${session.day}`}
                          onClick={() => onOpenChapter(session.bookId, session.chapters[0])}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-all"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Read Chapter {session.chapters[0]}</span>
                        </button>

                        {/* Ask AI Button */}
                        <button
                          id={`ask-ai-session-btn-${session.day}`}
                          onClick={() => {
                            const question = `In our Bible study on ${session.bookName} ${session.chapters.join(', ')} ("${session.title}"), what is the deepest lesson for my school life and how does this focus verse apply: "${session.focusVerse}"?`;
                            onAskAi(question);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all border border-amber-200"
                          title="Ask Miss Kelechi about this study"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Ask Scholar</span>
                        </button>

                        {/* Expand / Reflection Toggle */}
                        <button
                          id={`expand-session-notes-btn-${session.day}`}
                          onClick={() => setExpandedSessionId(isExpanded ? null : sessionId)}
                          className={cn(
                            "p-1.5 rounded-xl text-xs font-bold transition-all",
                            isExpanded ? "bg-slate-200 text-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          )}
                          title="Notes & Reflection"
                        >
                          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                        </button>
                      </div>
                    </div>

                    {/* Focus Verse Preview */}
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-500 text-base flex-shrink-0 mt-0.5">format_quote</span>
                      <div>
                        <span className="font-serif italic font-semibold text-slate-800">
                          "{session.focusVerse}"
                        </span>
                        <span className="block text-[11px] font-bold text-amber-700 mt-0.5">
                          — {session.focusVerseRef}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Reflection & Notes Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/70 text-xs space-y-1">
                          <p className="font-bold text-amber-950 flex items-center gap-1">
                            <PenTool className="w-3.5 h-3.5 text-amber-700" />
                            <span>Today's Reflection Question:</span>
                          </p>
                          <p className="text-amber-900 font-medium italic">
                            "{session.reflectionPrompt}"
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            My Study Notes & Prayer Commitment:
                          </label>
                          <textarea
                            rows={2}
                            value={reflectionInputs[sessionId] ?? (sessionRecord?.reflection || '')}
                            onChange={(e) => setReflectionInputs({ ...reflectionInputs, [sessionId]: e.target.value })}
                            placeholder="Write what God spoke to your heart through this chapter today..."
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {sessionRecord?.completedAt ? `Finished on ${sessionRecord.completedAt}` : 'Not yet completed'}
                          </span>
                          <button
                            id={`save-session-notes-btn-${session.day}`}
                            onClick={() => {
                              const notes = reflectionInputs[sessionId] ?? (sessionRecord?.reflection || '');
                              onToggleSessionCompleted(sessionId, notes);
                              setExpandedSessionId(null);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                          >
                            Save Reflection & Mark Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: 66-BOOK CHAPTER TRACKER (FULL BIBLE CHECKBOX MATRIX) */}
      {/* ========================================================================= */}
      {plannerTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Book Selector List */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div>
              <h3 className="font-headline font-black text-slate-900 text-base sm:text-lg">
                Select a Bible Book
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Track every chapter read across the 66 Books of Scripture.
              </p>
            </div>

            {/* Search and Testament Tabs */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter books (e.g. Proverbs, John)..."
                  value={trackerSearch}
                  onChange={(e) => setTrackerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold text-center">
                {(['all', 'Old Testament', 'New Testament'] as const).map(testament => (
                  <button
                    key={testament}
                    onClick={() => setTrackerTestament(testament)}
                    className={cn(
                      "py-1 rounded-lg transition-all",
                      trackerTestament === testament 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {testament === 'all' ? 'All Books' : testament === 'Old Testament' ? 'Old Test.' : 'New Test.'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Books List */}
            <div className="max-h-[500px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredTrackerBooks.map(book => {
                const readList = readChapters[book.id] || [];
                const readCount = readList.length;
                const isSelected = book.id === currentTrackerBook.id;
                const isDone = readCount >= book.totalChapters && book.totalChapters > 0;
                const pct = book.totalChapters > 0 ? Math.round((readCount / book.totalChapters) * 100) : 0;

                return (
                  <button
                    key={book.id}
                    id={`tracker-book-btn-${book.id}`}
                    onClick={() => setSelectedBookForTracker(book.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border",
                      isSelected 
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-sm" 
                        : "bg-white text-slate-700 hover:bg-slate-50 border-transparent hover:border-slate-200"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black">{book.name}</span>
                        {isDone && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                            isSelected ? "bg-slate-950 text-amber-300" : "bg-emerald-100 text-emerald-800"
                          )}>
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        "text-[10px] block mt-0.5",
                        isSelected ? "text-slate-900" : "text-slate-400"
                      )}>
                        {book.category} • {book.totalChapters} Chs
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-black",
                        isSelected ? "text-slate-950" : isDone ? "text-emerald-600" : "text-slate-500"
                      )}>
                        {readCount}/{book.totalChapters}
                      </span>
                      <ChevronRight className={cn("w-4 h-4", isSelected ? "text-slate-950" : "text-slate-300")} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Checkbox Matrix for Selected Book */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            {/* Book Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black uppercase">
                    {currentTrackerBook.testament}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {currentTrackerBook.category}
                  </span>
                </div>
                <h3 className="font-headline font-black text-2xl text-slate-900">
                  {currentTrackerBook.name} Chapters Tracker
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Click any chapter to check or uncheck it. Checkboxes automatically save your study progress.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id={`mark-all-book-${currentTrackerBook.id}`}
                  onClick={() => onMarkAllBookChapters(currentTrackerBook.id, currentTrackerBook.totalChapters, true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200"
                >
                  ✓ Mark All as Read
                </button>
                <button
                  id={`unmark-all-book-${currentTrackerBook.id}`}
                  onClick={() => onMarkAllBookChapters(currentTrackerBook.id, currentTrackerBook.totalChapters, false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Reset Book
                </button>
              </div>
            </div>

            {/* Book Progress Summary */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                  Book Completion Status
                </span>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  You have read <strong>{currentBookReadList.length}</strong> of <strong>{currentTrackerBook.totalChapters}</strong> chapters ({Math.round((currentBookReadList.length / currentTrackerBook.totalChapters) * 100)}%).
                </p>
              </div>

              <div className="text-right">
                <button
                  id="open-reader-first-unread-btn"
                  onClick={() => {
                    // Find first unread chapter or chapter 1
                    let targetCh = 1;
                    for (let i = 1; i <= currentTrackerBook.totalChapters; i++) {
                      if (!currentBookReadList.includes(i)) {
                        targetCh = i;
                        break;
                      }
                    }
                    onOpenChapter(currentTrackerBook.id, targetCh);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open in Reader</span>
                </button>
              </div>
            </div>

            {/* Checkbox Grid for All Chapters */}
            <div>
              <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-3">
                <span>All {currentTrackerBook.totalChapters} Chapters Checkbox Grid:</span>
                <span className="text-slate-400 font-normal">Tap box to toggle completion</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5">
                {Array.from({ length: currentTrackerBook.totalChapters }, (_, i) => i + 1).map(chapterNum => {
                  const isRead = currentBookReadList.includes(chapterNum);

                  return (
                    <div
                      key={chapterNum}
                      className={cn(
                        "p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between group",
                        isRead 
                          ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm" 
                          : "bg-slate-50/70 border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/30"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-black">
                          Ch. {chapterNum}
                        </span>
                        
                        {/* The interactive Checkbox */}
                        <button
                          id={`chapter-checkbox-${currentTrackerBook.id}-${chapterNum}`}
                          onClick={() => onToggleChapterRead(currentTrackerBook.id, chapterNum)}
                          className={cn(
                            "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                            isRead 
                              ? "bg-emerald-600 text-white shadow-sm" 
                              : "border border-slate-300 hover:border-amber-500 bg-white"
                          )}
                          title={isRead ? "Mark as unread" : "Mark as read"}
                        >
                          {isRead && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>

                      {/* 1-Click to Read in Reader */}
                      <button
                        id={`open-chapter-reader-${chapterNum}`}
                        onClick={() => onOpenChapter(currentTrackerBook.id, chapterNum)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 text-left flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Read</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW C: CUSTOM STUDY SESSIONS & LOG */}
      {/* ========================================================================= */}
      {plannerTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-headline font-black text-slate-900 text-xl">
                  Personal Study Sessions & Journal
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Create custom study goals for personal devotions, family Bible study, or Sunday School topics.
                </p>
              </div>

              <button
                id="add-custom-session-btn"
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingCustom ? 'Cancel' : 'New Custom Session'}</span>
              </button>
            </div>

            {/* Custom Session Creation Form Drawer */}
            {isAddingCustom && (
              <form onSubmit={handleCreateCustomSession} className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <Sparkle className="w-4 h-4 text-amber-600" />
                  <span>Create a New Custom Study Session</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Session Title:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Parables of Jesus Reflection"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Bible Book:
                    </label>
                    <select
                      value={customBookId}
                      onChange={(e) => setCustomBookId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      {BIBLE_BOOKS_CATALOG.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.totalChapters} Chs)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chapter Number(s):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1 or 1, 2, 3"
                      value={customChaptersStr}
                      onChange={(e) => setCustomChaptersStr(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Study Notes or Target Learning Goal (Optional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What specific question or spiritual goal do you want to explore during this session?"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                  >
                    Add to Planner
                  </button>
                </div>
              </form>
            )}

            {/* Custom Sessions Checkbox List */}
            {customSessions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No custom sessions added yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the <strong>New Custom Session</strong> button above to plan your own study chapters and personal devotion checklist.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {customSessions.map(session => {
                  const sessionId = `custom-${session.id}`;
                  const isCompleted = !!completedSessions[sessionId];

                  return (
                    <div
                      key={session.id}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                        isCompleted 
                          ? "bg-emerald-50/50 border-emerald-200" 
                          : "bg-white border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          id={`toggle-custom-session-${session.id}`}
                          onClick={() => onToggleSessionCompleted(sessionId, session.notes)}
                          className={cn(
                            "w-7 h-7 rounded-xl flex items-center justify-center transition-all flex-shrink-0 mt-0.5",
                            isCompleted 
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" 
                              : "border-2 border-slate-300 hover:border-amber-500 bg-white"
                          )}
                          title={isCompleted ? "Mark incomplete" : "Mark completed"}
                        >
                          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {session.bookName} {session.chapters.join(', ')}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Added {session.dateAdded}
                            </span>
                          </div>

                          <h4 className={cn(
                            "font-bold text-sm",
                            isCompleted ? "text-emerald-950 line-through decoration-emerald-500/50" : "text-slate-900"
                          )}>
                            {session.title}
                          </h4>

                          {session.notes && (
                            <p className="text-xs text-slate-600 italic">
                              "{session.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          id={`open-custom-session-reader-${session.id}`}
                          onClick={() => onOpenChapter(session.bookId, session.chapters[0] || 1)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Open Chapter</span>
                        </button>

                        <button
                          id={`delete-custom-session-${session.id}`}
                          onClick={() => onDeleteCustomSession(session.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
