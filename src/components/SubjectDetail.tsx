import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, Topic, Curriculum } from '../types';
import { GRADES, SUBJECTS } from '../constants';
import { getCurriculum, getAllTopicsForGrade } from '../curriculumData';
import { cn } from '../lib/utils';
import { isSubjectDrillAvailable } from '../utils/drillSchedule';
import Logo from './Logo';
import SubjectMotivation from './SubjectMotivation';

export type SubjectSectionType = 'lessons' | 'worksheets' | 'activities' | 'matrix';

interface SubjectDetailProps { 
  subject: Subject; 
  onBack: () => void;
  onSelectTopic: (topic: Topic, targetTab?: 'lesson' | 'worksheet' | 'activity', targetMode?: 'matching' | 'video' | 'quiz' | 'creative') => void;
  onStartDrills: (subject: Subject) => void;
  history: { topicId: string, score: number, date: number }[];
  initialSection?: SubjectSectionType;
  initialGrade?: number;
}

export default function SubjectDetail({ 
  subject, 
  onBack,
  onSelectTopic,
  onStartDrills,
  history,
  initialSection = 'lessons',
  initialGrade
}: SubjectDetailProps) {
  const [selectedGrade, setSelectedGrade] = useState<number>(() => {
    if (initialGrade && initialGrade >= 1 && initialGrade <= 10) return initialGrade;
    if (subject === 'Biology' || subject === 'Etymology') return 8;
    return 1;
  });

  const [activeSection, setActiveSection] = useState<SubjectSectionType>(initialSection);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [activeRange, setActiveRange] = useState<string>('all'); // 'all', '1-10', '11-20', '21-30', '31-40', '41-50', 'term'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSeniorGrades, setShowSeniorGrades] = useState<boolean>(false);

  const subjectInfo = SUBJECTS.find(s => s.name === subject);
  const displayTitle = subjectInfo?.label || subject;

  useEffect(() => {
    let activeGrade = selectedGrade;
    if (subject === 'Alphabet') {
      activeGrade = 1;
    } else if (subject === 'Biology' || subject === 'Etymology') {
      if (selectedGrade < 8 || selectedGrade > 10) {
        activeGrade = 8;
      }
    }
    if (activeGrade !== selectedGrade) {
      setSelectedGrade(activeGrade);
    }
    setCurriculum(getCurriculum(activeGrade, subject));
  }, [selectedGrade, subject]);

  // Sync initialSection prop if changed from parent navigation
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const allTopics: Topic[] = useMemo(() => {
    return getAllTopicsForGrade(selectedGrade, subject);
  }, [selectedGrade, subject]);

  const filteredTopics = useMemo(() => {
    let list = allTopics;

    // Filter by term or numerical range
    if (activeRange === 'term') {
      const termObj = curriculum?.terms.find(t => t.id === selectedTerm);
      if (termObj) list = termObj.topics;
    } else if (activeRange === '1-10') {
      list = list.filter(t => (t.lessonNumber || 1) >= 1 && (t.lessonNumber || 1) <= 10);
    } else if (activeRange === '11-20') {
      list = list.filter(t => (t.lessonNumber || 1) >= 11 && (t.lessonNumber || 1) <= 20);
    } else if (activeRange === '21-30') {
      list = list.filter(t => (t.lessonNumber || 1) >= 21 && (t.lessonNumber || 1) <= 30);
    } else if (activeRange === '31-40') {
      list = list.filter(t => (t.lessonNumber || 1) >= 31 && (t.lessonNumber || 1) <= 40);
    } else if (activeRange === '41-50') {
      list = list.filter(t => (t.lessonNumber || 1) >= 41 && (t.lessonNumber || 1) <= 50);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        `lesson ${t.lessonNumber}`.includes(q) ||
        `${t.lessonNumber}` === q
      );
    }

    return list;
  }, [allTopics, activeRange, selectedTerm, curriculum, searchQuery]);

  // Module statistics
  const completedTopicsCount = useMemo(() => {
    return allTopics.filter(t => history.some(h => h.topicId === t.id && h.score >= 60)).length;
  }, [allTopics, history]);

  const moduleProgressPercent = Math.round((completedTopicsCount / (allTopics.length || 1)) * 100);

  if (!curriculum) return null;

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden bg-background text-on-surface">
      {/* Sticky Top Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-sm border-b border-surface-container flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 rounded-full hover:bg-surface-container active:scale-95 transition-all text-primary"
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <Logo size="sm" className="hidden sm:flex" />
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-${subjectInfo?.color || 'primary'}-container`)}>
              <span className="material-symbols-outlined text-lg text-primary">{subjectInfo?.icon || 'menu_book'}</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-lg text-primary leading-tight">
                {displayTitle} Module
              </h1>
              <span className="text-[11px] font-bold text-outline-variant uppercase tracking-wider block">
                Grade {selectedGrade} • 50 Lessons
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(() => {
            const subjectCompleted = history.filter(h => h.topicId.startsWith(`${subject}-`) && h.score >= 60).length;
            const isUnlocked = subjectCompleted >= 5;
            return (
              <div className="hidden lg:flex items-center gap-2 bg-amber-100/90 px-3 py-1.5 rounded-full border border-amber-300 text-amber-950 text-xs font-black shadow-sm">
                <span className="material-symbols-outlined text-sm text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
                <span>{displayTitle} Badge: {isUnlocked ? 'Earned! 🏆' : `${subjectCompleted}/5 to Unlock`}</span>
              </div>
            );
          })()}

          <div className="hidden md:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container">
            <span className="text-xs font-bold text-on-surface-variant">Module Progress:</span>
            <span className="text-xs font-black text-secondary">{moduleProgressPercent}%</span>
            <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${moduleProgressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onStartDrills(subject)}
            className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span className="hidden sm:inline">Drills</span>
          </button>
        </div>
      </nav>

      <main className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        {/* Module Header & Motivation */}
        <header className="space-y-6">
          <SubjectMotivation subject={subject} grade={selectedGrade} />

          {/* SECTION 1: ORGANIZED BY GRADE LEVEL (1-5) */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                    Step 1
                  </span>
                  <h2 className="text-xl sm:text-2xl font-headline font-black text-on-surface">
                    Grade Level (Grades 1–5)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
                  Each grade level is organized with exactly 50 sequential lessons, 50 worksheets, and 50 interactive labs.
                </p>
              </div>

              {subject !== 'Alphabet' && subject !== 'Biology' && subject !== 'Etymology' && (
                <button
                  onClick={() => setShowSeniorGrades(!showSeniorGrades)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showSeniorGrades ? 'unfold_less' : 'unfold_more'}
                  </span>
                  <span>{showSeniorGrades ? 'Hide Senior Grades (6–10)' : 'View Senior Grades (6–10)'}</span>
                </button>
              )}
            </div>

            {subject !== 'Alphabet' ? (
              <div className="flex flex-wrap gap-2.5">
                {[1, 2, 3, 4, 5].map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={cn(
                      "px-5 py-3 rounded-2xl font-headline font-black text-base transition-all flex items-center gap-2 shadow-sm cursor-pointer",
                      selectedGrade === grade 
                        ? "bg-primary text-white scale-105 shadow-md" 
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    <span className="material-symbols-outlined text-lg">school</span>
                    <span>Grade {grade}</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold",
                      selectedGrade === grade ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface-variant"
                    )}>
                      50 Lessons
                    </span>
                  </button>
                ))}

                {/* Optional Senior Grades (6-10) */}
                {showSeniorGrades && [6, 7, 8, 9, 10].map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={cn(
                      "px-4 py-2.5 rounded-2xl font-headline font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer border",
                      selectedGrade === grade 
                        ? "bg-secondary text-white border-secondary shadow-md scale-105" 
                        : "bg-surface-container-lowest text-on-surface-variant border-surface-container hover:bg-surface-container"
                    )}
                  >
                    <span>Grade {grade}</span>
                    <span className="text-[10px] text-outline-variant">(Senior)</span>
                  </button>
                ))}

                {(subject === 'Biology' || subject === 'Etymology') && [8, 9, 10].map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={cn(
                      "px-5 py-3 rounded-2xl font-headline font-black text-base transition-all flex items-center gap-2 shadow-sm cursor-pointer",
                      selectedGrade === grade 
                        ? "bg-secondary text-white scale-105 shadow-md" 
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    <span className="material-symbols-outlined text-lg">science</span>
                    <span>Advanced Grade {grade}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-surface-container-low rounded-2xl text-xs font-semibold text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">info</span>
                <span>Alphabet Module is focused on early childhood literacy and phonics mastery (Grade 1 Foundation).</span>
              </div>
            )}
          </div>

          {/* SECTION 2: DEDICATED SECTIONS TABS (LESSONS, WORKSHEETS, ACTIVITIES, MATRIX) */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-secondary/10 text-secondary">
                    Step 2
                  </span>
                  <h2 className="text-xl sm:text-2xl font-headline font-black text-on-surface">
                    Module Sections (Lessons, Worksheets, Activities)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
                  Choose a dedicated section to explore all 50 lessons with tailored tools and interactive engagement.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Section Tab 1: Lessons */}
              <button
                onClick={() => setActiveSection('lessons')}
                className={cn(
                  "p-4 rounded-2xl text-left transition-all border-2 flex flex-col justify-between cursor-pointer",
                  activeSection === 'lessons'
                    ? "bg-primary-container border-primary shadow-md scale-[1.02]"
                    : "bg-surface-container-low border-transparent hover:border-surface-container-high hover:bg-surface-container"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    activeSection === 'lessons' ? "bg-primary text-white" : "bg-surface-container text-primary"
                  )}>
                    <span className="material-symbols-outlined text-xl">menu_book</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/60 text-on-surface">
                    50 Lessons
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base text-on-surface">1. Lessons Section</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5 line-clamp-2">
                    Direct instruction with AI Miss Kelechi & Q&A.
                  </p>
                </div>
              </button>

              {/* Section Tab 2: Worksheets */}
              <button
                onClick={() => setActiveSection('worksheets')}
                className={cn(
                  "p-4 rounded-2xl text-left transition-all border-2 flex flex-col justify-between cursor-pointer",
                  activeSection === 'worksheets'
                    ? "bg-secondary-container border-secondary shadow-md scale-[1.02]"
                    : "bg-surface-container-low border-transparent hover:border-surface-container-high hover:bg-surface-container"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    activeSection === 'worksheets' ? "bg-secondary text-white" : "bg-surface-container text-secondary"
                  )}>
                    <span className="material-symbols-outlined text-xl">edit_note</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/60 text-on-surface">
                    50 Worksheets
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base text-on-surface">2. Worksheets Section</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5 line-clamp-2">
                    Digital exercises, writing practice, auto-saving.
                  </p>
                </div>
              </button>

              {/* Section Tab 3: Activities */}
              <button
                onClick={() => setActiveSection('activities')}
                className={cn(
                  "p-4 rounded-2xl text-left transition-all border-2 flex flex-col justify-between cursor-pointer",
                  activeSection === 'activities'
                    ? "bg-tertiary-container border-tertiary shadow-md scale-[1.02]"
                    : "bg-surface-container-low border-transparent hover:border-surface-container-high hover:bg-surface-container"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    activeSection === 'activities' ? "bg-tertiary text-white" : "bg-surface-container text-tertiary"
                  )}>
                    <span className="material-symbols-outlined text-xl">extension</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/60 text-on-surface">
                    50 Interactive Labs
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base text-on-surface">3. Activities Section</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5 line-clamp-2">
                    Matching games, educational videos & rapid quizzes.
                  </p>
                </div>
              </button>

              {/* Section Tab 4: All-in-One Matrix */}
              <button
                onClick={() => setActiveSection('matrix')}
                className={cn(
                  "p-4 rounded-2xl text-left transition-all border-2 flex flex-col justify-between cursor-pointer",
                  activeSection === 'matrix'
                    ? "bg-surface-container-high border-on-surface shadow-md scale-[1.02]"
                    : "bg-surface-container-low border-transparent hover:border-surface-container-high hover:bg-surface-container"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    activeSection === 'matrix' ? "bg-slate-900 text-white" : "bg-surface-container text-slate-700"
                  )}>
                    <span className="material-symbols-outlined text-xl">grid_view</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/60 text-on-surface">
                    1–50 Matrix
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base text-on-surface">4. All-in-One Matrix</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5 line-clamp-2">
                    Side-by-side view of all 3 components for each lesson.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: LESSON NUMBER FILTER & NAVIGATION BAR (1-50) */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                  Step 3
                </span>
                <h3 className="font-headline font-black text-lg text-on-surface">
                  Filter by Lesson Number (1–50)
                </h3>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search lesson # or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-xl text-xs font-semibold placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary border border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Range Selector for the 50 lessons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setActiveRange('all')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  activeRange === 'all'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                All 50 Lessons
              </button>
              <button
                onClick={() => setActiveRange('1-10')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  activeRange === '1-10'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Lessons 1–10
              </button>
              <button
                onClick={() => setActiveRange('11-20')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  activeRange === '11-20'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Lessons 11–20
              </button>
              <button
                onClick={() => setActiveRange('21-30')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  activeRange === '21-30'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Lessons 21–30
              </button>
              <button
                onClick={() => setActiveRange('31-40')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  activeRange === '31-40'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Lessons 31–40
              </button>
              <button
                onClick={() => setActiveRange('41-50')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  activeRange === '41-50'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Lessons 41–50
              </button>

              <span className="text-outline-variant font-bold text-xs px-1">|</span>

              {/* Term filters */}
              {[1, 2, 3, 4].map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setActiveRange('term');
                    setSelectedTerm(t);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    activeRange === 'term' && selectedTerm === t
                      ? "bg-secondary text-white shadow-sm font-black"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  Term {t}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold pt-1">
              <span>Showing <strong>{filteredTopics.length}</strong> of {allTopics.length} organized items</span>
              <span className="hidden sm:inline">Every lesson includes matching activities, embedded video & rapid quizzes.</span>
            </div>
          </div>
        </header>

        {/* Rapid Mastery Drills Banner */}
        {(() => {
          const availableToday = isSubjectDrillAvailable(subject);
          return (
            <section 
              className={cn(
                "border-4 rounded-[2.5rem] p-8 text-white relative overflow-hidden group transition-all cursor-pointer shadow-md",
                availableToday 
                  ? "bg-slate-900 border-primary/20 hover:scale-[1.01]" 
                  : "bg-slate-900/90 border-amber-500/30"
              )} 
              onClick={() => onStartDrills(subject)}
            >
              <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -z-0", availableToday ? "bg-primary/10" : "bg-amber-500/10")} />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
                    availableToday ? "bg-primary text-white" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  )}>
                    <span className="material-symbols-outlined text-[14px]">
                      {availableToday ? 'bolt' : 'lock_clock'}
                    </span>
                    {availableToday ? 'Subject Drills Active' : 'Drills Schedule Constraint'}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Rapid Mastery Drills</h3>
                  <p className="text-white/70 font-medium text-xs sm:text-sm max-w-md">
                    {availableToday 
                      ? `Fast-paced timer questions for Grade ${selectedGrade} ${subject}. Compete for high scores!` 
                      : `Biology & Etymology drills run on Mon, Wed, Fri, Sat & Sun. (Locked on Tue & Thu).`}
                  </p>
                </div>
                <button 
                  className={cn(
                    "px-8 py-3.5 rounded-xl font-black text-sm group-hover:scale-105 transition-all flex items-center gap-2 cursor-pointer",
                    availableToday 
                      ? "bg-primary text-white shadow-lg" 
                      : "bg-amber-500 text-slate-950 font-black shadow-lg"
                  )}
                >
                  <span>{availableToday ? 'Start Drills' : 'View Schedule'}</span>
                  <span className="material-symbols-outlined text-base">
                    {availableToday ? 'rocket_launch' : 'calendar_month'}
                  </span>
                </button>
              </div>
            </section>
          );
        })()}

        {/* SECTION CONTENT BASED ON ACTIVE SECTION */}
        <div className="space-y-6">
          {/* SECTION 1: LESSONS (1-50) */}
          {activeSection === 'lessons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">school</span>
                  <div>
                    <h3 className="font-headline font-black text-lg text-primary">
                      Grade {selectedGrade} Lessons Section (1–50)
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium">
                      Direct step-by-step instruction with AI Miss Kelechi, audio synthesis, and exit quizzes.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-primary px-3 py-1 bg-white rounded-full self-start sm:self-auto shadow-sm">
                  {completedTopicsCount} of {allTopics.length} Mastered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic, idx) => {
                  const lessonNum = topic.lessonNumber || (idx + 1);
                  const topicHistory = history.filter(h => h.topicId === topic.id);
                  const bestScore = topicHistory.length > 0 ? Math.max(...topicHistory.map(h => h.score)) : null;
                  const isCompleted = topicHistory.length > 0 && (bestScore || 0) >= 60;

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 12) * 0.05 }}
                      className={cn(
                        "bg-surface-container-lowest p-6 rounded-3xl shadow-sm border-2 transition-all flex flex-col justify-between group",
                        isCompleted ? "border-secondary/30 bg-secondary/[0.02]" : "border-surface-container hover:border-primary/40"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                            Lesson {lessonNum} of 50
                          </span>
                          {isCompleted ? (
                            <span className="bg-secondary text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              Score: {bestScore}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                              Grade {selectedGrade}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-headline font-black text-xl text-on-surface group-hover:text-primary transition-colors leading-snug">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant font-medium mt-2 line-clamp-3 leading-relaxed">
                            {topic.description}
                          </p>
                        </div>

                        {/* Interactive Elements Indicator */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant bg-surface-container-low p-2 rounded-xl">
                          <span className="material-symbols-outlined text-primary text-xs">check_circle</span>
                          <span>Includes Matching, Video & Rapid Quiz</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-surface-container flex flex-col gap-2">
                        <button
                          onClick={() => onSelectTopic(topic, 'lesson')}
                          className="w-full py-3 bg-primary hover:bg-primary-dim text-white rounded-xl font-headline font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                        >
                          <span className="material-symbols-outlined text-base">play_arrow</span>
                          <span>Start Lesson {lessonNum}</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => onSelectTopic(topic, 'worksheet')}
                            className="py-1.5 px-2 bg-surface-container-low hover:bg-secondary/10 hover:text-secondary rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition-colors"
                          >
                            📝 Worksheet
                          </button>
                          <button
                            onClick={() => onSelectTopic(topic, 'activity')}
                            className="py-1.5 px-2 bg-surface-container-low hover:bg-tertiary/10 hover:text-tertiary rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition-colors"
                          >
                            🧩 Interactive
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: WORKSHEETS (1-50) */}
          {activeSection === 'worksheets' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-secondary/5 p-4 rounded-2xl border border-secondary/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">edit_note</span>
                  <div>
                    <h3 className="font-headline font-black text-lg text-secondary">
                      Grade {selectedGrade} Worksheets Section (1–50)
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium">
                      50 structured digital practice exercises, open-ended reflections, and auto-saving progress.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-secondary px-3 py-1 bg-white rounded-full self-start sm:self-auto shadow-sm">
                  Organized 1 to 50
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic, idx) => {
                  const lessonNum = topic.lessonNumber || (idx + 1);
                  const topicHistory = history.filter(h => h.topicId === topic.id);
                  const bestScore = topicHistory.length > 0 ? Math.max(...topicHistory.map(h => h.score)) : null;

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 12) * 0.05 }}
                      className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border-2 border-surface-container hover:border-secondary/40 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                            Worksheet {lessonNum} of 50
                          </span>
                          <span className="text-[10px] font-bold text-outline-variant uppercase">
                            Digital Practice
                          </span>
                        </div>

                        <div>
                          <h4 className="font-headline font-black text-xl text-on-surface group-hover:text-secondary transition-colors leading-snug">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant font-medium mt-2 line-clamp-2">
                            Reinforce core principles from Lesson {lessonNum} through comprehensive practice problems and reflection.
                          </p>
                        </div>

                        <div className="bg-surface-container-low p-3 rounded-2xl space-y-1.5 text-xs text-on-surface-variant font-medium">
                          <div className="flex items-center justify-between">
                            <span>Format:</span>
                            <span className="font-bold text-on-surface">Interactive Questions & Synthesis</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Status:</span>
                            <span className={cn("font-black", bestScore !== null ? "text-secondary" : "text-amber-600")}>
                              {bestScore !== null ? `Submitted (${bestScore}%)` : 'Ready to Start'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-surface-container flex flex-col gap-2">
                        <button
                          onClick={() => onSelectTopic(topic, 'worksheet')}
                          className="w-full py-3 bg-secondary hover:bg-secondary-fixed-dim text-white rounded-xl font-headline font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          <span>Open Worksheet {lessonNum}</span>
                        </button>

                        <button
                          onClick={() => onSelectTopic(topic, 'lesson')}
                          className="w-full py-2 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold transition-colors text-center"
                        >
                          Review Lesson First
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: ACTIVITIES (1-50) */}
          {activeSection === 'activities' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-tertiary/5 p-4 rounded-2xl border border-tertiary/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-2xl">extension</span>
                  <div>
                    <h3 className="font-headline font-black text-lg text-tertiary">
                      Grade {selectedGrade} Interactive Activities Section (1–50)
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium">
                      Every single lesson features at least one interactive component: Drag & Drop Matching, Educational Video, or Rapid Short Quiz.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-tertiary px-3 py-1 bg-white rounded-full self-start sm:self-auto shadow-sm">
                  100% Interactive
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic, idx) => {
                  const lessonNum = topic.lessonNumber || (idx + 1);

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 12) * 0.05 }}
                      className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border-2 border-surface-container hover:border-tertiary/40 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-tertiary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                            Activity {lessonNum} of 50
                          </span>
                          <span className="text-[10px] font-bold text-outline-variant uppercase">
                            Interactive Lab
                          </span>
                        </div>

                        <div>
                          <h4 className="font-headline font-black text-xl text-on-surface group-hover:text-tertiary transition-colors leading-snug">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant font-medium mt-2 line-clamp-2">
                            Interactive concept matching, curated video lessons, and lightning-fast knowledge checks.
                          </p>
                        </div>

                        {/* Interactive Features Pills */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-xl text-xs font-semibold text-primary">
                            <span className="material-symbols-outlined text-sm">extension</span>
                            <span>Drag & Drop Matching Activity</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-secondary/5 rounded-xl text-xs font-semibold text-secondary">
                            <span className="material-symbols-outlined text-sm">smart_display</span>
                            <span>Embedded Educational Video & Takeaways</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-tertiary/5 rounded-xl text-xs font-semibold text-tertiary">
                            <span className="material-symbols-outlined text-sm">bolt</span>
                            <span>Rapid Interactive Short Quiz</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-surface-container flex flex-col gap-2">
                        <button
                          onClick={() => onSelectTopic(topic, 'activity', 'matching')}
                          className="w-full py-3 bg-tertiary hover:bg-tertiary-dim text-white rounded-xl font-headline font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                        >
                          <span className="material-symbols-outlined text-base">sports_esports</span>
                          <span>Launch Activity {lessonNum}</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => onSelectTopic(topic, 'activity', 'video')}
                            className="py-1.5 px-2 bg-surface-container-low hover:bg-secondary/10 hover:text-secondary rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">play_circle</span>
                            <span>Video</span>
                          </button>
                          <button
                            onClick={() => onSelectTopic(topic, 'activity', 'quiz')}
                            className="py-1.5 px-2 bg-surface-container-low hover:bg-tertiary/10 hover:text-tertiary rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">bolt</span>
                            <span>Rapid Quiz</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: ALL-IN-ONE MATRIX (1-50) */}
          {activeSection === 'matrix' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-container-high p-4 rounded-2xl border border-surface-container">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface text-2xl">table_chart</span>
                  <div>
                    <h3 className="font-headline font-black text-lg text-on-surface">
                      Grade {selectedGrade} Academic Matrix (Lessons 1–50)
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium">
                      Unified curriculum matrix showing all 3 components (Lesson, Worksheet, Activity) for each lesson number.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-on-surface px-3 py-1 bg-surface-container-lowest rounded-full self-start sm:self-auto shadow-sm">
                  Complete Curriculum Overview
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm overflow-hidden">
                <div className="divide-y divide-surface-container">
                  {filteredTopics.map((topic, idx) => {
                    const lessonNum = topic.lessonNumber || (idx + 1);
                    const topicHistory = history.filter(h => h.topicId === topic.id);
                    const bestScore = topicHistory.length > 0 ? Math.max(...topicHistory.map(h => h.score)) : null;
                    const isCompleted = topicHistory.length > 0 && (bestScore || 0) >= 60;

                    return (
                      <div 
                        key={topic.id}
                        className="p-4 sm:p-6 hover:bg-surface-container-low/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-black text-lg shrink-0",
                            isCompleted ? "bg-secondary text-white" : "bg-primary-container text-primary"
                          )}>
                            {lessonNum}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-primary uppercase tracking-wider">
                                Lesson {lessonNum} of 50
                              </span>
                              {isCompleted && (
                                <span className="bg-secondary/10 text-secondary text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-xs">check</span>
                                  {bestScore}%
                                </span>
                              )}
                            </div>
                            <h4 className="font-headline font-black text-base text-on-surface mt-0.5">
                              {topic.title}
                            </h4>
                            <p className="text-xs text-on-surface-variant font-medium line-clamp-1 mt-0.5">
                              {topic.description}
                            </p>
                          </div>
                        </div>

                        {/* Three Action Pills */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={() => onSelectTopic(topic, 'lesson')}
                            className="px-3.5 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">school</span>
                            <span>Lesson</span>
                          </button>

                          <button
                            onClick={() => onSelectTopic(topic, 'worksheet')}
                            className="px-3.5 py-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            <span>Worksheet</span>
                          </button>

                          <button
                            onClick={() => onSelectTopic(topic, 'activity', 'matching')}
                            className="px-3.5 py-2 bg-tertiary/10 hover:bg-tertiary text-tertiary hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">extension</span>
                            <span>Activity</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
