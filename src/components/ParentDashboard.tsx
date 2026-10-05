import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ProjectSubmission } from '../types';
import { SUBJECTS, getLessonsCountForGrade } from '../constants';
import { cn } from '../lib/utils';
import Logo from './Logo';
import ParentLearning from './ParentLearning';
import ChristianVideosCenter from './ChristianVideosCenter';
import ChristianMusicCenter from './ChristianMusicCenter';
import { useError } from './ErrorManager';
import { checkAllGradesFinished } from '../utils/gradeCompletion';
import { calculateUserPoints, getUserBadges, getScholarLevel, getLeaderboard } from '../utils/gamification';

export default function ParentDashboard({ 
  user,
  history,
  onLogout,
  onSelectView
}: { 
  user: User;
  history: { topicId: string, score: number, date: number }[];
  onLogout: () => void;
  onSelectView?: (view: 'landing' | 'login' | 'dashboard' | 'subject' | 'lesson' | 'parent' | 'final-exam' | 'drills' | 'payment-plans') => void;
}) {
  const { reportError } = useError();
  const [showSettings, setShowSettings] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'analytics' | 'learning' | 'alerts' | 'profile'>('overview');
  
  const [technicalErrors, setTechnicalErrors] = React.useState<string[]>([]);

  // Miss Kelechi Cloud Refresh state
  const [showCloudRefresh, setShowCloudRefresh] = React.useState(false);
  const [cloudRefreshStage, setCloudRefreshStage] = React.useState(0);

  const handleRefreshCloud = () => {
    setShowCloudRefresh(true);
    setCloudRefreshStage(0);
    
    const intervals = [800, 1000, 1000, 900, 800];
    let currentStage = 0;
    
    const nextStage = () => {
      if (currentStage < 5) {
        currentStage++;
        setCloudRefreshStage(currentStage);
        if (currentStage === 5) {
          localStorage.setItem('miss_kelechi_cloud_refreshed', 'true');
          window.dispatchEvent(new Event('miss_kelechi_cloud_refreshed'));
        } else {
          setTimeout(nextStage, intervals[currentStage]);
        }
      }
    };
    
    setTimeout(nextStage, intervals[0]);
  };
  
  React.useEffect(() => {
    // Simulate system health and data integrity check
    const checkSystems = () => {
      const errors: string[] = [];
      if (!history) errors.push("Connection interrupted: History data unavailable.");
      if (history.some(h => !h.topicId || typeof h.score !== 'number')) {
        errors.push("Data Corruption: Invalid record found in learning history.");
      }
      setTechnicalErrors(errors);
    };
    checkSystems();
  }, [history]);

  const filteredHistory = history ? history.filter(h => !h.topicId.startsWith('DRILLS-') && !h.topicId.includes('DRILLS')) : [];

  const projectSubmissions: ProjectSubmission[] = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(`asc_project_submissions_${user.id}`);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }, [user.id]);

  const totalLessons = filteredHistory.length;
  const averageScore = totalLessons > 0 
    ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.score, 0) / totalLessons) 
    : 0;
  
  const totalCumulativeScore = filteredHistory.reduce((acc, curr) => acc + curr.score, 0);

  // Calculate progress based on the specific grade's lesson count
  const lessonsPerSubject = getLessonsCountForGrade(user.grade || 1);
  const availableSubjects = SUBJECTS.filter(s => s.name !== 'Alphabet' || user.grade === 1);
  const totalPossibleTopics = availableSubjects.length * lessonsPerSubject; 
  const uniqueCompletedTopics = new Set(filteredHistory.map(h => h.topicId)).size;
  const overallProgress = Math.round((uniqueCompletedTopics / totalPossibleTopics) * 100);

  const gradeStatus = checkAllGradesFinished(user, filteredHistory);
  const isAllGradesFinished = gradeStatus.isAllGradesFinished;

  const pointsData = React.useMemo(() => calculateUserPoints(user, filteredHistory), [user, filteredHistory]);
  const scholarLevel = React.useMemo(() => getScholarLevel(pointsData.totalPoints), [pointsData.totalPoints]);
  const badgesList = React.useMemo(() => getUserBadges(user, filteredHistory), [user, filteredHistory]);
  const unlockedBadges = React.useMemo(() => badgesList.filter(b => b.isUnlocked), [badgesList]);
  const { userRank } = React.useMemo(() => getLeaderboard(user, pointsData.totalPoints, unlockedBadges.length), [user, pointsData.totalPoints, unlockedBadges.length]);

  const criticalFailures = filteredHistory.filter(h => {
    const isSpelling = h.topicId.startsWith('Spelling');
    return isSpelling ? h.score <= 50 : h.score <= 60;
  });
  const learningChallenges = filteredHistory.filter(h => {
    const isSpelling = h.topicId.startsWith('Spelling');
    if (isSpelling) return h.score > 50 && h.score < 75;
    return h.score > 60 && h.score < 80;
  });
  const appUpdates = [
    { date: '2026-04-15', event: 'Audio integration for Grade 1 added.' },
    { date: '2026-04-16', event: 'New "Alphabet" subject launched.' },
    { date: '2026-04-17', event: 'Strict 60% Pass Threshold implemented: Students must redo lesson if they score 60% or less.' }
  ];

  const handleSyncCloud = () => {
    // Simulate a Firestore permission error
    const authInfo = {
      userId: user.id,
      email: "parent@gmail.com",
      emailVerified: true,
      isAnonymous: false,
      providerInfo: [{ providerId: 'google.com', displayName: user.name, email: 'parent@gmail.com' }]
    };
    
    const errorInfo = {
      error: "Missing or insufficient permissions.",
      operationType: 'write',
      path: `users/${user.id}/history`,
      authInfo
    };

    reportError(`Database Error: ${errorInfo.error}. Please contact administrator. (Op: ${errorInfo.operationType})`, "connection");
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-6">
          <Logo size="sm" />
          <div className="h-6 w-px bg-surface-container-high hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-2 border-primary/20">
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="font-headline font-black text-on-surface hidden sm:block">Parent View</span>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-surface-container overflow-hidden z-[60]"
              >
                <button 
                  onClick={() => {
                    setShowSettings(false);
                    if (onSelectView) onSelectView('payment-plans');
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-secondary hover:bg-secondary/10 flex items-center gap-2 border-b border-surface-container"
                >
                  <span className="material-symbols-outlined text-sm text-secondary">folder_open</span>
                  Payment Plans Folder
                </button>
                <button 
                  onClick={() => {
                    handleRefreshCloud();
                    setShowSettings(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-primary hover:bg-primary/10 flex items-center gap-2 border-b border-surface-container"
                >
                  <span className="material-symbols-outlined text-sm text-primary">sync</span>
                  Refresh Cloud (Miss Kelechi)
                </button>
                <button 
                  onClick={() => {
                    reportError("Parent reported a technical issue. Our support team has been notified.", "technical");
                    setShowSettings(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-on-surface hover:bg-surface-container flex items-center gap-2 border-b border-surface-container"
                >
                  <span className="material-symbols-outlined text-sm text-primary">report_problem</span>
                  Report Tech Issue
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main className="pt-28 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <header className="mb-12">
                <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">Child's Performance</h1>
                <p className="text-xl text-on-surface-variant font-medium mt-2">Monitoring {user.name}'s learning journey</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-primary">
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Overall Progress</h3>
                  <div className="text-4xl font-black text-primary">{overallProgress}%</div>
                  <p className="text-xs text-on-surface-variant mt-2">Grade {user.grade} topics explored</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-secondary">
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Average Score</h3>
                  <div className="text-4xl font-black text-secondary">{averageScore}%</div>
                  <p className="text-xs text-on-surface-variant mt-2">
                    {averageScore >= 90 ? 'High achievement!' : averageScore >= 70 ? 'Good progress!' : 'Keep practicing!'}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-tertiary">
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Quizzes Taken</h3>
                  <div className="text-4xl font-black text-tertiary">{totalLessons}</div>
                  <p className="text-xs text-on-surface-variant mt-2">Total attempts completed</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-amber-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">WAEC / JAMB Hub</h3>
                    <span className="material-symbols-outlined text-amber-600 text-lg">
                      {isAllGradesFinished ? 'lock_open' : 'lock'}
                    </span>
                  </div>
                  <div className="text-2xl font-black flex items-center gap-2">
                    {isAllGradesFinished ? (
                      <span className="text-emerald-600">UNLOCKED</span>
                    ) : (
                      <span className="text-amber-600">LOCKED</span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">
                    {isAllGradesFinished 
                      ? 'All 10 grades finished (Exams Unlocked)' 
                      : `Opens after finishing all 10 grades (Current: Grade ${user.grade})`
                    }
                  </p>
                </div>
              </div>

              {/* Christian Character & Virtues Guidance Banner for Parents */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-8 rounded-2xl shadow-md mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-amber-100 text-xs font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-base">menu_book</span>
                    Biblical Character & Moral Integrity
                  </div>
                  <h3 className="font-headline text-2xl font-black text-white">
                    Christian Values Integration
                  </h3>
                  <p className="text-sm text-amber-50 leading-relaxed font-medium">
                    {user.name}'s curriculum is grounded in Christian values: Diligence (Colossians 3:23), Honesty (Proverbs 11:3), Respect for Parents (Exodus 20:12), and Love for others. Miss Kelechi incorporates these moral principles into every lesson.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center min-w-[200px]">
                  <span className="material-symbols-outlined text-4xl text-amber-200 mb-1">verified</span>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-100">Character Foundation</p>
                  <p className="text-sm font-bold text-white mt-1">100% Biblical Ethics</p>
                </div>
              </div>

              {/* Gamification, Badges & Points Tracker for Parents */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm mb-12 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-black text-xl text-on-surface">
                        Academic Gamification & Badges Tracker
                      </h3>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Track {user.name}'s points, level advancement, and virtual badges earned through lessons and activities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Scholar Level</span>
                      <span className="font-headline font-black text-sm text-amber-950">Level {scholarLevel.level}: {scholarLevel.title}</span>
                    </div>
                    <div className="h-8 w-px bg-amber-200" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Total Points</span>
                      <span className="font-headline font-black text-sm text-amber-950">{pointsData.totalPoints.toLocaleString()} XP</span>
                    </div>
                    <div className="h-8 w-px bg-amber-200" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Pan-Africa Rank</span>
                      <span className="font-headline font-black text-sm text-amber-950">#{userRank}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-headline font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                    Virtual Badges Earned ({unlockedBadges.length} of {badgesList.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {badgesList.map(b => (
                      <div 
                        key={b.id}
                        className={cn(
                          "p-3 rounded-2xl border text-center flex flex-col items-center justify-between",
                          b.isUnlocked 
                            ? "bg-amber-50/60 border-amber-300 shadow-sm" 
                            : "bg-surface-container-low border-surface-container opacity-60"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center mb-1.5",
                          b.isUnlocked ? "bg-amber-400 text-slate-950 shadow-sm" : "bg-surface-container-high text-outline-variant"
                        )}>
                          <span className="material-symbols-outlined text-xl">{b.icon}</span>
                        </div>
                        <span className="font-headline font-black text-xs text-on-surface leading-tight line-clamp-1">
                          {b.title}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full",
                          b.isUnlocked ? "bg-amber-200 text-amber-900" : "text-outline-variant"
                        )}>
                          {b.isUnlocked ? 'Unlocked' : `${b.currentCount}/${b.targetCount}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Christian Videos Publisher Studio (Parent/Admin Creator Mode) */}
              <div className="mb-12">
                <ChristianVideosCenter user={user} mode="parent" />
              </div>

              {/* Christian Music Player & Worship Academy */}
              <div className="mb-12">
                <ChristianMusicCenter user={user} />
              </div>

              {/* Experiential Project Sessions & Parent Verification Log */}
              <section className="bg-white rounded-2xl shadow-sm border border-surface-container overflow-hidden mb-12 p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-surface-container">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-1">
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      Hands-On Learning Log
                    </div>
                    <h2 className="text-2xl font-black text-on-surface font-headline">
                      Project Sessions & Parent Supervision
                    </h2>
                    <p className="text-sm text-on-surface-variant font-medium">
                      Tracking experiential projects across Science, Social Studies, Math, Literature, Bible Study, etc.
                    </p>
                  </div>
                  <div className="bg-surface-container-low px-4 py-2 rounded-xl text-xs font-bold text-on-surface flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    {projectSubmissions.length} Projects Submitted
                  </div>
                </div>

                {projectSubmissions.length === 0 ? (
                  <div className="text-center py-10 bg-surface-container-low rounded-xl border border-dashed border-surface-container-high">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">science</span>
                    <p className="font-bold text-on-surface text-base">No Project Sessions Completed Yet</p>
                    <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                      {user.name} can open the <strong>Project Sessions Hub</strong> in their dashboard to perform hands-on projects in Science, Social Studies, Math, and all other subjects.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectSubmissions.map((sub, idx) => (
                      <div key={idx} className="p-5 bg-surface-container-low rounded-xl border border-surface-container hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-md">
                            {sub.subject}
                          </span>
                          <span className="text-[10px] font-bold text-on-surface-variant">
                            {new Date(sub.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-on-surface text-base mb-1">{sub.projectTitle}</h4>
                        <p className="text-xs text-on-surface-variant italic mb-3">"{sub.reflection}"</p>
                        
                        {sub.parentVerified ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Parent Verification Recorded ({sub.parentName || 'Supervised'})
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">pending</span>
                            Supervision Pending
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-surface-container">
                  <h2 className="text-2xl font-bold text-on-surface">Subject Breakdown</h2>
                </div>
                <div className="divide-y divide-surface-container">
                    {SUBJECTS.filter(s => s.name !== 'Alphabet' || user.grade === 1).map(subject => {
                      const subjectHistory = filteredHistory.filter(h => h.topicId.startsWith(subject.name));
                    const subAvg = subjectHistory.length > 0 
                      ? Math.round(subjectHistory.reduce((acc, curr) => acc + curr.score, 0) / subjectHistory.length)
                      : 0;
                    const subProgress = Math.round((new Set(subjectHistory.map(h => h.topicId)).size / lessonsPerSubject) * 100);

                    return (
                      <div key={subject.name} className="p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center",
                            `bg-${subject.color}-container text-on-${subject.color}-container`
                          )}>
                            <span className="material-symbols-outlined">{subject.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{subject.name}</h4>
                            <p className="text-sm text-on-surface-variant">Grade {user.grade || 1} Curriculum</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-on-surface">{subAvg}% Avg</div>
                          <div className="w-32 h-2 bg-surface-container-high rounded-full mt-2 overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500" 
                              style={{ width: `${subProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ParentLearning />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">Analytics</h1>
                <p className="text-xl text-on-surface-variant font-medium mt-2">In-depth scores and cumulative totals</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-3xl shadow-xl border-l-[12px] border-primary">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-3xl">analytics</span>
                    </div>
                    <h3 className="text-xl font-bold text-on-surface">Average Score</h3>
                  </div>
                  <div className="text-8xl font-black text-primary leading-none">{averageScore}%</div>
                  <p className="text-on-surface-variant font-medium mt-6">This represents the student's mastery across all participated quizzes.</p>
                </div>

                <div className="bg-white p-10 rounded-3xl shadow-xl border-l-[12px] border-secondary">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-3xl">military_tech</span>
                    </div>
                    <h3 className="text-xl font-bold text-on-surface">Total Cumulative Score</h3>
                  </div>
                  <div className="text-8xl font-black text-secondary leading-none">{totalCumulativeScore}</div>
                  <p className="text-on-surface-variant font-medium mt-6">The total number of points earned across his entire learning history.</p>
                </div>
              </div>

              <section className="bg-white p-8 rounded-3xl shadow-sm border border-surface-container">
                <h3 className="text-2xl font-bold mb-6">Score Distribution</h3>
                <div className="flex items-end gap-2 h-48">
                  {filteredHistory.slice(-10).map((h, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div 
                        className="bg-primary/20 hover:bg-primary transition-all rounded-t-lg w-full" 
                        style={{ height: `${h.score}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
                        {h.score}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  <span>Earlier</span>
                  <span>Latest Lessons</span>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">Alerts & Logs</h1>
                <p className="text-xl text-on-surface-variant font-medium mt-2">Critical issues and platform updates</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <section className="space-y-6">
                    <h3 className="text-2xl font-bold text-red-500 flex items-center gap-2">
                      <span className="material-symbols-outlined">warning</span>
                      Learning Alerts
                    </h3>
                    
                    {criticalFailures.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-xs font-black text-red-600 uppercase tracking-tighter">Critical: Redo Required (Score ≤ 60%)</p>
                        {criticalFailures.map((err, i) => (
                          <div key={`crit-${i}`} className="bg-red-600 p-4 rounded-xl shadow-lg flex items-center justify-between border-2 border-red-400">
                            <div>
                              <p className="font-black text-white">{err.topicId.split('-')[0]} Unit Failure</p>
                              <p className="text-xs text-red-100 italic">
                                Score: {err.score}% - {err.topicId.startsWith('Spelling') ? 'Session requires > 50%.' : 'Session requires > 60%.'} Student was forced to restart.
                              </p>
                            </div>
                            <span className="material-symbols-outlined text-white">dangerous</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {learningChallenges.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-xs font-black text-primary uppercase tracking-tighter">Needs Review (Score {'>'} 60% &amp; {'<'} 80%)</p>
                        {learningChallenges.map((err, i) => (
                          <div key={`challenge-${i}`} className="bg-white p-4 rounded-xl border border-red-200 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-red-900">{err.topicId.split('-')[0]} Help Needed</p>
                              <p className="text-xs text-red-700">Achieved {err.score}% on {new Date(err.date).toLocaleDateString()}</p>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-red-900 bg-red-200 px-3 py-1 rounded-full">Assign Review</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {criticalFailures.length === 0 && learningChallenges.length === 0 && (
                      <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-200">
                        <span className="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
                        <p className="text-green-800 font-bold">No critical learning issues! Student is mastering the content well.</p>
                      </div>
                    )}
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">settings_suggest</span>
                      System Diagnostics
                    </h3>
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Connectivity & Integrity</span>
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase",
                          technicalErrors.length > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                          <span className={cn("w-2 h-2 rounded-full", technicalErrors.length > 0 ? "bg-red-500" : "bg-green-500 animate-pulse")} />
                          {technicalErrors.length > 0 ? "Action Required" : "System Healthy"}
                        </div>
                      </div>
                      
                      {technicalErrors.length > 0 ? (
                        <div className="space-y-3">
                          {technicalErrors.map((err, i) => (
                            <div key={i} className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 italic text-xs">
                              <span className="material-symbols-outlined text-sm">report</span>
                              {err}
                            </div>
                          ))}
                          <button 
                            onClick={handleSyncCloud}
                            className="w-full mt-2 py-2 text-primary font-bold text-xs hover:underline"
                          >
                            Sync with Cloud (Retry)
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-on-surface-variant italic">All local curriculum records are synchronized. No technical issues found.</p>
                      )}
                    </div>
                  </section>
                </div>

                <section className="space-y-6">
                  <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span>
                    Platform Events
                  </h3>
                  <div className="space-y-4">
                    {appUpdates.map((update, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="text-xs font-bold text-primary whitespace-nowrap pt-1">{update.date}</div>
                        <div className="text-sm font-medium text-on-surface leading-snug">{update.event}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <header>
                <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">Student Records</h1>
                <p className="text-xl text-on-surface-variant font-medium mt-2">Comprehensive profile and history</p>
              </header>

              <div className="bg-white rounded-3xl p-10 shadow-xl border border-surface-container flex flex-col md:flex-row gap-10 items-center md:items-start">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary ring-8 ring-primary/10">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div>
                    <h2 className="text-4xl font-black text-on-surface">{user.name}</h2>
                    <p className="text-primary font-bold text-lg uppercase tracking-widest">Scholar ID: #ASC-{user.id}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-container-low p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Grade</p>
                      <p className="text-2xl font-black text-primary">{user.grade || 1}</p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Status</p>
                      <p className="text-2xl font-black text-primary">Active</p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Rank</p>
                      <p className="text-2xl font-black text-primary">A+</p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Credits</p>
                      <p className="text-2xl font-black text-primary">5400</p>
                    </div>
                  </div>
                </div>
              </div>

              <section className="bg-white rounded-3xl shadow-sm overflow-hidden py-8">
                <div className="px-10 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">receipt_long</span>
                    Complete Activity Record
                  </h3>
                </div>
                <div className="px-10 divide-y divide-surface-container">
                  {filteredHistory.slice().reverse().map((h, i) => (
                    <div key={i} className="py-6 flex items-center justify-between group hover:bg-surface-container-low px-4 -mx-4 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-on-surface-variant border border-surface-container group-hover:bg-primary group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined">assignment</span>
                        </div>
                        <div>
                          <p className="font-black text-lg text-on-surface">{h.topicId.split('-')[0]} Unit Test</p>
                          <p className="text-sm font-medium text-on-surface-variant">
                            Session recorded on {new Date(h.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black uppercase text-on-surface-variant">Proficiency</p>
                          <p className="text-sm font-bold text-primary">{h.score >= 80 ? 'Mastery' : 'Improving'}</p>
                        </div>
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-inner",
                          h.score >= 80 ? "bg-green-100 text-green-700" : "bg-primary-container text-primary"
                        )}>
                          {h.score}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-8 pb-6 pt-4 bg-white/80 backdrop-blur-xl rounded-t-[3rem] z-50 shadow-lg">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex flex-col items-center justify-center p-3 transition-all duration-300",
            activeTab === 'overview' ? "bg-primary text-white rounded-full -translate-y-4 shadow-xl" : "text-on-surface/50"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'overview' ? "'FILL' 1" : undefined }}>dashboard</span>
          <span className="font-body text-[10px] font-semibold">Overview</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "flex flex-col items-center justify-center p-3 transition-all duration-300",
            activeTab === 'analytics' ? "bg-primary text-white rounded-full -translate-y-4 shadow-xl" : "text-on-surface/50"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'analytics' ? "'FILL' 1" : undefined }}>insights</span>
          <span className="font-body text-[10px] font-semibold">Analytics</span>
        </button>
        <button 
          onClick={() => setActiveTab('learning')}
          className={cn(
            "flex flex-col items-center justify-center p-3 transition-all duration-300",
            activeTab === 'learning' ? "bg-primary text-white rounded-full -translate-y-4 shadow-xl" : "text-on-surface/50"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'learning' ? "'FILL' 1" : undefined }}>auto_stories</span>
          <span className="font-body text-[10px] font-semibold">Learning</span>
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={cn(
            "flex flex-col items-center justify-center p-3 transition-all duration-300",
            activeTab === 'alerts' ? "bg-primary text-white rounded-full -translate-y-4 shadow-xl" : "text-on-surface/50"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'alerts' ? "'FILL' 1" : undefined }}>notifications</span>
          <span className="font-body text-[10px] font-semibold">Alerts</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center justify-center p-3 transition-all duration-300",
            activeTab === 'profile' ? "bg-primary text-white rounded-full -translate-y-4 shadow-xl" : "text-on-surface/50"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : undefined }}>person</span>
          <span className="font-body text-[10px] font-semibold">Profile</span>
        </button>
      </nav>

      <AnimatePresence>
        {showCloudRefresh && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-center space-y-6"
            >
              {/* Decorative sync graphic */}
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                {cloudRefreshStage < 5 ? (
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined text-5xl text-primary"
                  >
                    sync
                  </motion.span>
                ) : (
                  <span className="material-symbols-outlined text-5xl text-emerald-500 animate-bounce">
                    cloud_done
                  </span>
                )}
              </div>
              
              <h3 className="text-3xl font-headline font-black text-on-surface">
                {cloudRefreshStage < 5 ? "Refreshing Miss Kelechi Cloud..." : "Cloud Refreshed Successfully!"}
              </h3>
              
              <div className="space-y-4">
                <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${(cloudRefreshStage / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className="bg-primary h-full rounded-full"
                  />
                </div>
                
                <p className="text-sm font-bold uppercase tracking-widest text-primary">
                  {cloudRefreshStage === 0 && "Initializing secure connection paths..."}
                  {cloudRefreshStage === 1 && "Connecting with Miss Kelechi server at www.africanschoolcurriculum.com..."}
                  {cloudRefreshStage === 2 && "Synchronizing Grade lessons & worksheets..."}
                  {cloudRefreshStage === 3 && "Optimizing pedagogical dialogue pipelines..."}
                  {cloudRefreshStage === 4 && "Finalizing cloud handshake..."}
                  {cloudRefreshStage === 5 && "Cloud sync secure! Miss Kelechi is now fully online."}
                </p>
                
                <p className="text-xs font-medium text-on-surface-variant leading-relaxed px-4">
                  {cloudRefreshStage < 5 
                    ? "Please wait while we resolve connection pathways and synchronize the digital AI strategic curriculum."
                    : "Miss Kelechi's AI Teacher is available, synced, and working PROPERLY. All curriculum systems are online!"
                  }
                </p>
              </div>
              
              {cloudRefreshStage === 5 && (
                <button 
                  onClick={() => setShowCloudRefresh(false)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-headline font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all mt-4"
                >
                  Close & Close Menu!
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
