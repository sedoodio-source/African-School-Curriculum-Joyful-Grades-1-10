import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Play, 
  Pause,
  Headphones,
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Volume2, 
  VolumeX,
  Mic2, 
  MessageSquare, 
  Award, 
  Search, 
  X,
  Radio,
  FileText,
  Disc
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User, ChristianSong, ChristianSongLog } from '../types';

export const FEATURED_CHRISTIAN_SONGS: ChristianSong[] = [
  {
    id: 'song-1',
    title: 'All I Once Held Dear (Knowing You)',
    artist: 'Robin Mark',
    category: 'Hymns & Reflection',
    description: 'A powerful hymn reflecting on counting earthly riches as nothing compared to the priceless joy of knowing Jesus Christ. Teaches humility and true spiritual value.',
    bibleVerse: 'Philippians 3:8 — "I consider everything a loss because of the surpassing worth of knowing Christ Jesus my Lord."',
    audioOrVideoUrl: 'https://www.youtube.com/embed/Y4mJ3p06J9I',
    duration: '4:50',
    lyricsExcerpt: 'Knowing You, Jesus, knowing You / There is no greater thing / You’re my all, You’re the best / You’re my joy, my righteousness / And I love You, Lord.',
    learningObjectives: [
      'Understand the biblical principle of spiritual priorities',
      'Learn humility over material possessions',
      'Reflect on personal devotion to God'
    ],
    reflectionPrompt: 'What does "knowing Jesus" mean to you in your daily life at school and home?'
  },
  {
    id: 'song-2',
    title: 'I Give Myself Away',
    artist: 'William McDowell',
    category: 'Worship',
    description: 'A heartfelt worship anthem surrendering our lives, gifts, time, and talents for God’s divine purpose. Teaches dedication, service, and unselfish living.',
    bibleVerse: 'Romans 12:1 — "Offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship."',
    audioOrVideoUrl: 'https://www.youtube.com/embed/1vjhsn34m5w',
    duration: '6:15',
    lyricsExcerpt: 'I give myself away / So You can use me / My life is not my own / To You I belong / I give myself away.',
    learningObjectives: [
      'Learn the meaning of Christian surrender and stewardship',
      'Understand using God-given talents to serve others',
      'Practice daily prayer of commitment'
    ],
    reflectionPrompt: 'Name one gift or skill God has given you that you can use to help someone this week!'
  },
  {
    id: 'song-3',
    title: 'Ojoro',
    artist: 'Sound of Salem',
    category: 'African Gospel & Worship',
    description: 'A joyful African praise anthem celebrating God’s unmerited favor, grace, and divine protection that turns every plan of the enemy around for our good.',
    bibleVerse: 'Psalm 5:12 — "For surely, O Lord, you bless the righteous; you surround them with your favor as with a shield."',
    audioOrVideoUrl: 'https://www.youtube.com/embed/uNf84a4W9x0',
    duration: '5:20',
    lyricsExcerpt: 'God’s grace and favor is working for me! No weapon formed against me shall prosper / Ojoro for my matter, grace has taken over!',
    learningObjectives: [
      'Understand God’s grace and unmerited favor',
      'Celebrate joyous African gospel music traditions',
      'Build unshakeable confidence in divine protection'
    ],
    reflectionPrompt: 'Share a time when God answered a prayer or protected you and your family!'
  },
  {
    id: 'song-4',
    title: 'God’s Not Dead (Like a Lion)',
    artist: 'Newsboys',
    category: 'Faith & Courage',
    description: 'An energetic Christian rock anthem declaring that God is alive, active, and roaring like a lion inside our hearts. Inspires bold Christian courage in students.',
    bibleVerse: 'Romans 1:16 — "For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes."',
    audioOrVideoUrl: 'https://www.youtube.com/embed/S_OTz-lpDjw',
    duration: '4:20',
    lyricsExcerpt: 'My God’s not dead / He’s surely alive / He’s living on the inside / Roaring like a lion!',
    learningObjectives: [
      'Develop unashamed Christian faith and courage',
      'Recognize God’s active presence in the world today',
      'Memorize Romans 1:16 scripture truth'
    ],
    reflectionPrompt: 'How can you show kindness and stand up for your faith at school?'
  },
  {
    id: 'song-5',
    title: 'We Believe',
    artist: 'Newsboys',
    category: 'Faith & Courage',
    description: 'A unifying creed song affirming faith in God the Father, Jesus Christ the Son, the Holy Spirit, the resurrection, and the ultimate victory of the church.',
    bibleVerse: 'John 11:25-26 — "I am the resurrection and the life. The one who believes in me will live, even though they die."',
    audioOrVideoUrl: 'https://www.youtube.com/embed/WjZ01FcK0yk',
    duration: '4:10',
    lyricsExcerpt: 'We believe in God the Father / We believe in Jesus Christ / We believe in the Holy Spirit / And He’s given us new life!',
    learningObjectives: [
      'Learn the fundamental doctrines of Christian belief',
      'Understand the Apostles’ Creed foundation',
      'Express collective unity in worship'
    ],
    reflectionPrompt: 'Why is believing in Jesus’ resurrection important for Christian hope?'
  },
  {
    id: 'song-6',
    title: 'Letters from War',
    artist: 'Mark Schultz',
    category: 'Hymns & Reflection',
    description: 'A deeply moving story-song about a mother’s faithful prayers and letters for her soldier son. Teaches the power of persistent prayer and sacrificial love.',
    bibleVerse: 'James 5:16 — "The prayer of a righteous person is powerful and effective."',
    audioOrVideoUrl: 'https://www.youtube.com/embed/3EThzG6C5zM',
    duration: '5:10',
    lyricsExcerpt: 'She folded up the letter and put it in a drawer / She prayed, "Lord bring him home, bring him home safely from the war."',
    learningObjectives: [
      'Understand the power of a mother’s and family’s prayers',
      'Appreciate sacrifice, love, and endurance',
      'Reflect on writing encouraging letters of faith'
    ],
    reflectionPrompt: 'Write a short prayer of blessing for your parents or guardian.'
  },
  {
    id: 'song-7',
    title: 'Always Pray for You',
    artist: 'Nosa',
    category: 'African Gospel & Worship',
    description: 'A beloved African gospel classic filled with warmth, blessing, and unconditional love. Teaches students that family and loved ones are constantly lifted up in prayer.',
    bibleVerse: '1 Thessalonians 5:17 — "Pray without ceasing."',
    audioOrVideoUrl: 'https://www.youtube.com/embed/2XqL_2X1nQo',
    duration: '4:45',
    lyricsExcerpt: 'I will always pray for you / May the sun shine on your way / May God keep you safe each day / I will always pray for you.',
    learningObjectives: [
      'Learn the value of intercessory prayer for friends and family',
      'Celebrate Nigerian and African gospel musical culture',
      'Cultivate lifelong habits of blessing others'
    ],
    reflectionPrompt: 'Who is one person you will commit to praying for every day this week?'
  },
  {
    id: 'song-8',
    title: 'Na Your Way (God Is Good)',
    artist: 'Nosa ft. Mairo Ese',
    category: 'African Gospel & Worship',
    description: 'A soul-stirring Nigerian worship song exalting God’s sovereignty, miraculous ways, and unfailing faithfulness across all generations.',
    bibleVerse: 'Proverbs 3:5-6 — "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him."',
    audioOrVideoUrl: 'https://www.youtube.com/embed/2W8C0Q6mUe8',
    duration: '5:30',
    lyricsExcerpt: 'You do things no man can do / Na Your way, O Lord! You make a way where there is no way / You are good and Your mercy endures forever.',
    learningObjectives: [
      'Understand trusting God’s unique ways and timing',
      'Sing praise in Nigerian cultural context',
      'Reflect on God’s miracles in daily life'
    ],
    reflectionPrompt: 'What does "Na Your Way" mean when trusting God through tough homework or challenges?'
  }
];

interface ChristianMusicCenterProps {
  user: User;
}

export default function ChristianMusicCenter({ user }: ChristianMusicCenterProps) {
  const [songLogs, setSongLogs] = useState<Record<string, ChristianSongLog>>(() => {
    try {
      const saved = localStorage.getItem(`asc_christian_song_logs_${user.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSong, setActiveSong] = useState<ChristianSong | null>(null);
  const [studentNote, setStudentNote] = useState<string>('');

  // Save song logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`asc_christian_song_logs_${user.id}`, JSON.stringify(songLogs));
    } catch (e) {
      console.error(e);
    }
  }, [songLogs, user.id]);

  const categories = ['All', 'African Gospel & Worship', 'Worship', 'Faith & Courage', 'Hymns & Reflection'];

  const filteredSongs = FEATURED_CHRISTIAN_SONGS.filter(song => {
    const matchesCategory = selectedCategory === 'All' || song.category === selectedCategory;
    const matchesQuery = searchQuery === '' || 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleOpenSong = (song: ChristianSong) => {
    setActiveSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
    setStudentNote(songLogs[song.id]?.studentNotes || '');
  };

  const handleCompleteSong = (songId: string) => {
    const updated: ChristianSongLog = {
      songId,
      listenedAt: Date.now(),
      studentNotes: studentNote,
      completed: true
    };
    setSongLogs(prev => ({ ...prev, [songId]: updated }));
    setActiveSong(null);
  };

  const completedCount = (Object.values(songLogs) as ChristianSongLog[]).filter(l => l.completed).length;

  return (
    <section id="christian-music-center" className="my-10 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-6 md:p-10 rounded-[2.5rem] border-4 border-amber-400/40 shadow-2xl text-white relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-xl shadow-amber-400/20 shrink-0">
            <Music className="w-8 h-8 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Radio className="w-3 h-3" />
                Christian Music & Worship Academy
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Disc className="w-3 h-3" />
                Worship & Moral Study
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tight text-white">
              Christian Music Player & Worship Lessons
            </h2>
            <p className="text-white/70 font-medium text-xs md:text-sm mt-1 max-w-2xl">
              Listen to inspiring songs by <strong>Robin Mark, William McDowell, Sound of Salem, Newsboys, Mark Schultz, and Nosa</strong>. Learn scripture truths, lyrics, and moral values through praise!
            </p>
          </div>
        </div>

        {/* Worship Stats Badge */}
        <div className="bg-slate-900/90 border border-white/10 px-6 py-3.5 rounded-2xl flex items-center gap-4 shrink-0 shadow-xl self-stretch md:self-auto justify-between md:justify-start">
          <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center text-amber-300">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-lg font-black text-amber-300">{completedCount} / {FEATURED_CHRISTIAN_SONGS.length} Lessons Completed</div>
            <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Faith & Praise Mastered</div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="my-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-10">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                selectedCategory === cat
                  ? "bg-amber-400 text-slate-950 shadow-lg scale-105"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Robin Mark, Nosa, Newsboys..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6 relative z-10">
        {filteredSongs.map(song => {
          const isCompleted = songLogs[song.id]?.completed;
          return (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 hover:border-amber-400/50 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider rounded-lg">
                    {song.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/50 font-bold">{song.duration}</span>
                    {isCompleted && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Learned
                      </span>
                    )}
                  </div>
                </div>

                {/* Song Title & Artist */}
                <div className="space-y-1 mb-3">
                  <h3 className="font-headline font-black text-lg text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {song.title}
                  </h3>
                  <p className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Mic2 className="w-3.5 h-3.5" />
                    <span>{song.artist}</span>
                  </p>
                </div>

                {/* Bible Verse Box */}
                <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-xl mb-3">
                  <p className="text-[11px] font-extrabold text-amber-200 italic line-clamp-2">
                    "{song.bibleVerse}"
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-white/70 font-medium line-clamp-3 leading-relaxed mb-4">
                  {song.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenSong(song)}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg group-hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Listen & Learn Lesson</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Song Player & Learning Modal */}
      <AnimatePresence>
        {activeSong && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border-2 border-amber-400/50 max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl text-white my-8"
            >
              {/* Modal Header */}
              <div className="p-5 bg-slate-950 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-black">
                    <Music className="w-6 h-6" />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      {activeSong.artist} • {activeSong.category}
                    </span>
                    <h3 className="font-headline font-black text-xl text-white">
                      {activeSong.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSong(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Audio Listening Deck (No Video Display) */}
              <div className="bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-950 p-6 md:p-8 border-b border-white/10 relative overflow-hidden">
                {/* Listening Mode Banner */}
                <div className="flex items-center justify-between gap-4 mb-6 bg-amber-500/10 border border-amber-400/30 px-4 py-2 rounded-xl text-amber-300 text-xs font-black uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Pure Audio Listening Mode</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-bold">
                    Music Only • No Video
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                  {/* Vinyl Record / Album Cover Deck */}
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-36 h-36 md:w-44 md:h-44 rounded-full bg-slate-950 border-4 border-amber-400/50 shadow-2xl flex items-center justify-center relative overflow-hidden",
                      isPlaying ? "animate-spin [animation-duration:8s]" : ""
                    )}>
                      {/* Vinyl Grooves */}
                      <div className="absolute inset-2 rounded-full border border-white/10" />
                      <div className="absolute inset-5 rounded-full border border-white/10" />
                      <div className="absolute inset-8 rounded-full border border-white/10" />
                      <div className="absolute inset-12 rounded-full border border-white/10" />
                      
                      {/* Center Label */}
                      <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 font-black flex flex-col items-center justify-center p-1 text-center shadow-inner z-10">
                        <Disc className="w-6 h-6 text-slate-950" />
                        <span className="text-[8px] uppercase tracking-tighter line-clamp-1 font-extrabold">{activeSong.artist}</span>
                      </div>
                    </div>

                    {/* Glowing Audio Pulse Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-2 rounded-full shadow-lg">
                      <Music className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Audio Controls & Visualizer */}
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Mic2 className="w-3.5 h-3.5" />
                        {activeSong.artist}
                      </span>
                      <h4 className="font-headline font-black text-2xl text-white mt-0.5">
                        {activeSong.title}
                      </h4>
                      <p className="text-xs text-white/60 font-medium">
                        Category: {activeSong.category} • Duration: {activeSong.duration}
                      </p>
                    </div>

                    {/* Animated Sound Wave Visualizer */}
                    <div className="flex items-end gap-1 h-8 px-2 bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden justify-center">
                      {[40, 70, 30, 90, 50, 100, 60, 80, 45, 85, 65, 95, 35, 75, 55, 85, 40, 70, 90, 50].map((h, i) => (
                        <motion.div
                          key={i}
                          className={cn(
                            "w-1.5 rounded-full transition-all",
                            isPlaying ? "bg-gradient-to-t from-amber-500 to-amber-300" : "bg-white/20"
                          )}
                          animate={isPlaying ? {
                            height: [`${Math.max(15, h * 0.3)}%`, `${h}%`, `${Math.max(15, h * 0.4)}%`]
                          } : { height: '20%' }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            delay: i * 0.05
                          }}
                        />
                      ))}
                    </div>

                    {/* Audio Transport Controls */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all hover:scale-105 cursor-pointer"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-5 h-5 fill-slate-950" />
                            <span>Pause Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 fill-slate-950" />
                            <span>Play Audio</span>
                          </>
                        )}
                      </button>

                      {/* Volume Slider Control */}
                      <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 px-3 py-2 rounded-xl text-xs text-white/80">
                        <button onClick={() => setIsMuted(!isMuted)} className="hover:text-amber-300 cursor-pointer">
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            setVolume(parseInt(e.target.value, 10));
                            setIsMuted(false);
                          }}
                          className="w-20 accent-amber-400 h-1 bg-white/20 rounded-lg cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-white/50 w-7">{isMuted ? '0%' : `${volume}%`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden Audio Driver (Extracts audio track for pure listening) */}
                <div className="hidden">
                  <iframe
                    src={`${activeSong.audioOrVideoUrl}?autoplay=1&controls=0`}
                    title={activeSong.title}
                    allow="autoplay"
                  />
                </div>
              </div>

              {/* Learning Content & Reflection */}
              <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto">
                {/* Scripture Anchor */}
                <div className="bg-amber-500/10 border border-amber-400/30 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>Biblical Scripture Connection</span>
                  </div>
                  <p className="text-sm font-black text-amber-200 italic">
                    "{activeSong.bibleVerse}"
                  </p>
                </div>

                {/* Lyrics Excerpt */}
                <div className="bg-purple-950/50 border border-purple-400/30 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-black uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Worship Lyrics & Key Chorus</span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-white/90 italic leading-relaxed whitespace-pre-line">
                    "{activeSong.lyricsExcerpt}"
                  </p>
                </div>

                {/* Educational Learning Objectives */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-white/60 tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Lesson Objectives & Moral Truths</span>
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeSong.learningObjectives.map((obj, idx) => (
                      <li key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80 font-medium flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Student Reflection Journal */}
                <div className="p-5 bg-slate-950 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>Student Music Reflection Journal</span>
                  </div>

                  <p className="text-xs font-bold text-white/80">
                    {activeSong.reflectionPrompt}
                  </p>

                  <textarea
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    placeholder="Write your reflection note here... (e.g. This song teaches me to trust God completely...)"
                    rows={3}
                    className="w-full p-3.5 bg-slate-900 border border-white/20 rounded-xl text-white text-xs font-medium focus:ring-2 focus:ring-amber-400 outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-white/50 font-medium">
                    Artist: <strong>{activeSong.artist}</strong>
                  </div>

                  <button
                    onClick={() => handleCompleteSong(activeSong.id)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>Complete Worship Lesson & Save Note</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
