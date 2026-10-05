import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, Subject, WorksheetProgress, User } from '../types';
import AITeacher from './AITeacher';
import QuizView from './QuizView';
import { cn } from '../lib/utils';
import UpgradeButton from './UpgradeButton';
import { saveActivityLog } from '../utils/gamification';

import WorksheetView from './WorksheetView';
import ActivityView from './ActivityView';

export default function LessonView({ 
  topic, 
  subject,
  grade,
  user,
  history,
  worksheetHistory,
  onCompleteQuiz,
  onSaveWorksheet,
  onBack,
  onFinish,
  initialTab = 'lesson',
  initialMode = 'matching'
}: { 
  topic: Topic; 
  subject: Subject;
  grade: number;
  user: User;
  history: { topicId: string, score: number, date: number }[];
  worksheetHistory: WorksheetProgress[];
  onCompleteQuiz: (score: number) => void;
  onSaveWorksheet: (progress: WorksheetProgress) => void;
  onBack: () => void;
  onFinish: () => void;
  initialTab?: 'lesson' | 'worksheet' | 'activity';
  initialMode?: 'matching' | 'video' | 'quiz' | 'creative';
}) {
  const isSpelling = subject === 'Spelling';
  const [activeTab, setActiveTab] = useState<'lesson' | 'worksheet' | 'activity'>(initialTab);
  const [interactiveMode, setInteractiveMode] = useState<'matching' | 'video' | 'quiz' | 'creative'>(initialMode);
  const [lessonView, setLessonView] = useState<'teach' | 'quiz'>('teach');
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [redoWorksheet, setRedoWorksheet] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [resetCounter, setResetCounter] = useState(0);
  const [earnedPointsNotification, setEarnedPointsNotification] = useState<{ points: number; message: string } | null>(null);

  useEffect(() => {
    if (earnedPointsNotification) {
      const timer = setTimeout(() => {
        setEarnedPointsNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [earnedPointsNotification]);

  const handleTeachComplete = () => {
    setLessonView('quiz');
  };

  const handleActivityComplete = (activityScore: number, activityType: string) => {
    const pointsEarned = activityScore === 100 ? 60 : 50;
    saveActivityLog({
      id: `${topic.id}-${activityType}`,
      userId: user.id,
      topicId: topic.id,
      subject,
      grade,
      activityType: activityType as any,
      score: activityScore,
      pointsEarned,
      timestamp: Date.now()
    });
    setEarnedPointsNotification({
      points: pointsEarned,
      message: `Interactive ${activityType.toUpperCase()} Lab Completed! +${pointsEarned} XP added to your standing!`
    });
  };

  const handleQuizComplete = (finalScore: number) => {
    setScore(finalScore);
    
    // Spelling specific rule: 10/20 (50%) or below means redo worksheet
    if (isSpelling) {
      if (finalScore <= 50) {
        setIsFailed(true);
        setRedoWorksheet(true);
        setIsComplete(false);
      } else {
        setIsFailed(false);
        setRedoWorksheet(false);
        setIsComplete(true);
        const earnedXP = 100 + (finalScore === 100 ? 50 : finalScore >= 90 ? 30 : finalScore >= 80 ? 15 : 0);
        setEarnedPointsNotification({
          points: earnedXP,
          message: finalScore === 100 
            ? 'Flawless 100% Score! Centurion Bonus Awarded! (+150 XP)' 
            : `Lesson Quiz Passed! +${earnedXP} XP added to your total!`
        });
        onCompleteQuiz(finalScore);
      }
    } else {
      // Standard rule: 60% or below requires redoing EVERYTHING: Teach, Worksheet, and Activity.
      if (finalScore <= 60) {
        setIsFailed(true);
        setRedoWorksheet(false);
        setIsComplete(false);
        // Force reset states and clear progress immediately upon failure detection
        onSaveWorksheet({
          topicId: topic.id,
          answers: {},
          reflection: '',
          isCompleted: false
        });
        setResetCounter(prev => prev + 1);
      } else {
        setIsFailed(false);
        setRedoWorksheet(false);
        setIsComplete(true);
        const earnedXP = 100 + (finalScore === 100 ? 50 : finalScore >= 90 ? 30 : finalScore >= 80 ? 15 : 0);
        setEarnedPointsNotification({
          points: earnedXP,
          message: finalScore === 100 
            ? 'Flawless 100% Score! Centurion Bonus Awarded! (+150 XP)' 
            : `Lesson Quiz Passed! +${earnedXP} XP added to your total!`
        });
        onCompleteQuiz(finalScore);
      }
    }
  };

  const handleRetry = () => {
    setIsFailed(false);
    setIsComplete(false);
    setRedoWorksheet(false);
    setScore(null);
    setLessonView('teach');
    setActiveTab('lesson');
  };

  const topicHistory = history.filter(h => h.topicId === topic.id);

  const handleTabChange = (tab: 'lesson' | 'worksheet' | 'activity') => {
    setActiveTab(tab);
    // If switching away from lesson tab, reset quiz view if it was active
    if (tab !== 'lesson') {
      setLessonView('teach');
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32 relative">
      {/* Floating Points & Achievement Notification Toast */}
      <AnimatePresence>
        {earnedPointsNotification && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 text-slate-950 px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-white/80 flex items-center gap-3 max-w-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              ⭐
            </div>
            <div>
              <span className="font-headline font-black text-sm uppercase tracking-wider block">
                +{earnedPointsNotification.points} XP Awarded!
              </span>
              <p className="text-xs font-bold text-slate-900/90 leading-tight">
                {earnedPointsNotification.message}
              </p>
            </div>
            <button
              onClick={() => setEarnedPointsNotification(null)}
              className="p-1 rounded-full hover:bg-black/10 text-slate-900 ml-1 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm flex items-center justify-between px-6 h-16">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container active:scale-95 transition-all mr-4">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-headline font-bold text-lg text-primary truncate max-w-xs sm:max-w-md">{topic.title}</h1>
        </div>
        <UpgradeButton user={user} variant="pill" />
      </nav>

      <main className="pt-24 px-6 max-w-5xl mx-auto space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-tertiary-container text-on-tertiary-container px-4 py-1 rounded-full text-sm font-bold font-headline uppercase tracking-wider">
              {activeTab === 'lesson' && lessonView === 'quiz' ? 'Quiz' : activeTab}
            </span>
            <span className="text-on-surface-variant font-bold text-sm">Grade {grade} • {subject}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            {activeTab === 'lesson' && lessonView === 'quiz' ? `Quiz: ${topic.title}` : topic.title}
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
            {activeTab === 'lesson' && lessonView === 'quiz' 
              ? `Let's see what you've learned! Answer these ${isSpelling ? '20' : '10'} questions to complete the lesson.` 
              : activeTab === 'worksheet' 
                ? isSpelling 
                  ? "Practice your spelling! Write 3 words and a sentence on each of the 20 pages."
                  : "Practice your skills with these exercises."
                : activeTab === 'activity'
                  ? "Engage with interactive concept matching, curated educational videos, and rapid knowledge checks!"
                  : topic.description}
          </p>

          {/* Quick-Access Interactive Elements Bar for High Engagement */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-1">
              Interactive Lab:
            </span>
            <button
              onClick={() => {
                setInteractiveMode('matching');
                setActiveTab('activity');
              }}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">extension</span>
              <span>Matching Activity</span>
            </button>
            <button
              onClick={() => {
                setInteractiveMode('video');
                setActiveTab('activity');
              }}
              className="px-3 py-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">smart_display</span>
              <span>Educational Video</span>
            </button>
            <button
              onClick={() => {
                setInteractiveMode('quiz');
                setActiveTab('activity');
              }}
              className="px-3 py-1.5 bg-tertiary/10 hover:bg-tertiary text-tertiary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              <span>Rapid Short Quiz</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            {activeTab === 'lesson' ? (
              lessonView === 'teach' ? (
                <AITeacher 
                  topic={topic} 
                  subject={subject} 
                  grade={grade} 
                  user={user}
                  onComplete={handleTeachComplete} 
                  resetKey={resetCounter}
                />
              ) : (
                <QuizView 
                  topic={topic} 
                  subject={subject} 
                  grade={grade} 
                  user={user}
                  onComplete={handleQuizComplete}
                  onBack={() => setLessonView('teach')}
                />
              )
            ) : activeTab === 'worksheet' ? (
              <WorksheetView 
                topic={topic} 
                savedProgress={worksheetHistory.find(p => p.topicId === topic.id)}
                onSave={onSaveWorksheet}
                subject={subject}
                grade={grade}
                user={user}
              />
            ) : (
              <ActivityView 
                topic={topic} 
                subject={subject}
                grade={grade}
                user={user}
                resetKey={resetCounter} 
                initialMode={interactiveMode}
                onComplete={handleActivityComplete}
              />
            )}
          </section>

          <aside className="lg:col-span-4 space-y-6">
            {/* Interactive Lab Suite Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container space-y-3">
              <h4 className="font-headline font-bold text-on-surface text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">science</span>
                Interactive Elements
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Every lesson features interactive learning components to deepen understanding:
              </p>
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setInteractiveMode('matching');
                    setActiveTab('activity');
                  }}
                  className="w-full p-2.5 bg-surface-container-low hover:bg-primary/10 hover:text-primary rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">extension</span>
                    <span>Drag & Drop Matching</span>
                  </span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
                <button
                  onClick={() => {
                    setInteractiveMode('video');
                    setActiveTab('activity');
                  }}
                  className="w-full p-2.5 bg-surface-container-low hover:bg-secondary/10 hover:text-secondary rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm">smart_display</span>
                    <span>Embedded Educational Video</span>
                  </span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
                <button
                  onClick={() => {
                    setInteractiveMode('quiz');
                    setActiveTab('activity');
                  }}
                  className="w-full p-2.5 bg-surface-container-low hover:bg-tertiary/10 hover:text-tertiary rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-sm">bolt</span>
                    <span>Rapid Short Quiz</span>
                  </span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-white/50">
              <h4 className="font-headline font-bold text-on-surface mb-4">Lesson Goals</h4>
              <ul className="space-y-4">
                {[
                  'Understand core concepts',
                  'Interactive Q&A',
                  'Final Knowledge Check'
                ].map((goal, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            {topicHistory.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-white/50">
                <h4 className="font-headline font-bold text-on-surface mb-4">Your History</h4>
                <div className="space-y-3">
                  {topicHistory.map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-outline-variant uppercase">Attempt {topicHistory.length - i}</span>
                        <span className="text-xs font-medium text-on-surface-variant">
                          {new Date(h.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={cn(
                        "font-headline font-black text-lg",
                        h.score >= 80 ? "text-secondary" : "text-primary"
                      )}>
                        {h.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isComplete && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary-container rounded-2xl p-8 shadow-lg border-2 border-secondary text-center space-y-4"
              >
                <span className="material-symbols-outlined text-6xl text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <div>
                  <h4 className="text-2xl font-headline font-black text-on-secondary-container">Lesson Complete!</h4>
                  <p className="text-on-secondary-container/80 font-black text-4xl my-2">{score}%</p>
                </div>

                <div className="p-3 bg-amber-100 rounded-xl border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-amber-600 text-base">stars</span>
                  <span>+{100 + ((score === 100) ? 50 : (score || 0) >= 90 ? 30 : (score || 0) >= 80 ? 15 : 0)} XP Added to Leaderboard!</span>
                </div>

                <button 
                  onClick={onFinish}
                  className="w-full bg-secondary text-white py-3 rounded-xl font-headline font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Finish Lesson
                </button>
              </motion.div>
            )}

            {isFailed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-100 rounded-2xl p-8 shadow-lg border-2 border-red-500 text-center"
              >
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <h4 className="text-2xl font-headline font-black text-red-900">Score Too Low</h4>
                <p className="text-red-700 font-bold text-4xl my-4">{score}%</p>
                <p className="text-red-800 text-sm font-medium mb-6">
                  {redoWorksheet 
                    ? "Spelling sessions require more than 10 correct answers (50%). You must redo the worksheet and activities."
                    : "You must get more than 60% to pass. You need to redo the lesson, worksheets, and activities."}
                </p>
                <button 
                  onClick={handleRetry}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-headline font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  {redoWorksheet ? "Redo Worksheet & Activities" : "Retry Everything"}
                </button>
              </motion.div>
            )}
          </aside>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-8 pb-4 pt-2 bg-white/80 backdrop-blur-md shadow-lg rounded-t-[3rem] z-50">
        <button 
          onClick={() => handleTabChange('lesson')}
          className={cn(
            "flex flex-col items-center justify-center p-3 h-14 w-14 rounded-full transition-all duration-200",
            activeTab === 'lesson' ? "bg-primary text-white -mt-4 shadow-lg" : "text-on-surface opacity-70"
          )}
        >
          <span className="material-symbols-outlined">school</span>
          <span className="font-body font-semibold text-[10px]">AI Teach</span>
        </button>
        <button 
          onClick={() => handleTabChange('worksheet')}
          className={cn(
            "flex flex-col items-center justify-center p-3 h-14 w-14 rounded-full transition-all duration-200",
            activeTab === 'worksheet' ? "bg-primary text-white -mt-4 shadow-lg" : "text-on-surface opacity-70"
          )}
        >
          <span className="material-symbols-outlined">edit_note</span>
          <span className="font-body font-semibold text-[10px]">Worksheet</span>
        </button>
        <button 
          onClick={() => handleTabChange('activity')}
          className={cn(
            "flex flex-col items-center justify-center p-3 h-14 w-14 rounded-full transition-all duration-200",
            activeTab === 'activity' ? "bg-primary text-white -mt-4 shadow-lg" : "text-on-surface opacity-70"
          )}
        >
          <span className="material-symbols-outlined">extension</span>
          <span className="font-body font-semibold text-[10px]">Interactive</span>
        </button>
      </nav>
    </div>
  );
}
