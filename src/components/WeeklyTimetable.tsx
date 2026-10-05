import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { SUBJECTS } from '../constants';

interface TimetableDay {
  day: string;
  focus: string;
  tasks: { icon: string; label: string; color: string; description: string }[];
  activity?: { icon: string; label: string; color: string };
  videoUrl?: string;
}

const WEEK_PLAN: TimetableDay[] = [
  {
    day: 'Monday',
    focus: 'Full Academic Mastery',
    tasks: [
      { icon: 'auto_stories', label: 'All Subject Lessons', color: 'primary', description: 'Complete today\'s curriculum units.' },
      { icon: 'edit_note', label: 'Worksheets', color: 'secondary', description: 'Practice written exercises for all units.' },
      { icon: 'rocket_launch', label: 'Activities', color: 'tertiary', description: 'Engaging interactive subject activities.' }
    ]
  },
  {
    day: 'Tuesday',
    focus: 'Core Theory & Practice',
    tasks: [
      { icon: 'auto_stories', label: 'All Subject Lessons', color: 'primary', description: 'Continue your weekly learning path.' },
      { icon: 'edit_note', label: 'Worksheets', color: 'secondary', description: 'Deep dive into theory with worksheets.' }
    ]
  },
  {
    day: 'Wednesday',
    focus: 'Deep Learning Cycle',
    tasks: [
      { icon: 'auto_stories', label: 'All Subject Lessons', color: 'primary', description: 'Focus on advancing your subject progress.' }
    ]
  },
  {
    day: 'Thursday',
    focus: 'Consolidation Phase',
    tasks: [
      { icon: 'auto_stories', label: 'All Subject Lessons', color: 'primary', description: 'Complete your lessons for the new topics.' }
    ]
  },
  {
    day: 'Friday',
    focus: 'Physical Excellence & Review Drills',
    tasks: [
      { icon: 'bolt', label: 'All Subject Drills', color: 'primary', description: 'Rapid-fire review of the week\'s learning.' }
    ],
    activity: { icon: 'fitness_center', label: 'Physical Exercising', color: 'secondary' },
    videoUrl: 'https://cdn.pixabay.com/video/2021/02/09/64386-510037803_large.mp4' // 3D Animated Fitness Figure
  }
];

export default function WeeklyTimetable({ onStartDrills, grade = 1 }: { onStartDrills?: () => void, grade?: number }) {
  const [selectedDay, setSelectedDay] = React.useState(new Date().getDay() - 1);
  const [timer, setTimer] = React.useState(420); // 7 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [hasStarted, setHasStarted] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const getWeekPlan = (g: number): TimetableDay[] => {
    const plan = [...WEEK_PLAN];
    if (g === 1) {
      const allSubjectTasks = [
        { icon: 'abc', label: 'Alphabet & Phonics', color: 'secondary', description: 'Mastering letters and sounds.' },
        { icon: 'calculate', label: 'Math Basics', color: 'primary', description: 'Numbers, shapes, and counting.' },
        { icon: 'auto_stories', label: 'English & Reading', color: 'tertiary', description: 'Starting our reading journey.' },
        { icon: 'science', label: 'Science Wonders', color: 'secondary', description: 'Exploring God\'s creation.' },
        { icon: 'public', label: 'Social Discovery', color: 'primary', description: 'Learning about our culture.' },
        { icon: 'menu_book', label: 'Bible & Stories', color: 'tertiary', description: 'Faith and moral narratives.' }
      ];

      plan[0] = { day: 'Monday', focus: 'Foundational Mastery: All Subjects', tasks: allSubjectTasks };
      plan[1] = { day: 'Tuesday', focus: 'Foundational Mastery: All Subjects', tasks: allSubjectTasks };
      plan[2] = { day: 'Wednesday', focus: 'Foundational Mastery: All Subjects', tasks: allSubjectTasks };
      plan[3] = { day: 'Thursday', focus: 'Foundational Mastery: All Subjects', tasks: allSubjectTasks };
      plan[4] = { 
        day: 'Friday', 
        focus: 'Academic Excellence & Review Drills', 
        tasks: [
          ...allSubjectTasks.slice(0, 3),
          { icon: 'bolt', label: 'All Subject Drills', color: 'primary', description: 'Rapid-fire review of the week\'s learning.' }
        ],
        activity: { icon: 'fitness_center', label: 'Physical Exercising', color: 'secondary' },
        videoUrl: 'https://cdn.pixabay.com/video/2021/02/09/64386-510037803_large.mp4'
      };
    }
    return plan;
  };

  const currentPlan = getWeekPlan(grade);

  // Normalize Sunday (0)/Saturday (6) to Monday if needed
  const displayDayIdx = selectedDay < 0 || selectedDay > 4 ? 0 : selectedDay;
  const currentDay = currentPlan[displayDayIdx];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      // Use a more professional sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const britishVoice = voices.find(v => v.lang.includes('GB'));
      if (britishVoice) utterance.voice = britishVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  React.useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      // Voice triggers at specific intervals
      if (timer === 420) speak("Welcome to your seven minute exercise mission. Please mirror my movements exactly. Let's begin!");
      if (timer === 360) speak("Excellent work scholar. Keep following the AI trainer carefully.");
      if (timer === 300) speak("Maintain your form and energy. Five minutes remaining.");
      if (timer === 210) speak("You are half way through the mission. You are doing great!");
      if (timer === 120) speak("Only two minutes left. Deep breaths and stay focused.");
      if (timer === 60) speak("Final minute! Finish strong!");
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      speak("Mission complete! Well done for finishing your seven minutes of excellence. You are now ready for your subject drills.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDaySelect = (idx: number) => {
    setSelectedDay(idx);
    if (idx !== 4) {
      setIsTimerRunning(false);
      setTimer(420);
      setHasStarted(false);
    }
  };

  const startMission = () => {
    setHasStarted(true);
    setIsTimerRunning(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="text-center md:text-left">
        <h1 className="font-headline text-4xl font-extrabold text-on-surface">Weekly Academic Planner</h1>
        <p className="text-on-surface-variant font-medium mt-2">Your roadmap for school days: Monday to Friday.</p>
      </header>

      {/* Day Selector */}
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {currentPlan.map((item, idx) => (
          <button
            key={item.day}
            onClick={() => handleDaySelect(idx)}
            className={cn(
              "px-6 py-3 rounded-2xl font-headline font-black transition-all active:scale-95",
              displayDayIdx === idx 
                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {item.day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's Focus Card */}
        <div className="lg:col-span-12">
          <motion.div 
            key={currentDay.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-surface-container relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[10rem] -z-10" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block font-headline">Daily Mission</span>
                <h2 className="text-5xl font-black text-on-surface">{currentDay.day}</h2>
                <div className="mt-4 flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full w-fit">
                  <span className="material-symbols-outlined text-sm">target</span>
                  <span className="text-xs font-bold uppercase tracking-widest">{currentDay.focus}</span>
                </div>
              </div>

              {currentDay.activity && (
                <div className="bg-secondary-container p-6 rounded-3xl border-2 border-dashed border-secondary/30 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-lg">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {currentDay.activity.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-secondary/70 tracking-widest">Main Activity</p>
                    <p className="text-xl font-black text-secondary">{currentDay.activity.label}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentDay.tasks.map((task, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (task.label === 'All Subject Drills' && onStartDrills) {
                      onStartDrills();
                    }
                  }}
                  className={cn(
                    "bg-surface-container-low p-6 rounded-3xl border border-surface-container flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all",
                    task.label === 'All Subject Drills' ? "cursor-pointer border-primary/30 ring-1 ring-primary/20" : "cursor-default"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3",
                    `bg-${task.color}-container text-on-${task.color}-container`
                  )}>
                    <span className="material-symbols-outlined text-3xl">{task.icon}</span>
                  </div>
                  <h4 className="text-lg font-black text-on-surface mb-2">{task.label}</h4>
                  <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                    {task.description}
                  </p>
                  {task.label === 'All Subject Drills' && (
                    <div className="mt-4 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full group-hover:bg-primary-dim transition-colors">
                      Start Drills
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {currentDay.videoUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12 space-y-4"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-on-surface tracking-tight uppercase">AI EXERCISE TEACHER</h3>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest italic">Live Instructional Stream</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border-4 border-white ring-2 ring-black/5 bg-slate-950 relative group/video">
                  {/* Camera Viewfinder Overlay */}
                  <div className="absolute inset-0 border-[20px] border-transparent border-t-white/10 border-l-white/10 w-16 h-16 top-4 left-4 z-10" />
                  <div className="absolute inset-0 border-[20px] border-transparent border-b-white/10 border-r-white/10 w-16 h-16 bottom-4 right-4 z-10 self-end" />
                  
                  <video 
                    ref={videoRef}
                    src={currentDay.videoUrl} 
                    className={cn(
                      "w-full h-full object-cover transition-all duration-1000",
                      !hasStarted ? "blur-xl brightness-50 scale-110" : "shadow-inner scale-100"
                    )}
                    controls={hasStarted}
                    loop
                    muted={!hasStarted}
                    playsInline
                    onPlay={() => setIsTimerRunning(true)}
                    onPause={() => setIsTimerRunning(false)}
                  />
                  
                  {!hasStarted && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startMission}
                        className="bg-primary text-white px-12 py-8 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col items-center gap-4 active:bg-primary-dim transition-all"
                      >
                        <span className="material-symbols-outlined text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>video_chat</span>
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-black tracking-tighter">WATCH AI TEACHER</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Start Exercise Video</span>
                        </div>
                      </motion.button>
                    </div>
                  )}

                  {/* Native Session Banner */}
                  <div className="absolute top-8 left-8 pointer-events-none z-10">
                    <motion.div 
                      key={hasStarted ? 'active' : 'ready'}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={cn(
                        "backdrop-blur-xl text-white px-8 py-4 rounded-3xl flex items-center gap-4 shadow-2xl border border-white/20",
                        hasStarted ? "bg-red-600/90" : "bg-black/60"
                      )}
                    >
                      <span className="material-symbols-outlined animate-pulse text-3xl">
                        {hasStarted ? 'sensors' : 'videocam_off'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black uppercase tracking-widest opacity-80">
                          {hasStarted ? 'Teacher On Screen' : 'Teacher Ready'}
                        </span>
                        <span className="text-lg font-black italic text-white shadow-sm">
                          {hasStarted ? 'WATCH & COPY EVERY MOVE!' : 'AI Teacher is Warming Up'}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* 7-Minute Timer HUD */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-primary/50 flex items-center justify-center relative">
                        <svg className="w-full h-full -rotate-90 absolute inset-0">
                          <circle 
                            cx="20" cy="20" r="18" fill="none" 
                            stroke="currentColor" strokeWidth="2"
                            className="text-white/10"
                            transform="translate(-2,-2)"
                          />
                          <circle 
                            cx="20" cy="20" r="18" fill="none" 
                            stroke="currentColor" strokeWidth="2"
                            className="text-primary transition-all duration-1000"
                            strokeDasharray="113"
                            strokeDashoffset={113 - (113 * (timer / 420))}
                            transform="translate(-2,-2)"
                          />
                        </svg>
                        <span className="material-symbols-outlined text-sm">timer</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Mission Time</span>
                        <span className="text-xl font-black tabular-nums">{formatTime(timer)}</span>
                      </div>
                    </div>
                  </div>

                  {timer === 0 && (
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-40">
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-20 h-20 bg-white text-secondary rounded-full flex items-center justify-center mb-6 shadow-2xl">
                        <span className="material-symbols-outlined text-5xl">task_alt</span>
                      </motion.div>
                      <h3 className="text-4xl font-black text-white mb-2">Mission Complete!</h3>
                      <p className="text-white/80 font-bold text-lg">Your body and mind are now prepared for subject drills.</p>
                    </div>
                  )}

                  {hasStarted && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                      {/* AI Scanner Line */}
                      <motion.div 
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-secondary shadow-[0_0_15px_rgba(52,199,89,0.8)] opacity-40"
                      />
                      {/* Digital Tracking Corners */}
                      <div className="absolute inset-10 border border-secondary/20 opacity-30 rounded-3xl" />
                      
                      {/* Live Tracking Label */}
                      <div className="absolute bottom-10 right-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <motion.div 
                          animate={{ opacity: [1, 0.4, 1] }} 
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-secondary" 
                        />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE COPY MODE</span>
                      </div>
                    </div>
                  )}

                  {hasStarted && (
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-end opacity-0 group-hover/video:opacity-100 transition-opacity pointer-events-none z-10">
                      <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.4em]">Copy the AI model perfectly</p>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  Your AI Teacher is monitoring your exercise mission
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Weekly Summary Grid */}
        <div className="lg:col-span-12 space-y-6">
          <h3 className="text-2xl font-black text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">calendar_view_week</span>
            Weekly Schedule Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {currentPlan.map((day, idx) => (
              <button 
                key={day.day}
                onClick={() => handleDaySelect(idx)}
                className={cn(
                  "p-6 rounded-[2rem] border transition-all text-left w-full h-full cursor-pointer",
                  displayDayIdx === idx 
                    ? "bg-primary text-white border-primary shadow-lg scale-105 z-10" 
                    : "bg-white text-on-surface border-surface-container hover:border-primary/30 hover:shadow-md"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{day.day}</p>
                  {new Date().getDay() - 1 === idx && (
                    <div className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shadow-sm" />
                  )}
                </div>
                <p className="font-bold text-sm mb-4 line-clamp-1">{day.focus}</p>
                
                <div className="space-y-2">
                  {day.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 opacity-80">
                      <span className="material-symbols-outlined text-[16px]">{task.icon}</span>
                      <span className="text-[10px] font-bold">{task.label}</span>
                    </div>
                  ))}
                  {day.activity && (
                    <div className={cn(
                      "flex items-center gap-2 mt-2 p-2 rounded-lg",
                      displayDayIdx === idx ? "bg-white/20 text-white" : "bg-secondary/10 text-secondary"
                    )}>
                      <span className="material-symbols-outlined text-[14px]">fitness_center</span>
                      <span className="text-[9px] font-black uppercase">Exercise</span>
                    </div>
                  )}
                  {day.day === 'Friday' && (
                    <div className={cn(
                      "flex items-center gap-2 mt-1 p-2 rounded-lg",
                      displayDayIdx === idx ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}>
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      <span className="text-[9px] font-black uppercase">Drills</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* School Values Section */}
        <div className="lg:col-span-12 bg-surface-container-low p-8 rounded-[3rem] border border-surface-container text-center">
          <p className="text-sm font-bold text-on-surface-variant italic leading-relaxed">
            "Excellence is not an act, but a habit. Consistent daily learning from Monday to Friday builds the foundation for your future leadership."
          </p>
          <div className="mt-4 flex justify-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              High Standards
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Mastery Focus
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-tertiary">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Physical Health
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
