import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Tv, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Lock, 
  Edit3, 
  Trash2, 
  Eye, 
  ShieldAlert, 
  MessageSquare, 
  Bookmark, 
  Award,
  Video,
  Share2,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User, ChristianVideo, ChristianVideoWatchLog } from '../types';

export const DEFAULT_CHRISTIAN_VIDEOS: ChristianVideo[] = [
  {
    id: 'cv-1',
    title: 'David and Goliath: Courage Through Faith',
    description: 'Learn how young David trusted in God’s power rather than physical strength to defeat Goliath, teaching us that no challenge is too big with the Lord.',
    bibleVerse: '1 Samuel 17:45 — "You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty."',
    category: 'Bible Heroes',
    videoUrl: 'https://www.youtube.com/embed/7zL_m9R3-A0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=60',
    duration: '8:45',
    createdAt: Date.now() - 86400000 * 5,
    published: true,
    designer: 'School Chaplain & Parent Admin',
    reflectionPrompt: 'What is one "Goliath" or hard subject in school you can ask God for courage to overcome?'
  },
  {
    id: 'cv-2',
    title: 'The Parable of the Good Samaritan: Love in Action',
    description: 'Discover Jesus’ lesson on loving your neighbor without prejudice, showing kindness, care, and compassion to everyone around you.',
    bibleVerse: 'Luke 10:27 — "Love the Lord your God with all your heart... and Love your neighbor as yourself."',
    category: 'Parables',
    videoUrl: 'https://www.youtube.com/embed/osfQg4yKtq8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=60',
    duration: '6:30',
    createdAt: Date.now() - 86400000 * 4,
    published: true,
    designer: 'Parent Admin',
    reflectionPrompt: 'How can you show kindness to a classmate or family member today?'
  },
  {
    id: 'cv-3',
    title: 'Daniel in the Lions\' Den: Unshakable Integrity',
    description: 'Follow Daniel’s steadfast prayer life and integrity in Babylon, proving that obeying God brings divine protection and peace.',
    bibleVerse: 'Daniel 6:22 — "My God sent his angel, and he shut the mouths of the lions. They have not hurt me, because I was found innocent in his sight."',
    category: 'Bible Heroes',
    videoUrl: 'https://www.youtube.com/embed/bL3_Iip8Hn0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60',
    duration: '9:15',
    createdAt: Date.now() - 86400000 * 3,
    published: true,
    designer: 'Parent Admin',
    reflectionPrompt: 'Why is it important to stick to your Christian values even when others do not?'
  },
  {
    id: 'cv-4',
    title: 'God’s Creation & Science: The Divine Masterpiece',
    description: 'Explore the wondrous order in nature, galaxy movements, and cellular biology that testify to the wisdom of our Creator.',
    bibleVerse: 'Psalm 19:1 — "The heavens declare the glory of God; the skies proclaim the work of his hands."',
    category: 'Faith & Science',
    videoUrl: 'https://www.youtube.com/embed/2_mD0mG2-N8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
    duration: '7:10',
    createdAt: Date.now() - 86400000 * 2,
    published: true,
    designer: 'Science & Faith Publisher',
    reflectionPrompt: 'Name two things in nature or science that show God’s amazing creativity!'
  },
  {
    id: 'cv-5',
    title: 'The Prodigal Son: Infinite Mercy & Forgiveness',
    description: 'Understand the depth of God’s forgiving love through the parable of the loving father welcoming his returning son with open arms.',
    bibleVerse: 'Luke 15:24 — "For this son of mine was dead and is alive again; he was lost and is found."',
    category: 'Moral Stories',
    videoUrl: 'https://www.youtube.com/embed/5a6B6pDq3iA',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509021436468-d5103e3927d7?w=800&auto=format&fit=crop&q=60',
    duration: '8:00',
    createdAt: Date.now() - 86400000 * 1,
    published: true,
    designer: 'Parent Admin',
    reflectionPrompt: 'What does forgiveness mean to you when someone makes a mistake?'
  }
];

interface ChristianVideosCenterProps {
  user: User;
  mode?: 'student' | 'parent';
}

export default function ChristianVideosCenter({ user, mode = 'student' }: ChristianVideosCenterProps) {
  const [videos, setVideos] = useState<ChristianVideo[]>(() => {
    try {
      const saved = localStorage.getItem('asc_christian_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CHRISTIAN_VIDEOS;
  });

  const [watchLogs, setWatchLogs] = useState<Record<string, ChristianVideoWatchLog>>(() => {
    try {
      const saved = localStorage.getItem(`asc_christian_watch_logs_${user.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeVideo, setActiveVideo] = useState<ChristianVideo | null>(null);
  const [studentNote, setStudentNote] = useState<string>('');
  const [showDesignerModal, setShowDesignerModal] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<ChristianVideo | null>(null);

  // Parent Designer Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ChristianVideo['category']>('Moral Stories');
  const [formDescription, setFormDescription] = useState('');
  const [formBibleVerse, setFormBibleVerse] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDuration, setFormDuration] = useState('5:00');
  const [formReflectionPrompt, setFormReflectionPrompt] = useState('');
  const [formPublished, setFormPublished] = useState(true);

  // Save videos to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('asc_christian_videos', JSON.stringify(videos));
    } catch (e) {
      console.error(e);
    }
  }, [videos]);

  // Save watch logs
  useEffect(() => {
    try {
      localStorage.setItem(`asc_christian_watch_logs_${user.id}`, JSON.stringify(watchLogs));
    } catch (e) {
      console.error(e);
    }
  }, [watchLogs, user.id]);

  const categories = ['All', 'Moral Stories', 'Bible Heroes', 'Christian Values', 'Worship & Praise', 'Faith & Science', 'Parables'];

  // Filter videos for display
  const displayVideos = videos.filter(v => {
    const isPublished = mode === 'parent' ? true : v.published;
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    return isPublished && matchesCategory;
  });

  const handleOpenVideo = (video: ChristianVideo) => {
    setActiveVideo(video);
    setStudentNote(watchLogs[video.id]?.studentReflection || '');
  };

  const handleCompleteWatch = (videoId: string) => {
    const updated: ChristianVideoWatchLog = {
      videoId,
      watchedAt: Date.now(),
      studentReflection: studentNote,
      completed: true
    };
    setWatchLogs(prev => ({ ...prev, [videoId]: updated }));
    setActiveVideo(null);
  };

  // Parent Designer Handlers
  const handleOpenNewVideoForm = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormCategory('Moral Stories');
    setFormDescription('');
    setFormBibleVerse('');
    setFormVideoUrl('');
    setFormDuration('6:00');
    setFormReflectionPrompt('What key lesson did you learn from this Christian video?');
    setFormPublished(true);
    setShowDesignerModal(true);
  };

  const handleEditVideoForm = (v: ChristianVideo) => {
    setEditingVideo(v);
    setFormTitle(v.title);
    setFormCategory(v.category);
    setFormDescription(v.description);
    setFormBibleVerse(v.bibleVerse);
    setFormVideoUrl(v.videoUrl);
    setFormDuration(v.duration);
    setFormReflectionPrompt(v.reflectionPrompt || '');
    setFormPublished(v.published);
    setShowDesignerModal(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVideoUrl.trim()) return;

    // Convert standard youtube link to embed if needed
    let processedUrl = formVideoUrl.trim();
    if (processedUrl.includes('youtube.com/watch?v=')) {
      const videoId = processedUrl.split('v=')[1]?.split('&')[0];
      if (videoId) processedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (processedUrl.includes('youtu.be/')) {
      const videoId = processedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) processedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    if (editingVideo) {
      setVideos(prev => prev.map(v => v.id === editingVideo.id ? {
        ...v,
        title: formTitle,
        category: formCategory,
        description: formDescription,
        bibleVerse: formBibleVerse,
        videoUrl: processedUrl,
        duration: formDuration,
        reflectionPrompt: formReflectionPrompt,
        published: formPublished
      } : v));
    } else {
      const newVid: ChristianVideo = {
        id: `cv-custom-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        description: formDescription,
        bibleVerse: formBibleVerse,
        videoUrl: processedUrl,
        duration: formDuration,
        createdAt: Date.now(),
        published: formPublished,
        designer: `${user.name} (Parent/Admin Publisher)`,
        reflectionPrompt: formReflectionPrompt
      };
      setVideos(prev => [newVid, ...prev]);
    }

    setShowDesignerModal(false);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this Christian video entry?')) {
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleTogglePublish = (id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, published: !v.published } : v));
  };

  const completedCount = (Object.values(watchLogs) as ChristianVideoWatchLog[]).filter(l => l.completed).length;

  return (
    <section id="christian-videos-center" className="my-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 md:p-10 rounded-[2.5rem] border-4 border-amber-500/30 shadow-2xl text-white relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-xl shadow-amber-500/20 shrink-0">
            <Tv className="w-8 h-8 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Christian Educational Cinema
              </span>

              {mode === 'student' ? (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Student Watch Mode (Read-Only)
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Edit3 className="w-3 h-3" />
                  Parent Video Creator & Designer Studio
                </span>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tight text-white">
              Christian Video Theater & Moral Lessons
            </h2>
            <p className="text-white/70 font-medium text-xs md:text-sm mt-1 max-w-2xl">
              {mode === 'student' 
                ? 'Watch inspiring Christian videos curated by your parent/admin. Learn Bible truths, moral integrity, and reflect on Godly principles!'
                : 'Design, edit, and publish Christian videos for students. Students can watch published videos after app release!'}
            </p>
          </div>
        </div>

        {/* Action Button & Stats */}
        <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between md:justify-end">
          {mode === 'parent' ? (
            <button
              onClick={handleOpenNewVideoForm}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-xl transition-all hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              <span>Design New Christian Video</span>
            </button>
          ) : (
            <div className="bg-slate-900/80 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3 text-xs">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-extrabold text-amber-300">{completedCount} Videos Completed</div>
                <div className="text-[10px] text-white/60 font-medium">Earned Christian Faith Badges</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Read-Only Notice for Students */}
      {mode === 'student' && (
        <div className="my-6 p-4 bg-amber-500/10 border border-amber-400/30 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-200">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Read-Only Student Notice:</strong> Video design and publishing are exclusively managed by your Parent/Admin Publisher. You can watch published videos below and write your reflection notes!
            </span>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase rounded-lg shrink-0">
            Protected Cinema
          </span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-4 my-2 scrollbar-none">
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

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6 relative z-10">
        {displayVideos.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10 p-8">
            <Tv className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <h4 className="font-bold text-lg text-white">No Christian Videos Published in this Category</h4>
            <p className="text-xs text-white/60 mt-1 max-w-md mx-auto">
              {mode === 'student' 
                ? 'Your Parent/Admin will publish new Christian videos soon!' 
                : 'Click "Design New Christian Video" above to create and publish your first video!'}
            </p>
          </div>
        ) : (
          displayVideos.map(video => {
            const isCompleted = watchLogs[video.id]?.completed;
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden hover:border-amber-400/50 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Video Thumbnail / Header Preview */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer" onClick={() => handleOpenVideo(video)}>
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-950 flex items-center justify-center p-6 text-center">
                        <Video className="w-12 h-12 text-amber-400/40" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-slate-950 fill-slate-950 ml-1" />
                      </div>
                    </div>

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-400/30">
                        {video.category}
                      </span>
                      {isCompleted && (
                        <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-lg">
                          <CheckCircle2 className="w-3 h-3" /> Watched
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                      {video.duration}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-headline font-black text-lg text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {video.title}
                    </h3>

                    <p className="text-xs text-amber-300/90 font-semibold italic bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20">
                      "{video.bibleVerse}"
                    </p>

                    <p className="text-xs text-white/70 font-medium line-clamp-3 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-white/50 font-bold">
                    By: {video.designer}
                  </div>

                  {mode === 'parent' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePublish(video.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer",
                          video.published ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                        )}
                      >
                        {video.published ? 'Published' : 'Draft'}
                      </button>
                      <button
                        onClick={() => handleEditVideoForm(video)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer"
                        title="Edit Video"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 rounded-lg text-rose-300 transition-all cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenVideo(video)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Watch & Reflect</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Video Player & Reflection Modal */}
      <AnimatePresence>
        {activeVideo && (
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
                  <span className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
                    <Tv className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      {activeVideo.category} • Christian Theater
                    </span>
                    <h3 className="font-headline font-black text-lg md:text-xl text-white">
                      {activeVideo.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Area */}
              <div className="relative aspect-video bg-black w-full overflow-hidden">
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Lesson Content & Reflection Section */}
              <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto">
                <div className="bg-amber-500/10 border border-amber-400/30 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>Scripture Anchor</span>
                  </div>
                  <p className="text-sm font-black text-amber-200 italic">
                    "{activeVideo.bibleVerse}"
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-white/60 tracking-wider">
                    Lesson Summary & Moral Message
                  </h4>
                  <p className="text-sm text-white/90 font-medium leading-relaxed">
                    {activeVideo.description}
                  </p>
                </div>

                {/* Student Reflection Journal */}
                <div className="p-5 bg-slate-950 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>Student Faith Reflection Note</span>
                  </div>

                  <p className="text-xs font-bold text-white/80">
                    {activeVideo.reflectionPrompt || 'What key takeaway or moral lesson did you learn from this video?'}
                  </p>

                  <textarea
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    placeholder="Type your reflection note here... (e.g. I learned to trust God when facing big challenges!)"
                    rows={3}
                    className="w-full p-3.5 bg-slate-900 border border-white/20 rounded-xl text-white text-xs font-medium focus:ring-2 focus:ring-amber-400 outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-white/50 font-medium">
                    Published by: <strong>{activeVideo.designer}</strong>
                  </div>

                  <button
                    onClick={() => handleCompleteWatch(activeVideo.id)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>Mark as Watched & Save Reflection</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Parent Designer / Creator Modal */}
      <AnimatePresence>
        {showDesignerModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border-2 border-amber-400/50 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl text-white my-8 p-6 md:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-400 text-slate-950 rounded-xl">
                    <Edit3 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-headline font-black text-xl text-white">
                      {editingVideo ? 'Edit Christian Video' : 'Design New Christian Video'}
                    </h3>
                    <p className="text-xs text-white/60">Publish Christian cinema for student watching after app release</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDesignerModal(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
                <div>
                  <label className="block font-extrabold uppercase text-amber-300 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Esther's Bravery & Standing for Justice"
                    className="w-full p-3 bg-slate-950 border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-extrabold uppercase text-amber-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ChristianVideo['category'])}
                      className="w-full p-3 bg-slate-950 border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                    >
                      <option value="Moral Stories">Moral Stories</option>
                      <option value="Bible Heroes">Bible Heroes</option>
                      <option value="Christian Values">Christian Values</option>
                      <option value="Worship & Praise">Worship & Praise</option>
                      <option value="Faith & Science">Faith & Science</option>
                      <option value="Parables">Parables</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold uppercase text-amber-300 mb-1">
                      Duration (e.g. 6:30)
                    </label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="e.g., 7:15"
                      className="w-full p-3 bg-slate-950 border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-amber-300 mb-1">
                    Video Embed URL or YouTube Link *
                  </label>
                  <input
                    type="text"
                    required
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or embed URL"
                    className="w-full p-3 bg-slate-950 border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                  <span className="text-[10px] text-white/50 block mt-1">
                    Paste YouTube links or iframe video embed sources.
                  </span>
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-amber-300 mb-1">
                    Scripture / Bible Verse Reference
                  </label>
                  <input
                    type="text"
                    value={formBibleVerse}
                    onChange={(e) => setFormBibleVerse(e.target.value)}
                    placeholder='e.g. Joshua 1:9 — "Be strong and courageous..."'
                    className="w-full p-3 bg-slate-950 border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-amber-300 mb-1">
                    Video Description & Moral Lesson
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Explain the lesson and moral takeaway..."
                    className="w-full p-3 bg-slate-950 border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-amber-300 mb-1">
                    Student Reflection Question Prompt
                  </label>
                  <input
                    type="text"
                    value={formReflectionPrompt}
                    onChange={(e) => setFormReflectionPrompt(e.target.value)}
                    placeholder="e.g., What is one way you can show courage in faith this week?"
                    className="w-full p-3 bg-slate-950 border border-white/20 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="formPublished"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                  <label htmlFor="formPublished" className="font-bold text-white cursor-pointer">
                    Publish Video immediately for Student Watching
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowDesignerModal(false)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black uppercase cursor-pointer shadow-xl"
                  >
                    Save & Publish Video 🎬
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
