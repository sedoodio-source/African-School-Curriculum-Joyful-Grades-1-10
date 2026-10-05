import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { 
  WAEC_JAMB_SUBJECTS, 
  JAMB_COURSE_TRACKS, 
  WAEC_CHIEF_EXAMINER_TIPS, 
  AUTHENTIC_EXAM_QUESTIONS,
  ExamQuestion,
  WaecJambSubject,
  JambCourseTrack
} from '../data/waecJambData';
import { 
  GraduationCap, BookOpen, Clock, Award, CheckCircle2, 
  AlertCircle, Sparkles, Send, HelpCircle, ChevronRight, 
  ChevronLeft, RotateCcw, Target, Shield, Check, Flame,
  Flag, School, BarChart3, Filter, Zap, Lightbulb
} from 'lucide-react';
import { checkAllGradesFinished } from '../utils/gradeCompletion';
import WaecJambLocked from './WaecJambLocked';

interface WaecJambCenterProps {
  user: User;
  history?: any[];
  onBack?: () => void;
}

type MainMode = 'jamb_cbt' | 'waec_paper' | 'syllabus_tips' | 'ai_tutor' | 'scorecard';

export default function WaecJambCenter({ user, history = [], onBack }: WaecJambCenterProps) {
  const gradeStatus = checkAllGradesFinished(user, history);

  // WAEC and JAMB WILL NOT open until ALL grades are finished!
  if (!gradeStatus.isAllGradesFinished) {
    return <WaecJambLocked user={user} history={history} onBack={onBack} />;
  }

  const [activeMode, setActiveMode] = useState<MainMode>('jamb_cbt');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('mathematics');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  
  // JAMB CBT Simulator State
  const [selectedTrack, setSelectedTrack] = useState<string>('engineering-tech');
  const [cbtDurationMinutes, setCbtDurationMinutes] = useState<number>(15);
  const [isCbtActive, setIsCbtActive] = useState<boolean>(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(15 * 60);
  const [cbtQuestions, setCbtQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [cbtSubmitted, setCbtSubmitted] = useState<boolean>(false);
  const [cbtResultScore, setCbtResultScore] = useState<{ rawScore: number; maxScore: number; jambScaledScore: number }>({ rawScore: 0, maxScore: 0, jambScaledScore: 0 });

  // WAEC Paper 2 Theory State
  const [theoryUserAnswer, setTheoryUserAnswer] = useState<string>('');
  const [revealedTheoryGuides, setRevealedTheoryGuides] = useState<Record<string, boolean>>({});
  const [theoryAiFeedback, setTheoryAiFeedback] = useState<string | null>(null);
  const [isEvaluatingTheory, setIsEvaluatingTheory] = useState<boolean>(false);

  // Dynamic Generator State
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<ExamQuestion[]>([]);

  // AI Exam Master Chat
  const [tutorQuery, setTutorQuery] = useState<string>('');
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ id: string; sender: 'user' | 'tutor'; text: string; timestamp: number }>>(() => {
    try {
      const saved = localStorage.getItem(`asc_exam_tutor_chat_${user.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'intro-msg',
          sender: 'tutor',
          text: `**Welcome to the WAEC & JAMB Chief Examiner's Clinic, ${user.name}!** 🎓\n\nI am Miss Kelechi, your senior examination strategist. I am here to ensure you secure all **A1s in WASSCE** and score **300+ in your JAMB UTME**.\n\nYou can ask me for:\n- Step-by-step marking schemes for WAEC Paper 2 theory.\n- The 8-Key CBT keyboard strategy for lightning-fast JAMB navigation.\n- Summary writing rules without verbatim lifting.\n- Nigerian commercial math problems with Naira (₦).\n\n*What exam topic would you like to master today?*`,
          timestamp: Date.now()
        }
      ];
    } catch {
      return [];
    }
  });

  // Test History / Saved Scorecards
  const [examHistory, setExamHistory] = useState<Array<{
    id: string;
    examType: 'WAEC' | 'JAMB';
    subject: string;
    score: number;
    total: number;
    scaledScore?: number;
    date: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem(`asc_exam_history_${user.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'initial-jamb',
          examType: 'JAMB',
          subject: 'General Mathematics',
          score: 8,
          total: 10,
          scaledScore: 320,
          date: new Date().toLocaleDateString()
        }
      ];
    } catch {
      return [];
    }
  });

  // Save exam history
  useEffect(() => {
    try {
      localStorage.setItem(`asc_exam_history_${user.id}`, JSON.stringify(examHistory));
    } catch (e) {
      console.error(e);
    }
  }, [examHistory, user.id]);

  // Save tutor messages
  useEffect(() => {
    try {
      localStorage.setItem(`asc_exam_tutor_chat_${user.id}`, JSON.stringify(tutorMessages));
    } catch (e) {
      console.error(e);
    }
  }, [tutorMessages, user.id]);

  // Combined Questions Pool
  const allAvailableQuestions = [...AUTHENTIC_EXAM_QUESTIONS, ...dynamicQuestions];

  // Filtered by selected subject & year
  const filteredQuestions = allAvailableQuestions.filter(q => {
    const matchesSubject = selectedSubjectId === 'all' || q.subjectId === selectedSubjectId;
    const matchesYear = selectedYear === 'all' || q.year === selectedYear;
    return matchesSubject && matchesYear;
  });

  // CBT Timer
  useEffect(() => {
    let interval: any = null;
    if (isCbtActive && !cbtSubmitted && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmitCbt();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCbtActive, cbtSubmitted, timeRemainingSeconds]);

  // Authentic JAMB 8-Key Keyboard Navigation (A, B, C, D, N, P, S, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCbtActive || cbtSubmitted) return;
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      const currentQ = cbtQuestions[currentQuestionIndex];
      if (!currentQ || !currentQ.options) return;

      if (['A', 'B', 'C', 'D'].includes(key)) {
        const optionIndex = key.charCodeAt(0) - 65; // A->0, B->1, etc.
        if (currentQ.options[optionIndex]) {
          handleSelectOption(currentQ.id, currentQ.options[optionIndex]);
        }
      } else if (key === 'N') {
        // Next
        if (currentQuestionIndex < cbtQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      } else if (key === 'P') {
        // Previous
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
        }
      } else if (key === 'R') {
        // Flag for Review
        handleToggleFlag(currentQ.id);
      } else if (key === 'S') {
        // Submit
        if (confirm("Are you sure you want to SUBMIT your JAMB CBT exam now?")) {
          handleSubmitCbt();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCbtActive, cbtSubmitted, currentQuestionIndex, cbtQuestions]);

  const handleStartCbtSession = () => {
    let pool = allAvailableQuestions.filter(q => q.paperType === 'Paper 1 (Objective)');
    if (selectedSubjectId !== 'all') {
      pool = pool.filter(q => q.subjectId === selectedSubjectId);
    }
    // If not enough questions, take from any subject
    if (pool.length < 5) {
      pool = allAvailableQuestions.filter(q => q.paperType === 'Paper 1 (Objective)');
    }
    
    // Shuffle and pick 10 questions for practice
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
    setCbtQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setCbtSubmitted(false);
    setTimeRemainingSeconds(cbtDurationMinutes * 60);
    setIsCbtActive(true);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleAutoSubmitCbt = () => {
    handleSubmitCbt();
  };

  const handleSubmitCbt = () => {
    let correctCount = 0;
    cbtQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const max = cbtQuestions.length;
    // Scale to standard 400-mark JAMB score
    const jambScore = Math.round((correctCount / (max || 1)) * 400);

    setCbtResultScore({
      rawScore: correctCount,
      maxScore: max,
      jambScaledScore: jambScore
    });

    setCbtSubmitted(true);

    // Save to history
    const newEntry = {
      id: `jamb-${Date.now()}`,
      examType: 'JAMB' as const,
      subject: selectedSubjectId === 'all' ? 'All Subjects Mock' : (WAEC_JAMB_SUBJECTS.find(s => s.id === selectedSubjectId)?.name || 'JAMB Practice'),
      score: correctCount,
      total: max,
      scaledScore: jambScore,
      date: new Date().toLocaleDateString()
    };
    setExamHistory(prev => [newEntry, ...prev]);
  };

  // Generate dynamic questions with Gemini
  const handleGenerateFreshQuestions = async () => {
    const currentSubject = WAEC_JAMB_SUBJECTS.find(s => s.id === selectedSubjectId)?.name || 'General Mathematics';
    setIsGeneratingQuestions(true);

    try {
      const res = await fetch('/api/exam/waec-jamb/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: activeMode === 'jamb_cbt' ? 'JAMB' : 'WAEC',
          subject: currentSubject,
          count: 5
        })
      });

      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setDynamicQuestions(prev => [...data.questions, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // AI Examiner Chat Question
  const handleSendTutorQuestion = async (customPrompt?: string) => {
    const q = customPrompt || tutorQuery;
    if (!q.trim() || isTutorLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user' as const,
      text: q.trim(),
      timestamp: Date.now()
    };

    setTutorMessages(prev => [...prev, userMsg]);
    setTutorQuery('');
    setIsTutorLoading(true);

    try {
      const res = await fetch('/api/exam/waec-jamb/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.trim(),
          examType: activeMode === 'jamb_cbt' ? 'JAMB' : 'WAEC',
          subject: WAEC_JAMB_SUBJECTS.find(s => s.id === selectedSubjectId)?.name || 'General Examination',
          studentName: user.name
        })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      const aiMsg = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor' as const,
        text: data.answer || "My dear scholar, study diligently and remember: through Christ who strengthens you, you shall excel!",
        timestamp: Date.now()
      };
      setTutorMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      console.error(e);
      const fallbackMsg = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor' as const,
        text: `📖 **Chief Examiner's Guidance for ${user.name}**\n\n1. **Formula & Units**: Always state the general formula before substituting numerical values.\n2. **Avoid Penalties**: In English, avoid informal contractions. In Biology, never cross label lines.\n3. **Faith & Diligence**: *"Commit your works to the Lord, and your plans will be established." (Proverbs 16:3)*. Keep practicing!`,
        timestamp: Date.now()
      };
      setTutorMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Format Timer mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="waec-jamb-center" className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 backdrop-blur-sm">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>National Examination Excellence Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-black tracking-tight text-white leading-tight">
              WAEC (WASSCE) & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">JAMB (UTME) Center</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
              Master the West African Senior School Certificate Examination and ace your Computer-Based UTME test with authentic past questions, 8-key CBT simulation, and Chief Examiner marking guides.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex flex-wrap items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-black text-amber-300">A1</div>
              <div className="text-[10px] font-bold uppercase text-slate-300">WAEC Target</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-black text-emerald-300">300+</div>
              <div className="text-[10px] font-bold uppercase text-slate-300">JAMB Score</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-black text-teal-200">8-Key</div>
              <div className="text-[10px] font-bold uppercase text-slate-300">CBT Keyboard</div>
            </div>
          </div>
        </div>

        {/* Navigation Mode Tabs */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'jamb_cbt', label: 'JAMB UTME CBT Simulator', icon: Zap, badge: 'CBT 8-Key' },
            { id: 'waec_paper', label: 'WAEC WASSCE Center', icon: BookOpen, badge: 'Paper 1 & 2' },
            { id: 'syllabus_tips', label: 'Course Tracks & Cut-Offs', icon: School },
            { id: 'ai_tutor', label: 'Ask Chief Examiner (Miss Kelechi)', icon: Sparkles, badge: 'AI Master' },
            { id: 'scorecard', label: 'My Exam Scorecard', icon: BarChart3, count: examHistory.length.toString() }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-waec-jamb-${tab.id}`}
                onClick={() => {
                  setActiveMode(tab.id as MainMode);
                  if (tab.id !== 'jamb_cbt') {
                    setIsCbtActive(false);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all",
                  isActive
                    ? "bg-white text-slate-950 shadow-xl shadow-black/20 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-emerald-700" : "text-slate-400")} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] uppercase font-black tracking-wider rounded-md bg-amber-400 text-slate-950">
                    {tab.badge}
                  </span>
                )}
                {tab.count && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 text-white font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {/* =========================================================================
            1. JAMB UTME CBT SIMULATOR
           ========================================================================= */}
        {activeMode === 'jamb_cbt' && (
          <motion.div
            key="jamb-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {!isCbtActive ? (
              // Pre-Exam Setup & Configuration
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Setup Card */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                          <Zap className="w-6 h-6 text-amber-500" />
                          <span>JAMB UTME CBT Simulator Setup</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                          Simulate the authentic Nigerian Joint Admissions and Matriculation Board Computer-Based Test.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Official CBT Mode
                      </span>
                    </div>

                    {/* Step 1: Select Faculty / Course Combination Track */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        1. Select Your Target Faculty / Subject Combination
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {JAMB_COURSE_TRACKS.map(track => {
                          const isSelected = selectedTrack === track.id;
                          return (
                            <button
                              key={track.id}
                              onClick={() => setSelectedTrack(track.id)}
                              className={cn(
                                "p-4 rounded-2xl text-left border transition-all space-y-2",
                                isSelected
                                  ? "bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-800">{track.faculty}</span>
                                <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                  Cut-Off: {track.targetCutoff}+
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 leading-snug">{track.name}</h4>
                              <p className="text-xs text-slate-500">
                                <strong>Subjects:</strong> {track.subjects.join(', ')}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Subject Drill Focus */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        2. Subject for This Drill Session
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedSubjectId('all')}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border",
                            selectedSubjectId === 'all'
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          )}
                        >
                          Comprehensive (Mixed 4-Subject Mock)
                        </button>
                        {WAEC_JAMB_SUBJECTS.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubjectId(sub.id)}
                            className={cn(
                              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border",
                              selectedSubjectId === sub.id
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                            )}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 3: Timer Duration */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        3. Practice Duration
                      </label>
                      <div className="flex gap-3">
                        {[
                          { min: 10, label: '10 Mins (Rapid Fire)' },
                          { min: 15, label: '15 Mins (Standard Drill)' },
                          { min: 30, label: '30 Mins (Intensive)' },
                          { min: 120, label: '120 Mins (Full UTME Exam)' }
                        ].map(d => (
                          <button
                            key={d.min}
                            onClick={() => setCbtDurationMinutes(d.min)}
                            className={cn(
                              "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center",
                              cbtDurationMinutes === d.min
                                ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Launch Button */}
                    <button
                      id="start-jamb-cbt-btn"
                      onClick={handleStartCbtSession}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-base transition-all shadow-xl shadow-emerald-700/20 active:scale-98 flex items-center justify-center gap-3"
                    >
                      <Zap className="w-5 h-5 text-amber-300" />
                      <span>Start JAMB CBT Examination</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Right: Authentic 8-Key Instructions & Tips */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[2rem] p-6 shadow-xl border border-white/10 space-y-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400">keyboard</span>
                      <h3 className="text-lg font-black tracking-tight">Authentic JAMB 8-Key System</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      In the actual JAMB CBT center, candidates can answer and navigate without using the mouse!
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                        <span className="font-mono text-amber-300 font-black mr-2 bg-black/40 px-1.5 py-0.5 rounded">A, B, C, D</span>
                        <span className="text-slate-200">Select option</span>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                        <span className="font-mono text-emerald-300 font-black mr-2 bg-black/40 px-1.5 py-0.5 rounded">N</span>
                        <span className="text-slate-200">Next question</span>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                        <span className="font-mono text-sky-300 font-black mr-2 bg-black/40 px-1.5 py-0.5 rounded">P</span>
                        <span className="text-slate-200">Previous question</span>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                        <span className="font-mono text-rose-300 font-black mr-2 bg-black/40 px-1.5 py-0.5 rounded">S</span>
                        <span className="text-slate-200">Submit exam</span>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 col-span-2">
                        <span className="font-mono text-yellow-300 font-black mr-2 bg-black/40 px-1.5 py-0.5 rounded">R</span>
                        <span className="text-slate-200">Flag for review</span>
                      </div>
                    </div>

                    <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 text-xs text-amber-200 leading-relaxed flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>No Negative Marking:</strong> JAMB does not deduct points for wrong attempts. Always guess smartly if unsure!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : !cbtSubmitted ? (
              // Active CBT Examination Screen
              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                {/* CBT Top Bar (Authentic JAMB CBT Header) */}
                <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-sm">
                      UTME
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">JAMB Computer-Based Testing Simulator</h3>
                      <p className="text-xs text-slate-400">Candidate: {user.name} | Reg: {user.id.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Countdown Timer */}
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-black border transition-all",
                      timeRemainingSeconds < 120 
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse" 
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    )}>
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(timeRemainingSeconds)}</span>
                    </div>

                    <button
                      id="cbt-submit-top-btn"
                      onClick={() => {
                        if (confirm("Are you sure you want to SUBMIT your JAMB CBT exam now?")) {
                          handleSubmitCbt();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      Submit Exam (S)
                    </button>
                  </div>
                </div>

                {/* CBT Workspace */}
                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Question Content */}
                  <div className="lg:col-span-8 space-y-6">
                    {cbtQuestions[currentQuestionIndex] && (
                      <>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                              Question {currentQuestionIndex + 1} of {cbtQuestions.length}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {cbtQuestions[currentQuestionIndex].subjectName}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              Year: {cbtQuestions[currentQuestionIndex].year}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleFlag(cbtQuestions[currentQuestionIndex].id)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                              flaggedQuestions[cbtQuestions[currentQuestionIndex].id]
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            )}
                            title="Flag this question to review later (R)"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>{flaggedQuestions[cbtQuestions[currentQuestionIndex].id] ? 'Flagged (R)' : 'Flag (R)'}</span>
                          </button>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-4">
                          <p className="text-base md:text-lg font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                            {cbtQuestions[currentQuestionIndex].question}
                          </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 pt-2">
                          {cbtQuestions[currentQuestionIndex].options?.map((option, optIdx) => {
                            const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                            const isSelected = selectedAnswers[cbtQuestions[currentQuestionIndex].id] === option;
                            return (
                              <button
                                key={optIdx}
                                id={`cbt-option-${optionLetter}`}
                                onClick={() => handleSelectOption(cbtQuestions[currentQuestionIndex].id, option)}
                                className={cn(
                                  "w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 group",
                                  isSelected
                                    ? "bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                                )}
                              >
                                <span className={cn(
                                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
                                  isSelected
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                                )}>
                                  {optionLetter}
                                </span>
                                <span className="text-sm font-medium text-slate-800 pt-1 leading-snug">
                                  {option}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Bottom Navigation Toolbar */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <button
                            id="cbt-prev-btn"
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous (P)</span>
                          </button>

                          <button
                            id="cbt-clear-btn"
                            onClick={() => {
                              setSelectedAnswers(prev => {
                                const next = { ...prev };
                                delete next[cbtQuestions[currentQuestionIndex].id];
                                return next;
                              });
                            }}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5"
                          >
                            Clear Answer
                          </button>

                          <button
                            id="cbt-next-btn"
                            disabled={currentQuestionIndex === cbtQuestions.length - 1}
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(cbtQuestions.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-800 transition-all shadow-md"
                          >
                            <span>Next (N)</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Question Palette / Navigator */}
                  <div className="lg:col-span-4 space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                        Question Palette
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Tap any number to jump directly to that question.
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {cbtQuestions.map((q, idx) => {
                        const isAnswered = !!selectedAnswers[q.id];
                        const isFlagged = !!flaggedQuestions[q.id];
                        const isCurrent = currentQuestionIndex === idx;

                        return (
                          <button
                            key={q.id}
                            id={`palette-btn-${idx + 1}`}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={cn(
                              "h-10 rounded-xl font-bold text-xs transition-all relative border flex items-center justify-center",
                              isCurrent && "ring-2 ring-indigo-600 ring-offset-2 scale-105 z-10",
                              isAnswered 
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                                : isFlagged
                                  ? "bg-amber-400 text-slate-950 border-amber-500"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            <span>{idx + 1}</span>
                            {isFlagged && (
                              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-950" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-600" />
                        <span>Answered ({Object.keys(selectedAnswers).length})</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="w-3.5 h-3.5 rounded bg-amber-400" />
                        <span>Flagged for Review ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300" />
                        <span>Unanswered ({cbtQuestions.length - Object.keys(selectedAnswers).length})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Results & Review Screen
              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-slate-200 space-y-8">
                {/* Result Card */}
                <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-[2rem] p-8 text-center space-y-4 border border-white/10">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-400 text-slate-950 inline-block">
                    Official JAMB UTME Result Breakdown
                  </span>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                    <div>
                      <div className="text-5xl md:text-6xl font-black text-amber-300 font-headline">
                        {cbtResultScore.jambScaledScore}
                        <span className="text-xl text-slate-400 font-normal"> / 400</span>
                      </div>
                      <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-1">
                        Scaled JAMB Score
                      </p>
                    </div>

                    <div className="h-12 w-px bg-white/10 hidden sm:block" />

                    <div>
                      <div className="text-3xl font-black text-emerald-300">
                        {cbtResultScore.rawScore} / {cbtResultScore.maxScore}
                      </div>
                      <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-1">
                        Raw Correct Answers
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed pt-2">
                    {cbtResultScore.jambScaledScore >= 280 ? (
                      <span className="text-emerald-300 font-bold">
                        Outstanding Performance! High probability of admission into competitive courses (Medicine, Law, Computer Science) at UNILAG, UI, OAU, or Covenant University.
                      </span>
                    ) : cbtResultScore.jambScaledScore >= 240 ? (
                      <span className="text-amber-200 font-bold">
                        Solid Credit Pass! Well above the national minimum cut-off mark. Keep refining weaker topics to push past 280+.
                      </span>
                    ) : (
                      <span className="text-slate-300">
                        Good effort! Review the step-by-step solutions below and practice with Miss Kelechi to raise your speed and accuracy.
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <button
                      onClick={handleStartCbtSession}
                      className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
                    >
                      Practice Again
                    </button>
                    <button
                      onClick={() => setIsCbtActive(false)}
                      className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 active:scale-95"
                    >
                      Configure New Session
                    </button>
                  </div>
                </div>

                {/* Question-by-Question Solution Review */}
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Detailed Step-by-Step Answer Explanations</span>
                  </h3>

                  <div className="space-y-4">
                    {cbtQuestions.map((q, idx) => {
                      const userAns = selectedAnswers[q.id];
                      const isCorrect = userAns === q.correctAnswer;

                      return (
                        <div
                          key={q.id}
                          className={cn(
                            "p-6 rounded-2xl border transition-all space-y-3",
                            isCorrect 
                              ? "bg-emerald-50/50 border-emerald-200" 
                              : "bg-rose-50/40 border-rose-200"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">
                              Question {idx + 1} ({q.subjectName} • {q.topic})
                            </span>
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-xs font-bold",
                              isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            )}>
                              {isCorrect ? 'Correct ✓' : userAns ? 'Incorrect ✗' : 'Unattempted'}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-slate-900">
                            {q.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 font-bold block mb-0.5">Your Choice:</span>
                              <span className={cn("font-medium", isCorrect ? "text-emerald-700" : "text-rose-600")}>
                                {userAns || 'None selected'}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 font-bold block mb-0.5">Correct Answer:</span>
                              <span className="font-bold text-emerald-700">
                                {q.correctAnswer}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                            <strong className="text-slate-900 block mb-1">Teacher's Explanation:</strong>
                            <p className="whitespace-pre-line">{q.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================================
            2. WAEC WASSCE CENTER (Paper 1 Objective & Paper 2 Theory)
           ========================================================================= */}
        {activeMode === 'waec_paper' && (
          <motion.div
            key="waec-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Top Filter Bar */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase text-slate-500">Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value="all">All WAEC Subjects</option>
                  {WAEC_JAMB_SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <span className="text-xs font-bold uppercase text-slate-500 ml-2">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value="all">All Years (2020-2024)</option>
                  <option value="2024">2024 WASSCE</option>
                  <option value="2023">2023 WASSCE</option>
                  <option value="2022">2022 WASSCE</option>
                </select>
              </div>

              <button
                id="generate-fresh-waec-btn"
                onClick={handleGenerateFreshQuestions}
                disabled={isGeneratingQuestions}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isGeneratingQuestions ? "Generating with AI..." : "Generate Fresh WAEC Questions"}</span>
              </button>
            </div>

            {/* WAEC Questions List */}
            <div className="space-y-6">
              {filteredQuestions.map((q) => {
                const isTheory = q.paperType === 'Paper 2 (Theory/Essay)';
                const isGuideRevealed = revealedTheoryGuides[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-black uppercase",
                          isTheory ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-blue-100 text-blue-900 border border-blue-200"
                        )}>
                          {q.paperType}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{q.subjectName}</span>
                        <span className="text-xs text-slate-400 font-medium">({q.year} WASSCE • {q.topic})</span>
                      </div>

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                        WAEC Standard
                      </span>
                    </div>

                    {/* Question Body */}
                    <p className="text-base text-slate-900 font-medium leading-relaxed whitespace-pre-line">
                      {q.question}
                    </p>

                    {/* Multiple-Choice Options if Objective */}
                    {!isTheory && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-3 rounded-xl border text-xs font-medium flex items-center gap-3",
                              opt === q.correctAnswer
                                ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            )}
                          >
                            <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{opt}</span>
                            {opt === q.correctAnswer && (
                              <Check className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Theory Question Marking Scheme (M1, A1, B1) */}
                    {isTheory && (
                      <div className="space-y-4 pt-2">
                        <button
                          onClick={() => setRevealedTheoryGuides(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition-all"
                        >
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                          <span>{isGuideRevealed ? "Hide Marking Scheme & Scheme Guide" : "Reveal Chief Examiner's Step-by-Step Marking Scheme"}</span>
                        </button>

                        {isGuideRevealed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 text-xs"
                          >
                            <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                              <Award className="w-4 h-4" />
                              <span>Official WAEC Marking Scheme & Marks Allocation</span>
                            </h4>

                            {q.markingGuide && (
                              <div className="space-y-1.5 pl-2 border-l-2 border-amber-400">
                                {q.markingGuide.map((step, sIdx) => (
                                  <div key={sIdx} className="text-slate-300 font-mono">
                                    • {step}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 text-slate-200 leading-relaxed">
                              <strong className="text-white block mb-1">Full Pedagogical Solution:</strong>
                              <p className="whitespace-pre-line">{q.explanation}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            3. COURSE TRACKS, SYLLABUS & UNIVERSITY CUT-OFFS
           ========================================================================= */}
        {activeMode === 'syllabus_tips' && (
          <motion.div
            key="syllabus-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Chief Examiner's Golden Tips */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                <span>WAEC & JAMB Chief Examiner's Golden Strategies</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WAEC_CHIEF_EXAMINER_TIPS.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-indigo-900">{tip.subject}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-200">
                        {tip.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tip.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* University Cut-Off Mark Matrix */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <School className="w-5 h-5 text-emerald-600" />
                    <span>Nigerian Universities Target Cut-Off Marks & Faculty Combinations</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Benchmarks for top Federal, State, and accredited Christian Private Universities.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {JAMB_COURSE_TRACKS.map(track => (
                  <div
                    key={track.id}
                    className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{track.faculty}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">
                        Target: {track.targetCutoff}+
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900">{track.name}</h4>

                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-700">Mandatory JAMB 4-Subject Combination:</strong>
                        <p className="text-slate-600 mt-0.5">{track.subjects.join(' • ')}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Premier Institutions:</strong>
                        <p className="text-slate-600 mt-0.5">{track.topUniversities.join(', ')}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Career & Kingdom Impact:</strong>
                        <p className="text-slate-600 mt-0.5">{track.careerProspects}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            4. ASK CHIEF EXAMINER AI (MISS KELECHI)
           ========================================================================= */}
        {activeMode === 'ai_tutor' && (
          <motion.div
            key="ai-tutor-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: Starters */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Exam Master Quick Starters</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Tap any question to receive official marking schemes and mnemonic rules from Miss Kelechi.
                </p>

                <div className="space-y-2">
                  {[
                    "How do I answer WAEC English Summary questions without verbatim lifting?",
                    "What are the step-by-step method marks for General Mathematics Paper 2?",
                    "Explain the difference between mitosis and meiosis for JAMB Biology.",
                    "What are the rules for drawing biological diagrams in WAEC Paper 2?",
                    "How does the 8-key JAMB CBT keyboard navigation work?"
                  ].map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendTutorQuestion(starter)}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-all leading-snug"
                    >
                      • {starter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Interactive Chat */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/80 flex flex-col h-[650px] overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Miss Kelechi • Chief Examiner AI</h3>
                      <p className="text-xs text-slate-400">WAEC & JAMB Official Examination Consultant</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Live AI
                  </span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin">
                  {tutorMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 max-w-[88%]",
                        msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs text-white",
                        msg.sender === 'user' ? "bg-indigo-600" : "bg-emerald-700"
                      )}>
                        {msg.sender === 'user' ? 'ME' : 'MK'}
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-xs md:text-sm leading-relaxed",
                        msg.sender === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-md" 
                          : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-line shadow-sm"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTutorLoading && (
                    <div className="flex gap-3 mr-auto items-center text-xs text-slate-400 animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                        MK
                      </div>
                      <span>Miss Kelechi is analyzing the marking scheme...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                  <input
                    id="tutor-chat-input"
                    type="text"
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTutorQuestion()}
                    placeholder="Ask Miss Kelechi any WAEC or JAMB question..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    id="send-tutor-query-btn"
                    onClick={() => handleSendTutorQuestion()}
                    disabled={isTutorLoading || !tutorQuery.trim()}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            5. MY EXAM SCORECARD & DIAGNOSTICS
           ========================================================================= */}
        {activeMode === 'scorecard' && (
          <motion.div
            key="scorecard-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  <span>My National Examination Scorecard</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Track all your mock test sessions, scaled scores, and admission eligibility trends.
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm("Reset exam scorecard history?")) {
                    setExamHistory([]);
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-600 font-bold"
              >
                Clear History
              </button>
            </div>

            {examHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <School className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-medium">No exam practice history yet.</p>
                <button
                  onClick={() => setActiveMode('jamb_cbt')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Start First JAMB CBT Mock
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {examHistory.map(entry => (
                  <div
                    key={entry.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase",
                          entry.examType === 'JAMB' ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                        )}>
                          {entry.examType}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{entry.subject}</h4>
                      </div>
                      <p className="text-xs text-slate-400">Date: {entry.date}</p>
                    </div>

                    <div className="text-right">
                      {entry.scaledScore !== undefined && (
                        <div className="text-2xl font-black text-emerald-700">
                          {entry.scaledScore} / 400
                        </div>
                      )}
                      <p className="text-xs font-semibold text-slate-500">
                        Raw: {entry.score} / {entry.total} ({Math.round((entry.score / entry.total) * 100)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
