import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Compass, 
  GraduationCap, 
  Target, 
  BookOpen, 
  Users, 
  Clock, 
  Send, 
  Sparkles 
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

export default function MissKelechiInfoCenter({ user }: { user: User }) {
  const defaultWelcome = `Hello, brilliant Grade ${user.grade} scholar **${user.name}**! 🌟 I am **Miss Kelechi**, your digital teacher and mentor.

Welcome to your personalized Student Portal! I am here to help you navigate our curriculum. You can study Mathematics, English Language, Science, Social Studies, Literature, and Bible Study! 

Select a subject above, read through the interactive term lessons, and take the quizzes. You can also explore our Digital Library with over 500 books or test your speed with Rapid-Fire drills! Please click any of the guide buttons below or ask me any custom question!`;

  const [bubbleText, setBubbleText] = useState(defaultWelcome);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#\\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-GB'; // British classic accent for Miss Kelechi
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleGuideTopic = (topicType: 'how-to' | 'lessons' | 'drills' | 'library' | 'parents' | 'duration') => {
    setError(null);
    let msg = "";
    if (topicType === 'how-to') {
      msg = `Excellent choice, ${user.name}! To get started, simply scroll up and tap any of your available subject cards (like Math or Science) to open the course. Under each subject, you can view lessons categorized across Term 1 to Term 4. Read the lessons, answer worksheets, participate in activities, and complete the final grade exam once you finish!`;
    } else if (topicType === 'lessons') {
      msg = `Our lessons follow expanded standard frameworks across four distinct Term blocks. Depending on your grade level, you can study Mathematics, English, Science, Social Studies, Literature, Bible Study, or Spelling. If you are in Grade 1, we also have a specialized Alphabet course with read-aloud support!`;
    } else if (topicType === 'drills') {
      msg = `Our dynamic Rapid-Fire Drills are standardized 20-question practice challenges that shuffle and refresh every single time. Try to get more than 60% of answers correct to build your grade-level mastery. If you score lower, the system will friendly guide you to redo it for extra practice!`;
    } else if (topicType === 'library') {
      msg = `Our marvelous Digital Library contains over 500 books, novels, and educational stories! Click the "Library" button in the bottom navigation to open it. Read exciting adventure stories, sci-fi novels, and Christian books to grow your spelling, literacy, and reading comprehension.`;
    } else if (topicType === 'parents') {
      msg = `Your parents have access to a dedicated Parent Portal on the landing page! They can track your learning speed in real-time, view your practice test scores, and receive supportive warnings/emails if you score 60% or lower on a lesson, helping you focus on redo topics.`;
    } else if (topicType === 'duration') {
      let duration = "up to 1 year";
      if (user.grade === 1) duration = "exactly 40 weeks";
      else if (user.grade >= 7 && user.grade <= 9) duration = "1 year and 2 months";
      else if (user.grade === 10) duration = "1 year and 4 months";

      msg = `Our standard curriculum timelines are designed for deep academic growth. For your Grade ${user.grade}, it is designed to take ${duration} to completely finish. Work through your lessons and timetables steadily to graduate to the next grade level!`;
    }
    setBubbleText(msg);
    speakText(msg);
  };

  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const query = chatInput;
    setChatInput("");
    setIsLoading(true);
    setError(null);
    setBubbleText("Let me review our curriculum and prepare some professional advice for you...");

    try {
      const response = await fetch('/api/kelechi/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          userName: user.name,
          userGrade: user.grade
        })
      });

      if (!response.ok) {
        throw new Error("Could not connect to Miss Kelechi right now.");
      }

      const data = await response.json();
      setBubbleText(data.reply);
      speakText(data.reply);

    } catch (err: any) {
      console.error(err);
      setError("I apologize, my dear, but I had a little trouble connecting to the school database. Please check your network or select a guide topic below!");
      
      // Smart Fallback offline responses
      let fallbackText = "I'm always ready to guide you! Choose a subject card above to start, or choose your weekly Timetable in the bottom menu.";
      const q = query.toLowerCase();
      if (q.includes("lesson") || q.includes("start") || q.includes("where") || q.includes("go")) {
        fallbackText = "To begin, select any subject card above (such as Mathematics or Literature). Inside, you will find term-by-term lessons, worksheets, interactive quizzes, and rapid drills!";
      } else if (q.includes("duration") || q.includes("time") || q.includes("long") || q.includes("week") || q.includes("month") || q.includes("year")) {
        let duration = "up to a year";
        if (user.grade === 1) duration = "exactly 40 weeks";
        else if (user.grade >= 7 && user.grade <= 9) duration = "1 year and 2 months";
        else if (user.grade === 10) duration = "1 year and 4 months";
        fallbackText = `For Grade ${user.grade}, the academic timeline is structured for ${duration} of thorough learning to complete all Term 1-4 coursework.`;
      } else if (q.includes("subject") || q.includes("curriculum") || q.includes("learn")) {
        fallbackText = "We offer a rich, standard-aligned African curriculum containing Math, English, Science, Social Studies, Literature, Bible Study, and Spelling. Tap any of them to begin!";
      } else if (q.includes("exam") || q.includes("test") || q.includes("quiz") || q.includes("fail")) {
        fallbackText = "Do not be discouraged by difficult questions! Quizzes test your memory, while drills build rapid recall. Get at least 60% on quizzes, and pass the Final Exam at 100% progress to graduate!";
      }
      setBubbleText(fallbackText);
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown Helper
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(formattedLine.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="font-extrabold text-on-surface">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(formattedLine.substring(lastIndex));

      return (
        <p key={idx} className="mb-2 last:mb-0 text-sm md:text-base leading-relaxed text-on-surface-variant">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div id="miss-kelechi-info-center" className="bg-white rounded-[2.5rem] shadow-xl border-4 border-primary/10 overflow-hidden flex flex-col max-w-4xl mx-auto my-12 relative">
      
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-tr-[5rem] pointer-events-none" />

      {/* Header Panel */}
      <div className="bg-gradient-to-r from-primary via-primary-dim to-secondary p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-surface-container relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/40 flex-shrink-0 shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" 
              alt="Miss Kelechi Portrait" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-xl font-black">Miss Kelechi</h3>
              <span className="bg-green-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                AI Guide
              </span>
            </div>
            <p className="text-xs text-white/80 font-medium">World-Class Assistant, Counselor & Mentor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={isSpeaking ? stopSpeaking : () => speakText(bubbleText)}
            className={cn(
              "p-2.5 rounded-xl text-white hover:bg-white/15 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold border border-white/20 shadow-sm cursor-pointer",
              isSpeaking ? "bg-red-500/30 text-red-100 border-red-500/50" : ""
            )}
            title={isSpeaking ? "Mute Miss Kelechi" : "Hear Miss Kelechi Speak"}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5 animate-bounce" /> : <Volume2 className="w-5 h-5" />}
            <span>{isSpeaking ? 'Mute' : 'Speak Aloud'}</span>
          </button>
        </div>
      </div>

      {/* Speech Bubble / Information Area */}
      <div className="p-6 md:p-8 bg-surface-container-low flex flex-col gap-4 relative z-10">
        <div className="relative bg-white rounded-3xl p-6 border border-primary/10 shadow-sm text-left">
          <div className="absolute top-6 -left-2 w-4 h-4 bg-white border-l border-b border-primary/10 transform rotate-45" />
          
          <div className="relative z-10">
            {renderFormattedText(bubbleText)}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-bold text-primary/80 border-t border-primary/5 pt-3">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Standard British-Colonial Accent Enabled
            </span>
            {!isSpeaking && (
              <button 
                onClick={() => speakText(bubbleText)} 
                className="underline text-primary hover:text-primary-dim transition-colors flex items-center gap-1 cursor-pointer"
              >
                🔊 Speak loud
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center shadow-inner">
            {error}
          </div>
        )}
      </div>

      {/* Interactive Guide Chips */}
      <div className="px-6 pb-4 bg-surface-container-low relative z-10">
        <p className="text-[10px] font-black uppercase tracking-wider text-on-surface/50 ml-1 mb-3">
          💡 Tap to ask Miss Kelechi about your curriculum:
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleGuideTopic('how-to')}
            className="px-4 py-2.5 bg-white hover:bg-primary-container hover:text-primary border border-surface-container rounded-2xl text-xs font-bold text-on-surface transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Compass className="w-4 h-4 text-primary" />
            How to study here?
          </button>
          <button
            onClick={() => handleGuideTopic('lessons')}
            className="px-4 py-2.5 bg-white hover:bg-primary-container hover:text-primary border border-surface-container rounded-2xl text-xs font-bold text-on-surface transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-secondary" />
            Where are terms lessons?
          </button>
          <button
            onClick={() => handleGuideTopic('drills')}
            className="px-4 py-2.5 bg-white hover:bg-primary-container hover:text-primary border border-surface-container rounded-2xl text-xs font-bold text-on-surface transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Target className="w-4 h-4 text-tertiary" />
            Rapid Drills & redo
          </button>
          <button
            onClick={() => handleGuideTopic('library')}
            className="px-4 py-2.5 bg-white hover:bg-primary-container hover:text-primary border border-surface-container rounded-2xl text-xs font-bold text-on-surface transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            Access 500+ Library Books
          </button>
          <button
            onClick={() => handleGuideTopic('parents')}
            className="px-4 py-2.5 bg-white hover:bg-primary-container hover:text-primary border border-surface-container rounded-2xl text-xs font-bold text-on-surface transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Users className="w-4 h-4 text-secondary" />
            Parents monitoring portal
          </button>
          <button
            onClick={() => handleGuideTopic('duration')}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-xs font-black text-amber-900 transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-500" />
            How long to graduate?
          </button>
        </div>
      </div>

      {/* Custom query search box */}
      <form 
        onSubmit={handleCustomQuery}
        className="p-5 bg-white border-t border-surface-container flex items-center gap-3 relative z-10"
      >
        <input 
          type="text" 
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={isLoading ? "Miss Kelechi is thinking..." : "Ask Miss Kelechi anything about lessons, schedules, or timelines..."}
          disabled={isLoading}
          className="flex-1 px-5 py-3.5 bg-surface-container-low border border-surface-container rounded-2xl text-xs md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!chatInput.trim() || isLoading}
          className="p-3.5 bg-primary hover:bg-primary-dim disabled:opacity-50 text-white rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
