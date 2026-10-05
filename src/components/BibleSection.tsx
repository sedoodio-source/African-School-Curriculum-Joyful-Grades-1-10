import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Sparkles, Volume2, VolumeX, Bookmark, BookmarkCheck,
  Search, Share2, Copy, Check, Heart, Shield, Award, Lightbulb,
  Send, RefreshCw, ChevronRight, ChevronLeft, ArrowRight, BookMarked,
  Sun, MessageSquare, Compass, HelpCircle, Star, Filter, ZoomIn, ZoomOut,
  Maximize2, Play, Pause, RotateCcw, CheckSquare, Calendar
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';
import BibleStudyPlanner from './BibleStudyPlanner';
import { 
  BIBLE_BOOKS_CATALOG, 
  DETAILED_BIBLE_BOOKS, 
  BIBLE_TOPICS, 
  DAILY_DEVOTIONALS, 
  AI_BIBLE_PROMPTS,
  BibleBook,
  BibleTopic,
  DailyDevotional
} from '../data/bibleData';

interface BibleSectionProps {
  user: User;
  onNavigateToTab?: (tab: string) => void;
  isEmbedded?: boolean;
}

interface BibleChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  bookContext?: string;
  keyVerse?: string;
}

export default function BibleSection({ user, onNavigateToTab, isEmbedded = false }: BibleSectionProps) {
  // Navigation View Modes
  const [activeView, setActiveView] = useState<'reader' | 'planner' | 'ai_ask' | 'devotional' | 'topics' | 'bookmarks'>('reader');

  // Reader State
  const [selectedBookId, setSelectedBookId] = useState<string>('proverbs');
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(3);
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'Old Testament' | 'New Testament'>('all');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [translation, setTranslation] = useState<'KJV' | 'NIV' | 'ESV'>('KJV');

  // Highlighting & Bookmarks State
  const [bookmarkedVerses, setBookmarkedVerses] = useState<{ id: string; book: string; chapter: number; verse: number; text: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem(`asc_bible_bookmarks_${user.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'proverbs-3-5',
          book: 'Proverbs',
          chapter: 3,
          verse: 5,
          text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
          date: new Date().toLocaleDateString()
        },
        {
          id: 'philippians-4-13',
          book: 'Philippians',
          chapter: 4,
          verse: 13,
          text: 'I can do all things through Christ which strengtheneth me.',
          date: new Date().toLocaleDateString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [highlightedVerses, setHighlightedVerses] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`asc_bible_highlights_${user.id}`);
      return saved ? JSON.parse(saved) : { 'proverbs-3-5': 'bg-amber-100 dark:bg-amber-900/40 text-amber-950 font-semibold' };
    } catch {
      return {};
    }
  });

  // Copied feedback toast
  const [copiedVerseId, setCopiedVerseId] = useState<string | null>(null);

  // Audio Speech (TTS)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState<string>('');

  // AI Chat Assistant State
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<BibleChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`asc_bible_chat_${user.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: `**Peace be with you, ${user.name}!** 📖✨\n\nI am Miss Kelechi, your Scripture & Bible Scholar. Whether you are curious about God's wisdom in **Proverbs**, seeking courage before exams in **Philippians 4**, or learning how Jesus walked with love in the **Gospels**, I am here to help you understand God's Word.\n\n*What question do you have about the Bible today?*`,
          timestamp: Date.now()
        }
      ];
    } catch {
      return [];
    }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Devotional state
  const [selectedDevotionalIndex, setSelectedDevotionalIndex] = useState(0);
  const [devotionalPledgeDone, setDevotionalPledgeDone] = useState(false);

  // Bible Study Planner State
  const [readChapters, setReadChapters] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem(`asc_bible_read_chapters_${user.id}`);
      return saved ? JSON.parse(saved) : {
        'proverbs': [1, 2, 3],
        'psalms': [23, 91],
        'philippians': [4],
        'john': [1]
      };
    } catch {
      return { 'proverbs': [1, 2, 3] };
    }
  });

  const [completedSessions, setCompletedSessions] = useState<Record<string, { completedAt: string; reflection?: string; prayer?: string }>>(() => {
    try {
      const saved = localStorage.getItem(`asc_bible_completed_sessions_${user.id}`);
      return saved ? JSON.parse(saved) : {
        'proverbs-wisdom-day-1': {
          completedAt: new Date().toLocaleDateString(),
          reflection: 'Reverence for God is where all wisdom and understanding start.'
        }
      };
    } catch {
      return {};
    }
  });

  const [customSessions, setCustomSessions] = useState<Array<{
    id: string;
    title: string;
    bookId: string;
    bookName: string;
    chapters: number[];
    dateAdded: string;
    notes?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem(`asc_bible_custom_sessions_${user.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'cs-sample-1',
          title: 'Sunday Morning Psalm of Praise',
          bookId: 'psalms',
          bookName: 'Psalms',
          chapters: [100],
          dateAdded: new Date().toLocaleDateString(),
          notes: 'Entering His gates with thanksgiving and praise.'
        }
      ];
    } catch {
      return [];
    }
  });

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`asc_bible_bookmarks_${user.id}`, JSON.stringify(bookmarkedVerses));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedVerses, user.id]);

  // Save highlights to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`asc_bible_highlights_${user.id}`, JSON.stringify(highlightedVerses));
    } catch (e) {
      console.error(e);
    }
  }, [highlightedVerses, user.id]);

  // Save planner data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`asc_bible_read_chapters_${user.id}`, JSON.stringify(readChapters));
    } catch (e) {
      console.error(e);
    }
  }, [readChapters, user.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`asc_bible_completed_sessions_${user.id}`, JSON.stringify(completedSessions));
    } catch (e) {
      console.error(e);
    }
  }, [completedSessions, user.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`asc_bible_custom_sessions_${user.id}`, JSON.stringify(customSessions));
    } catch (e) {
      console.error(e);
    }
  }, [customSessions, user.id]);

  const handleToggleChapterRead = (bookId: string, chapterNumber: number) => {
    setReadChapters(prev => {
      const currentList = prev[bookId] || [];
      if (currentList.includes(chapterNumber)) {
        return {
          ...prev,
          [bookId]: currentList.filter(c => c !== chapterNumber)
        };
      } else {
        return {
          ...prev,
          [bookId]: [...currentList, chapterNumber].sort((a, b) => a - b)
        };
      }
    });
  };

  const handleMarkAllBookChapters = (bookId: string, totalChapters: number, markRead: boolean) => {
    setReadChapters(prev => {
      if (markRead) {
        const allChapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
        return {
          ...prev,
          [bookId]: allChapters
        };
      } else {
        return {
          ...prev,
          [bookId]: []
        };
      }
    });
  };

  const handleToggleSessionCompleted = (sessionId: string, reflection?: string) => {
    setCompletedSessions(prev => {
      if (prev[sessionId]) {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      } else {
        return {
          ...prev,
          [sessionId]: {
            completedAt: new Date().toLocaleDateString(),
            reflection: reflection || ''
          }
        };
      }
    });
  };

  const handleAddCustomSession = (session: { title: string; bookId: string; bookName: string; chapters: number[]; notes?: string }) => {
    const newSession = {
      ...session,
      id: `cs-${Date.now()}`,
      dateAdded: new Date().toLocaleDateString()
    };
    setCustomSessions(prev => [newSession, ...prev]);
  };

  const handleDeleteCustomSession = (id: string) => {
    setCustomSessions(prev => prev.filter(s => s.id !== id));
  };

  // Save chat messages
  useEffect(() => {
    try {
      localStorage.setItem(`asc_bible_chat_${user.id}`, JSON.stringify(chatMessages));
    } catch (e) {
      console.error(e);
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, user.id]);

  // Current active book & chapter data
  const currentBookData: BibleBook = DETAILED_BIBLE_BOOKS[selectedBookId] || DETAILED_BIBLE_BOOKS['proverbs'];
  const currentChapter = currentBookData.chapters.find(c => c.chapterNumber === selectedChapterNum) || currentBookData.chapters[0] || {
    chapterNumber: 1,
    title: `${currentBookData.name} Chapter 1`,
    verses: [
      { verseNumber: 1, text: `${currentBookData.keyVerse.text}` }
    ]
  };

  // Filtered books list
  const filteredBooks = BIBLE_BOOKS_CATALOG.filter(book => {
    const matchesTestament = testamentFilter === 'all' || book.testament === testamentFilter;
    const matchesSearch = book.name.toLowerCase().includes(bookSearchQuery.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  // Toggle Bookmark
  const toggleBookmark = (bookName: string, chapter: number, verse: number, text: string) => {
    const id = `${bookName.toLowerCase()}-${chapter}-${verse}`;
    const exists = bookmarkedVerses.some(b => b.id === id);
    if (exists) {
      setBookmarkedVerses(prev => prev.filter(b => b.id !== id));
    } else {
      setBookmarkedVerses(prev => [
        ...prev,
        {
          id,
          book: bookName,
          chapter,
          verse,
          text,
          date: new Date().toLocaleDateString()
        }
      ]);
    }
  };

  // Toggle Highlight
  const toggleHighlight = (verseId: string, colorClass: string) => {
    setHighlightedVerses(prev => {
      if (prev[verseId] === colorClass) {
        const copy = { ...prev };
        delete copy[verseId];
        return copy;
      }
      return { ...prev, [verseId]: colorClass };
    });
  };

  // Copy verse to clipboard
  const handleCopyVerse = (text: string, ref: string, id: string) => {
    navigator.clipboard.writeText(`"${text}" — ${ref} (${translation})`);
    setCopiedVerseId(id);
    setTimeout(() => setCopiedVerseId(null), 2500);
  };

  // Text to Speech
  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner audio
    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick English / British voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-NG') || v.lang.includes('en-US'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingText('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingText('');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when unmounted
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Send question to AI
  const handleSendAiQuestion = async (queryText?: string) => {
    const q = (queryText || aiQuestion).trim();
    if (!q || isAiLoading) return;

    const userMessage: BibleChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: Date.now(),
      bookContext: `${currentBookData.name} ${currentChapter.chapterNumber}`
    };

    setChatMessages(prev => [...prev, userMessage]);
    setAiQuestion('');
    setIsAiLoading(true);
    setAiError(null);

    // Switch to AI tab if not already on it
    if (activeView !== 'ai_ask') {
      setActiveView('ai_ask');
    }

    try {
      const response = await fetch('/api/bible/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          book: currentBookData.name,
          chapter: currentChapter.chapterNumber,
          grade: user.grade || 5,
          studentName: user.name,
          conversationHistory: chatMessages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.answer || "God's word is rich with truth and wisdom. Let us continue meditating upon His promises!";

      const aiMessage: BibleChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("AI Bible Ask error:", err);
      // Smart pedagogical fallback if offline
      const fallbackResponse = `📖 **Biblical Insights on "${q}"**\n\n*“Your word is a lamp to my feet and a light to my path.” (Psalm 119:105)*\n\nMy dear scholar **${user.name}**, God’s Word teaches us that true wisdom begins with the fear of the Lord (Proverbs 9:10). In your academic journey and daily life, remember:\n\n1. **Diligence in Work**: Whatever you do in your lessons and homework, work with all your heart as unto the Lord (Colossians 3:23).\n2. **Confidence in God**: You can overcome any difficult subject through Christ who gives you strength (Philippians 4:13).\n3. **Love & Honor**: Honor your parents and teachers with respect and kindness (Ephesians 6:1-2).\n\n🙏 **Prayer**: *Lord, fill ${user.name}’s heart with divine understanding, memory retention, and joy in studying Your Word. Amen.*`;

      const aiMessage: BibleChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackResponse,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick ask from verse
  const handleAskAboutVerse = (verseText: string, verseRef: string) => {
    const question = `Please explain the deep spiritual meaning and school life application of this verse: "${verseText}" (${verseRef})`;
    handleSendAiQuestion(question);
  };

  const currentDevotional = DAILY_DEVOTIONALS[selectedDevotionalIndex] || DAILY_DEVOTIONALS[0];

  return (
    <div id="bible-section-container" className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">church</span>
              <span>Holy Scriptures & AI Scripture Scholar</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-black tracking-tight text-white leading-tight">
              The Living Word <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">& Bible AI Scholar</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
              Read God's Holy Word, explore the Old and New Testaments, memorize scripture, and ask Miss Kelechi deep questions for study, character, and spiritual excellence.
            </p>
          </div>

          {/* Quick Stats / Actions */}
          <div className="flex flex-wrap items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <button
              id="bible-study-planner-quick-btn"
              onClick={() => setActiveView('planner')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              <CheckSquare className="w-4 h-4 text-slate-950" />
              <span>Study Planner</span>
            </button>
            <button
              id="bible-daily-verse-quick-btn"
              onClick={() => setActiveView('devotional')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/10 active:scale-95"
            >
              <Sun className="w-4 h-4 text-amber-300" />
              <span>Daily Verse</span>
            </button>
            <button
              id="bible-ask-ai-quick-btn"
              onClick={() => setActiveView('ai_ask')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/10 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask Bible AI</span>
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'reader', label: 'Bible Reader', icon: BookOpen, count: '66 Books' },
            { id: 'planner', label: 'Study Planner', icon: CheckSquare, badge: 'Track Progress' },
            { id: 'ai_ask', label: 'Ask Bible AI (Miss Kelechi)', icon: Sparkles, badge: 'Interactive' },
            { id: 'devotional', label: 'Daily Devotionals', icon: Sun },
            { id: 'topics', label: 'Topics & Life Lessons', icon: Lightbulb },
            { id: 'bookmarks', label: 'My Bookmarks', icon: Bookmark, count: bookmarkedVerses.length.toString() }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                id={`bible-tab-${tab.id}`}
                onClick={() => setActiveView(tab.id as any)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all",
                  isActive 
                    ? "bg-white text-slate-900 shadow-xl shadow-black/20 scale-105" 
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-black tracking-wider rounded-md bg-amber-400 text-slate-950">
                    {tab.badge}
                  </span>
                )}
                {tab.count && (
                  <span className={cn(
                    "px-2 py-0.5 text-[11px] font-bold rounded-full",
                    isActive ? "bg-slate-100 text-slate-700" : "bg-white/10 text-slate-300"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        {/* 1. BIBLE READER VIEW */}
        {activeView === 'reader' && (
          <motion.div
            key="reader-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Sidebar: Book & Chapter Navigator */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-black text-lg text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span>Select Book</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {filteredBooks.length} Books
                  </span>
                </div>

                {/* Search & Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="bible-book-search-input"
                      type="text"
                      placeholder="Search Bible book..."
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Testament Filter Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      id="filter-testament-all"
                      onClick={() => setTestamentFilter('all')}
                      className={cn(
                        "py-1.5 rounded-lg transition-all text-center",
                        testamentFilter === 'all' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      All (66)
                    </button>
                    <button
                      id="filter-testament-ot"
                      onClick={() => setTestamentFilter('Old Testament')}
                      className={cn(
                        "py-1.5 rounded-lg transition-all text-center",
                        testamentFilter === 'Old Testament' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      Old (39)
                    </button>
                    <button
                      id="filter-testament-nt"
                      onClick={() => setTestamentFilter('New Testament')}
                      className={cn(
                        "py-1.5 rounded-lg transition-all text-center",
                        testamentFilter === 'New Testament' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      New (27)
                    </button>
                  </div>
                </div>

                {/* Books Scroll List */}
                <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                  {filteredBooks.map(book => {
                    const isSelected = selectedBookId === book.id;
                    const hasFullText = !!DETAILED_BIBLE_BOOKS[book.id];
                    return (
                      <button
                        key={book.id}
                        id={`select-book-${book.id}`}
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setSelectedChapterNum(1);
                        }}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between text-sm transition-all group",
                          isSelected 
                            ? "bg-indigo-600 text-white font-bold shadow-md" 
                            : "hover:bg-slate-100 text-slate-700 font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            book.testament === 'Old Testament' ? "bg-amber-400" : "bg-emerald-400",
                            isSelected && "bg-white"
                          )} />
                          <span>{book.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs opacity-75">
                          <span>{book.totalChapters} ch</span>
                          {hasFullText && (
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-black",
                              isSelected ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"
                            )}>
                              Read
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Chapter Selector */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Chapters in {currentBookData.name}
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      Ch. {selectedChapterNum}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {Array.from({ length: currentBookData.chaptersCount || 1 }, (_, i) => i + 1).map(chNum => {
                      const isSelected = selectedChapterNum === chNum;
                      const hasText = currentBookData.chapters.some(c => c.chapterNumber === chNum);
                      return (
                        <button
                          key={chNum}
                          id={`select-chapter-${chNum}`}
                          onClick={() => setSelectedChapterNum(chNum)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all",
                            isSelected 
                              ? "bg-amber-500 text-slate-950 shadow-md scale-110" 
                              : hasText
                                ? "bg-slate-100 text-slate-800 hover:bg-indigo-50 hover:text-indigo-600"
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          {chNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Book Summary Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-[2rem] p-6 border border-indigo-100/80 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>Book Theme: {currentBookData.name}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {currentBookData.summary}
                </p>
                <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Key Scripture</div>
                  <p className="text-xs font-semibold text-slate-900 italic">
                    "{currentBookData.keyVerse.text}"
                  </p>
                  <div className="text-[11px] font-bold text-slate-500 text-right">
                    — {currentBookData.keyVerse.reference}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Scripture Reader Panel */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
                {/* Scripture Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                      <span>{currentBookData.testament}</span>
                      <span>•</span>
                      <span>{currentBookData.category}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-headline font-black text-slate-900">
                      {currentBookData.name} <span className="text-amber-500">Chapter {selectedChapterNum}</span>
                    </h2>
                    {currentChapter.title && (
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        {currentChapter.title}
                      </p>
                    )}
                  </div>

                  {/* Toolbar Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Translation Selector */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      {(['KJV', 'NIV', 'ESV'] as const).map(trans => (
                        <button
                          key={trans}
                          id={`select-translation-${trans}`}
                          onClick={() => setTranslation(trans)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg transition-all",
                            translation === trans ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                          )}
                        >
                          {trans}
                        </button>
                      ))}
                    </div>

                    {/* Font Size Selector */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                      <button
                        id="font-size-sm"
                        onClick={() => setFontSize('sm')}
                        className={cn("px-2 py-1 rounded-lg", fontSize === 'sm' && "bg-white text-indigo-600 shadow-sm")}
                        title="Small font"
                      >
                        A-
                      </button>
                      <button
                        id="font-size-md"
                        onClick={() => setFontSize('md')}
                        className={cn("px-2 py-1 rounded-lg", fontSize === 'md' && "bg-white text-indigo-600 shadow-sm")}
                        title="Medium font"
                      >
                        A
                      </button>
                      <button
                        id="font-size-lg"
                        onClick={() => setFontSize('lg')}
                        className={cn("px-2 py-1 rounded-lg", fontSize === 'lg' && "bg-white text-indigo-600 shadow-sm")}
                        title="Large font"
                      >
                        A+
                      </button>
                    </div>

                    {/* Audio Narration Button */}
                    <button
                      id="listen-chapter-audio-btn"
                      onClick={() => {
                        const allVersesText = currentChapter.verses.map(v => `${v.verseNumber}. ${v.text}`).join(' ');
                        handleSpeakText(`${currentBookData.name} Chapter ${selectedChapterNum}. ${allVersesText}`);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95",
                        isSpeaking 
                          ? "bg-amber-500 text-slate-950 animate-pulse" 
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      )}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeaking ? "Stop Reading" : "Read Aloud"}</span>
                    </button>

                    {/* Chapter Read Status Toggle Checkbox */}
                    <button
                      id="chapter-read-toggle-reader-btn"
                      onClick={() => handleToggleChapterRead(currentBookData.id, selectedChapterNum)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border",
                        (readChapters[currentBookData.id] || []).includes(selectedChapterNum)
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/20"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      )}
                      title={(readChapters[currentBookData.id] || []).includes(selectedChapterNum) ? "Chapter marked as completed in Study Planner" : "Mark chapter as completed in Study Planner"}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>
                        {(readChapters[currentBookData.id] || []).includes(selectedChapterNum)
                          ? "Read ✓" 
                          : "Mark Read"}
                      </span>
                    </button>

                    {/* Quick Link to Study Planner */}
                    <button
                      id="open-planner-from-reader-btn"
                      onClick={() => setActiveView('planner')}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-all"
                      title="Open Bible Study Planner"
                    >
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Planner</span>
                    </button>
                  </div>
                </div>

                {/* Chapter Theme Highlight */}
                {currentChapter.theme && (
                  <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3">
                    <Sun className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-0.5">Chapter Focus</h4>
                      <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        {currentChapter.theme}
                      </p>
                    </div>
                  </div>
                )}

                {/* Verses List */}
                <div className={cn(
                  "space-y-4 font-serif leading-relaxed text-slate-800",
                  fontSize === 'sm' && "text-sm leading-relaxed",
                  fontSize === 'md' && "text-base leading-loose",
                  fontSize === 'lg' && "text-lg leading-loose",
                  fontSize === 'xl' && "text-xl leading-loose"
                )}>
                  {currentChapter.verses.map((verse) => {
                    const verseId = `${currentBookData.id}-${selectedChapterNum}-${verse.verseNumber}`;
                    const isBookmarked = bookmarkedVerses.some(b => b.id === verseId);
                    const highlightClass = highlightedVerses[verseId] || '';
                    const isCopied = copiedVerseId === verseId;

                    return (
                      <div
                        key={verse.verseNumber}
                        id={`verse-row-${verseId}`}
                        className={cn(
                          "group p-3 rounded-2xl transition-all hover:bg-slate-50 relative flex flex-col sm:flex-row sm:items-start justify-between gap-3",
                          highlightClass
                        )}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-50 font-sans text-xs font-black text-indigo-700 flex items-center justify-center mt-0.5 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {verse.verseNumber}
                          </span>
                          <p className="font-normal">
                            {verse.text}
                          </p>
                        </div>

                        {/* Verse Action Bar */}
                        <div className="shrink-0 flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                          {/* Bookmark */}
                          <button
                            id={`bookmark-btn-${verseId}`}
                            onClick={() => toggleBookmark(currentBookData.name, selectedChapterNum, verse.verseNumber, verse.text)}
                            title={isBookmarked ? "Remove bookmark" : "Bookmark verse"}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              isBookmarked ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                            )}
                          >
                            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>

                          {/* Highlight Yellow */}
                          <button
                            id={`highlight-btn-${verseId}`}
                            onClick={() => toggleHighlight(verseId, 'bg-amber-100 text-amber-950 font-semibold')}
                            title="Highlight in gold"
                            className="w-5 h-5 rounded-full bg-amber-200 hover:ring-2 hover:ring-amber-400 transition-all"
                          />

                          {/* Highlight Green */}
                          <button
                            id={`highlight-green-btn-${verseId}`}
                            onClick={() => toggleHighlight(verseId, 'bg-emerald-100 text-emerald-950 font-semibold')}
                            title="Highlight in green"
                            className="w-5 h-5 rounded-full bg-emerald-200 hover:ring-2 hover:ring-emerald-400 transition-all"
                          />

                          {/* Audio read verse */}
                          <button
                            id={`audio-verse-btn-${verseId}`}
                            onClick={() => handleSpeakText(`${currentBookData.name} ${selectedChapterNum} verse ${verse.verseNumber}: ${verse.text}`)}
                            title="Read verse aloud"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Copy */}
                          <button
                            id={`copy-verse-btn-${verseId}`}
                            onClick={() => handleCopyVerse(verse.text, `${currentBookData.name} ${selectedChapterNum}:${verse.verseNumber}`, verseId)}
                            title="Copy verse"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>

                          {/* Ask AI about this verse */}
                          <button
                            id={`ask-ai-verse-btn-${verseId}`}
                            onClick={() => handleAskAboutVerse(verse.text, `${currentBookData.name} ${selectedChapterNum}:${verse.verseNumber}`)}
                            title="Ask Miss Kelechi to explain this verse"
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Explain</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chapter Navigation Footer */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    id="prev-chapter-btn"
                    disabled={selectedChapterNum <= 1}
                    onClick={() => setSelectedChapterNum(prev => Math.max(1, prev - 1))}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Chapter</span>
                  </button>

                  <div className="text-xs font-bold text-slate-500">
                    {currentBookData.name} {selectedChapterNum} of {currentBookData.chaptersCount}
                  </div>

                  <button
                    id="next-chapter-btn"
                    disabled={selectedChapterNum >= currentBookData.chaptersCount}
                    onClick={() => setSelectedChapterNum(prev => Math.min(currentBookData.chaptersCount, prev + 1))}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md"
                  >
                    <span>Next Chapter</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. BIBLE STUDY PLANNER VIEW */}
        {activeView === 'planner' && (
          <motion.div
            key="planner-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <BibleStudyPlanner
              user={user}
              onOpenChapter={(bookId, chapterNumber) => {
                setSelectedBookId(bookId);
                setSelectedChapterNum(chapterNumber);
                setActiveView('reader');
              }}
              onAskAi={(question) => {
                handleSendAiQuestion(question);
              }}
              readChapters={readChapters}
              onToggleChapterRead={handleToggleChapterRead}
              onMarkAllBookChapters={handleMarkAllBookChapters}
              completedSessions={completedSessions}
              onToggleSessionCompleted={handleToggleSessionCompleted}
              customSessions={customSessions}
              onAddCustomSession={handleAddCustomSession}
              onDeleteCustomSession={handleDeleteCustomSession}
            />
          </motion.div>
        )}

        {/* 3. ASK AI BIBLE SCHOLAR VIEW */}
        {activeView === 'ai_ask' && (
          <motion.div
            key="ai-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: Instant Biblical Starters */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-base">
                  <HelpCircle className="w-5 h-5 text-amber-500" />
                  <span>Popular Bible Questions</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Tap any question to receive deep scripture references, historical background, and character application.
                </p>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                  {AI_BIBLE_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      id={`ai-prompt-btn-${idx}`}
                      onClick={() => handleSendAiQuestion(prompt.question)}
                      className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group space-y-1.5"
                    >
                      <div className="text-[11px] font-bold text-indigo-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">{prompt.icon}</span>
                        <span>{prompt.category}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900 leading-snug">
                        {prompt.question}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Verse Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-6 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Scholar's Memory Promise</span>
                </div>
                <p className="text-xs font-serif italic text-amber-950 leading-relaxed font-semibold">
                  "The fear of the LORD is the beginning of wisdom: and the knowledge of the holy is understanding."
                </p>
                <div className="text-[11px] font-bold text-amber-800 text-right">
                  — Proverbs 9:10
                </div>
              </div>
            </div>

            {/* Right: Interactive Chat Dialog */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80 flex flex-col h-[650px]">
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline font-black text-slate-900 text-base">
                        Miss Kelechi's Bible Scholar
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Scripture Insights & Christian Character Guidance for Grade {user.grade}
                      </p>
                    </div>
                  </div>

                  <button
                    id="clear-chat-history-btn"
                    onClick={() => {
                      if (confirm("Reset Bible AI conversation?")) {
                        setChatMessages([]);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-xs font-bold flex items-center gap-1"
                    title="Clear Chat"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2 scrollbar-thin">
                  {chatMessages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start gap-3.5",
                          isUser ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {/* Avatar */}
                        <div className={cn(
                          "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          isUser ? "bg-indigo-600 text-white font-bold text-sm" : "bg-amber-500 text-slate-950"
                        )}>
                          {isUser ? user.name[0]?.toUpperCase() : <BookOpen className="w-4 h-4" />}
                        </div>

                        {/* Content Card */}
                        <div className={cn(
                          "max-w-[85%] rounded-[1.8rem] p-5 space-y-3 shadow-sm",
                          isUser 
                            ? "bg-indigo-600 text-white rounded-tr-none font-medium text-sm" 
                            : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/80 font-sans text-sm"
                        )}>
                          {!isUser && (
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                <span>Bible Scholar Response</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  id={`speak-msg-${msg.id}`}
                                  onClick={() => handleSpeakText(msg.text)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
                                  title="Listen to explanation"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`copy-msg-${msg.id}`}
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.text);
                                    setCopiedVerseId(msg.id);
                                    setTimeout(() => setCopiedVerseId(null), 2000);
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
                                  title="Copy response"
                                >
                                  {copiedVerseId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Message Body with clean paragraph rendering */}
                          <div className="prose prose-sm max-w-none text-inherit leading-relaxed whitespace-pre-line">
                            {msg.text}
                          </div>

                          <div className={cn(
                            "text-[10px] text-right pt-1 opacity-70",
                            isUser ? "text-indigo-200" : "text-slate-400"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isAiLoading && (
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 animate-pulse">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-[1.8rem] rounded-tl-none p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Searching the Scriptures with Miss Kelechi...</span>
                        </div>
                        <div className="h-2 w-48 bg-slate-200 rounded-full animate-pulse" />
                        <div className="h-2 w-32 bg-slate-200 rounded-full animate-pulse" />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <div className="pt-4 border-t border-slate-100">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAiQuestion();
                    }}
                    className="flex items-center gap-2 relative"
                  >
                    <input
                      id="ai-bible-question-input"
                      type="text"
                      placeholder="Ask any question about the Bible, parables, characters, or school diligence..."
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      disabled={isAiLoading}
                      className="flex-1 pl-4 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50"
                    />
                    <button
                      id="ai-bible-submit-btn"
                      type="submit"
                      disabled={!aiQuestion.trim() || isAiLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-all shadow-md active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. DAILY DEVOTIONALS VIEW */}
        {activeView === 'devotional' && (
          <motion.div
            key="devotional-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Devotional Selector list */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>Devotional Library</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Inspiring daily scriptures with school application, reflection, and guided prayers.
                </p>

                <div className="space-y-2">
                  {DAILY_DEVOTIONALS.map((dev, idx) => {
                    const isSelected = selectedDevotionalIndex === idx;
                    return (
                      <button
                        key={dev.id}
                        id={`devotional-item-${dev.id}`}
                        onClick={() => {
                          setSelectedDevotionalIndex(idx);
                          setDevotionalPledgeDone(false);
                        }}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl transition-all border space-y-1.5 group",
                          isSelected 
                            ? "bg-amber-50 border-amber-300 shadow-md" 
                            : "bg-slate-50 hover:bg-slate-100 border-slate-100"
                        )}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={cn(
                            "font-bold uppercase tracking-wider text-[10px]",
                            isSelected ? "text-amber-700" : "text-indigo-600"
                          )}>
                            {dev.scriptureRef}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            Day {idx + 1}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                          {dev.dayTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                          {dev.theme}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Active Devotional Reading Card */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/80 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                      {currentDevotional.theme}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-headline font-black text-slate-900 mt-2">
                      {currentDevotional.dayTitle}
                    </h2>
                  </div>
                  <button
                    id="read-devotional-audio-btn"
                    onClick={() => handleSpeakText(`${currentDevotional.dayTitle}. Scripture: ${currentDevotional.scriptureText} ${currentDevotional.scriptureRef}. Reflection: ${currentDevotional.reflection}. Application: ${currentDevotional.studentApplication}. Prayer: ${currentDevotional.prayer}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all shadow-sm"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </button>
                </div>

                {/* Scripture Anchor Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 shadow-lg space-y-2 relative overflow-hidden">
                  <div className="text-[11px] font-black uppercase tracking-widest text-amber-950/70 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Today's Anchor Scripture</span>
                  </div>
                  <p className="text-lg sm:text-xl font-serif font-bold italic leading-snug">
                    "{currentDevotional.scriptureText}"
                  </p>
                  <div className="text-right text-xs font-black uppercase tracking-wider text-slate-950">
                    — {currentDevotional.scriptureRef}
                  </div>
                </div>

                {/* Reflection Paragraphs */}
                <div className="space-y-4">
                  <h4 className="font-headline font-bold text-slate-900 text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>Scholar's Reflection</span>
                  </h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    {currentDevotional.reflection}
                  </p>
                </div>

                {/* Student Daily Action Step */}
                <div className="space-y-3">
                  <h4 className="font-headline font-bold text-slate-900 text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Daily School Action Pledge</span>
                  </h4>
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
                      {currentDevotional.studentApplication}
                    </p>
                    <button
                      id="pledge-complete-btn"
                      onClick={() => setDevotionalPledgeDone(true)}
                      className={cn(
                        "shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-2",
                        devotionalPledgeDone 
                          ? "bg-emerald-600 text-white pointer-events-none" 
                          : "bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                      )}
                    >
                      {devotionalPledgeDone ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4 text-amber-500" />}
                      <span>{devotionalPledgeDone ? "Pledge Completed!" : "I Commit Today"}</span>
                    </button>
                  </div>
                </div>

                {/* Guided Prayer */}
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Guided Prayer of Dedication</span>
                  </div>
                  <p className="text-xs sm:text-sm font-serif italic text-slate-800 leading-relaxed font-semibold">
                    "{currentDevotional.prayer}"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. THEMATIC SCRIPTURE EXPLORER */}
        {activeView === 'topics' && (
          <motion.div
            key="topics-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BIBLE_TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  id={`topic-card-${topic.id}`}
                  className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-200/80 space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-md",
                      topic.color
                    )}>
                      <span className="material-symbols-outlined text-2xl">{topic.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-black text-slate-900 text-lg">
                        {topic.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {topic.verses.map((v, vIdx) => (
                      <div
                        key={vIdx}
                        className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {v.reference}
                          </span>
                          <button
                            id={`topic-read-btn-${topic.id}-${vIdx}`}
                            onClick={() => {
                              setSelectedBookId(v.bookId);
                              setSelectedChapterNum(v.chapter);
                              setActiveView('reader');
                            }}
                            className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                          >
                            <span>Read in Context</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm font-serif italic text-slate-800 font-semibold leading-relaxed">
                          "{v.text}"
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          💡 <strong>Student Lesson:</strong> {v.lesson}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 5. BOOKMARKS VIEW */}
        {activeView === 'bookmarks' && (
          <motion.div
            key="bookmarks-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/80 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-slate-900 text-xl">
                    My Saved Bible Verses
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {bookmarkedVerses.length} favorite scriptures stored for quick study and meditation.
                  </p>
                </div>
              </div>

              {bookmarkedVerses.length > 0 && (
                <button
                  id="clear-all-bookmarks-btn"
                  onClick={() => {
                    if (confirm("Clear all saved bookmarks?")) {
                      setBookmarkedVerses([]);
                    }
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-700"
                >
                  Clear All
                </button>
              )}
            </div>

            {bookmarkedVerses.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <BookMarked className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-base">No saved verses yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the bookmark icon next to any verse in the Bible Reader to save your favorite promises here.
                </p>
                <button
                  id="go-to-reader-from-bookmarks-btn"
                  onClick={() => setActiveView('reader')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  Open Bible Reader
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedVerses.map((b) => (
                  <div
                    key={b.id}
                    id={`bookmark-card-${b.id}`}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {b.book} {b.chapter}:{b.verse}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          id={`bookmark-speak-${b.id}`}
                          onClick={() => handleSpeakText(`${b.book} ${b.chapter}:${b.verse}. ${b.text}`)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600"
                          title="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`bookmark-remove-${b.id}`}
                          onClick={() => setBookmarkedVerses(prev => prev.filter(item => item.id !== b.id))}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600"
                          title="Remove"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-serif italic text-slate-800 font-semibold leading-relaxed">
                      "{b.text}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-[11px]">
                      <span className="text-slate-400 font-medium">Saved on {b.date}</span>
                      <button
                        id={`bookmark-open-chapter-${b.id}`}
                        onClick={() => {
                          const bookKey = b.book.toLowerCase().replace(/\s+/g, '');
                          setSelectedBookId(bookKey);
                          setSelectedChapterNum(b.chapter);
                          setActiveView('reader');
                        }}
                        className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>Open Chapter</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
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
