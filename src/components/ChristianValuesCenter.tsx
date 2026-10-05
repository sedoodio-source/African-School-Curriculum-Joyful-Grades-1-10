import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Sun, 
  CheckCircle, 
  Feather, 
  HandHeart, 
  Star,
  Quote,
  Lightbulb,
  Compass
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../types';

interface ChristianValue {
  id: string;
  title: string;
  verse: string;
  reference: string;
  description: string;
  actionItem: string;
  category: 'Integrity' | 'Wisdom' | 'Love' | 'Diligence' | 'Respect' | 'Faith';
  icon: string;
}

const CHRISTIAN_VALUES: ChristianValue[] = [
  {
    id: 'diligence',
    title: 'Diligence & Excellence',
    verse: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
    reference: 'Colossians 3:23',
    description: 'Approaching every lesson, worksheet, and assignment with full concentration and dedication as an offering to God.',
    actionItem: 'Give 100% effort in today’s study session without shortcuts.',
    category: 'Diligence',
    icon: 'auto_awesome'
  },
  {
    id: 'wisdom',
    title: 'Beginning of Wisdom',
    verse: 'The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.',
    reference: 'Proverbs 9:10',
    description: 'Seeking God in prayer before studying so He opens our minds to comprehend science, math, literature, and life.',
    actionItem: 'Say a 10-second prayer before starting your AI Teach session today.',
    category: 'Wisdom',
    icon: 'menu_book'
  },
  {
    id: 'integrity',
    title: 'Honesty & Integrity',
    verse: 'The integrity of the upright guides them, but the unfaithful are destroyed by their duplicity.',
    reference: 'Proverbs 11:3',
    description: 'Doing your own work truthfully, avoiding cheating or copy-pasting answers, knowing God sees and blesses honest effort.',
    actionItem: 'Answer all quiz questions truthfully from your own understanding.',
    category: 'Integrity',
    icon: 'verified_user'
  },
  {
    id: 'love',
    title: 'Love & Kindness',
    verse: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.',
    reference: 'Ephesians 4:32',
    description: 'Speaking politely to parents, teachers, and classmates, showing patience and encouragement to everyone.',
    actionItem: 'Help a family member or classmate with a smile today.',
    category: 'Love',
    icon: 'favorite'
  },
  {
    id: 'respect',
    title: 'Honor & Respect',
    verse: 'Honor your father and your mother, so that you may live long in the land the Lord your God is giving you.',
    reference: 'Exodus 20:12',
    description: 'Listening attentively to parents and elders, completing schoolwork promptly, and treating authority with honor.',
    actionItem: 'Obey your parents immediately when asked to study or do chores.',
    category: 'Respect',
    icon: 'volunteer_activism'
  },
  {
    id: 'faith',
    title: 'Faith & Perseverance',
    verse: 'I can do all this through Him who gives me strength.',
    reference: 'Philippians 4:13',
    description: 'Never giving up when a math problem or spelling word seems hard, trusting God to grant clarity and perseverance.',
    actionItem: 'When stuck, take a deep breath, pray for clarity, and try again!',
    category: 'Faith',
    icon: 'verified'
  }
];

const DAILY_DEVOTION = {
  title: "The Golden Rule of Academic Excellence",
  scripture: "So in everything, do to others what you would have them do to you, for this sums up the Law and the Prophets.",
  reference: "Matthew 7:12",
  thought: "God gave each scholar incredible potential. When we study diligently, help our classmates, and honor our teachers and parents, we reflect Christ's light in our school and home.",
  prayer: "Lord Jesus, grant me wisdom, focus, and a clean heart today. Help me to study diligently, speak kindly, and honor my parents and teachers in all I do. Amen."
};

export default function ChristianValuesCenter({ user }: { user: User }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [pledgeAccepted, setPledgeAccepted] = useState<boolean>(() => {
    return localStorage.getItem('christian_pledge_signed') === 'true';
  });
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  const categories = ['All', 'Diligence', 'Wisdom', 'Integrity', 'Love', 'Respect', 'Faith'];

  const filteredValues = selectedCategory === 'All' 
    ? CHRISTIAN_VALUES 
    : CHRISTIAN_VALUES.filter(v => v.category === selectedCategory);

  const handleSignPledge = () => {
    setPledgeAccepted(true);
    localStorage.setItem('christian_pledge_signed', 'true');
  };

  return (
    <div id="christian-values-center" className="bg-gradient-to-b from-amber-50/80 via-white to-blue-50/50 p-6 md:p-8 rounded-3xl border-2 border-amber-200 shadow-xl mb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-amber-200/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-1">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300">
                Biblical Character Foundation
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Godly Excellence
              </span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-black text-slate-900 mt-1">
              Christian Values & Character Guidance
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Building academic mastery upon faith, integrity, love, and biblical wisdom for Grade {user.grade}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPrayerModal(true)}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all shadow-md cursor-pointer hover:scale-105"
        >
          <Feather className="w-4 h-4 text-amber-400" />
          <span>Scholar's Daily Prayer 🙏</span>
        </button>
      </div>

      {/* Daily Devotion Card */}
      <div className="my-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <span className="material-symbols-outlined text-9xl">auto_awesome</span>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-100 text-xs font-bold uppercase tracking-widest mb-2">
            <Quote className="w-4 h-4 text-amber-200" />
            <span>Daily Scripture Reflection</span>
          </div>

          <h3 className="font-headline text-xl md:text-2xl font-black mb-2">
            "{DAILY_DEVOTION.scripture}"
          </h3>
          <p className="text-amber-100 font-extrabold text-sm mb-4">
            — {DAILY_DEVOTION.reference}
          </p>

          <p className="text-sm font-medium bg-black/15 p-4 rounded-xl border border-white/20 backdrop-blur-sm text-amber-50 leading-relaxed">
            💡 <strong className="text-white">Today's Faith Reflection:</strong> {DAILY_DEVOTION.thought}
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              selectedCategory === cat
                ? "bg-amber-500 text-white shadow-md scale-105"
                : "bg-white text-slate-600 hover:bg-amber-100/50 border border-slate-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Value Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {filteredValues.map((val) => (
          <motion.div
            key={val.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <span className="material-symbols-outlined text-xl">{val.icon}</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  {val.category}
                </span>
              </div>

              <h4 className="font-headline font-black text-lg text-slate-900 mb-1">
                {val.title}
              </h4>

              <p className="text-xs font-bold text-amber-800 italic bg-amber-50 p-2.5 rounded-xl border border-amber-200/50 mb-3">
                "{val.verse}" <span className="font-extrabold text-[11px] block mt-0.5 text-amber-900">— {val.reference}</span>
              </p>

              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                {val.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{val.actionItem}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Christian Scholar Honor Pledge */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Christian Student Integrity Pledge</span>
          </div>
          <h3 className="font-headline text-xl md:text-2xl font-black text-white">
            Pledge of Honesty, Love & Diligence
          </h3>
          <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
            "I pledge as a Christian scholar to study with honesty, honor my parents and teachers, speak kindly, treat everyone with love, and do all my academic work with excellence for God's glory."
          </p>
        </div>

        <button
          onClick={handleSignPledge}
          disabled={pledgeAccepted}
          className={cn(
            "px-6 py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-3 cursor-pointer whitespace-nowrap shadow-lg",
            pledgeAccepted
              ? "bg-emerald-500 text-white cursor-default"
              : "bg-amber-400 hover:bg-amber-300 text-slate-950 hover:scale-105"
          )}
        >
          {pledgeAccepted ? (
            <>
              <CheckCircle className="w-5 h-5 text-white" />
              <span>Pledge Signed & Active ✝️</span>
            </>
          ) : (
            <>
              <HandHeart className="w-5 h-5" />
              <span>Sign Christian Honor Pledge</span>
            </>
          )}
        </button>
      </div>

      {/* Daily Prayer Modal */}
      <AnimatePresence>
        {showPrayerModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-3xl p-6 md:p-8 border-2 border-amber-300 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                    <Feather className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headline font-black text-xl text-slate-900">
                      Scholar's Daily Prayer
                    </h3>
                    <p className="text-xs font-bold text-amber-700">Seeking God's Wisdom Before Studying</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPrayerModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-3">
                <p className="text-sm font-semibold text-slate-800 leading-relaxed italic">
                  "{DAILY_DEVOTION.prayer}"
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  3 Faith Steps Before Every Session:
                </h4>
                <ul className="text-xs text-slate-700 font-medium space-y-1.5 list-disc pl-5">
                  <li>Ask the Holy Spirit for focus and clarity.</li>
                  <li>Commit your study session to God with joy.</li>
                  <li>Resolve to do honest, diligent work without shortcuts.</li>
                </ul>
              </div>

              <button
                onClick={() => setShowPrayerModal(false)}
                className="w-full py-3.5 bg-slate-900 text-white font-extrabold text-sm rounded-2xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                Amen! Start Learning Now 🙏
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
