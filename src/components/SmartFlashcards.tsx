import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { SUBJECTS } from '../constants';

interface HistoryItem {
  topicId: string;
  score: number;
  date: number;
}

export default function SmartFlashcards({ history, grade = 1 }: { history: HistoryItem[], grade?: number }) {
  const [session, setSession] = useState<{ topic: string, cards: { q: string, a: string }[] } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'topics' | 'drills'>('topics');
  const [drillSubject, setDrillSubject] = useState<string>('Math');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  const startReview = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setShowAnswer(false);
    setCurrentIdx(0);
    setUserAnswer('');
    setFeedback('none');

    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          subject: drillSubject,
          grade,
          history
        })
      });
      const data = await res.json();
      if (data.cards) {
        setSession(data);
      }
    } catch (err) {
      console.error("Flashcard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    if (!session) return;
    if (currentIdx < session.cards.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowAnswer(false);
      setUserAnswer('');
      setFeedback('none');
    } else {
      setSession(null);
    }
  };

  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

  const checkDrillAnswer = () => {
    if (normalize(userAnswer) === normalize(card.a)) {
      setFeedback('correct');
      setShowAnswer(true);
    } else {
      setFeedback('wrong');
    }
  };

  if (!session) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-headline font-black text-on-surface text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">psychology_alt</span>
              Quick Flash
            </h4>
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button 
                onClick={() => setMode('topics')}
                className={cn(
                  "px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all",
                  mode === 'topics' ? "bg-white text-secondary shadow-sm" : "text-on-surface-variant opacity-50"
                )}
              >
                Review
              </button>
              <button 
                onClick={() => setMode('drills')}
                className={cn(
                  "px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all",
                  mode === 'drills' ? "bg-white text-secondary shadow-sm" : "text-on-surface-variant opacity-50"
                )}
              >
                Drills
              </button>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mb-4">
            {mode === 'topics' 
              ? "Test your memory on topics you've already completed!" 
              : "Quick-fire questions to sharpen your brain in any subject!"}
          </p>

          {mode === 'drills' && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUBJECTS.filter(s => s.name !== 'Alphabet' || grade === 1).map(s => (
                <button
                  key={s.name}
                  onClick={() => setDrillSubject(s.name)}
                  className={cn(
                    "p-1.5 rounded-lg border-2 transition-all flex items-center gap-1",
                    drillSubject === s.name 
                      ? "border-primary bg-primary/5 text-primary scale-105" 
                      : "border-transparent bg-surface-container-low text-on-surface-variant opacity-60 hover:opacity-100"
                  )}
                  title={s.name}
                >
                  <span className="material-symbols-outlined text-sm">{s.icon}</span>
                  <span className="text-[8px] font-black uppercase truncate max-w-[40px]">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          onClick={startReview}
          disabled={(mode === 'topics' && history.length === 0) || isLoading}
          className={cn(
            "mt-4 w-full py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 transition-all text-xs",
            mode === 'topics' ? "bg-secondary" : "bg-primary"
          )}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">{mode === 'topics' ? 'bolt' : 'rocket_launch'}</span>
              {mode === 'topics' ? 'Start Topic Review' : `Drill Me: ${drillSubject}`}
            </>
          )}
        </button>
      </div>
    );
  }

  const card = session.cards[currentIdx];

  const checkMathAnswer = () => {
    if (userAnswer.trim() === card.a.trim()) {
      setFeedback('correct');
      setShowAnswer(true);
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-3xl shadow-sm border transition-colors flex flex-col h-full relative overflow-hidden",
      feedback === 'correct' ? "border-green-500 shadow-lg shadow-green-100" : feedback === 'wrong' ? "border-red-500 shadow-lg shadow-red-100" : "border-secondary"
    )}>
      <div className="flex justify-between items-center mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary">{session.topic}</p>
        <p className="text-[10px] font-black text-on-surface-variant">{currentIdx + 1} / {session.cards.length}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIdx + (showAnswer ? '-a' : '-q')}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="flex-1 flex flex-col items-center justify-center text-center p-4"
        >
          <span className="material-symbols-outlined text-secondary-container text-4xl mb-4 opacity-30">
            {feedback === 'correct' ? 'verified' : feedback === 'wrong' ? 'close' : showAnswer ? 'verified' : 'help_outline'}
          </span>
          <p className={cn("text-sm font-bold leading-relaxed", showAnswer ? "text-primary" : "text-on-surface", (showAnswer || mode === 'drills') ? "text-md" : "text-lg")}>
            {showAnswer ? card.a : card.q}
          </p>
          
          {!showAnswer && (
            <div className="mt-4 w-full max-w-[200px]">
              <input 
                type="text"
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setFeedback('none');
                }}
                onKeyPress={(e) => e.key === 'Enter' && checkDrillAnswer()}
                placeholder="Type your answer..."
                className="w-full text-center py-3 bg-surface-container-low border-2 border-surface-container rounded-xl text-lg font-black text-on-surface focus:ring-2 focus:ring-primary transition-all"
                autoFocus
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex flex-col gap-2">
        {!showAnswer ? (
          <>
            <button 
              onClick={checkDrillAnswer}
              disabled={!userAnswer.trim()}
              className="w-full py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all text-center"
            >
              Check Answer
            </button>
            <button 
              onClick={() => setShowAnswer(true)}
              className="w-full py-2 text-on-surface-variant opacity-40 text-[8px] font-black uppercase tracking-widest hover:opacity-100 transition-all"
            >
              I don't know, reveal answer
            </button>
          </>
        ) : (
          <button 
            onClick={nextCard}
            className={cn(
              "w-full py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all text-center",
              mode === 'drills' ? "bg-primary" : "bg-secondary"
            )}
          >
            {currentIdx === session.cards.length - 1 ? 'Finish Drills' : 'Got it! Next'}
          </button>
        )}
      </div>
    </div>
  );
}
