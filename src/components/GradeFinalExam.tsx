import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Question } from '../types';
import { cn } from '../lib/utils';
import Logo from './Logo';

export default function GradeFinalExam({ 
  user,
  onComplete,
  onBack
}: { 
  user: User;
  onComplete: (score: number) => void;
  onBack: () => void;
}) {
  const [questions, setQuestions] = useState<(Question & { subject: string })[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    generateExam();
  }, []);

  const generateExam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: `Grade ${user.grade} Comprehensive Final Exam`,
          subject: 'Comprehensive Curriculum',
          grade: user.grade,
          count: 15
        })
      });
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted = data.questions.map((q: any) => ({
          ...q,
          subject: q.subject || 'Comprehensive'
        }));
        setQuestions(formatted);
      } else {
        throw new Error('Invalid exam format');
      }
    } catch (error) {
      console.error("Exam Generation Error, loading fallback:", error);
      setQuestions([
        {
          id: 1,
          type: 'multiple-choice',
          subject: 'Mathematics',
          question: `In Grade ${user.grade} Mathematics, if a student buys a book for ₦1,200 and pays with ₦2,000, what is the change?`,
          options: ['₦800', '₦500', '₦1,000', '₦600'],
          correctAnswer: '₦800',
          hint: 'Subtract 1,200 from 2,000.',
          explanation: '₦2,000 - ₦1,200 = ₦800.'
        },
        {
          id: 2,
          type: 'multiple-choice',
          subject: 'Bible Study',
          question: 'Which fruit of the Spirit in Galatians 5:22 refers to calm endurance during trials?',
          options: ['Patience', 'Hatred', 'Anger', 'Pride'],
          correctAnswer: 'Patience',
          hint: 'Galatians 5:22-23.',
          explanation: 'Patience is a God-given spiritual fruit.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questions[currentIdx].id]: answer }));
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      submitExam();
    }
  };

  const submitExam = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center space-y-8">
        <Logo size="lg" />
        <div className="w-32 h-32 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div>
          <h2 className="text-3xl font-headline font-black text-on-surface">Assembling Grade Final Exam</h2>
          <p className="text-on-surface-variant font-medium mt-2 max-w-sm">
            Miss Kelechi is preparing 30 comprehensive questions to test your mastery of Grade {user.grade}.
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-2xl w-full border-4 border-primary/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary via-secondary to-tertiary" />
          
          <div className="mb-8">
            <span className="material-symbols-outlined text-8xl text-secondary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              {score >= 70 ? 'workspace_premium' : 'school'}
            </span>
            <h2 className="text-4xl font-headline font-black text-on-surface">Exam Results</h2>
            <p className="text-on-surface-variant font-bold mt-2 uppercase tracking-widest">Grade {user.grade} Final Assessment</p>
          </div>

          <div className="my-12 py-10 bg-surface-container-low rounded-3xl border-2 border-surface-container relative">
            <div className="text-[100px] font-black text-primary leading-none">{score}%</div>
            <div className="text-xl font-bold text-on-surface-variant mt-4">
              {score >= 90 ? "Incredible Mastery!" : score >= 70 ? "Great Achievement!" : "Good Effort!"}
            </div>
            <div className="absolute -top-4 -right-4 bg-secondary text-white px-6 py-2 rounded-full font-black shadow-lg">
              {score >= 50 ? 'PASSED' : 'RETAKE SUGGESTED'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-container">
              <p className="text-xs font-bold text-outline-variant uppercase">Total Questions</p>
              <p className="text-2xl font-black text-on-surface">30</p>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-container">
              <p className="text-xs font-bold text-outline-variant uppercase">Time Spent</p>
              <p className="text-2xl font-black text-on-surface">15m</p>
            </div>
          </div>

          {user.grade === 10 && score >= 50 && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-left flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-emerald-600">workspace_premium</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-700">All 10 Grades Finished!</p>
                <p className="text-sm font-bold text-slate-800">Congratulations! WAEC (WASSCE) & JAMB (UTME) Center is now UNLOCKED!</p>
              </div>
            </div>
          )}

          <button 
            onClick={() => onComplete(score)}
            className="w-full bg-primary text-white py-6 rounded-2xl font-headline font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">verified</span>
            Confirm Result & Continue
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Logo size="lg" />
        <h2 className="text-2xl font-black text-on-surface">Unable to load final exam</h2>
        <p className="text-on-surface-variant max-w-sm font-medium">
          There was an error compiling your test questions. Please check your internet connection or try again later.
        </p>
        <button onClick={onBack} className="bg-primary text-white py-3 px-8 rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-surface-container px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="h-6 w-px bg-surface-container-high" />
          <div>
            <h1 className="font-headline font-black text-primary leading-none uppercase tracking-tighter text-lg">Grade {user.grade} Final Test</h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Question {currentIdx + 1} of 30</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Progress</span>
            <div className="w-48 h-2 bg-surface-container rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${((currentIdx + 1) / 30) * 100}%` }}
              />
            </div>
          </div>
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 pt-28 pb-32 px-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-black uppercase tracking-widest">
                  {currentQuestion.subject}
                </span>
                <span className="text-on-surface-variant font-bold text-sm">Comprehensive Unit</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface leading-tight tracking-tight">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    "p-8 text-left rounded-3xl border-2 transition-all relative group overflow-hidden",
                    userAnswers[currentQuestion.id] === option
                      ? "bg-primary border-primary text-white shadow-xl scale-[1.02]"
                      : "bg-white border-surface-container hover:border-primary/30 text-on-surface shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm",
                      userAnswers[currentQuestion.id] === option
                        ? "bg-white text-primary border-white"
                        : "bg-surface-container-low border-surface-container text-on-surface-variant"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-bold text-lg leading-snug">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t border-surface-container z-50 flex items-center justify-center">
        <div className="max-w-4xl w-full flex justify-between items-center">
          <button 
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-8 py-4 rounded-xl font-headline font-bold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
          
          <div className="flex items-center gap-8">
            <span className="hidden sm:block text-[10px] font-black text-outline-variant uppercase tracking-widest">
              Review your answer before proceeding
            </span>
            <button 
              onClick={nextQuestion}
              disabled={!userAnswers[currentQuestion.id]}
              className="bg-primary hover:bg-primary-dim text-white px-12 py-4 rounded-2xl font-headline font-black text-lg shadow-xl active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
            >
              {currentIdx === questions.length - 1 ? 'Finish Exam' : 'Save & Next'}
              <span className="material-symbols-outlined text-sm">
                {currentIdx === questions.length - 1 ? 'verified' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
