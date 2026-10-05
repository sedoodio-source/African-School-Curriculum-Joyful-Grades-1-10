import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Target, 
  Users, 
  Layout, 
  Award, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  PlayCircle,
  Menu,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  HelpCircle,
  Compass,
  GraduationCap,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import Logo from './Logo';
import kidsLearningImg from '../assets/images/african_kids_learning_1783017045072.jpg';

export default function LandingPage({ 
  onSelectRole,
  onSelectView
}: { 
  onSelectRole: (role: 'student' | 'parent') => void;
  onSelectView: (view: 'landing' | 'login' | 'dashboard' | 'subject' | 'lesson' | 'parent' | 'final-exam' | 'drills' | 'payment-plans') => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: "Interactive Lessons",
      description: "Engaging curriculum designed specifically for Grade 1-10 students, following the latest African educational standards.",
      icon: <Layout className="w-6 h-6 text-primary" />,
      color: "bg-primary/10"
    },
    {
      title: "Vast Digital Library",
      description: "Access hundreds of novels, Christian stories, and educational books with rich, multi-page content.",
      icon: <BookOpen className="w-6 h-6 text-secondary" />,
      color: "bg-secondary/10"
    },
    {
      title: "Rapid-Fire Drills",
      description: "Build mastery through focused 20-question sessions with immediate feedback and subject cycling.",
      icon: <Target className="w-6 h-6 text-tertiary" />,
      color: "bg-tertiary/10"
    },
    {
      title: "WAEC & JAMB CBT Center",
      description: "Opens upon finishing all grades (1-10). Features authentic WASSCE theory marking schemes and authentic 8-key JAMB UTME computer-based simulations.",
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-500/10"
    },
    {
      title: "Parental Insights",
      description: "A dedicated portal for parents to track progress, scores, and celebrate every learning milestone.",
      icon: <Users className="w-6 h-6 text-primary" />,
      color: "bg-primary/10"
    },
    {
      title: "Gamified Awards",
      description: "Earn badges and reach milestones that turn the educational journey into an exciting adventure.",
      icon: <Award className="w-6 h-6 text-secondary" />,
      color: "bg-secondary/10"
    },
    {
      title: "Cultural Relevance",
      description: "Content that reflects the richness of African heritage combined with global educational excellence.",
      icon: <Globe className="w-6 h-6 text-tertiary" />,
      color: "bg-tertiary/10"
    }
  ];

  const gradeTracks = [
    { range: "Primary", grades: "Grades 1 – 5", focus: "Foundational mastery in Literacy, Numeracy, and Discovery." },
    { range: "Middle School", grades: "Grades 6 – 8", focus: "Exploring complex concepts in Science, Social Studies, and Literature." },
    { range: "Senior Levels", grades: "Grades 9 – 10", focus: "Advanced preparation and critical thinking for future success." }
  ];

  // Grade Plan Details
  const GRADE_PLAN_DETAILS = [
    {
      grade: 1,
      title: "Grade 1 - Early Foundations",
      summary: "In Grade 1, young learners master alphabet phonics, basic arithmetic, spelling, early science observation, and introductory reading designed to foster academic confidence.",
      subjects: ["Alphabet", "Math", "English", "Science", "Spelling"]
    },
    {
      grade: 2,
      title: "Grade 2 - Creative Discovery",
      summary: "In Grade 2, pupils delve into word building, fluent reading patterns, interactive scientific observations of plants & animals, local geography, and introductory literature.",
      subjects: ["Math", "English", "Science", "Social Studies", "Literature"]
    },
    {
      grade: 3,
      title: "Grade 3 - Academic Expansion",
      summary: "Grade 3 introduces structured paragraphs, multiplication tables, energy and force physics basics, West African history, and classic moral books.",
      subjects: ["Math", "English", "Science", "Social Studies", "Bible Study", "Literature"]
    },
    {
      grade: 4,
      title: "Grade 4 - Analytical Mastery",
      summary: "Grade 4 students explore fraction calculations, human anatomy biology, regional geography, advanced essay formats, and complex spelling logs.",
      subjects: ["Math", "English", "Science", "Social Studies", "Spelling", "Literature"]
    },
    {
      grade: 5,
      title: "Grade 5 - Junior Secondary Prep",
      summary: "In Grade 5, lessons transition to decimal math, national history, properties of matter, moral ethics, and advanced reading comprehension strategies.",
      subjects: ["Math", "English", "Science", "Social Studies", "Bible Study", "Spelling"]
    },
    {
      grade: 6,
      title: "Grade 6 - Secondary Transition",
      summary: "Grade 6 guides students through algebraic foundations, world ecosystems, historical African empires, complex sentence structures, and advanced ethics.",
      subjects: ["Math", "English", "Science", "Social Studies", "Spelling", "Literature"]
    },
    {
      grade: 7,
      title: "Grade 7 - High School Core",
      summary: "In Grade 7, students tackle advanced linear equations, physical science mechanics, African geography, poetry analysis, and civic rights.",
      subjects: ["Math", "English", "Science", "Social Studies", "Spelling", "Literature"]
    },
    {
      grade: 8,
      title: "Grade 8 - Critical Inquiry",
      summary: "Grade 8 focuses on geometric proofs, thermal physics, civic responsibility, global literature masterpieces, and structured spelling drills.",
      subjects: ["Math", "English", "Science", "Social Studies", "Spelling", "Bible Study"]
    },
    {
      grade: 9,
      title: "Grade 9 - Senior Level Foundations",
      summary: "Grade 9 introduces senior-level chemistry, quadratic equation methods, cell biology, West African history logs, and classic literature analysis.",
      subjects: ["Math", "English", "Science", "Social Studies", "Literature"]
    },
    {
      grade: 10,
      title: "Grade 10 - Graduation & Excellence",
      summary: "Our highest grade level features pre-calculus logic, organic chemistry, global economic systems, advanced essay thesis logs, and leadership projects.",
      subjects: ["Math", "English", "Science", "Social Studies", "Literature", "Bible Study"]
    }
  ];

  const [showPrivacyPortal, setShowPrivacyPortal] = useState(false);
  const [privacyPortalStep, setPrivacyPortalStep] = useState(1); // 1: Info, 2: Payment prompt
  const [privacyData, setPrivacyData] = useState({ name: '', address: '', password: '' });

  // Payment requirements and checkouts states
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [selectedGradeForCheckout, setSelectedGradeForCheckout] = useState<number | null>(null);
  const [isPayingAiTeach, setIsPayingAiTeach] = useState(false);

  // Custom amounts starting at base prices (15,000 for grade, 20,000 for AI Teach)
  const [customAmounts, setCustomAmounts] = useState<Record<number, number>>({
    1: 15000, 2: 15000, 3: 15000, 4: 15000, 5: 15000,
    6: 15000, 7: 15000, 8: 15000, 9: 15000, 10: 15000
  });
  const [aiTeachAmount, setAiTeachAmount] = useState<number>(20000);

  // Checkout billing form
  const [checkoutForm, setCheckoutForm] = useState({
    childName: '',
    parentName: '',
    email: '',
    paymentMethod: 'paystack' // paystack, flutterwave, bank_transfer, ussd
  });
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Robust detection for "the website" (shared/production) vs "Google AI Studio" (dev)
  const isSharedApp = typeof window !== 'undefined' && 
    (window.location.hostname.includes('ais-pre') || 
     (!window.location.hostname.includes('ais-dev') && !window.location.hostname.includes('localhost')));

  const [registeredChildren, setRegisteredChildren] = useState<{name: string, grade: number}[]>(() => {
    try {
      const saved = localStorage.getItem('asc_registered_children');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const hasRegisteredChildren = registeredChildren.length > 0;

  const handleParentSelect = () => {
    onSelectRole('parent');
  };

  const handleStudentSelect = () => {
    onSelectRole('student');
  };

  const handlePrivacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPrivacyPortalStep(2);
  };

  const Nav = () => (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-on-surface/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo size="md" />
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-widest text-on-surface-variant">Features</a>
          <button 
            type="button"
            onClick={() => onSelectView('payment-plans')}
            className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"
          >
            Payment Plans
            <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse">₦</span>
          </button>
          <a href="#curriculum" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-widest text-on-surface-variant">Curriculum</a>
          <button 
            onClick={handleStudentSelect}
            className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg transition-all"
          >
            Student Login
          </button>
          <button 
            onClick={handleParentSelect}
            className="px-6 py-2.5 bg-tertiary text-on-tertiary rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg transition-all"
          >
            Parent Portal
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b absolute top-20 left-0 w-full p-6 flex flex-col gap-6 shadow-xl">
          <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Features</a>
          <button 
            type="button"
            onClick={() => { setIsMenuOpen(false); onSelectView('payment-plans'); }}
            className="text-lg font-bold text-left flex items-center gap-2"
          >
            Payment Plans
            <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-bold">₦</span>
          </button>
          <a href="#curriculum" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Curriculum</a>
          <div className="flex flex-col gap-4 pt-4 border-t">
            <button onClick={() => { handleStudentSelect(); setIsMenuOpen(false); }} className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest">Student Login</button>
            <button onClick={() => { handleParentSelect(); setIsMenuOpen(false); }} className="w-full py-4 bg-tertiary-container text-on-tertiary-container rounded-2xl font-bold uppercase tracking-widest">Parent Portal</button>
          </div>
        </div>
      )}
    </nav>
  );

  return (
    <div className="text-on-surface selection:bg-primary/20 relative">
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary font-bold text-xs uppercase tracking-widest"
            >
              <CheckCircle2 size={14} />
              Accredited Grade 1-10 Curriculum
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-serif font-black leading-[0.9] tracking-tighter"
            >
              Where Learning is a <span className="text-primary italic">Joyful</span> Adventure.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-on-surface-variant max-w-xl font-medium leading-relaxed"
            >
              Empowering the next generation of African leaders through interactive discovery, 
              Christian values, and global excellence.
            </motion.p>

            {hasRegisteredChildren && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center gap-4 shadow-sm max-w-xl"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Offline Registry Active</h4>
                  <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                    Registered: {registeredChildren.map((c: any) => `${c.name} (Grade ${c.grade})`).join(', ')}. Enjoy FULL UNINTERRUPTED ACCESS!
                  </p>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={handleStudentSelect}
                className="px-8 py-4 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center gap-3"
              >
                Log into Student Portal
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={handleParentSelect}
                className="px-8 py-4 bg-white border-2 border-on-surface/10 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-on-surface/5 transition-all flex items-center gap-3"
              >
                Enter Parent Portal
                <Users size={18} />
              </button>
              <button 
                onClick={() => onSelectView('payment-plans')}
                className="px-8 py-4 bg-secondary text-white rounded-3xl font-black text-xs uppercase tracking-[0.15em] shadow-xl hover:scale-105 transition-all flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-lg">payments</span>
                Payment Plans
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative w-full order-1 lg:order-2"
          >
            <div className="relative z-10 bg-white rounded-[3rem] p-4 shadow-2xl border-4 border-primary/10 overflow-hidden group">
              <div className="relative h-96 md:h-[28rem] rounded-[2.5rem] overflow-hidden">
                <img 
                  src={kidsLearningImg} 
                  alt="African Scholars Learning" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Grades 1 to 10 Ready</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="px-3 py-1 bg-secondary text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    African Standard Curriculum
                  </span>
                  <h3 className="text-2xl font-black font-display leading-tight">
                    Empowering African Excellence
                  </h3>
                  <p className="text-xs text-white/80 font-medium">
                    Complete 4-Term subjects, 500+ library books, and rapid-fire drills designed for academic brilliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -top-10 -right-10 w-48 h-48 bg-tertiary-container/30 rounded-[3rem] -z-10 rotate-12" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-primary-container/30 rounded-full -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-y border-on-surface/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-display font-black text-primary">10+</div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-2">Grades Supported</p>
            </div>
            <div>
              <div className="text-5xl font-display font-black text-secondary">500+</div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-2">Books & Novels</p>
            </div>
            <div>
              <div className="text-5xl font-display font-black text-tertiary">2k+</div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-2">Interactive Tasks</p>
            </div>
            <div>
              <div className="text-5xl font-display font-black text-primary">100%</div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-2">African Standard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <h2 className="text-5xl font-serif font-black leading-tight">Everything needed for academic brilliance.</h2>
            <p className="text-on-surface-variant text-lg font-medium leading-relaxed">
              We've built a holistic ecosystem that supports both direct study and independent exploration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all border border-on-surface/5"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8", feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
                <p className="text-on-surface-variant font-medium leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Relocated Payments & Solutions Section */}
      <section id="payments" className="py-24 bg-surface-container-lowest relative z-10 scroll-mt-20 border-t border-on-surface/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border-2 border-on-surface/5 space-y-6 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 opacity-5 group-hover:opacity-10 transition-all">
              <span className="material-symbols-outlined text-[150px]">folder</span>
            </div>

            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-secondary">
              <span className="material-symbols-outlined text-4xl">folder_open</span>
            </div>

            <div className="space-y-3">
              <span className="px-3.5 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                Relocated to dedicated folder
              </span>
              <h2 className="text-4xl font-serif font-black text-on-surface">
                Looking for our Payment Plans?
              </h2>
              <p className="text-on-surface-variant text-sm font-semibold max-w-xl mx-auto leading-relaxed">
                We have moved our Grade-by-Grade tuition solutions, live Google Meet AI Teach cohorts, voluntary computer lab contributions, and guidelines into a dedicated <strong>Payment Plans Folder</strong> to keep your homepage clean.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectView('payment-plans')}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 mx-auto"
            >
              <span className="material-symbols-outlined text-base">folder_open</span>
              Open Payment Plans Folder
            </button>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-32 bg-primary text-white overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-serif font-black leading-tight mb-8">
                Curriculum tailored for every growth stage.
              </h2>
              <p className="text-white/70 text-lg mb-12">
                Our tracks are carefully structured to evolve with your child's cognitive development. 
                From foundation years to final examinations.
              </p>
              
              <div className="space-y-6">
                {gradeTracks.map((track, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-container">{track.range}</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{track.grades}</span>
                    </div>
                    <p className="font-bold text-lg">{track.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop" 
                  className="rounded-3xl aspect-square object-cover shadow-2xl rotate-3" 
                  alt="Students learning" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop" 
                  className="rounded-3xl aspect-[3/4] object-cover shadow-2xl -translate-y-12 -rotate-3" 
                  alt="Education" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop" 
                  className="rounded-3xl aspect-[3/4] object-cover shadow-2xl -translate-y-12" 
                  alt="Classroom" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1510172951991-85616e6d1ce2?q=80&w=800&auto=format&fit=crop" 
                  className="rounded-3xl aspect-square object-cover shadow-2xl rotate-6" 
                  alt="Library" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-on-surface/5 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <Logo size="sm" className="mx-auto" />
          <div className="flex justify-center gap-8 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">About Us</a>
            {isSharedApp ? (
              <button 
                onClick={() => { setShowPrivacyPortal(true); setPrivacyPortalStep(1); }}
                className="hover:text-primary transition-colors uppercase tracking-widest"
              >
                Parental Privacy
              </button>
            ) : (
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            )}
            <button 
              onClick={() => {
                if (isSharedApp) {
                  alert("Terms of Service: To enter the portal, a volunteer parent must pay 15,000 Naira. Chat with 08025719336 for details.");
                } else {
                  alert("Standard Terms of Service apply.");
                }
              }}
              className="hover:text-primary transition-colors uppercase tracking-widest"
            >
              Terms of Service
            </button>
          </div>
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] opacity-30">
            © 2026 African School Curriculum • Empowering Excellence
          </div>
        </div>
      </footer>

      {/* Parental Privacy Portal Modal (Website Only) */}
      <AnimatePresence>
        {isSharedApp && showPrivacyPortal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyPortal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              {privacyPortalStep === 1 ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-3xl font-serif font-black mb-2">Parental Privacy Portal</h3>
                    <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Sign in to manage your privacy</p>
                  </div>
                  <form onSubmit={handlePrivacySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface/50 ml-4">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={privacyData.name}
                        onChange={(e) => setPrivacyData({...privacyData, name: e.target.value})}
                        className="w-full px-6 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold"
                        placeholder="Enter your name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface/50 ml-4">Address</label>
                      <input 
                        required
                        type="text" 
                        value={privacyData.address}
                        onChange={(e) => setPrivacyData({...privacyData, address: e.target.value})}
                        className="w-full px-6 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold"
                        placeholder="Home Address" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface/50 ml-4">Secret Password</label>
                      <input 
                        required
                        type="password" 
                        value={privacyData.password}
                        onChange={(e) => setPrivacyData({...privacyData, password: e.target.value})}
                        className="w-full px-6 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold"
                        placeholder="••••••••" 
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all mt-4"
                    >
                      Login to Privacy Hub
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowPrivacyPortal(false)}
                      className="w-full py-3 text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-8 py-4">
                   <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-primary">chat_bubble</span>
                  </div>
                  <h3 className="text-3xl font-serif font-black leading-tight">
                    Are you ready to chat 08025719336 and pay 15,000?
                  </h3>
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => {
                        window.open("https://wa.me/2348025719336", "_blank");
                        setShowPrivacyPortal(false);
                      }}
                      className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      I am Ready
                    </button>
                    <button 
                      onClick={() => setShowPrivacyPortal(false)}
                      className="w-full py-5 bg-surface text-on-surface rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-2 border-on-surface/5 hover:bg-on-surface/5 transition-all"
                    >
                      Not yet
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
