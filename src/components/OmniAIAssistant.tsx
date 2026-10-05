import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  HelpCircle, 
  BookOpen, 
  Heart, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { User } from '../types';
import { useUpgradeStatus } from '../utils/upgradeManager';
import AIUpgradeLockedBanner from './AIUpgradeLockedBanner';
import UpgradeButton from './UpgradeButton';

export default function OmniAIAssistant({ user }: { user: User }) {
  const status = useUpgradeStatus(user);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'homework' | 'bible' | 'quiz'>('homework');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSolveHomework = async () => {
    if (!status.isUpgraded) return;
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/ai/solve-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          grade: user.grade,
          studentName: user.name,
          subject: 'School'
        })
      });
      const data = await res.json();
      setResponse(data.answer || data.error || 'Failed to generate solution.');
    } catch (err: any) {
      setResponse('Error connecting to Miss Kelechi AI: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDevotional = async () => {
    if (!status.isUpgraded) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/ai/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMood: prompt || 'Academic Excellence & Moral Growth',
          studentName: user.name
        })
      });
      const data = await res.json();
      setResponse(data.devotional || data.error || 'Failed to generate devotional.');
    } catch (err: any) {
      setResponse('Error generating devotional: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePopQuiz = async () => {
    if (!status.isUpgraded) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: prompt || 'General Science & Faith',
          subject: 'General',
          grade: user.grade,
          count: 5
        })
      });
      const data = await res.json();
      if (Array.isArray(data.questions)) {
        const quizText = data.questions.map((q: any, i: number) => 
          `**Q${i+1} (${q.type}):** ${q.question}\n` +
          (q.options?.length ? q.options.map((opt: string, oi: number) => `   ${String.fromCharCode(65+oi)}) ${opt}`).join('\n') + '\n' : '') +
          `**Answer:** ${q.correctAnswer}\n*Hint:* ${q.hint}\n`
        ).join('\n---\n');
        setResponse(`### 🎯 Custom Pop Quiz for Grade ${user.grade}\n\n` + quizText);
      } else {
        setResponse('Failed to format pop quiz.');
      }
    } catch (err: any) {
      setResponse('Error generating pop quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#\\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-GB';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <>
      {/* Omnipresent Floating AI Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-4 rounded-2xl shadow-2xl border-2 border-amber-300/60 flex items-center gap-3 font-extrabold cursor-pointer group"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6 animate-bounce text-slate-950" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white animate-ping" />
        </div>
        <span className="hidden md:inline font-headline text-sm uppercase tracking-wider">
          Miss Kelechi AI
        </span>
      </motion.button>

      {/* Floating AI Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-8 z-50 w-[92vw] max-w-lg bg-slate-950/95 border border-amber-400/30 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden text-white flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-lg text-amber-300 flex items-center gap-2">
                    Miss Kelechi AI
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-mono">
                      Gemini 3.6
                    </span>
                  </h3>
                  <p className="text-xs text-white/60">Omnipresent Academic & Faith Tutor</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UpgradeButton user={user} variant="pill" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 p-2 bg-slate-900/80 border-b border-white/10 text-xs font-bold">
              <button
                onClick={() => { setActiveTab('homework'); setResponse(null); }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'homework' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Homework</span>
              </button>
              <button
                onClick={() => { setActiveTab('bible'); setResponse(null); }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'bible' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Faith & Devotion</span>
              </button>
              <button
                onClick={() => { setActiveTab('quiz'); setResponse(null); }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'quiz' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>Pop Quiz</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {!status.isUpgraded ? (
                <div className="py-4">
                  <AIUpgradeLockedBanner user={user} featureName="Miss Kelechi AI Assistant" />
                </div>
              ) : (
                <>
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
                      {activeTab === 'homework' && 'Ask Miss Kelechi any homework or subject question:'}
                      {activeTab === 'bible' && 'Enter your mood, challenge, or topic for a devotional:'}
                      {activeTab === 'quiz' && 'Enter subject or topic for a 5-question pop quiz:'}
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        activeTab === 'homework' ? "e.g., Explain how to calculate 20% discount on ₦5,000 in Math step-by-step" :
                        activeTab === 'bible' ? "e.g., I feel nervous about exams and want courage in faith" :
                        "e.g., Science: Water cycle or Fractions in Math"
                      }
                      rows={3}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-all resize-none"
                    />
                    
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          if (activeTab === 'homework') handleSolveHomework();
                          else if (activeTab === 'bible') handleDevotional();
                          else handleGeneratePopQuiz();
                        }}
                        disabled={loading || (!prompt.trim() && activeTab === 'homework')}
                        className="px-5 py-2.5 bg-amber-400 text-slate-950 hover:bg-amber-300 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Generate AI Response</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Response Display */}
                  {response && (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/40 p-5 rounded-2xl border border-amber-400/30 space-y-3 relative">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Miss Kelechi's Solution
                        </span>
                        <button
                          onClick={() => isSpeaking ? stopSpeaking() : speak(response)}
                          className="px-3 py-1 bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                        {response}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
