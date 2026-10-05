import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, Subject, User } from '../types';
import { cn } from '../lib/utils';
import { 
  getLessonInteractiveData, 
  LessonInteractiveContent, 
  MatchingPair, 
  ShortQuizQuestion 
} from '../data/lessonInteractiveData';

interface InteractiveLessonLabProps {
  topic: Topic;
  subject: Subject;
  grade: number;
  user: User;
  resetKey?: number;
  initialMode?: 'matching' | 'video' | 'quiz' | 'creative';
  onActivityComplete?: (score: number, activityType: string) => void;
}

export default function InteractiveLessonLab({
  topic,
  subject,
  grade,
  user,
  resetKey,
  initialMode = 'matching',
  onActivityComplete
}: InteractiveLessonLabProps) {
  const content: LessonInteractiveContent = useMemo(() => {
    return getLessonInteractiveData(subject, grade, topic);
  }, [subject, grade, topic]);

  const [activeMode, setActiveMode] = useState<'matching' | 'video' | 'quiz' | 'creative'>(initialMode);

  // Sound feedback
  const playSound = (type: 'success' | 'error' | 'fanfare') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(164.81, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.3);
        });
      }
    } catch {
      // Audio playback fails silently in restricted environments
    }
  };

  // MATCHING STATE
  const [shuffledTerms, setShuffledTerms] = useState<MatchingPair[]>([]);
  const [shuffledMatches, setShuffledMatches] = useState<MatchingPair[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPairAnimation, setWrongPairAnimation] = useState<string | null>(null);
  const [matchingHint, setMatchingHint] = useState<string | null>(null);

  // SHORT QUIZ STATE
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // VIDEO COMPREHENSION STATE
  const [videoAnswer, setVideoAnswer] = useState<string | null>(null);
  const [videoAnswerChecked, setVideoAnswerChecked] = useState(false);

  // CREATIVE PROJECT STATE
  const [projectText, setProjectText] = useState('');
  const [projectSubmitted, setProjectSubmitted] = useState(false);

  // Initialize and shuffle matching pairs
  useEffect(() => {
    const pairs = content.matching.pairs;
    // Shuffle terms
    const terms = [...pairs].sort(() => Math.random() - 0.5);
    // Shuffle matches independently
    const matches = [...pairs].sort(() => Math.random() - 0.5);
    setShuffledTerms(terms);
    setShuffledMatches(matches);
    setSelectedTermId(null);
    setMatchedIds([]);
    setMatchingHint(null);
    setCurrentQuizIdx(0);
    setQuizAnswers({});
    setQuizScore(null);
    setShowExplanation(false);
    setVideoAnswer(null);
    setVideoAnswerChecked(false);
    setProjectText('');
    setProjectSubmitted(false);
  }, [content, resetKey]);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, pairId: string) => {
    e.dataTransfer.setData('text/plain', pairId);
    setSelectedTermId(pairId);
  };

  // Handle Drop on Target Match Card
  const handleDropOnMatch = (e: React.DragEvent, targetPairId: string) => {
    e.preventDefault();
    const draggedTermId = e.dataTransfer.getData('text/plain');
    if (draggedTermId) {
      evaluateMatch(draggedTermId, targetPairId);
    }
  };

  // Handle Click-to-Pair (Touch / Mouse fallback)
  const handleTermClick = (pairId: string) => {
    if (matchedIds.includes(pairId)) return;
    if (selectedTermId === pairId) {
      setSelectedTermId(null);
    } else {
      setSelectedTermId(pairId);
      const pair = content.matching.pairs.find(p => p.id === pairId);
      if (pair?.hint) {
        setMatchingHint(`Clue for "${pair.term}": ${pair.hint}`);
      }
    }
  };

  const handleMatchClick = (matchPairId: string) => {
    if (matchedIds.includes(matchPairId)) return;
    if (!selectedTermId) {
      setMatchingHint("First select a concept card on the left, then click its matching definition here.");
      return;
    }
    evaluateMatch(selectedTermId, matchPairId);
  };

  const evaluateMatch = (termId: string, matchId: string) => {
    if (termId === matchId) {
      // Correct match!
      playSound('success');
      const newMatched = [...matchedIds, termId];
      setMatchedIds(newMatched);
      setSelectedTermId(null);
      setMatchingHint(null);

      // Check if all pairs are matched
      if (newMatched.length === content.matching.pairs.length) {
        playSound('fanfare');
        if (onActivityComplete) {
          onActivityComplete(100, 'matching');
        }
      }
    } else {
      // Incorrect match
      playSound('error');
      setWrongPairAnimation(matchId);
      const termPair = content.matching.pairs.find(p => p.id === termId);
      setMatchingHint(`Not quite! Review the definition for "${termPair?.term}". Clue: ${termPair?.hint || 'Think carefully about the key concepts.'}`);
      setTimeout(() => {
        setWrongPairAnimation(null);
      }, 700);
    }
  };

  const resetMatching = () => {
    setMatchedIds([]);
    setSelectedTermId(null);
    setMatchingHint(null);
    setShuffledTerms([...content.matching.pairs].sort(() => Math.random() - 0.5));
    setShuffledMatches([...content.matching.pairs].sort(() => Math.random() - 0.5));
  };

  // QUIZ HANDLERS
  const handleSelectQuizAnswer = (option: string) => {
    const question = content.shortQuiz.questions[currentQuizIdx];
    if (!question || quizAnswers[question.id]) return; // Answer locked

    const isCorrect = option === question.correctAnswer;
    if (isCorrect) {
      playSound('success');
    } else {
      playSound('error');
    }

    setQuizAnswers(prev => ({ ...prev, [question.id]: option }));
    setShowExplanation(true);
  };

  const handleNextQuizQuestion = () => {
    setShowExplanation(false);
    if (currentQuizIdx < content.shortQuiz.questions.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      // Calculate final score
      let correct = 0;
      content.shortQuiz.questions.forEach(q => {
        if (quizAnswers[q.id] === q.correctAnswer) {
          correct += 1;
        }
      });
      const finalPercent = Math.round((correct / content.shortQuiz.questions.length) * 100);
      setQuizScore(finalPercent);
      if (finalPercent >= 70) {
        playSound('fanfare');
      }
      if (onActivityComplete) {
        onActivityComplete(finalPercent, 'quiz');
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIdx(0);
    setQuizAnswers({});
    setQuizScore(null);
    setShowExplanation(false);
  };

  // VIDEO COMPREHENSION HANDLER
  const handleCheckVideoAnswer = () => {
    if (!videoAnswer) return;
    const isCorrect = videoAnswer === content.video.comprehensionQuestion.correctAnswer;
    setVideoAnswerChecked(true);
    if (isCorrect) {
      playSound('success');
      if (onActivityComplete) {
        onActivityComplete(100, 'video');
      }
    } else {
      playSound('error');
    }
  };

  const isMatchingComplete = matchedIds.length > 0 && matchedIds.length === content.matching.pairs.length;

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 space-y-8">
      {/* Top Header & Interactive Mode Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container-low pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <span>Interactive Learning Lab</span>
            <span aria-hidden="true">·</span>
            <span>Grade {grade} {subject}</span>
            <span aria-hidden="true">·</span>
            <span>Active Engagement</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            {topic.title}
          </h2>
        </div>

        {/* Clean Segmented Mode Selector (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface-container-low rounded-2xl">
          <button
            onClick={() => setActiveMode('matching')}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5",
              activeMode === 'matching'
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-base">extension</span>
            <span>Matching Activity</span>
            {isMatchingComplete && (
              <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
            )}
          </button>

          <button
            onClick={() => setActiveMode('video')}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5",
              activeMode === 'video'
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-base">smart_display</span>
            <span>Educational Video</span>
            {videoAnswerChecked && videoAnswer === content.video.comprehensionQuestion.correctAnswer && (
              <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
            )}
          </button>

          <button
            onClick={() => setActiveMode('quiz')}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5",
              activeMode === 'quiz'
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>Rapid Quiz</span>
            {quizScore !== null && (
              <span className="text-[10px] font-black text-secondary">{quizScore}%</span>
            )}
          </button>

          <button
            onClick={() => setActiveMode('creative')}
            className={cn(
              "px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5",
              activeMode === 'creative'
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-base">draw</span>
            <span>Creative Task</span>
          </button>
        </div>
      </div>

      {/* MODE 1: DRAG & DROP MATCHING ACTIVITY */}
      {activeMode === 'matching' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <div className="space-y-1">
              <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">touch_app</span>
                {content.matching.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {content.matching.instruction}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Progress</div>
                <div className="font-mono text-base font-black text-primary">
                  {matchedIds.length} / {content.matching.pairs.length} Matched
                </div>
              </div>
              <button
                onClick={resetMatching}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-white rounded-xl transition-colors"
                title="Reset matching cards"
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Dynamic Clue or Notification */}
          {matchingHint && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 flex items-start gap-2.5"
            >
              <span className="material-symbols-outlined text-amber-600 text-sm shrink-0 mt-0.5">lightbulb</span>
              <span>{matchingHint}</span>
            </motion.div>
          )}

          {/* Completion Celebration Overlay */}
          {isMatchingComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center bg-emerald-500/10 border-2 border-emerald-500/30 rounded-3xl space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-3xl">celebration</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900">
                Spectacular Job! All Concepts Matched!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                You've successfully mastered the key terms and definitions for <strong>{topic.title}</strong> in Grade {grade}.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={resetMatching}
                  className="px-6 py-2.5 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setActiveMode('video')}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  <span>Watch Educational Video</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Interactive Matching Arena */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Terms / Concepts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">
                  <span>1. Concepts & Terms</span>
                  <span className="text-[11px] text-slate-400 font-normal">Drag or Click to select</span>
                </div>
                {shuffledTerms.map(pair => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isSelected = selectedTermId === pair.id;

                  return (
                    <div
                      key={pair.id}
                      draggable={!isMatched}
                      onDragStart={e => handleDragStart(e, pair.id)}
                      onClick={() => handleTermClick(pair.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 select-none",
                        isMatched
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 opacity-80 cursor-default"
                          : isSelected
                            ? "bg-primary/10 border-primary shadow-md scale-[1.01]"
                            : "bg-white border-surface-container-high hover:border-primary/40 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold",
                          isMatched 
                            ? "bg-emerald-500 text-white" 
                            : isSelected 
                              ? "bg-primary text-white" 
                              : "bg-surface-container-low text-on-surface-variant"
                        )}>
                          <span className="material-symbols-outlined text-base">
                            {isMatched ? 'check' : 'drag_indicator'}
                          </span>
                        </span>
                        <span className="font-bold text-sm text-on-surface">
                          {pair.term}
                        </span>
                      </div>
                      {isMatched && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Matched
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Definitions / Matches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">
                  <span>2. Definitions & Properties</span>
                  <span className="text-[11px] text-slate-400 font-normal">Drop or Click to match</span>
                </div>
                {shuffledMatches.map(pair => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isWrong = wrongPairAnimation === pair.id;

                  return (
                    <div
                      key={pair.id}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleDropOnMatch(e, pair.id)}
                      onClick={() => handleMatchClick(pair.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all cursor-pointer select-none",
                        isMatched
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 cursor-default"
                          : isWrong
                            ? "bg-rose-50 border-rose-400 animate-shake"
                            : selectedTermId
                              ? "bg-white border-primary/30 hover:border-primary hover:bg-primary/5 hover:scale-[1.01]"
                              : "bg-white border-surface-container-high hover:border-surface-variant"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs",
                          isMatched ? "text-emerald-600" : "text-slate-400"
                        )}>
                          <span className="material-symbols-outlined text-base">
                            {isMatched ? 'verified' : 'circle'}
                          </span>
                        </span>
                        <p className="text-xs text-on-surface leading-relaxed font-medium">
                          {pair.match}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* MODE 2: EMBEDDED EDUCATIONAL VIDEO */}
      {activeMode === 'video' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 16:9 Video Player */}
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-xl border border-black/10 relative">
                <iframe
                  src={content.video.videoUrl}
                  title={content.video.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{content.video.source}</span>
                  <span aria-hidden="true">·</span>
                  <span>Duration: {content.video.duration}</span>
                </div>
                <span className="text-[11px] text-primary font-bold">Curated Educational Stream</span>
              </div>
            </div>

            {/* Video Insights & Interactive Check */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 bg-surface-container-low rounded-2xl space-y-3">
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">description</span>
                  Lesson Summary
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  {content.video.summary}
                </p>
              </div>

              {/* Timestamped Key Takeaways */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider">
                  Key Video Milestones
                </h4>
                <div className="space-y-2">
                  {content.video.takeaways.map((takeaway, i) => (
                    <div 
                      key={i} 
                      className="p-3 bg-white rounded-xl border border-surface-container-high flex items-start gap-3"
                    >
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono text-[11px] font-bold shrink-0">
                        {takeaway.timestamp}
                      </span>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-on-surface">{takeaway.label}</div>
                        <div className="text-[11px] text-on-surface-variant">{takeaway.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Video Comprehension Check */}
              <div className="p-5 bg-primary/5 border border-primary/15 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">help</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                    Video Comprehension Check
                  </h4>
                </div>
                <p className="text-xs font-bold text-on-surface">
                  {content.video.comprehensionQuestion.question}
                </p>

                <div className="space-y-2">
                  {content.video.comprehensionQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setVideoAnswer(opt);
                        setVideoAnswerChecked(false);
                      }}
                      className={cn(
                        "w-full p-3 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between",
                        videoAnswer === opt
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-on-surface border-surface-container-high hover:border-primary/40"
                      )}
                    >
                      <span>{opt}</span>
                      {videoAnswer === opt && (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                    </button>
                  ))}
                </div>

                {!videoAnswerChecked ? (
                  <button
                    disabled={!videoAnswer}
                    onClick={handleCheckVideoAnswer}
                    className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    Check My Answer
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-xl text-xs leading-relaxed font-medium",
                      videoAnswer === content.video.comprehensionQuestion.correctAnswer
                        ? "bg-emerald-500/10 text-emerald-900 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-900 border border-rose-500/30"
                    )}
                  >
                    <div className="font-bold mb-1">
                      {videoAnswer === content.video.comprehensionQuestion.correctAnswer
                        ? "Correct! Brilliant observation."
                        : "Not quite correct."}
                    </div>
                    {content.video.comprehensionQuestion.explanation}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MODE 3: RAPID KNOWLEDGE CHECK QUIZ */}
      {activeMode === 'quiz' && (
        <section className="space-y-6">
          {quizScore !== null ? (
            /* Quiz Results Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center bg-white border border-surface-container rounded-3xl space-y-4 max-w-lg mx-auto"
            >
              <div className={cn(
                "w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-3xl font-black font-mono shadow-md",
                quizScore >= 70 ? "bg-emerald-500 text-white" : "bg-amber-500 text-slate-950"
              )}>
                {quizScore}%
              </div>
              <h4 className="text-2xl font-black text-on-surface">
                {quizScore >= 70 ? "Exceptional Knowledge!" : "Good Effort!"}
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {quizScore >= 70 
                  ? "You have demonstrated strong conceptual understanding of this lesson's key principles."
                  : "Review the lesson materials and video to reinforce these core definitions."}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 bg-surface-container-high text-on-surface text-xs font-bold rounded-xl hover:bg-surface-container transition-colors"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={() => setActiveMode('matching')}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all"
                >
                  Try Matching Game
                </button>
              </div>
            </motion.div>
          ) : (
            /* Active Question Screen */
            (() => {
              const currentQ: ShortQuizQuestion = content.shortQuiz.questions[currentQuizIdx] || content.shortQuiz.questions[0];
              const selectedAnswer = quizAnswers[currentQ?.id];
              const isAnswered = Boolean(selectedAnswer);

              return (
                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Question Header & Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                      <span>Question {currentQuizIdx + 1} of {content.shortQuiz.questions.length}</span>
                      <span className="font-mono text-primary font-bold">
                        {Math.round(((currentQuizIdx + 1) / content.shortQuiz.questions.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentQuizIdx + 1) / content.shortQuiz.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="bg-white p-6 rounded-2xl border border-surface-container space-y-4">
                    <h3 className="text-lg font-bold text-on-surface leading-snug">
                      {currentQ.question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {currentQ.options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrectOption = option === currentQ.correctAnswer;

                        return (
                          <button
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => handleSelectQuizAnswer(option)}
                            className={cn(
                              "w-full p-4 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between",
                              !isAnswered
                                ? "bg-surface-container-lowest border-surface-container hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                                : isCorrectOption
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-900 font-bold"
                                  : isSelected
                                    ? "bg-rose-500/10 border-rose-500/40 text-rose-900"
                                    : "bg-surface-container-lowest border-surface-container opacity-50"
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <span className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono",
                                isAnswered && isCorrectOption 
                                  ? "bg-emerald-600 text-white" 
                                  : isAnswered && isSelected 
                                    ? "bg-rose-600 text-white" 
                                    : "bg-surface-container text-on-surface-variant"
                              )}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{option}</span>
                            </span>

                            {isAnswered && isCorrectOption && (
                              <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                            )}
                            {isAnswered && isSelected && !isCorrectOption && (
                              <span className="material-symbols-outlined text-rose-600 text-base">cancel</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Explanation & Moral Takeaway */}
                    <AnimatePresence>
                      {showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 border-t border-surface-container-low space-y-3"
                        >
                          <div className={cn(
                            "p-3 rounded-xl text-xs leading-relaxed",
                            selectedAnswer === currentQ.correctAnswer
                              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                              : "bg-rose-50 text-rose-900 border border-rose-200"
                          )}>
                            <span className="font-bold block mb-1">
                              {selectedAnswer === currentQ.correctAnswer ? "Correct Answer!" : "Review Note:"}
                            </span>
                            {currentQ.explanation}
                          </div>

                          {currentQ.moralTakeaway && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                              <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5 shrink-0">volunteer_activism</span>
                              <div>
                                <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">Character & Moral Connection</span>
                                <span>{currentQ.moralTakeaway}</span>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={handleNextQuizQuestion}
                            className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>{currentQuizIdx < content.shortQuiz.questions.length - 1 ? "Next Question" : "See Final Score"}</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })()
          )}
        </section>
      )}

      {/* MODE 4: CREATIVE TASK & APPLICATION MISSION */}
      {activeMode === 'creative' && (
        <section className="space-y-6 max-w-2xl mx-auto">
          <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
              <span className="material-symbols-outlined text-base">palette</span>
              <span>Hands-On Creative Application</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface">
              {content.creativePrompt.mission}
            </h3>
            
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Guiding Questions:
              </div>
              <ul className="space-y-1.5 text-xs text-on-surface-variant font-medium">
                {content.creativePrompt.guidingQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-white rounded-xl border border-surface-container text-xs text-slate-600 italic">
              "💡 Starter Idea: {content.creativePrompt.starterIdea}"
            </div>
          </div>

          {projectSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3"
            >
              <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
              <h4 className="text-lg font-bold text-slate-900">Project Draft Recorded!</h4>
              <p className="text-xs text-slate-600">
                Your creative summary has been saved to your learning log. Keep exercising your creativity for God's glory!
              </p>
              <button
                onClick={() => setProjectSubmitted(false)}
                className="px-5 py-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-xl hover:bg-emerald-50"
              >
                Edit Draft
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Your Creative Summary or Project Notes:
                </label>
                <textarea
                  value={projectText}
                  onChange={e => setProjectText(e.target.value)}
                  placeholder="Record your thoughts, poster draft, scripture application, or key takeaways here..."
                  rows={6}
                  className="w-full p-4 bg-white border border-surface-container rounded-2xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  disabled={!projectText.trim()}
                  onClick={() => {
                    setProjectSubmitted(true);
                    playSound('success');
                    if (onActivityComplete) {
                      onActivityComplete(100, 'creative');
                    }
                  }}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Save Creative Project</span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
