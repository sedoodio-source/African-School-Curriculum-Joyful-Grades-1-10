/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import StudentDashboard from './components/StudentDashboard';
import SubjectDetail from './components/SubjectDetail';
import LessonView from './components/LessonView';
import ParentDashboard from './components/ParentDashboard';
import GradeFinalExam from './components/GradeFinalExam';
import DrillSession from './components/DrillSession';
import PaymentPlans from './components/PaymentPlans';
import WaecJambCenter from './components/WaecJambCenter';
import WaecJambLocked from './components/WaecJambLocked';
import { checkAllGradesFinished } from './utils/gradeCompletion';
import InternetNotificationCenter from './components/InternetNotificationCenter';
import OmniAIAssistant from './components/OmniAIAssistant';
import { ErrorProvider } from './components/ErrorManager';
import { User, View, Subject, Topic, WorksheetProgress } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('asc_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<View>(() => {
    const savedUser = localStorage.getItem('asc_user_profile');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.role === 'student' ? 'dashboard' : 'parent';
    }
    return 'landing';
  });
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectInitialSection, setSubjectInitialSection] = useState<'lessons' | 'worksheets' | 'activities' | 'matrix'>('lessons');
  const [drillSubject, setDrillSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [lessonInitialTab, setLessonInitialTab] = useState<'lesson' | 'worksheet' | 'activity'>('lesson');
  const [lessonInitialMode, setLessonInitialMode] = useState<'matching' | 'video' | 'quiz' | 'creative'>('matching');
  const [loginRole, setLoginRole] = useState<'student' | 'parent'>('student');
  const [history, setHistory] = useState<{ topicId: string, score: number, date: number }[]>([]);
  const [worksheetHistory, setWorksheetHistory] = useState<WorksheetProgress[]>([]);

  // Dynamically load history and worksheet progress whenever user changes
  useEffect(() => {
    if (user) {
      const childHistoryKey = `anne_sam_history_${user.id}`;
      const childWorksheetKey = `asc_worksheet_history_${user.id}`;

      const savedHistory = localStorage.getItem(childHistoryKey);
      const savedWS = localStorage.getItem(childWorksheetKey);

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        // Fallback or migrate from global key if available
        const globalSaved = localStorage.getItem('anne_sam_history');
        setHistory(globalSaved ? JSON.parse(globalSaved) : []);
      }

      if (savedWS) {
        setWorksheetHistory(JSON.parse(savedWS));
      } else {
        // Fallback or migrate from global key if available
        const globalSavedWS = localStorage.getItem('asc_worksheet_history');
        setWorksheetHistory(globalSavedWS ? JSON.parse(globalSavedWS) : []);
      }
    } else {
      setHistory([]);
      setWorksheetHistory([]);
    }
  }, [user?.id]);

  // Save history and worksheet progress when they change
  useEffect(() => {
    if (user && history.length > 0) {
      localStorage.setItem(`anne_sam_history_${user.id}`, JSON.stringify(history));
      // Mirror to legacy key for backwards compatibility
      localStorage.setItem('anne_sam_history', JSON.stringify(history));
    }
  }, [history, user?.id]);

  useEffect(() => {
    if (user && worksheetHistory.length > 0) {
      localStorage.setItem(`asc_worksheet_history_${user.id}`, JSON.stringify(worksheetHistory));
      // Mirror to legacy key for backwards compatibility
      localStorage.setItem('asc_worksheet_history', JSON.stringify(worksheetHistory));
    }
  }, [worksheetHistory, user?.id]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('asc_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('asc_user_profile');
    }
  }, [user]);

  const handleSelectRole = (role: 'student' | 'parent') => {
    setLoginRole(role);
    setView('login');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView(loggedInUser.role === 'student' ? 'dashboard' : 'parent');
  };

  const handleStartFinalExam = () => {
    setView('final-exam');
  };

  const handleStartDrills = (subject?: Subject) => {
    setDrillSubject(subject || null);
    setView('drills');
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  const handleSelectSubject = (
    subject: Subject, 
    section: 'lessons' | 'worksheets' | 'activities' | 'matrix' = 'lessons'
  ) => {
    setSelectedSubject(subject);
    setSubjectInitialSection(section);
    setView('subject');
  };

  const handleSelectTopic = (
    topic: Topic, 
    targetTab: 'lesson' | 'worksheet' | 'activity' = 'lesson',
    targetMode: 'matching' | 'video' | 'quiz' | 'creative' = 'matching'
  ) => {
    setSelectedTopic(topic);
    setLessonInitialTab(targetTab);
    setLessonInitialMode(targetMode);
    setView('lesson');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedSubject(null);
    setSelectedTopic(null);
  };

  const handleBackToSubject = () => {
    setView('subject');
    setSelectedTopic(null);
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setSelectedSubject(null);
    setSelectedTopic(null);
  };

  const handleSaveWorksheet = (progress: WorksheetProgress) => {
    setWorksheetHistory(prev => {
      const filtered = prev.filter(p => p.topicId !== progress.topicId);
      return [...filtered, progress];
    });
  };

  const handleChangeGrade = (newGrade: number) => {
    if (user) {
      setUser({ ...user, grade: newGrade });
    }
  };

  return (
    <ErrorProvider>
      <InternetNotificationCenter />
      <div className="min-h-screen bg-background relative selection:bg-primary/20">
        {/* Global Decorative Background */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-tertiary-container rounded-full opacity-20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(#00618e 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingPage onSelectRole={handleSelectRole} onSelectView={setView} />
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <LoginScreen 
                onLogin={handleLogin} 
                onBack={handleBackToLanding}
                initialRole={loginRole}
              />
            </motion.div>
          )}

          {view === 'dashboard' && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StudentDashboard 
                user={user} 
                onSelectSubject={handleSelectSubject} 
                onLogout={handleLogout}
                onStartExam={handleStartFinalExam}
                onStartDrills={handleStartDrills}
                history={history}
                worksheetHistory={worksheetHistory}
                onChangeGrade={handleChangeGrade}
              />
            </motion.div>
          )}

          {view === 'drills' && user && (
            <motion.div
              key="drills"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DrillSession 
                user={user} 
                filterSubject={drillSubject || undefined}
                onBack={() => {
                  setDrillSubject(null);
                  handleBackToDashboard();
                }} 
                onComplete={(score, nextSubject) => {
                  setHistory(prev => [...prev, { topicId: `DRILLS-${drillSubject || 'ALL'}-${new Date().toDateString()}`, score, date: Date.now() }]);
                  if (nextSubject) {
                    setDrillSubject(nextSubject);
                    // Stay in 'drills' view but with new subject
                  } else {
                    setDrillSubject(null);
                    handleBackToDashboard();
                  }
                }} 
              />
            </motion.div>
          )}

          {view === 'subject' && selectedSubject && (
            <motion.div
              key="subject"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SubjectDetail 
                subject={selectedSubject} 
                onBack={handleBackToDashboard}
                onSelectTopic={handleSelectTopic}
                onStartDrills={handleStartDrills}
                history={history}
                initialSection={subjectInitialSection}
                initialGrade={user?.grade}
              />
            </motion.div>
          )}

          {view === 'lesson' && selectedTopic && selectedSubject && user && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <LessonView 
                topic={selectedTopic} 
                subject={selectedSubject}
                grade={user.grade || 1}
                user={user}
                history={history}
                worksheetHistory={worksheetHistory}
                initialTab={lessonInitialTab}
                initialMode={lessonInitialMode}
                onCompleteQuiz={(score) => {
                  if (score > 60) {
                    setHistory(prev => [...prev, { topicId: selectedTopic.id, score, date: Date.now() }]);
                  }
                  // If score <= 60, we don't save to history, which means the topic 
                  // won't show as completed in the UI, effectively forcing a redo.
                }}
                onSaveWorksheet={handleSaveWorksheet}
                onBack={handleBackToSubject} 
                onFinish={handleBackToDashboard}
              />
            </motion.div>
          )}

          {view === 'parent' && user && (
            <motion.div
              key="parent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ParentDashboard user={user} history={history} onLogout={handleLogout} onSelectView={setView} />
            </motion.div>
          )}

          {view === 'payment-plans' && (
            <motion.div
              key="payment-plans"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <PaymentPlans 
                onBack={() => {
                  setView(user && user.role === 'parent' ? 'parent' : 'landing');
                }} 
              />
            </motion.div>
          )}

          {view === 'final-exam' && user && (
            <motion.div
              key="final-exam"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
            >
              <GradeFinalExam 
                user={user} 
                onBack={handleBackToDashboard}
                onComplete={(score) => {
                  setHistory(prev => [...prev, { topicId: `FINAL-EXAM-G${user.grade}`, score, date: Date.now() }]);
                  if (user.grade === 10) {
                    localStorage.setItem(`all_grades_finished_${user.id}`, 'true');
                    localStorage.setItem('asc_all_grades_finished', 'true');
                  }
                  handleBackToDashboard();
                }}
              />
            </motion.div>
          )}

          {view === 'waec-jamb' && user && (
            <motion.div
              key="waec-jamb"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              <button
                onClick={handleBackToDashboard}
                className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Dashboard</span>
              </button>
              {checkAllGradesFinished(user, history).isAllGradesFinished ? (
                <WaecJambCenter user={user} history={history} onBack={handleBackToDashboard} />
              ) : (
                <WaecJambLocked 
                  user={user} 
                  history={history} 
                  onBack={handleBackToDashboard} 
                  onUnlocked={() => setView('waec-jamb')} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {user && <OmniAIAssistant user={user} />}
      </div>
    </ErrorProvider>
  );
}
