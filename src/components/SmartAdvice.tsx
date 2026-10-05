import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { SUBJECTS } from '../constants';
import { cn } from '../lib/utils';

interface HistoryItem {
  topicId: string;
  score: number;
  date: number;
}

export default function SmartAdvice({ user, history }: { user: User, history: HistoryItem[] }) {
  const [advice, setAdvice] = useState<{ subject: string, tip: string, encouragement: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdvice = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user.name,
          grade: user.grade,
          history
        })
      });
      const data = await res.json();
      if (res.ok && data.subject && data.tip) {
        setAdvice(data);
      } else {
        setAdvice({
          subject: "General Mathematics",
          tip: "Practice 3 word problems using Nigerian Naira (₦) today.",
          encouragement: `God has blessed you with great intelligence, ${user.name}!`
        });
      }
    } catch (err) {
      console.warn("Using offline fallback for smart advice:", err);
      setAdvice({
        subject: "Curriculum Insight",
        tip: "Read a chapter in the Library and take one Rapid-Fire Drill.",
        encouragement: `Keep up your diligent work, ${user.name}!`
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [user.grade]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="material-symbols-outlined text-8xl">psychology</span>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm animate-pulse">auto_awesome</span>
          </div>
          <h4 className="font-headline font-black text-on-surface text-sm uppercase tracking-widest">Miss Kelechi's Insight</h4>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-2">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-on-surface-variant uppercase animate-pulse tracking-tighter">Thinking...</p>
          </div>
        ) : advice ? (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase text-primary mb-1">{advice.subject}</p>
              <p className="text-sm font-bold text-on-surface leading-tight mb-2">"{advice.tip}"</p>
            </div>
            <p className="text-xs text-on-surface-variant italic border-l-2 border-primary/30 pl-3 py-1">
              {advice.encouragement}
            </p>
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-on-surface-variant">Tap the refresh to get a tip!</p>
          </div>
        )}

        <button 
          onClick={fetchAdvice}
          disabled={isLoading}
          className="mt-4 self-end p-2 hover:bg-surface-container rounded-lg transition-colors"
          title="Get new advice"
        >
          <span className={cn("material-symbols-outlined text-sm text-on-surface-variant", isLoading && "animate-spin")}>sync</span>
        </button>
      </div>
    </div>
  );
}
