import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Subject } from '../types';
import { SUBJECTS, getLessonsCountForGrade } from '../constants';
import { cn } from '../lib/utils';
import Logo from './Logo';
import SmartAdvice from './SmartAdvice';
import SmartFlashcards from './SmartFlashcards';
import WeeklyTimetable from './WeeklyTimetable';
import KindnessGraphic from './KindnessGraphic';
import { useError } from './ErrorManager';
import MissKelechiInfoCenter from './MissKelechiInfoCenter';
import DailyStudyGoal from './DailyStudyGoal';
import WeeklyLessonsGoal from './WeeklyLessonsGoal';
import ChristianValuesCenter from './ChristianValuesCenter';
import ChristianVideosCenter from './ChristianVideosCenter';
import ChristianMusicCenter from './ChristianMusicCenter';
import { isSubjectDrillAvailable } from '../utils/drillSchedule';
import ProjectSessions from './ProjectSessions';
import AISearchExplorer from './AISearchExplorer';
import BibleSection from './BibleSection';
import WaecJambCenter from './WaecJambCenter';
import WaecJambLocked from './WaecJambLocked';
import { checkAllGradesFinished } from '../utils/gradeCompletion';
import UpgradeButton from './UpgradeButton';
import GamificationCenter from './GamificationCenter';
import { 
  calculateUserPoints, 
  getScholarLevel, 
  getUserBadges, 
  getLeaderboard, 
  getActivityLogs 
} from '../utils/gamification';
import { WorksheetProgress } from '../types';

type DashboardTab = 'home' | 'search' | 'library' | 'projects' | 'progress' | 'awards' | 'bible' | 'waec-jamb' | 'profile' | 'timetable';

export default function StudentDashboard({ 
  user, 
  onSelectSubject,
  onLogout,
  onStartExam,
  onStartDrills,
  history = [],
  worksheetHistory = [],
  onChangeGrade
}: { 
  user: User; 
  onSelectSubject: (subject: Subject, section?: 'lessons' | 'worksheets' | 'activities' | 'matrix') => void;
  onLogout: () => void;
  onStartExam: () => void;
  onStartDrills: (subject?: Subject) => void;
  history?: { topicId: string, score: number, date: number }[];
  worksheetHistory?: WorksheetProgress[];
  onChangeGrade?: (grade: number) => void;
}) {
  const { reportError } = useError();
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [showExamIntro, setShowExamIntro] = useState(user.isBeginner && (user.loginMethod === 'Google' || user.loginMethod === 'ClassLink'));

  // Miss Kelechi Cloud Refresh state
  const [showCloudRefresh, setShowCloudRefresh] = useState(false);
  const [cloudRefreshStage, setCloudRefreshStage] = useState(0);

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

  const filteredHistory = history.filter(h => !h.topicId.startsWith('DRILLS-') && !h.topicId.includes('DRILLS'));

  const totalLessons = filteredHistory.length;
  const averageScore = totalLessons > 0 
    ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.score, 0) / totalLessons) 
    : 0;
  
  const lessonsPerSubject = getLessonsCountForGrade(user.grade || 1);
  const availableSubjects = SUBJECTS.filter(s => {
    if (s.name === 'Alphabet') return user.grade === 1;
    if (s.name === 'Biology' || s.name === 'Etymology') return user.grade !== undefined && user.grade >= 8 && user.grade <= 10;
    return true;
  });
  const totalPossibleTopics = availableSubjects.length * lessonsPerSubject; 
  const uniqueCompletedTopics = new Set(filteredHistory.map(h => h.topicId)).size;
  const overallProgress = Math.round((uniqueCompletedTopics / totalPossibleTopics) * 100);

  const gradeStatus = checkAllGradesFinished(user, filteredHistory);
  const isAllGradesFinished = gradeStatus.isAllGradesFinished;

  const activityLogs = useMemo(() => getActivityLogs(user.id), [user.id]);
  const pointsData = useMemo(() => calculateUserPoints(user, filteredHistory, worksheetHistory, activityLogs), [user, filteredHistory, worksheetHistory, activityLogs]);
  const scholarLevel = useMemo(() => getScholarLevel(pointsData.totalPoints), [pointsData.totalPoints]);
  const badgesList = useMemo(() => getUserBadges(user, filteredHistory, worksheetHistory, activityLogs), [user, filteredHistory, worksheetHistory, activityLogs]);
  const unlockedBadgesCount = useMemo(() => badgesList.filter(b => b.isUnlocked).length, [badgesList]);
  const { userRank } = useMemo(() => getLeaderboard(user, pointsData.totalPoints, unlockedBadgesCount), [user, pointsData.totalPoints, unlockedBadgesCount]);

  const [showSuperBadge, setShowSuperBadge] = useState(overallProgress === 100 && user.grade === 10);
  const [isReadingGraduation, setIsReadingGraduation] = useState(false);

  const graduationList = [
    "1. Opening Procession of our Grade 10 Scholars.",
    "2. National Anthem and our School's Anthem of Excellence.",
    "3. Opening Prayer to thank God for our academic journey.",
    "4. Welcome Address by the School Sponsor.",
    "5. Valedictory Speech by the Top Performing Scholar.",
    "6. Official Presentation of the SUPER BADGE and Completion Certificates.",
    "7. Inspirational Keynote Address by the Physical Teacher.",
    "8. Graduation Walk and Final Class Photo.",
    "9. Vote of Thanks and Closing Benediction."
  ];

  const readGraduationList = () => {
    window.speechSynthesis.cancel();
    setIsReadingGraduation(true);
    
    const textToRead = `Graduation Day Ceremony Plan. Read by your Teacher and Sponsor. ${graduationList.join(' ')} Congratulations to all our graduates!`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'en-GB';
    utterance.rate = 0.85;
    
    utterance.onend = () => setIsReadingGraduation(false);
    utterance.onerror = () => setIsReadingGraduation(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleChangeGrade = (newGrade: number) => {
    if (onChangeGrade) {
      // Robust detection for "the website" (shared/production) vs "Google AI Studio" (dev)
      const isSharedApp = typeof window !== 'undefined' && 
        (window.location.hostname.includes('ais-pre') || 
         (!window.location.hostname.includes('ais-dev') && !window.location.hostname.includes('localhost')));

      if (isSharedApp && newGrade > (user.grade || 0)) {
        alert(`Good work your child is moving to a new grade! Now, chat with this number, 08025719336 and pay 15,000 Naira to move to the next grade.`);
        // Note: For the website app, we show the letter/alert as requested.
      }
      
      onChangeGrade(newGrade);
      // Formal confirmation of 'permanent' suggestion
      const utterance = new SpeechSynthesisUtterance(`Grade updated to ${newGrade}. Your curriculum is now synchronized.`);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderContent = () => {
    if (user.grade === 10 && overallProgress === 100 && activeTab === 'awards') {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-12 rounded-[3rem] shadow-2xl text-center text-white border-8 border-white/30 relative overflow-hidden">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[120px] mb-6 drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <h1 className="text-6xl font-black mb-4 drop-shadow-md">SUPER BADGE</h1>
              <p className="text-2xl font-bold opacity-90">Well done for finishing all your courses!</p>
              <div className="mt-8 inline-block bg-white/20 px-6 py-2 rounded-full border border-white/40 font-black tracking-widest text-sm">
                GRADE 10 GRADUATE • 2026
              </div>
            </div>
          </div>

          <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-surface-container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-on-surface">Graduation Day Program</h2>
                <p className="text-on-surface-variant font-medium text-lg mt-2 italic">Listen to your Physical Teacher and Sponsor read the ceremony list</p>
              </div>
              <button 
                onClick={readGraduationList}
                className={cn(
                  "flex items-center gap-4 px-8 py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95",
                  isReadingGraduation ? "bg-red-500 text-white animate-pulse" : "bg-primary text-white hover:bg-primary-dim"
                )}
              >
                <span className="material-symbols-outlined text-3xl">
                  {isReadingGraduation ? 'stop_circle' : 'volume_up'}
                </span>
                {isReadingGraduation ? 'Stop Reading' : 'Read Ceremony List'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {graduationList.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high flex gap-4 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="font-bold text-on-surface text-lg">{item.substring(3)}</p>
                  </motion.div>
                ))}
              </div>
              <div className="bg-surface-container rounded-3xl overflow-hidden shadow-inner border-2 border-surface-container-high">
                <img 
                  src="https://picsum.photos/seed/graduation/800/800" 
                  alt="Graduation Celebration" 
                  className="w-full h-full object-cover grayscale-[0.2]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </section>
        </motion.div>
      );
    }

    switch (activeTab) {
      case 'search':
        return <AISearchExplorer user={user} />;
      case 'library':
        return <LibraryView />;
      case 'projects':
        return <ProjectSessions user={user} onBack={() => setActiveTab('home')} />;
      case 'progress':
        return <ProgressView user={user} history={filteredHistory} />;
      case 'awards':
        return (
          <GamificationCenter 
            user={user} 
            history={filteredHistory} 
            worksheetHistory={worksheetHistory}
            onBack={() => setActiveTab('home')}
            onSelectSubject={(subj) => onSelectSubject(subj, 'lessons')}
          />
        );
      case 'bible':
        return <BibleSection user={user} onNavigateToTab={(tab) => setActiveTab(tab as DashboardTab)} />;
      case 'waec-jamb':
        if (!isAllGradesFinished) {
          return (
            <WaecJambLocked 
              user={user} 
              history={filteredHistory} 
              onBack={() => setActiveTab('home')}
              onUnlocked={() => setActiveTab('waec-jamb')}
            />
          );
        }
        return <WaecJambCenter user={user} history={filteredHistory} onBack={() => setActiveTab('home')} />;
      case 'profile':
        return <ProfileView user={user} history={filteredHistory} onChangeGrade={handleChangeGrade} />;
      case 'timetable':
        return <WeeklyTimetable onStartDrills={onStartDrills} grade={user.grade} />;
      default:
        return (
          <>
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-2">
                <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">Hello, {user.name}!</h1>
                <p className="text-xl text-on-surface-variant font-medium">Student Portal • <span className="text-primary font-bold">Awesome Scholar</span></p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {overallProgress === 100 && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-secondary p-6 rounded-xl flex items-center gap-6 shadow-xl border-4 border-white/20 text-white cursor-pointer hover:scale-105 transition-all"
                    onClick={onStartExam}
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Grade Complete!</p>
                      <p className="text-xl font-black">Take Final Exam</p>
                    </div>
                    <span className="material-symbols-outlined ml-4">arrow_forward</span>
                  </motion.div>
                )}

                <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-6 shadow-sm border border-white/50">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle className="text-surface-container-high" cx="18" cy="18" fill="none" r="16" stroke="currentColor" strokeWidth="3" />
                      <circle className="text-secondary" cx="18" cy="18" fill="none" r="16" stroke="currentColor" strokeDasharray="100" strokeDashoffset={100 - overallProgress} strokeLinecap="round" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-headline font-bold text-sm">{overallProgress}%</div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Overall Progress</p>
                    <p className="text-xl font-black text-on-surface">{uniqueCompletedTopics}/{totalPossibleTopics} Lessons</p>
                  </div>
                </div>

                <div className="bg-tertiary-container p-6 rounded-xl flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-white/40 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-tertiary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-tertiary-container/80 uppercase tracking-wider">Avg. Score</p>
                    <p className="text-2xl font-black text-on-tertiary-container">{averageScore}%</p>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('awards')}
                  className="bg-amber-100 hover:bg-amber-200/90 transition-all cursor-pointer p-6 rounded-xl flex items-center gap-4 shadow-sm border border-amber-300"
                  title="Click to view Virtual Badges & Pan-African Leaderboard"
                >
                  <div className="w-12 h-12 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-amber-950 uppercase tracking-wider">{pointsData.totalPoints.toLocaleString()} XP</p>
                      <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">#{userRank}</span>
                    </div>
                    <p className="text-xs font-bold text-amber-800">{unlockedBadgesCount} Badges • Level {scholarLevel.level}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <UpgradeButton user={user} variant="banner" />
                </div>
              </div>
            </header>

            <section className="mb-10 space-y-6">
              <DailyStudyGoal user={user} history={filteredHistory} />
              <WeeklyLessonsGoal user={user} history={filteredHistory} />
            </section>

            {/* AI Search Explorer Banner */}
            <section className="mb-10">
              <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-white/10">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-3 max-w-xl z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-black text-xs uppercase tracking-widest border border-amber-400/30">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span> Live Google Grounded AI Search
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">AI Knowledge Search & Discovery</h3>
                  <p className="text-blue-100/90 text-sm font-medium leading-relaxed">
                    Search any scientific wonder, invention, history, animal, or African heritage topic with Miss Kelechi & live Google Search grounding!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 shrink-0 z-10"
                >
                  <span className="material-symbols-outlined font-black">search</span>
                  Open Search Explorer
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </section>

            {/* Christian Values & Character Guidance */}
            <section className="mb-10">
              <ChristianValuesCenter user={user} />
            </section>

            {/* Christian Videos Cinema Center (Student Watch Mode - Read-Only) */}
            <section className="mb-10">
              <ChristianVideosCenter user={user} mode="student" />
            </section>

            {/* Christian Music Player & Worship Academy */}
            <section className="mb-10">
              <ChristianMusicCenter user={user} />
            </section>

            {/* Interactive Project Sessions Banner */}
            <section className="mb-10">
              <div 
                onClick={() => setActiveTab('projects')}
                className="bg-slate-900 border-4 border-primary/30 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-0" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 text-primary-light border border-primary/30 rounded-full text-xs font-black uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      Experiential Learning Hub
                      {user.grade === 1 && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-md text-[10px]">
                          Grade 1 AI & Parent Co-Pilot
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tight">
                      Hands-On Project Sessions
                    </h2>
                    <p className="text-white/70 font-medium text-sm md:text-base max-w-xl">
                      Explore interactive project sessions in <strong>Science, Social Studies, Math, English, Literature, Bible Study, Biology & Etymology</strong>. 
                      {user.grade === 1 
                        ? ' Grade 1 sessions include step-by-step AI Tutor guidance and required parent supervision verification!' 
                        : ' Complete hands-on missions and earn special project badges!'}
                    </p>
                  </div>

                  <button 
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl group-hover:scale-105 transition-all flex items-center gap-3 shrink-0"
                  >
                    Open Project Hub
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Miss Kelechi Information Center immediately available on Student Home page after registration */}
            <section className="mb-12">
              <div className="max-w-4xl mx-auto text-center mb-6 px-4">
                <h2 className="text-3xl font-black text-on-surface flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-primary text-4xl">info</span>
                  Miss Kelechi's Information Center
                </h2>
                <p className="text-on-surface-variant font-medium text-base mt-1">
                  Welcome scholar! Learn about your school schedule, lesson timelines, or ask Miss Kelechi your academic and platform questions.
                </p>
              </div>
              <MissKelechiInfoCenter user={user} />
            </section>

            {/* Holy Bible Section & Scripture AI Scholar */}
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-600">Holy Scriptures & Character Guidance</span>
                  <h2 className="text-3xl font-black text-on-surface flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-amber-500 text-3xl">auto_stories</span>
                    Holy Bible Center & Scripture AI Scholar
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('bible')}
                  className="hidden sm:flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                >
                  <span>Open Fullscreen Bible</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>
              </div>
              <BibleSection user={user} onNavigateToTab={(tab) => setActiveTab(tab as DashboardTab)} isEmbedded={true} />
            </section>

            {/* WAEC & JAMB National Examination Excellence Hub Banner */}
            <section className="mb-12">
              <div 
                id="waec-jamb-banner"
                onClick={() => setActiveTab('waec-jamb')}
                className={cn(
                  "rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer border",
                  isAllGradesFinished 
                    ? "bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/40"
                    : "bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/80 border-amber-500/40"
                )}
              >
                <div className={cn(
                  "absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none",
                  isAllGradesFinished ? "bg-emerald-500/20" : "bg-amber-500/15"
                )} />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 text-center md:text-left max-w-xl">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border",
                      isAllGradesFinished 
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    )}>
                      <span className="material-symbols-outlined text-sm">
                        {isAllGradesFinished ? 'school' : 'lock'}
                      </span>
                      {isAllGradesFinished ? 'National Examination Center • Unlocked' : 'Locked • Requires All 10 Grades Finished'}
                      <span className={cn(
                        "ml-1 px-2 py-0.5 rounded text-[10px] font-black",
                        isAllGradesFinished ? "bg-amber-400 text-slate-950" : "bg-rose-500 text-white"
                      )}>
                        {isAllGradesFinished ? 'WAEC + JAMB' : 'G1-G10 Prerequisite'}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tight">
                      WAEC (WASSCE) & JAMB (UTME) Center
                    </h2>
                    <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                      {isAllGradesFinished
                        ? "Practice authentic West African Examination Council past papers (Paper 1 & Paper 2 Theory with marking schemes) and simulate the official JAMB 8-key Computer-Based Test (CBT)!"
                        : `WAEC and JAMB will NOT open until ALL grades (1 through 10) are finished. You are currently in Grade ${user.grade}. Complete all grade curricula to unlock Senior National Examinations!`
                      }
                    </p>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('waec-jamb'); }}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl group-hover:scale-105 transition-all flex items-center gap-3 shrink-0 cursor-pointer",
                      isAllGradesFinished
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950"
                        : "bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50"
                    )}
                  >
                    {isAllGradesFinished ? (
                      <>
                        Open WAEC & JAMB Hub
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg text-amber-400">lock</span>
                        Prerequisite Locked
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white p-1 rounded-3xl shadow-lg border-2 border-primary/10">
                <div className="bg-surface-container-low rounded-[1.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-primary text-white rounded-3xl flex flex-col items-center justify-center rotate-3 shadow-xl border-4 border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Grade</p>
                      <span className="font-headline text-5xl font-black leading-none">{user.grade}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-on-surface">Academic Level: Grade {user.grade}</h2>
                      <p className="text-on-surface-variant font-medium text-lg leading-tight">Switch your grade to update your permanent school record.</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Saved Permanently</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-2 bg-white/50 p-6 rounded-[2rem] border border-black/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Suggest My Permanent Grade</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                        <button 
                          key={g} 
                          onClick={() => handleChangeGrade(g)}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all hover:translate-y-[-4px] active:scale-90 shadow-sm",
                            g === user.grade 
                              ? "bg-primary text-white scale-110 shadow-lg ring-4 ring-primary/20" 
                              : g < (user.grade || 0) 
                                ? "bg-secondary/10 text-secondary hover:bg-secondary hover:text-white" 
                                : "bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-headline text-2xl font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications_active</span>
                  Classroom News
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 0, title: "Today's Schedule", desc: `Click to see what to do today!`, type: 'timetable', icon: 'event_note' },
                    { id: 1, title: `Welcome to Grade ${user.grade}!`, desc: `You are now a Grade ${user.grade} scholar. Let's make this year great!`, type: 'info', icon: 'school' },
                    { 
                      id: 2, 
                      title: isAllGradesFinished ? "WAEC & JAMB Examination Hub" : "WAEC & JAMB Hub (Locked)", 
                      desc: isAllGradesFinished 
                        ? "8-Key keyboard simulation, marking schemes & course cutoffs!" 
                        : "WAEC and JAMB will NOT open until ALL grades (1-10) are finished.", 
                      type: 'waec-jamb', 
                      icon: isAllGradesFinished ? 'school' : 'lock' 
                    },
                    { id: 3, title: "Final Exam Preparation", desc: "Complete all subjects to unlock the final Grade Exam.", type: 'exam', icon: 'history_edu' },
                  ].map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        if (notif.type === 'timetable') setActiveTab('timetable');
                        if (notif.type === 'waec-jamb') setActiveTab('waec-jamb');
                      }}
                      className={cn(
                        "bg-white p-4 rounded-xl border border-surface-container flex items-start gap-4 hover:shadow-md transition-all",
                        (notif.type === 'timetable' || notif.type === 'waec-jamb') ? "cursor-pointer border-primary/30 ring-1 ring-primary/10" : ""
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        notif.type === 'info' ? "bg-primary/10 text-primary" : 
                        notif.type === 'timetable' ? "bg-secondary/10 text-secondary" :
                        notif.type === 'waec-jamb' ? "bg-emerald-100 text-emerald-800" :
                        "bg-tertiary/10 text-tertiary"
                      )}>
                        <span className="material-symbols-outlined text-xl">{notif.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">{notif.title}</h4>
                        <p className="text-xs text-on-surface-variant">{notif.desc}</p>
                      </div>
                    </div>
                  ))}
                  <SmartAdvice user={user} history={filteredHistory} />
                  <SmartFlashcards history={filteredHistory} grade={user.grade} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-primary-dim p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-symbols-outlined text-4xl text-amber-300">military_tech</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider text-amber-300">
                      Rank #{userRank}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black mb-1">{scholarLevel.title}</h3>
                  <p className="opacity-90 text-xs font-semibold text-amber-200">
                    Level {scholarLevel.level} • {pointsData.totalPoints.toLocaleString()} Total XP
                  </p>
                  <p className="opacity-80 text-xs font-medium mt-2">
                    {unlockedBadgesCount} Virtual Badges earned! {averageScore > 0 ? `Average quiz score: ${averageScore}%` : 'Complete lessons to climb the leaderboard.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/20">
                  <button 
                    onClick={() => setActiveTab('awards')}
                    className="w-full py-2.5 bg-white text-primary rounded-xl font-headline font-black text-xs uppercase tracking-wider shadow-md hover:bg-white/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">emoji_events</span>
                    <span>Badges & Leaderboard</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <KindnessGraphic />
            </section>

            <section className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                    Curriculum Hub
                  </span>
                  <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">
                    Grade {user.grade || 1} • 50 Lessons Each
                  </span>
                </div>
                <h2 className="font-headline font-black text-3xl text-on-surface">
                  Dedicated Subject Modules
                </h2>
                <p className="text-sm text-on-surface-variant font-medium mt-1">
                  Explore Math, English, Social Studies, Literature, Science, and Bible Study with dedicated sections for Lessons, Worksheets, and Activities.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {availableSubjects.map((subject, idx) => (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => onSelectSubject(subject.name, 'lessons')}
                  className={cn(
                    "cursor-pointer rounded-xl p-8 shadow-sm relative overflow-hidden group transition-all hover:scale-[1.02]",
                    idx === 0 ? "md:col-span-8 bg-surface-container-lowest" : "md:col-span-4 bg-white"
                  )}
                >
                  <div className="absolute -top-4 -right-4 w-48 h-48 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[120px]">{subject.icon}</span>
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", `bg-${subject.color}-container`)}>
                          <span className="material-symbols-outlined">{subject.icon}</span>
                        </div>
                        <h3 className="font-headline text-3xl font-extrabold">{subject.label || subject.name}</h3>
                      </div>
                      
                      {idx === 0 && (
                        <div className="space-y-6 max-w-md">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-on-surface-variant">Overall Progress</span>
                              <span className="text-sm font-bold text-secondary">{overallProgress}% Complete</span>
                            </div>
                            <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-secondary to-secondary-fixed-dim rounded-full transition-all duration-1000" 
                                style={{ width: `${overallProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectSubject(subject.name, 'lessons'); }}
                        className="p-2 bg-surface-container-low rounded-lg text-[10px] font-black uppercase text-center hover:bg-surface-container transition-colors"
                      >
                        Lessons
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectSubject(subject.name, 'worksheets'); }}
                        className="p-2 bg-surface-container-low rounded-lg text-[10px] font-black uppercase text-center hover:bg-surface-container transition-colors"
                      >
                        Worksheets
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectSubject(subject.name, 'activities'); }}
                        className="p-2 bg-surface-container-low rounded-lg text-[10px] font-black uppercase text-center hover:bg-surface-container transition-colors"
                      >
                        Activities
                      </button>
                      {(() => {
                        const availableToday = isSubjectDrillAvailable(subject.name);
                        return (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onStartDrills(subject.name); }}
                            className={cn(
                              "p-2 rounded-lg text-[10px] font-black uppercase text-center transition-colors flex items-center justify-center gap-1",
                              availableToday 
                                ? "bg-primary/10 text-primary hover:bg-primary hover:text-white" 
                                : "bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-500/30"
                            )}
                            title={availableToday ? 'Start Drills' : 'Biology & Etymology Drills run Mon, Wed, Fri, Sat, Sun (Locked Tue & Thu)'}
                          >
                            {!availableToday && <span className="material-symbols-outlined text-xs">lock</span>}
                            Drills
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </section>

            <div className="mt-16 flex justify-center pb-8">
              <button 
                onClick={() => onSelectSubject(SUBJECTS[0].name)}
                className="group flex items-center gap-4 px-12 py-6 bg-gradient-to-b from-primary to-primary-dim text-white rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="font-headline text-2xl font-black">Continue Learning</span>
                <span className="material-symbols-outlined text-3xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>

            {/* Weekly Timetable Section (Displayed Below) */}
            <section className="mt-16 mb-16 pt-10 border-t-2 border-slate-200/80">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Class Schedule & Timetable</span>
                  <h2 className="text-3xl font-black text-on-surface flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-primary text-3xl">calendar_month</span>
                    Weekly Timetable & Lesson Schedule
                  </h2>
                </div>
              </div>
              <WeeklyTimetable onStartDrills={onStartDrills} grade={user.grade} />
            </section>

            {/* Student Profile & Academic Record Section (Displayed Below) */}
            <section className="mb-16 pt-10 border-t-2 border-slate-200/80">
              <ProfileView user={user} history={filteredHistory} onChangeGrade={handleChangeGrade} />
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden">
      <AnimatePresence>
        {showSuperBadge && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 w-full max-w-2xl rounded-[4rem] shadow-[0_0_80px_rgba(245,158,11,0.5)] p-16 text-center text-white border-[12px] border-white relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl text-amber-500">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              </div>
              <h2 className="text-6xl font-black mb-6 mt-4">SUPER BADGE</h2>
              <p className="text-2xl font-bold mb-10 opacity-90 leading-tight">Well done for finishing all your courses! <br /> You are a Grade 10 Master.</p>
              <div className="space-y-4">
                <button 
                  onClick={() => { setShowSuperBadge(false); setActiveTab('awards'); }}
                  className="w-full py-5 bg-white text-orange-600 rounded-3xl font-black text-2xl shadow-2xl active:scale-95 transition-all hover:bg-orange-50"
                >
                  View Graduation Program
                </button>
                <button 
                  onClick={() => setShowSuperBadge(false)}
                  className="text-white/60 font-bold hover:text-white transition-colors"
                >
                  Close Achievement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showExamIntro && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 text-center space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -z-0" />
              <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-3 text-primary">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_turned_in</span>
              </div>
              <h3 className="text-3xl font-headline font-black text-on-surface">Unlocked: Greater Exams</h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                Welcome to the Grade {user.grade} journey! Once you complete all your lessons, you'll unlock the <strong>Greater Exams</strong>. 
                <br /><br />
                These are comprehensive final tests that demonstrate your mastery of the entire curriculum. Pass these to graduate to the next grade!
              </p>
              <button 
                onClick={() => setShowExamIntro(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-headline font-black text-lg shadow-xl active:scale-95 transition-all"
              >
                Let's Get Started!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-6">
          <Logo size="sm" />
          <div className="h-6 w-px bg-surface-container-high hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-2 border-primary/20">
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="font-headline font-black text-on-surface hidden sm:block">Grade {user.grade}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          <UpgradeButton user={user} variant="pill" />
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
                    reportError("Student reported a technical issue. Our support team has been notified.", "technical");
                    setShowSettings(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-on-surface hover:bg-surface-container flex items-center gap-2 border-b border-surface-container"
                >
                  <span className="material-symbols-outlined text-sm text-primary">report</span>
                  Report Problem
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
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-end px-4 pb-4 bg-white/80 backdrop-blur-xl rounded-t-[3rem] z-50 shadow-lg">
        <NavButton 
          icon="home" 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <NavButton 
          icon="search" 
          label="AI Search" 
          active={activeTab === 'search'} 
          onClick={() => setActiveTab('search')} 
        />
        <NavButton 
          icon="menu_book" 
          label="Library" 
          active={activeTab === 'library'} 
          onClick={() => setActiveTab('library')} 
        />
        <NavButton 
          icon="rocket_launch" 
          label="Projects" 
          active={activeTab === 'projects'} 
          onClick={() => setActiveTab('projects')} 
        />
        <NavButton 
          icon="leaderboard" 
          label="Progress" 
          active={activeTab === 'progress'} 
          onClick={() => setActiveTab('progress')} 
        />
        <NavButton 
          icon="emoji_events" 
          label="Badges & Ranks" 
          active={activeTab === 'awards'} 
          onClick={() => setActiveTab('awards')} 
        />
        <NavButton 
          icon="auto_stories" 
          label="Bible" 
          active={activeTab === 'bible'} 
          onClick={() => setActiveTab('bible')} 
        />
        <NavButton 
          icon={isAllGradesFinished ? "school" : "lock"} 
          label={isAllGradesFinished ? "WAEC/JAMB" : "WAEC/JAMB"} 
          active={activeTab === 'waec-jamb'} 
          onClick={() => setActiveTab('waec-jamb')} 
          locked={!isAllGradesFinished}
        />
        <NavButton 
          icon="event_note" 
          label="Timetable" 
          active={activeTab === 'timetable'} 
          onClick={() => setActiveTab('timetable')} 
        />
        <NavButton 
          icon="person" 
          label="Profile" 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
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
                  Close & Start Learning!
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ icon, label, active, onClick, locked }: { icon: string, label: string, active: boolean, onClick: () => void, locked?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300 relative",
        active 
          ? "bg-primary text-white rounded-full p-3 mb-2 transform -translate-y-2 shadow-lg" 
          : "text-on-surface/50 p-2 hover:text-primary active:scale-90"
      )}
    >
      <div className="relative flex items-center justify-center">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "" }}>{icon}</span>
        {locked && !active && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
        )}
      </div>
      <span className="font-body text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function LibraryView() {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const books = [
    { 
      title: "The Whispering Forest", 
      author: "Anne Smith", 
      cover: "https://picsum.photos/seed/forest/200/300", 
      type: "Novel",
      pages: [
        "Once upon a time, in a forest where the trees whispered secrets to the wind, lived a small squirrel named Pip. Pip wasn't like other squirrels; he could see the natural wonder that flowed through the roots of the ancient oaks...",
        "Chapter 1: The Whispering Oak\n\nPip sat on a mossy branch, his tail twitching with excitement. Today was the day of the Great Nut Hunt, but Pip had other plans. He had heard rumors of a hidden grove where the nuts tasted like starlight...",
        "As Pip ventured deeper into the woods, the light began to change. The leaves above turned from emerald green to a shimmering silver. He felt a tingle in his paws as he approached the legendary Crystal Stream.",
        "Suddenly, a soft glow appeared behind a cluster of ferns. Pip held his breath. Could it be? The Guardian of the Forest was said to appear only to those with a pure heart and a curious spirit.",
        "The Guardian, a majestic stag with antlers made of solid moonlight, stepped into the clearing. 'Greetings, Pip,' he said, his voice like the rustle of autumn leaves. 'You have come seeking the Starlight Nuts.'",
        "Pip nodded eagerly. 'Yes, your Majesty. The forest elders say they can cure any illness and bring wisdom to the one who finds them.' The stag lowered his head. 'They are not easily won, little one.'",
        "Chapter 2: The Trial of Shadow\n\nTo reach the grove, Pip had to cross the Valley of Shadows, where the sun never reached and the wind howled like a hungry wolf. It was a place of illusions and tests of character.",
        "As Pip entered the valley, the shadows lengthened and twisted into strange shapes. He heard voices whispering his name, promising him all the nuts he could ever want if he just turned back.",
        "But Pip remembered his mission. His grandmother was ill, and only the Starlight Nuts could save her. He pressed on, his tiny paws steady against the cold, dark earth.",
        "A giant owl with eyes like burning coals blocked his path. 'Why do you seek the light in this valley of darkness?' the owl hooted. 'Because the light is needed more where it is absent,' Pip replied bravely.",
        "The owl stepped aside, revealing a path leading up a steep mountain. 'Wisdom is yours, Pip. Now, go find your light.' Pip started the climb, his heart full of hope.",
        "At the summit, he found a grove of trees with silver bark and leaves that glowed with a soft, ethereal light. Hanging from the branches were the Starlight Nuts, shimmering like tiny constellations.",
        "Pip carefully gathered a handful of the nuts and hurried back home. As he fed them to his grandmother, her eyes brightened and the strength returned to her limbs. The forest was safe, and Pip had become a hero."
      ]
    },
    { 
      title: "Space Explorers", 
      author: "Sam Jones", 
      cover: "https://picsum.photos/seed/space/200/300", 
      type: "Science Fiction",
      pages: [
        "The year was 3042. Captain Nova stood on the bridge of the Starseeker, watching the swirling nebula of Orion through the reinforced glass. 'Status report,' she commanded, her voice steady despite the flickering lights...",
        "Chapter 1: Beyond the Rim\n\n'Engines at 40%, Captain,' replied Jax, the ship's navigator. 'We're picking up a strange signal from the third moon of Xylos. It doesn't match any known frequency.'",
        "Nova leaned forward. 'Can we isolate the source?' Jax's fingers flew across the holographic interface. 'It's coming from inside an abandoned research facility. A facility that hasn't been active for over a century.'",
        "The Starseeker hummed as it entered the moon's orbit. Below, the surface was a jagged landscape of frozen methane and obsidian rock. Nova knew that whatever was down there, it would change everything.",
        "Chapter 2: The Ghost Protocol\n\nNova and Jax donned their pressure suits and descended into the moon's thin atmosphere. The research facility rose out of the ice like a giant, metal skeleton, its corridors silent and dark.",
        "As they entered the main lab, they found a single computer terminal still humming with power. On the screen was a message: 'Project Singularity initialized. Warning: Dimensional rift detected.'",
        "Jax checked the readings. 'Captain, according to this, the facility didn't just study space; they were trying to fold it. But something went wrong. They opened a door they couldn't close.'",
        "Suddenly, the room was filled with a blinding white light. A portal began to form in the center of the lab, its edges crackling with blue energy. From the other side, they could see a nebula unlike any they had ever seen.",
        "A voice drifted through the portal, ancient and wise. 'You have found the key to the multi-verse. But use it wisely, for every door you open has a cost.' Nova looked at Jax, her eyes wide with wonder and fear.",
        "Chapter 3: The Choice\n\n'We have to close it, Captain,' Jax said, his voice trembling. 'If we leave it open, there's no telling what might come through.' But Nova hesitated. 'Think of the possibilities, Jax. We could explore new galaxies in an instant.'",
        "As they debated, a shadow began to emerge from the portal. It was a mechanical being, its body made of shifting gears and glowing liquid. It didn't look hostile, but its presence felt massive.",
        "The being held out a hand. In its palm was a small, crystal sphere. 'The seed of stars,' it said. 'Close the door, and take this. It will guide your civilization through the stars, the slow way.'",
        "Nova realized the being was right. The quick way was dangerous. She stepped back and activated the facility's emergency shutdown. The portal collapsed with a deafening roar, leaving only the crystal sphere behind.",
        "Back on the Starseeker, Nova held the sphere. They hadn't found a shortcut, but they had found hope. The galaxy was vast, and they would explore every corner of it, one jump at a time."
      ]
    },
    { 
      title: "The Golden Lion", 
      author: "Tunde Akara", 
      cover: "https://picsum.photos/seed/lion/200/300", 
      type: "Adventure",
      pages: [
        "In the heart of the great savanna, there are legends of a lion whose coat is made of pure gold. It is said that he only appears during the first rains of the year to guide the lost back home.",
        "Chapter 1: The Lost Cub\n\nLulu, a young girl from the village of Zara, had gone out to find herbs for her mother. But the wind had changed, and the dust had covered her tracks. She was lost in the vast grass sea.",
        "As the sun began to set, the first clouds of the rainy season gathered on the horizon. Lulu sought shelter under a giant baobab tree, her heart heavy with worry. 'Please, Great Lion, find me,' she whispered.",
        "A low rumble filled the air, and suddenly, the rain began to fall. Through the silver curtain of water, Lulu saw a flash of brilliant gold. A massive lion stepped into the light, his fur shimmering like the sun.",
        "Chapter 2: The Golden Guide\n\nThe lion didn't growl. He simply looked at Lulu with eyes that held the wisdom of a thousand years. He turned and started walking, pausing only to ensure Lulu was following.",
        "They walked through the night, the lion's golden glow lighting the path. They passed through herds of sleeping elephants and past the dens of hyenas, who bowed their heads as the king passed by.",
        "Lulu felt a strange peace as she walked beside him. She realized that the Golden Lion wasn't just a physical creature; he was the spirit of the land itself, protecting its children.",
        "Chapter 3: The Return\n\nAs the dawn broke, Lulu saw the smoke from the village fires. The Golden Lion stopped at the edge of the clearing. He let out a soft roar that sounded like a song of joy.",
        "Lulu turned to thank him, but the lion was gone. In his place was a beautiful golden flower, its petals still fresh with rain. She picked it up and ran to her family, who were overjoyed to see her.",
        "She told them of her adventure, but many didn't believe her. But Lulu knew. Every year, when the first rains fall, she looks out at the savanna and remembers the golden friend who brought her home."
      ]
    },
    { 
      title: "The Clockwork Island", 
      author: "Oliver Gear", 
      cover: "https://picsum.photos/seed/clock/200/300", 
      type: "Novel",
      pages: [
        "Miles out at sea, hidden by a constant mist, lies the island of Aethelgard. It is not a place of earth and stone, but of brass, steam, and millions of tiny, ticking gears.",
        "Chapter 1: The Navigator's Secret\n\nElias, a young clockmaker from the mainland, had inherited an old, rusty key from his grandfather. 'Find the mist,' his grandfather had said. 'The key knows the way.'",
        "Elias spent months building a small steam boat, the 'Second Hand.' He sailed into the Great Mist, guided only by the key, which vibrated whenever he was on the right course.",
        "Suddenly, the mist cleared, and there it was. Aethelgard. A giant city that seemed to float on the waves, its towers connected by silver pipes and rotating platforms.",
        "Chapter 2: The City of Steam\n\nAs Elias docked his boat, he was met by a group of mechanical guardians. They didn't speak, but they examined his key and led him into the heart of the city.",
        "The streets were filled with people and automatons working together to keep the island moving. Elias learned that Aethelgard was a giant machine designed to clean the ocean's waters.",
        "But the machine was breaking down. The gears were grinding, and the steam levels were dropping. The Grand Artificer, an ancient woman named Clara, told Elias that only his key could fix the core.",
        "Chapter 3: The Great Core\n\nElias descended to the very bottom of the island, where a massive brass heart beat with a rhythmic thud. He found the keyhole and turned his grandfather's key.",
        "The heart surged with life. The gears aligned perfectly, and the mist around the island turned into a brilliant rainbow. The water around Aethelgard began to shimmer with purity once more.",
        "Elias stayed on Aethelgard, becoming a master artificer. He realized that the island wasn't just a machine; it was a promise that technology and nature could live in perfect harmony."
      ]
    },
    { 
      title: "The Sky Painter", 
      author: "Luna Star", 
      cover: "https://picsum.photos/seed/sky/200/300", 
      type: "Fantasy",
      pages: [
        "Every night, while the world sleeps, a young boy named Arlo climbs the tallest peak in the world with a brush made of clouds and a palette of stars.",
        "Chapter 1: The First Stroke\n\nArlo's job was to paint the sunrise. It was a heavy responsibility, for if he slept through his shift, the world would remain in darkness forever.",
        "One morning, Arlo found that his palette was empty. The stars had decided to hide behind a thick blanket of gray clouds, and he had no color for the horizon.",
        "He had to find a way to make the world see the day. He remembered a story about the Sun Bird, who lived in the core of the earth and held the essence of all light.",
        "Chapter 2: Journey Downward\n\nArlo descended into the deep caves, his only light a single glowworm he had found in a jar. He passed through crystalline halls and across rivers of liquid heat.",
        "Finally, he found her. The Sun Bird, her feathers a brilliant orange and red. 'Why do you disturb my rest, Sky Painter?' she asked, her voice like a crackling fire.",
        "'The palette is empty, your Majesty,' Arlo said. 'I cannot paint the sunrise without your help.' The Sun Bird smiled and plucked a single feather from her wing.",
        "'Take this, and use its flame as your brush,' she said. 'But remember, a sunrise is not just about color; it is about hope. You must feel the hope to paint it.'",
        "Chapter 3: The Perfect Dawn\n\nArlo raced back to the peak. He held the feather and thought of all the children waiting for the light. He felt a surge of warmth in his chest and began to paint.",
        "The sky exploded into colors the world had never seen. Pinks, purples, and brilliant golds swirled together, creating a masterpiece that stretched across the entire world.",
        "The world woke up and gasped at the beauty. Arlo smiled, his duty done. He knew that as long as there was hope, the sky would always be beautiful."
      ]
    },
    { 
      title: "Animal Savanna", 
      author: "Zoe Zoologist", 
      cover: "https://picsum.photos/seed/animal/200/300", 
      type: "Educational",
      pages: [
        "The African savanna is one of the most diverse ecosystems on our planet. It is a vast grassland dotted with acacia trees, home to thousands of different species.",
        "Section 1: The Big Five\n\nWhen people think of the savanna, they usually think of the 'Big Five': the Lion, the Elephant, the Buffalo, the Leopard, and the Rhinoceros.",
        "Lions are the only social cats, living in groups called prides. They work together to hunt and protect their territory. The males are known for their impressive manes.",
        "Elephants are the largest land animals. They are highly intelligent and have complex social structures. They use their trunks for breathing, smelling, touching, and grasping.",
        "Section 4: The Buffalo and Beyond\n\nCape Buffaloes are formidable creatures, traveling in large herds for protection. Leopards are the most elusive of the big cats, often dragging their prey up into trees.",
        "Rhinoceroses, unfortunately, are highly endangered. Both the black and white rhinos are actually gray, but they differ in the shape of their lips, which is adapted for their diet.",
        "Section 2: The Great Migration\n\nEvery year, over a million wildebeest and hundreds of thousands of zebras and gazelles travel in a massive circle across the Serengeti and Masai Mara.",
        "This is one of the greatest natural spectacles on Earth. They follow the rains in search of fresh grass, crossing dangerous rivers filled with crocodiles.",
        "This journey is vital for the health of the savanna. Their grazing keeps the grass short, and their movement helps spread seeds across the plains.",
        "Section 3: Hidden Wonders\n\nThe savanna is also home to many smaller, lesser-known animals. The aardvark, with its long snout, is a master of digging for termites.",
        "The honeyguide bird has a unique relationship with humans and honey badgers. It leads them to beehives and waits for them to break it open so it can edit the wax.",
        "Every animal, from the smallest insect to the largest elephant, plays a crucial role in maintaining the balance of this incredible landscape."
      ]
    },
    { 
      title: "Journey to the Moon", 
      author: "Jules Verne", 
      cover: "https://picsum.photos/seed/moon/200/300", 
      type: "Classic Sci-Fi",
      pages: [
        "In the 19th century, a group of scientists and adventurers gathered in Baltimore to achieve the impossible: to build a cannon large enough to fire a projectile to the moon.",
        "Chapter 1: The Gun Club\n\nImpey Barbicane, the president of the Gun Club, announced the mission. 'We will not just look at the moon; we will touch it!' the members cheered.",
        "They spent years calculating the trajectory, the charges, and the design of the hollow shell that would carry three men into the unknown.",
        "Finally, the day arrived. A massive pit had been dug in Florida, and the 'Columbiad' stood ready. Thousands of people gathered to witness the historic event.",
        "Chapter 2: The Launch\n\nBarbicane, Nicholl, and the Frenchman Ardan stepped into the projectile. The hatch was sealed, and the countdown began. 10... 9... 8...",
        "The explosion was heard for hundreds of miles. The projectile shot into the sky like a falling star, leaving a trail of smoke and dust behind it.",
        "Inside, the three men felt a sudden weightlessness. They were free of the Earth's gravity! They looked out the window and saw their home getting smaller and smaller.",
        "Chapter 3: The Lunar Orbit\n\nAs they approached the moon, they saw the craters and the vast plains of the lunar surface. It was a world of stark beauty, silent and cold.",
        "They realized they weren't going to land, but were going to orbit the moon. They saw the dark side, which no human had ever seen before.",
        "Even though they didn't land, their journey proved that humans could cross the void of space. They returned to Earth as heroes, inspiring generations of future explorers."
      ]
    },
    { 
      title: "History of Wonders", 
      author: "Dr. Discovery", 
      cover: "https://picsum.photos/seed/history/200/300", 
      type: "Educational",
      pages: [
        "History is not just a list of dates and names; it is a grand tapestry of human stories. From the building of the Great Pyramids to the first steps on the moon, every moment has shaped the world we live in today...",
        "Section 1: Ancient Civilizations\n\nThousands of years ago, along the banks of the Nile River, the Egyptians built a civilization that would last for millennia. They developed writing, mathematics, and architectural techniques that still baffle us today.",
        "The Romans followed, creating an empire that stretched across three continents. They built roads, aqueducts, and laws that form the foundation of modern society. Their influence can still be felt in our language and government.",
        "In the East, the Great Wall of China was constructed to protect the Middle Kingdom. It remains one of the most impressive engineering feats in human history, a testament to the power of collective effort.",
        "Section 2: The Age of Exploration\n\nIn the 15th and 16th centuries, brave navigators set sail across unknown oceans, seeking new trade routes and discovering new continents and cultures.",
        "This era changed the map of the world forever. It led to the exchange of ideas, technologies, and foods, but also brought conflict and hardship for many indigenous populations.",
        "The scientific revolution followed, as thinkers like Galileo and Newton challenged old beliefs and sought to understand the laws of the universe through observation and reason.",
        "Section 3: The Modern Era\n\nThe industrial revolution transformed how we live and work, leading to the rise of modern cities and the technology we rely on today.",
        "From the invention of the steam engine to the birth of the internet, the pace of change has accelerated. We now live in a globalized world, more connected than ever before.",
        "As we look back at the past, we learn from both our triumphs and our mistakes, using the wisdom of history to build a better future for everyone."
      ]
    },
    { 
      title: "The Brave Little Robot", 
      author: "Tech Kid", 
      cover: "https://picsum.photos/seed/robot/200/300", 
      type: "Picture Book",
      pages: [
        "Bleep was a small robot with a big heart. While the other robots were busy building giant towers, Bleep liked to fix broken toys for the children in the city. One day, the city's power grid failed, and only Bleep knew how to save the day...",
        "Page 1: A Busy Morning\n\nBleep's gears whirred as he polished his shiny metallic chest. He had a long list of toys to fix today, starting with a wooden train that had lost a wheel.",
        "Suddenly, the lights flickered and went out. All across the city, the giant construction robots stopped moving. The children were scared of the dark. Bleep knew he had to do something.",
        "He remembered the old backup generator in the basement of the Toy Shop. It was small, just like him. With a determined beep, he set off through the dark streets, his internal light guiding the way.",
        "Page 2: The Dark Stroll\n\nThe city felt very different in the dark. Bleep's little light didn't reach very far, and the towers he usually helped build looked like giant monsters.",
        "He passed a park where he saw a group of children crying. He stopped and did a little dance, his gears clicking a happy tune. They stopped crying and started to smile.",
        "'Don't worry,' Bleep beeped. 'I'm going to find the light!' He continued on his mission, his tiny wheels spinning as fast as they could.",
        "He reached the Toy Shop and found the generator. It was covered in dust and cobwebs. He began to work, his small hands moving with precision.",
        "Page 3: Let There Be Light!\n\nIt took hours, but finally, Bleep heard a low hum. The generator was running! He connected the wires and pulled the lever.",
        "The lights in the Toy Shop flickered to life. Then, the streetlights outside began to glow. One by one, the lights across the city returned.",
        "The people cheered, and even the giant construction robots resumed their work. Bleep returned home, tired but happy. He was small, but he had proven that even a little robot can do big things."
      ]
    },
    { 
      title: "Math is Fun!", 
      author: "Number Ninja", 
      cover: "https://picsum.photos/seed/math/200/300", 
      type: "Educational",
      pages: [
        "Mathematics is the language of the universe. From the patterns on a butterfly's wings to the orbits of the planets, math is everywhere! Let's explore the power of numbers together...",
        "Lesson 1: The Power of Patterns\n\nPatterns are sequences that repeat according to a rule. Can you find the pattern in these numbers: 2, 4, 6, 8? That's right, we're adding 2 each time!",
        "Now, let's look at shapes. A triangle has 3 sides, a square has 4, and a pentagon has 5. Do you see the pattern? Each time we add a side, the shape changes its name!",
        "Lesson 2: The Power of Addition\n\nAddition is putting things together. Imagine you have 3 bright red apples and 2 delicious green ones. How many do you have in total? 3 + 2 = 5!",
        "What if you have 10 marbles and your friend gives you 5 more? Now you have 15! Adding makes our collections grow bigger and bigger.",
        "Lesson 3: The Secret of Subtraction\n\nSubtraction is taking things away. If you have 10 cookies and you eat 3 of them, how many are left? 10 - 3 = 7. Subtraction helps us find what remains.",
        "Imagine a tree with 8 birds. If 2 of them fly away, how many stay on the branch? 8 - 2 = 6. We use subtraction to solve problems like this every day.",
        "Lesson 4: Multiplication Mania\n\nMultiplication is just fast addition! If you have 3 groups of 2 cookies, you could add them: 2 + 2 + 2 = 6. Or you could multiply: 3 x 2 = 6!",
        "It's like skipping over numbers. 5 x 2 is just skip-counting by five, two times: 5, 10! Multiplication is a powerful tool for big collections.",
        "Math isn't just about answers; it's about exploring and understanding our world. Keep practicing, and you'll become a Number Ninja too!"
      ]
    },
    { 
      title: "The Good Shepherd", 
      author: "Faith Writer", 
      cover: "https://picsum.photos/seed/shepherd/200/300", 
      type: "Short Story",
      pages: [
        "In a valley surrounded by high mountains, there lived a shepherd who knew every one of his sheep by name. He cared for them day and night, ensuring they always had fresh water and green grass to eat.",
        "One evening, as the sun began to set, the shepherd noticed that one little lamb was missing. Without hesitation, he left the ninety-nine safe in the fold and went out into the darkness to find the lost one.",
        "He climbed over rocks and through thorny bushes, calling out the lamb's name. Finally, he heard a faint bleat. The little lamb was stuck in a thicket, scared and tired.",
        "The shepherd gently lifted the lamb onto his shoulders and carried it all the way home. He was so happy to have found his lost sheep, reminding us that we are never truly alone.",
        "As the days passed, the little lamb stayed close to the shepherd. It had learned that the world outside the fold could be dangerous, but with the shepherd, it was always safe.",
        "The shepherd taught the other sheep to look out for the little lamb, too. They became a close-knit group, always helping each other when the path got steep or the grass was thin.",
        "One day, a great storm came to the valley. The wind roared and the rain fell in torrents. The shepherd quickly led the sheep to a hidden cave he had prepared.",
        "Inside, they were dry and warm. The shepherd sat by the entrance, his crook in hand, watching over them until the storm passed. He was their protector, their friend, and their guide."
      ]
    },
    { 
      title: "Ocean Adventures", 
      author: "Captain Blue", 
      cover: "https://picsum.photos/seed/ocean/200/300", 
      type: "Adventure",
      pages: [
        "The deep blue ocean is home to creatures more mysterious than any found on land. Join Captain Blue as he dives into the abyss to discover the secrets of the lost city of Atlantis...",
        "Chapter 1: Into the Deep\n\nThe submarine creaked as it descended further into the darkness. Outside, bioluminescent jellyfish pulsed with a soft, eerie light. 'Keep your eyes peeled,' the Captain whispered.",
        "At 5,000 meters, the sonar picked up something massive. It wasn't a whale or a shipwreck. It was a series of perfectly symmetrical structures, glowing with a faint blue energy.",
        "Captain Blue adjusted his goggles. 'We've found it,' he said, his voice filled with awe. 'The entrance to the Sunken Citadel. Prepare the diving suits; we're going in.'",
        "Step 4: The Citadel Gates\n\nThe gates of the citadel were made of a strange, translucent material that looked like frozen water. As they touched them, the gates vanished, revealing a city unlike any on Earth.",
        "There were buildings made of coral and pearl, and streets lit by glowing anemones. But there was no one there. The city was silent, a ghost of a civilization that had once ruled the waves.",
        "Captain Blue led the team into the central palace. In the middle of the throne room was a massive crystal globe, spinning silently. It showed a map of the entire ocean, with points of light indicating other hidden cities.",
        "He realized that Atlantis wasn't just a myth; it was part of a global network of advanced underwater civilizations. And they had just found the central hub.",
        "Suddenly, a series of lights began to flicker on the globe. A message began to form in a language they couldn't read, but the meaning was clear: the cities were waking up. Atlantis was back."
      ]
    },
    { 
      title: "The Good News", 
      author: "Evangelist Mark", 
      cover: "https://picsum.photos/seed/gospel/200/300", 
      type: "Theology",
      pages: [
        "The story of the Gospel is the greatest story ever told. It is a story of love, sacrifice, and redemption. It begins with a Creator who loves His creation so much that He gave everything to bring them back to Him.",
        "Chapter 1: The Beginning\n\nIn the beginning, the world was perfect. But humans chose to go their own way, creating a gap between themselves and God. But God had a plan to bridge that gap from the very first moment.",
        "He sent messengers and prophets to tell the people of the coming Savior. He showed them His laws and His heart, preparing them for the day when the light would truly enter the world.",
        "Finally, in a small town called Bethlehem, a child was born. He was the Fulfillment of all the promises, the Hope of the world wrapped in swaddling clothes.",
        "Chapter 2: The Life and Love\n\nJesus grew in wisdom and stature, teaching people about the Kingdom of God. He healed the sick, comforted the brokenhearted, and showed us what true love look like in action.",
        "He didn't just speak words; He lived them. He ate with the outcasts, challenged the self-righteous, and poured His life into His disciples. His life was a masterpiece of grace and truth.",
        "But His mission wasn't just to be a good teacher. He came to be the Bridge. He came to take the weight of our mistakes upon Himself and offer us a new start.",
        "Chapter 3: The Ultimate Gift\n\nOn a hill outside Jerusalem, Jesus gave His life for us. It seemed like the end of the story, but it was actually the beginning of a whole new chapter. Three days later, He rose again, proving that love is stronger than death.",
        "Now, He offers this gift of life to everyone. All we have to do is accept it and follow Him. It is the 'Good News' that has changed millions of lives and continues to shine in the darkness today."
      ]
    },
    { 
      title: "The Crystal Key", 
      author: "Sarah Stone", 
      cover: "https://picsum.photos/seed/crystal/200/300", 
      type: "Fantasy Novel",
      pages: [
        "In a land where the mountains hummed and the rivers sang, there was a legend of the Crystal Key. It was said to open a door to the Realm of Dreams, where anything was possible.",
        "Chapter 1: The Discovery\n\nKael, a young wanderer, found a strange, glowing shard in a dried-up riverbed. It wasn't just any stone; it vibrated with a frequency that made his heart skip a beat.",
        "He took it to the village elder, who gasped. 'The first piece of the Crystal Key,' she whispered. 'You must find the rest, Kael, or the Shadow King will use it to turn our dreams into nightmares.'",
        "Kael set out with nothing but a map and his courage. His first stop was the Whispering Woods, where the trees were said to know the location of the second piece.",
        "Chapter 2: The Whispering Woods\n\nThe woods were thick and dark, but Kael followed the vibration of his shard. He heard voices calling to him, trying to lure him off the path, but he didn't listen.",
        "He found a giant willow tree at the center of the woods. Its branches were covered in silver leaves that chimed like bells. Tucked inside a knot in the trunk was the second shard.",
        "As he touched it, the two shards fused together, glowing brighter than before. Suddenly, a group of Shadow Wraiths emerged from the trees, their eyes like cold blue stars.",
        "Kael used the light of the shards to drive them back. He realized the Key wasn't just a tool; it was a weapon against the darkness. He had to hurry; the third piece was in the Sky Citadel.",
        "Chapter 3: The Sky Citadel\n\nTo reach the citadel, Kael had to climb a staircase made of solid clouds. Every step felt like he was walking on air. At the top, he found a palace of gold and glass.",
        "In the throne room sat the Queen of the Sky. She was fair and kind, but her eyes were filled with sadness. 'The third piece is in the heart of my palace,' she said. 'But it is guarded by a dragon of light.'",
        "Kael approached the dragon, who let out a breath of pure radiance. Instead of fighting, Kael showed the dragon his shards. The dragon bowed its head and allowed him to take the final piece.",
        "The Key was complete. It hummed with a power that made the whole citadel shake. Kael turned it in the air, and a door of pure light opened. He had saved the realm and found his true purpose."
      ]
    },
    { 
      title: "Midnight Express", 
      author: "R.J. Swift", 
      cover: "https://picsum.photos/seed/train/200/300", 
      type: "Mystery Novel",
      pages: [
        "The Midnight Express wasn't just a train; it was a legend. It only appeared on the moonless nights, traveling through tunnels that didn't exist on any map.",
        "Chapter 1: The Ticket\n\nLeo found a silver ticket in his mailbox one Tuesday morning. It had no return address, just the words: 'Platform 9 3/4, Midnight. Don't be late.'",
        "Curiosity got the better of him. He went to the station and found a train that looked like it was made of shadows and moonlight. He stepped inside and found himself in a world of luxury and mystery.",
        "The passengers were all wearing masks, and the conductor was a tall man with a clock for a face. 'Welcome to the Express,' the conductor said. 'Your destination is your destiny.'",
        "Chapter 2: The Missing Diamond\n\nAs the train raced through the night, a scream echoed through the dining car. The Countess's famous Star Diamond had been stolen from her neck while the lights flickered.",
        "Leo, being a fan of detective stories, decided to investigate. He interviewed the passengers: a nervous professor, a silent opera singer, and a man with a suspicious-looking briefcase.",
        "He found a trail of stardust leading to the professor's cabin. But when he searched it, he only found a pile of old maps. The professor claimed he was just looking for a lost city.",
        "Chapter 3: The Reveal\n\nLeo noticed that the opera singer's mask was slightly ajar. Behind it, he saw a glimmer of white light. He realized she wasn't a singer at all; she was a master thief named The Phantom Lily.",
        "He confronted her on the observation deck. She smiled and held up the diamond. 'You're clever, Leo. But can you catch a phantom?' She leaped off the train, her cape turning into a set of wings.",
        "Leo didn't catch her, but he found the diamond on his seat the next morning with a note: 'Until next time, Detective.' The train pulled into his station just as the sun began to rise."
      ]
    },
    { 
      title: "The Old Manor", 
      author: "M.R. Ghost", 
      cover: "https://picsum.photos/seed/manor/200/300", 
      type: "Gothic Novel",
      pages: [
        "Blackwood Manor stood at the edge of the cliff, its windows looking out at the crashing waves like empty eyes. People said it was haunted, but Clara didn't believe in ghosts.",
        "Chapter 1: The Inheritance\n\nClara had inherited the manor from her eccentric uncle, who had spent his life studying the occult. She expected a dusty old house, but she found a place filled with secrets and whispers.",
        "The first night, she heard the sound of a piano playing in the basement. When she went down to check, the room was empty, but the keys were still vibrating as if someone had just played a note.",
        "She found a diary hidden behind a loose brick in the fireplace. It belonged to her uncle, and it detailed his experiments with a mirror that could see into the past.",
        "Chapter 2: The Mirror's Gaze\n\nClara found the mirror in the attic. It was covered in a black cloth. When she pulled it back, she didn't see her reflection; she saw a woman in a Victorian dress standing in the same room.",
        "The woman pointed to a painting on the wall. Clara looked at the painting and realized it was a map of the manor, but it showed a room that shouldn't exist—a room behind the library.",
        "She went back to the library and found a hidden lever behind a row of books. A section of the wall slid back, revealing a laboratory filled with strange machines and jars of glowing liquid.",
        "Chapter 3: The Final Secret\n\nIn the center of the lab was a machine her uncle had been building—a device to travel through the mirror. She realized her uncle wasn't dead; he was trapped on the other side.",
        "Clara activated the machine and stepped into the mirror. She found herself in a world that was a mirror image of her own, but everything was more vibrant and full of wonder.",
        "She found her uncle, and together they managed to return to the real world. She decided to keep the manor and continue her uncle's work, knowing that the world was much bigger than she had ever imagined."
      ]
    },
    { 
      title: "Noah's Ark", 
      author: "Bible Stories", 
      cover: "https://picsum.photos/seed/ark/200/300", 
      type: "Christian Story",
      pages: [
        "Long ago, the world was filled with noise and confusion. But there was one man, Noah, who walked closely with God and lived with a kind heart.",
        "One day, God spoke to Noah. 'Build a great Ark,' He said, 'for a great rain is coming to wash the world clean.' Noah listened and began to work, even when others didn't understand.",
        "He built the Ark out of gopher wood, exactly as God had instructed. It was as long as three football fields and higher than a three-story house!",
        "Then came the animals. Two by two, they marched into the Ark. Lions and lambs, elephants and ants, birds and butterflies. Noah and his family were finally safe inside as the first raindrop fell.",
        "The rain fell for forty days and forty nights. The Ark floated high above the mountains, a safe haven on the rising waters. Noah waited patiently, trusting in God's promise.",
        "Finally, the rain stopped. Noah sent out a dove, and it returned with an olive branch. The waters were receding! The Ark came to rest on the mountains of Ararat.",
        "Noah and his family stepped out onto the fresh, clean earth. God placed a beautiful rainbow in the sky as a sign of His covenant. 'I will never flood the earth again,' He promised.",
        "The animals spread across the land, and Noah built an altar to give thanks. It was a new beginning, a story of faith and the faithfulness of God that we still remember today."
      ]
    },
    { 
      title: "David and Goliath", 
      author: "Bible Stories", 
      cover: "https://picsum.photos/seed/giant/200/300", 
      type: "Christian Story",
      pages: [
        "In the hills of Bethlehem, a young shepherd boy named David looked after his father's sheep. While he was small, his faith in God was bigger than any mountain.",
        "One day, a great giant named Goliath came to challenge the army of Israel. He was over nine feet tall and wore heavy brass armor. 'Choose a man to fight me!' he roared, but everyone was afraid.",
        "David heard the giant's boast. 'Who is this that defies the living God?' he asked. Even though he was just a boy, he volunteered to fight the giant.",
        "The King tried to give David armor, but it was too heavy. David chose five smooth stones from a brook instead. With only his sling and his trust in God, he stepped forward.",
        "Goliath laughed. 'Am I a dog that you come at me with sticks?' But David replied, 'You come with a sword and spear, but I come in the name of the Lord.'",
        "As Goliath moved to attack, David ran toward him. He placed a stone in his sling and whirled it with all his might. The stone flew through the air and struck the giant exactly in the forehead.",
        "The great giant fell to the ground! David had won, not with strength or armor, but with the power of God. The whole army cheered at the miracle they had witnessed.",
        "David grew up to be a great king, but he always remembered the day in the valley. He taught us that when we face our own giants, we are never alone if we have faith."
      ]
    },
    { 
      title: "The Good Samaritan", 
      author: "Parables of Jesus", 
      cover: "https://picsum.photos/seed/samaritan/200/300", 
      type: "Christian Story",
      pages: [
        "A man was traveling down the dangerous road from Jerusalem to Jericho. Suddenly, he was attacked by bandits who took everything he had and left him hurt by the side of the road.",
        "A priest came by and saw the man, but he crossed to the other side of the road and kept walking. Then a Levite, a temple helper, came by. He also looked at the man and walked away.",
        "Then came a Samaritan. At that time, Samaritans and the people of Jerusalem were not friends. But when the Samaritan saw the hurt man, his heart was filled with compassion.",
        "He knelt down, cleaned the man's wounds, and bandaged them. He lifted the man onto his own donkey and took him to a nearby inn to recover.",
        "The Samaritan stayed with him all night. The next morning, he gave the innkeeper money. 'Take care of him,' he said. 'If you spend more, I will pay you when I return.'",
        "Jesus told this story to teach us who our neighbor is. It's not just the person next door; it's anyone who needs our help, regardless of who they are or where they come from.",
        "This parable reminds us that love is an action. It's about showing mercy and kindness even when it's not easy. It's the heart of the Gospel in a simple, beautiful story."
      ]
    },
    { 
      title: "Daniel in the Lions' Den", 
      author: "Bible Stories", 
      cover: "https://picsum.photos/seed/dan lions/200/300", 
      type: "Christian Story",
      pages: [
        "Daniel was a wise man who served the King of Babylon. Because he was so honest and capable, the King wanted to put him in charge of the whole kingdom.",
        "Other officials were jealous. They knew Daniel prayed to God three times a day, so they tricked the King into making a law that no one could pray to anyone but the King for thirty days.",
        "Daniel knew about the law, but he didn't stop. He went to his window and prayed to God just as he always did. The jealous men saw him and told the King.",
        "The King was sad because he liked Daniel, but he had to follow the law. Daniel was thrown into a den of hungry lions. The King spent the night worrying and couldn't sleep.",
        "The next morning, the King ran to the den. 'Daniel, was your God able to save you?' he cried. To his joy, a voice came from the darkness: 'My God sent His angel to shut the lions' mouths!'",
        "Daniel was pulled out of the den, and not a single scratch was on him. He had trusted in God, and God had protected him in the most dangerous place.",
        "The King saw the power of God and made a new decree: 'Everyone should respect the God of Daniel, for He is the living God who performs wonders in heaven and on earth!'",
        "This story teaches us to be brave in our faith, even when it's difficult. Like Daniel, we can trust that God is always with us, even in the middle of the 'lions' dens' of life."
      ]
    }
  ];

  const paginate = (newDirection: number) => {
    if (currentPage + newDirection >= 0 && currentPage + newDirection < selectedBook.pages.length) {
      setDirection(newDirection);
      setCurrentPage(currentPage + newDirection);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  if (selectedBook) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-surface-container min-h-[600px] flex flex-col"
      >
        <div className="p-6 bg-surface-container-low border-b border-surface-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setSelectedBook(null); setCurrentPage(0); }}
              className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h3 className="font-headline font-bold text-on-surface">{selectedBook.title}</h3>
              <p className="text-xs text-on-surface-variant font-medium">by {selectedBook.author}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined">text_fields</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined">bookmark</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative bg-[#fdfbf7] overflow-hidden perspective-1000">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                rotateY: { duration: 0.4 }
              }}
              className="absolute inset-0 p-8 md:p-12 flex flex-col items-center"
            >
              <div className="max-w-2xl w-full space-y-8">
                {currentPage === 0 && (
                  <div className="flex justify-center mb-12">
                    <img src={selectedBook.cover} alt={selectedBook.title} className="w-48 h-72 object-cover rounded-xl shadow-2xl" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="prose prose-slate max-w-none">
                  <p className="text-xl leading-relaxed text-on-surface font-serif whitespace-pre-wrap">
                    {selectedBook.pages[currentPage]}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 bg-surface-container-low border-t border-surface-container flex justify-center gap-8 z-10">
          <button 
            onClick={() => paginate(-1)}
            disabled={currentPage === 0}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Previous
          </button>
          <span className="text-sm font-bold text-on-surface-variant">
            Page {currentPage + 1} of {selectedBook.pages.length}
          </span>
          <button 
            onClick={() => paginate(1)}
            disabled={currentPage === selectedBook.pages.length - 1}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-extrabold text-on-surface">School Library</h1>
        <p className="text-on-surface-variant font-medium mt-2">Pick a book and start your reading journey!</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedBook(book)}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-surface-container group cursor-pointer"
          >
            <div className="aspect-[2/3] relative overflow-hidden">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {book.type}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-on-surface truncate">{book.title}</h3>
              <p className="text-xs text-on-surface-variant font-medium">{book.author}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedBook(book); }}
                className="w-full mt-4 py-2 bg-surface-container-low text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Read Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProgressView({ user, history }: { user: User, history: { topicId: string, score: number, date: number }[] }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-extrabold text-on-surface">My Progress</h1>
        <p className="text-on-surface-variant font-medium mt-2">Check out how much you've learned!</p>
      </header>

      <DailyStudyGoal user={user} history={history} />

      {history.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center shadow-sm">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">history_edu</span>
          <h2 className="text-xl font-bold text-on-surface">No lessons completed yet</h2>
          <p className="text-on-surface-variant mt-2">Start a lesson to see your progress here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.slice().reverse().map((h, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between border border-surface-container">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{h.topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Completed on {new Date(h.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-2xl font-black",
                  h.score >= 80 ? "text-secondary" : "text-primary"
                )}>
                  {h.score}%
                </div>
                <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest">Score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AwardsView({ history, setActiveTab }: { history: { topicId: string, score: number, date: number }[], setActiveTab: (tab: DashboardTab) => void }) {
  const averageScore = history.length > 0 
    ? (history.reduce((a, b) => a + b.score, 0) / history.length) 
    : 0;

  const awards = [
    { 
      id: 'first', 
      title: "First Step", 
      desc: "Completed your first lesson", 
      details: history.length > 0 ? `Earned on ${new Date(history[0].date).toLocaleDateString()} with ${history[0].topicId.split('-')[0]}` : "Complete your first lesson to earn this!",
      icon: "auto_stories", 
      condition: history.length >= 1 
    },
    { 
      id: 'perfect', 
      title: "Perfect Score", 
      desc: "Got 100% on a quiz", 
      details: history.some(h => h.score === 100) 
        ? `First achieved on ${new Date(history.find(h => h.score === 100)!.date).toLocaleDateString()} in ${history.find(h => h.score === 100)!.topicId.split('-')[0]}`
        : "Get 100% on any quiz to unlock this badge!",
      icon: "workspace_premium", 
      condition: history.some(h => h.score === 100) 
    },
    { 
      id: 'scholar', 
      title: "Rising Scholar", 
      desc: "Completed 5 lessons", 
      details: history.length >= 5 
        ? `Milestone reached on ${new Date(history[4].date).toLocaleDateString()}` 
        : `${history.length}/5 lessons complete`,
      icon: "school", 
      condition: history.length >= 5 
    },
    { 
      id: 'master', 
      title: "Subject Master", 
      desc: "Completed 10 lessons", 
      details: history.length >= 10 
        ? `Milestone reached on ${new Date(history[9].date).toLocaleDateString()}` 
        : `${history.length}/10 lessons complete`,
      icon: "military_tech", 
      condition: history.length >= 10 
    },
    { 
      id: 'consistent', 
      title: "Consistent Learner", 
      desc: "Average score above 90%", 
      details: averageScore >= 90 
        ? `Current Average: ${Math.round(averageScore)}% - Excellence achieved!` 
        : `Current Average: ${Math.round(averageScore)}% - Keep improving!`,
      icon: "stars", 
      condition: history.length > 0 && averageScore >= 90 
    },
  ];

  const recentlyEarned = awards.filter(a => a.condition).slice(-3);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-5xl font-black text-on-surface tracking-tight">Hall of Fame</h1>
          <p className="text-xl text-on-surface-variant font-medium mt-2">Celebrating your hard work and academic success!</p>
        </div>
        <div className="bg-primary/10 text-primary px-6 py-3 rounded-2xl border border-primary/20 flex items-center gap-3">
          <span className="material-symbols-outlined font-black">emoji_events</span>
          <span className="text-sm font-black uppercase tracking-widest">{awards.filter(a => a.condition).length} Awards Unlocked</span>
        </div>
      </header>

      {recentlyEarned.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-black text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">trending_up</span>
            Recent Achievements
          </h3>
          <div className="bg-surface-container-low rounded-[2.5rem] p-8 border border-surface-container flex flex-col md:flex-row gap-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-bl-[10rem] -z-0" />
            {recentlyEarned.map((award, i) => (
              <div key={i} className="flex-1 flex gap-6 items-center p-4 bg-white rounded-2xl shadow-sm border border-surface-container-high relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{award.icon}</span>
                </div>
                <div>
                  <h4 className="font-black text-on-surface leading-tight">{award.title}</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">{award.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h3 className="text-2xl font-black text-on-surface flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">military_tech</span>
          All Badges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {awards.map((award) => (
            <motion.div 
              key={award.id}
              whileHover={award.condition ? { y: -8, scale: 1.02 } : {}}
              className={cn(
                "p-10 rounded-[3rem] border-4 transition-all flex flex-col items-center text-center relative overflow-hidden group",
                award.condition 
                  ? "bg-white border-secondary shadow-xl" 
                  : "bg-surface-container-low border-surface-container-high opacity-60"
              )}
            >
              {award.condition && (
                <div className="absolute top-4 right-4 animate-bounce">
                  <span className="material-symbols-outlined text-secondary">stars</span>
                </div>
              )}
              
              <div className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-inner transition-transform duration-500",
                award.condition 
                  ? "bg-gradient-to-br from-secondary-container to-secondary/20 text-secondary group-hover:rotate-12 group-hover:scale-110" 
                  : "bg-surface-container-high text-outline-variant"
              )}>
                <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: award.condition ? "'FILL' 1" : "" }}>
                  {award.icon}
                </span>
              </div>
              
              <h3 className={cn("text-2xl font-black mb-2 tracking-tight", award.condition ? "text-on-surface" : "text-outline-variant")}>
                {award.title}
              </h3>
              
              <p className={cn("text-sm font-bold mb-4 px-4", award.condition ? "text-on-surface-variant" : "text-outline-variant")}>
                {award.desc}
              </p>
              
              <div className={cn(
                "w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest",
                award.condition 
                  ? "bg-secondary/10 text-secondary border border-secondary/20" 
                  : "bg-surface-container-high text-outline-variant"
              )}>
                {award.details}
              </div>

              {!award.condition && (
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-outline-variant uppercase tracking-[0.2em]">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Goal In-Progress
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <div className="bg-surface-container-low p-10 rounded-[4rem] text-center border-4 border-dashed border-primary/10">
        <h4 className="text-2xl font-black text-on-surface mb-2">Want more awards?</h4>
        <p className="text-on-surface-variant font-medium mb-8 max-w-lg mx-auto leading-relaxed">
          The more you learn, the more you earn! Keep practicing your subjects, completing worksheets, and taking quizzes to fill your Hall of Fame.
        </p>
        <button 
          onClick={() => setActiveTab('library')}
          className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Explore Library
        </button>
      </div>
    </div>
  );
}

function ProfileView({ user, history, onChangeGrade }: { user: User, history: { topicId: string, score: number, date: number }[], onChangeGrade?: (g: number) => void }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-extrabold text-on-surface">My Profile</h1>
        <p className="text-on-surface-variant font-medium mt-2">Manage your academic identity and settings!</p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-surface-container">
        <div className="h-48 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <motion.div animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        <div className="px-8 pb-12">
          <div className="relative -mt-20 mb-10 flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-3 shadow-2xl border-4 border-white overflow-hidden relative group">
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-[1.8rem]" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
            </div>
            <div className="flex-1 pb-2">
               <h2 className="text-5xl font-black text-on-surface tracking-tight">{user.name}</h2>
               <div className="mt-2 flex items-center gap-3">
                 <span className="bg-primary-container text-primary px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest">Scholar ID: AS-{user.id}</span>
                 <span className="bg-secondary-container text-secondary px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest">Grade {user.grade} Master</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-7 space-y-10">
              <section className="space-y-4">
                <h3 className="text-2xl font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_square</span>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container">
                    <label className="text-[10px] font-black text-outline-variant uppercase tracking-widest block mb-2">Display Name</label>
                    <p className="text-xl font-bold text-on-surface">{user.name}</p>
                  </div>
                  <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container group">
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-[10px] font-black text-outline-variant uppercase tracking-widest block">Current Grade</label>
                       <span className="text-[9px] font-black p-1 bg-secondary text-white rounded uppercase tracking-tighter">Suggest New</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-primary">Grade {user.grade}</p>
                      <div className="flex gap-1">
                         {[user.grade! - 1, user.grade!, user.grade! + 1].filter(g => g > 0 && g <= 10).map(g => (
                           <button 
                            key={g}
                            onClick={() => onChangeGrade?.(g)}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                              g === user.grade ? "bg-primary text-white" : "bg-white text-on-surface-variant hover:bg-primary/10"
                            )}
                           >
                             {g}
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-black text-on-surface flex items-center gap-2">
                   <span className="material-symbols-outlined text-secondary">verified_user</span>
                   Permanent Grade Suggestion
                </h3>
                <div className="bg-surface-container p-8 rounded-[2.5rem] border-2 border-dashed border-secondary/20">
                  <p className="text-sm font-medium text-on-surface-variant mb-6 leading-relaxed">
                    Choose your grade level below. This will update your school record and synchronize your subject worksheets and exercises immediately.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <button 
                        key={g} 
                        onClick={() => onChangeGrade?.(g)}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all hover:scale-110",
                          g === user.grade 
                            ? "bg-secondary text-white shadow-xl ring-4 ring-secondary/20" 
                            : "bg-white text-on-surface-variant shadow-sm hover:shadow-md"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-secondary/10 text-center">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] animate-pulse">Record Synchronization Active</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="md:col-span-5 space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[300px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div>
                  <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                    System Info
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block">Login Method</label>
                      <p className="text-lg font-bold">{user.loginMethod || 'Local Account'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block">Environment ID</label>
                      <p className="text-sm font-mono opacity-80">PROD-AIS-2026-AFR</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between">
                   <div>
                     <span className="text-[10px] font-black opacity-30 uppercase block">Status</span>
                     <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">Online</span>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] font-black opacity-30 uppercase block">App Ver</span>
                     <span className="text-xs font-bold opacity-60">2.4.5-Stable</span>
                   </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-[2rem] p-8 space-y-6 border border-surface-container">
                <h3 className="font-headline text-xl font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Learning Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                    <p className="text-3xl font-black text-secondary">{history.length}</p>
                    <p className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Tasks Done</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                    <p className="text-3xl font-black text-primary">
                      {history.length > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0}%
                    </p>
                    <p className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Avg Mastery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
