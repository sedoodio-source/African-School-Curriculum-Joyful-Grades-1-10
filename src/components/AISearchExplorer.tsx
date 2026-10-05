import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { 
  Search, Sparkles, BookOpen, Volume2, VolumeX, Bookmark, 
  BookmarkCheck, Globe, HelpCircle, Lightbulb, Compass, 
  ExternalLink, ShieldCheck, Zap, History, Trash2, Check, ArrowRight, RefreshCw, Lock
} from 'lucide-react';
import { useUpgradeStatus } from '../utils/upgradeManager';
import AIUpgradeLockedBanner from './AIUpgradeLockedBanner';
import UpgradeButton from './UpgradeButton';

interface SavedDiscovery {
  id: string;
  query: string;
  answer: string;
  groundingSources?: Array<{ title?: string; url?: string }>;
  timestamp: number;
}

interface AISearchExplorerProps {
  user: User;
  initialQuery?: string;
}

const POPULAR_SEARCH_TOPICS = [
  { label: '🚀 James Webb Telescope', query: 'James Webb Space Telescope recent discoveries in deep space' },
  { label: '🏛️ Ancient Benin Bronzes', query: 'History and metallurgy of Ancient Benin Kingdom bronzes in Nigeria' },
  { label: '⚡ Solar Energy in Africa', query: 'How solar power and photovoltaic cells generate electricity in West Africa' },
  { label: '🇳🇬 History of Nigerian Naira', query: 'Evolution and history of the Nigerian Naira currency and Central Bank' },
  { label: '🤖 AI & Neural Networks', query: 'How Artificial Intelligence models and machine learning neural networks work' },
  { label: '🦁 Serengeti Migration', query: 'Great Wildebeest Serengeti wildlife migration in East Africa' },
  { label: '🧬 DNA & Human Genetics', query: 'Structure of DNA and genetics explained simply' },
  { label: '🌊 Victoria Falls Wonder', query: 'Geology and history of Victoria Falls Mosi-oa-Tunya' }
];

export default function AISearchExplorer({ user, initialQuery = '' }: AISearchExplorerProps) {
  const status = useUpgradeStatus(user);
  const [query, setQuery] = useState(initialQuery);
  const [searchResult, setSearchResult] = useState<{
    query: string;
    answer: string;
    groundingMetadata?: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Saved Discoveries log in localStorage
  const [savedDiscoveries, setSavedDiscoveries] = useState<SavedDiscovery[]>(() => {
    try {
      const saved = localStorage.getItem(`saved_research_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'search' | 'notebook'>('search');

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!status.isUpgraded) return;
    if (!searchQuery || !searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/ai/search-explorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          grade: user.grade || 5,
          studentName: user.name
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete search.');
      }

      setSearchResult({
        query: searchQuery.trim(),
        answer: data.answer,
        groundingMetadata: data.groundingMetadata
      });
      setActiveTab('search');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to AI Search. Please check internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (searchResult?.answer) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      
      // Clean markdown tags for audio reading
      const cleanText = searchResult.answer.replace(/[*#_]/g, '');
      const utterance = new SpeechSynthesisUtterance(`Search discovery for ${searchResult.query}. ${cleanText}`);
      utterance.lang = 'en-GB';
      utterance.rate = 0.9;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const isCurrentSaved = searchResult 
    ? savedDiscoveries.some(item => item.query.toLowerCase() === searchResult.query.toLowerCase())
    : false;

  const handleToggleSave = () => {
    if (!searchResult) return;

    if (isCurrentSaved) {
      const updated = savedDiscoveries.filter(item => item.query.toLowerCase() !== searchResult.query.toLowerCase());
      setSavedDiscoveries(updated);
      localStorage.setItem(`saved_research_${user.id}`, JSON.stringify(updated));
    } else {
      const sources: Array<{ title?: string; url?: string }> = [];
      const webChunks = searchResult.groundingMetadata?.groundingChunks;
      if (Array.isArray(webChunks)) {
        webChunks.forEach((chunk: any) => {
          if (chunk.web?.title || chunk.web?.uri) {
            sources.push({ title: chunk.web.title || 'Web Source', url: chunk.web.uri });
          }
        });
      }

      const newEntry: SavedDiscovery = {
        id: Date.now().toString(),
        query: searchResult.query,
        answer: searchResult.answer,
        groundingSources: sources,
        timestamp: Date.now()
      };

      const updated = [newEntry, ...savedDiscoveries];
      setSavedDiscoveries(updated);
      localStorage.setItem(`saved_research_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleRemoveSaved = (id: string) => {
    const updated = savedDiscoveries.filter(item => item.id !== id);
    setSavedDiscoveries(updated);
    localStorage.setItem(`saved_research_${user.id}`, JSON.stringify(updated));
  };

  // Helper renderer for Markdown text
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-3" />;

      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        return (
          <h3 key={idx} className="text-xl font-black text-slate-900 mt-6 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
            {trimmed.replace(/^#+\s*/, '')}
          </h3>
        );
      }

      if (trimmed.startsWith('🌟') || trimmed.startsWith('🌍') || trimmed.startsWith('💡') || trimmed.startsWith('📖') || trimmed.startsWith('❓')) {
        return (
          <div key={idx} className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-2xl my-4 text-slate-900 font-bold text-lg">
            {trimmed}
          </div>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-slate-700 leading-relaxed my-1.5 font-medium">
            {trimmed.replace(/^[-*]\s*/, '')}
          </li>
        );
      }

      // Check for bold text
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={idx} className="text-slate-700 leading-relaxed my-2 font-medium text-base">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Extract web grounding search queries or links
  const searchQueries: string[] = searchResult?.groundingMetadata?.webSearchQueries || [];
  const groundingChunks = searchResult?.groundingMetadata?.groundingChunks || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black tracking-widest uppercase text-blue-200">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              Live Google Search Grounding & Miss Kelechi AI
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              AI Knowledge Search & Discovery
            </h1>
            <p className="text-blue-100/90 text-sm md:text-base font-medium">
              Search any scientific wonder, historical event, African heritage, or invention in real-time. Miss Kelechi grounds every discovery in live search data for Grade {user.grade || 5} scholars!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <UpgradeButton user={user} variant="pill" />
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
              <button
                onClick={() => setActiveTab('search')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all",
                  activeTab === 'search' ? "bg-white text-slate-900 shadow-lg" : "text-white/80 hover:text-white"
                )}
              >
                <Compass className="w-4 h-4" />
                Explorer
              </button>
              <button
                onClick={() => setActiveTab('notebook')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all relative",
                  activeTab === 'notebook' ? "bg-white text-slate-900 shadow-lg" : "text-white/80 hover:text-white"
                )}
              >
                <Bookmark className="w-4 h-4" />
                Notebook ({savedDiscoveries.length})
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="mt-8 relative z-10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row items-stretch gap-3 bg-white/10 backdrop-blur-xl p-2.5 rounded-3xl border border-white/25 shadow-2xl"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <Search className="w-6 h-6 text-amber-300 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!status.isUpgraded}
                placeholder={
                  !status.isUpgraded 
                    ? "🔒 AI Search is locked. Please upgrade to explore with Google Search Grounding." 
                    : "Search anything! e.g., James Webb Telescope, Benin Bronzes, Solar Power..."
                }
                className="w-full bg-transparent text-white placeholder-blue-200/70 text-base md:text-lg font-medium focus:outline-none disabled:opacity-60"
              />
            </div>
            {status.isUpgraded ? (
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all active:scale-95 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Searching Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
                    Search Grounding
                  </>
                )}
              </button>
            ) : (
              <div className="p-1">
                <UpgradeButton user={user} variant="pill" />
              </div>
            )}
          </form>

          {/* Quick Popular Topics Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase text-blue-200/80 mr-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Popular Ideas:
            </span>
            {POPULAR_SEARCH_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(topic.query);
                  handleSearch(topic.query);
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 backdrop-blur-md transition-all active:scale-95 hover:border-amber-400/40"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'search' && (
        <>
          {!status.isUpgraded && (
            <div className="mb-8">
              <AIUpgradeLockedBanner user={user} featureName="Miss Kelechi AI Search Explorer" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/20 text-red-700 p-6 rounded-3xl font-bold text-center space-y-2">
              <p>{error}</p>
              <button
                onClick={() => handleSearch()}
                className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Animation Card */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-slate-100 space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 relative">
                <Sparkles className="w-10 h-10 animate-bounce" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-3xl animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Scanning Knowledge Banks & Google Search</h3>
                <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
                  Miss Kelechi is gathering up-to-date facts, African context, and science principles for Grade {user.grade || 5}...
                </p>
              </div>
            </motion.div>
          )}

          {/* Search Results Display */}
          {!isLoading && searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100 space-y-8"
            >
              {/* Result Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Grounded Search Verification Active
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                    "{searchResult.query}"
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleSpeak}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all border",
                      isSpeaking
                        ? "bg-red-500 text-white border-red-500 shadow-lg animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    )}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
                    {isSpeaking ? 'Stop Voice' : 'Listen Read-Aloud'}
                  </button>

                  <button
                    onClick={handleToggleSave}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs transition-all border",
                      isCurrentSaved
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md"
                        : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                    )}
                  >
                    {isCurrentSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4 text-amber-400" />}
                    {isCurrentSaved ? 'Saved to Notebook' : 'Save Discovery'}
                  </button>
                </div>
              </div>

              {/* Google Search Grounding Sources (if available) */}
              {(searchQueries.length > 0 || groundingChunks.length > 0) && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-widest">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Verified Google Search References & Queries:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchQueries.map((sq, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                        <Search className="w-3 h-3 text-slate-400" />
                        {sq}
                      </span>
                    ))}
                    {groundingChunks.map((chunk: any, idx: number) => {
                      if (chunk.web?.title && chunk.web?.uri) {
                        return (
                          <a
                            key={idx}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {chunk.web.title}
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Main Formatted Search Explanation */}
              <div className="prose max-w-none">
                {renderFormattedText(searchResult.answer)}
              </div>

              {/* Bottom Teacher Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                  MK
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-base">Miss Kelechi's Research Commendation</h4>
                  <p className="text-slate-700 font-medium text-sm leading-relaxed">
                    "Excellent scholar! Curiosity is the key that unlocks God-given wisdom. Keep exploring new questions and sharing what you discover with your parents!"
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Placeholder state when no search has been run */}
          {!isLoading && !searchResult && (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-lg border border-slate-100 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Compass className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-black text-slate-900">What would you like to discover today?</h3>
                <p className="text-slate-500 font-medium text-sm">
                  Type any topic in the search bar above or click one of the popular search ideas to generate live AI grounded discoveries!
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Saved Research Notebook Tab */}
      {activeTab === 'notebook' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-amber-500" />
              My Saved Research Notebook
            </h2>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {savedDiscoveries.length} Saved Entries
            </span>
          </div>

          {savedDiscoveries.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-lg border border-slate-100 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-xl font-bold text-slate-800">Your Notebook is Currently Empty</h3>
              <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">
                Search for any topic in the Explorer tab and click "Save Discovery" to store research entries here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {savedDiscoveries.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-100 space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-black text-amber-600 uppercase tracking-widest">
                        Saved Discovery • {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">
                        "{item.query}"
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSearchResult({
                            query: item.query,
                            answer: item.answer,
                            groundingMetadata: { groundingChunks: item.groundingSources?.map(s => ({ web: { title: s.title, uri: s.url } })) }
                          });
                          setActiveTab('search');
                        }}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all"
                      >
                        Open View <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveSaved(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove from notebook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="line-clamp-4 text-slate-600 font-medium text-sm leading-relaxed">
                    {item.answer.replace(/[*#_]/g, '')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
