import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  Lock, 
  Check, 
  Laptop, 
  Video, 
  Award, 
  Info, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Building,
  GraduationCap
} from 'lucide-react';
import Logo from './Logo';
import { cn } from '../lib/utils';

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

interface PaymentPlansProps {
  onBack: () => void;
}

type FolderTab = 'grades' | 'aiteach' | 'requirements' | 'receipts';

export default function PaymentPlans({ onBack }: PaymentPlansProps) {
  const [activeTab, setActiveTab] = useState<FolderTab>('grades');
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
    paymentMethod: 'paystack' // paystack, flutterwave
  });
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  
  // Local registered children history
  const [registeredChildren, setRegisteredChildren] = useState<{name: string, grade: number}[]>(() => {
    try {
      const saved = localStorage.getItem('asc_registered_children');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      {/* Upper Navigation & Back Link */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to previous page
        </button>
        <div className="flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full text-secondary font-black text-[10px] uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm">folder_open</span>
          Payment Plans Folder
        </div>
      </div>

      {/* Header section inside the payment plans folder */}
      <header className="mb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-black tracking-tight text-on-surface flex items-center gap-3 flex-wrap">
          <span>Tuition & Enrollment</span>
          <span className="text-secondary italic">Folder</span>
        </h1>
        <p className="text-lg text-on-surface-variant font-medium mt-3 max-w-2xl">
          Review standard accredited African Grade tuitions, customize support amounts, join live Google Meet cohorts, or generate offsite payments.
        </p>
      </header>

      {/* PHYSICAL FILE FOLDER LAYOUT CONTAINER */}
      <div className="relative bg-white rounded-b-[3rem] rounded-tr-[3rem] shadow-2xl border-2 border-on-surface/5 overflow-hidden">
        
        {/* FOLDER INDEX TABS AT THE TOP */}
        <div className="flex flex-wrap bg-surface-container-low border-b border-on-surface/5">
          <button 
            onClick={() => setActiveTab('grades')}
            className={cn(
              "px-6 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-r border-on-surface/5 transition-all outline-none",
              activeTab === 'grades' 
                ? "bg-white text-primary border-t-4 border-t-primary" 
                : "text-on-surface-variant/70 hover:bg-on-surface/5"
            )}
          >
            <GraduationCap className="w-4 h-4 text-primary" />
            Grade Activations (₦15k)
          </button>
          <button 
            onClick={() => setActiveTab('aiteach')}
            className={cn(
              "px-6 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-r border-on-surface/5 transition-all outline-none",
              activeTab === 'aiteach' 
                ? "bg-white text-secondary border-t-4 border-t-secondary" 
                : "text-on-surface-variant/70 hover:bg-on-surface/5"
            )}
          >
            <Video className="w-4 h-4 text-secondary" />
            AI Teach Google Meet (₦20k)
          </button>
          <button 
            onClick={() => setActiveTab('requirements')}
            className={cn(
              "px-6 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-r border-on-surface/5 transition-all outline-none",
              activeTab === 'requirements' 
                ? "bg-white text-tertiary border-t-4 border-t-tertiary" 
                : "text-on-surface-variant/70 hover:bg-on-surface/5"
            )}
          >
            <Info className="w-4 h-4 text-tertiary" />
            Guidelines & Requirements
          </button>
          <button 
            onClick={() => setActiveTab('receipts')}
            className={cn(
              "px-6 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all outline-none",
              activeTab === 'receipts' 
                ? "bg-white text-emerald-600 border-t-4 border-t-emerald-600" 
                : "text-on-surface-variant/70 hover:bg-on-surface/5"
            )}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            My Payments & Receipts
          </button>
        </div>

        {/* FOLDER CONTENT PANEL */}
        <div className="p-8 md:p-12">
          
          {/* TAB 1: GRADE PLANS */}
          {activeTab === 'grades' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-on-surface/10 pb-6">
                <div>
                  <h3 className="text-2xl font-serif font-black text-on-surface">Grade-by-Grade Tuition</h3>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">Pay per grade level to activate full curriculum terms 1–4</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs font-bold max-w-md">
                  💡 Parents can adjust slider values to contribute more money to help fund physical school computer labs.
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {GRADE_PLAN_DETAILS.map((plan) => {
                  const currentVal = customAmounts[plan.grade] || 15000;
                  return (
                    <div 
                      key={plan.grade} 
                      className="bg-surface-container-lowest rounded-[2.5rem] p-8 border border-on-surface/5 hover:border-secondary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-all">
                        <Laptop className="w-12 h-12" />
                      </div>

                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
                            Accredited Unit
                          </span>
                          <h4 className="text-2xl font-serif font-black text-on-surface mt-1.5">{plan.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Tuition</span>
                          <span className="text-xl font-black text-secondary">₦15,000</span>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-on-surface-variant leading-relaxed mb-4">
                        {plan.summary}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {plan.subjects.map((subj) => (
                          <span key={subj} className="bg-surface-container-high px-2 py-0.5 rounded-lg text-[9px] font-bold text-on-surface-variant">
                            {subj}
                          </span>
                        ))}
                      </div>

                      {/* Adjuster to pay more */}
                      <div className="bg-white rounded-2xl p-4 border border-on-surface/5 mb-6 shadow-inner">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-amber-500 animate-pulse">volunteer_activism</span>
                            Optional hub contribution:
                          </span>
                          <span className="text-[10px] font-black text-secondary bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10">
                            Total: ₦{currentVal.toLocaleString()}
                          </span>
                        </div>
                        
                        <input 
                          type="range"
                          min="15000"
                          max="100000"
                          step="5000"
                          value={currentVal}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setCustomAmounts(prev => ({ ...prev, [plan.grade]: val }));
                          }}
                          className="w-full accent-secondary h-1.5 rounded bg-surface-container cursor-pointer"
                        />

                        <div className="flex justify-between text-[8px] font-bold text-on-surface-variant/40 mt-1">
                          <span>Base: ₦15k</span>
                          <span>Sponsor: ₦50k</span>
                          <span>Patron: ₦100k</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGradeForCheckout(plan.grade);
                          setIsPayingAiTeach(false);
                          setCheckoutSuccess(false);
                          setCheckoutForm({ childName: '', parentName: '', email: '', paymentMethod: 'paystack' });
                        }}
                        className="w-full py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Unlock Grade {plan.grade} (₦{currentVal.toLocaleString()})
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AI TEACH CLASSROOM */}
          {activeTab === 'aiteach' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-gradient-to-br from-primary to-primary-container text-white rounded-[3rem] p-8 md:p-12 shadow-xl border-4 border-white/15 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 opacity-10">
                  <Video className="w-64 h-64" />
                </div>

                <div className="max-w-3xl space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white font-bold text-xs uppercase tracking-widest">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    Live Digital Cohorts
                  </div>

                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h3 className="text-4xl md:text-5xl font-serif font-black leading-tight text-white">AI Teach Classroom</h3>
                      <p className="text-sm font-semibold uppercase tracking-widest text-primary-container mt-1">Taught live via Google Meet</p>
                    </div>
                    <div className="text-right bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
                      <span className="text-[10px] text-white/80 uppercase block font-bold">Standard Fee</span>
                      <span className="text-2xl font-black text-white">₦20,000</span>
                    </div>
                  </div>

                  <p className="text-sm text-white/90 leading-relaxed font-semibold">
                    Enroll your children in our live, highly collaborative <strong>two-week Google Meeting Beginners Class</strong>. Students learn essential computer fundamentals, virtual schooling software, secure file management, and online productivity taught live by accredited instructors starting every Monday!
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold text-white/95">
                    <div className="flex items-center gap-2.5 bg-white/10 p-4 rounded-2xl border border-white/5">
                      <span className="material-symbols-outlined text-amber-300">calendar_month</span>
                      2 Weeks Immersive Cohort
                    </div>
                    <div className="flex items-center gap-2.5 bg-white/10 p-4 rounded-2xl border border-white/5">
                      <span className="material-symbols-outlined text-emerald-300">video_chat</span>
                      Live Interactive Google Meet Meetings
                    </div>
                  </div>

                  {/* Sponsoring system for AI Teach */}
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/10 font-sans">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-amber-300 animate-bounce">volunteer_activism</span>
                        Fund more seats or support?
                      </span>
                      <span className="text-xs font-black text-primary-container bg-white px-3 py-1 rounded-lg">
                        Total Amount: ₦{aiTeachAmount.toLocaleString()}
                      </span>
                    </div>

                    <input 
                      type="range"
                      min="20000"
                      max="120000"
                      step="10000"
                      value={aiTeachAmount}
                      onChange={(e) => setAiTeachAmount(parseInt(e.target.value))}
                      className="w-full accent-white h-1.5 rounded bg-white/30 cursor-pointer"
                    />

                    <div className="flex justify-between text-[9px] font-bold text-white/50 mt-1">
                      <span>Baseline: ₦20,000</span>
                      <span>Sponsor Seats: ₦70,000</span>
                      <span>Patron Level: ₦120,000</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button 
                        type="button"
                        onClick={() => setAiTeachAmount(20000)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                          aiTeachAmount === 20000 
                            ? "bg-white text-primary border-white" 
                            : "bg-transparent text-white border-white/20 hover:bg-white/10"
                        )}
                      >
                        ₦20,000 (Standard)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAiTeachAmount(40000)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                          aiTeachAmount === 40000 
                            ? "bg-white text-primary border-white" 
                            : "bg-transparent text-white border-white/20 hover:bg-white/10"
                        )}
                      >
                        Sponsor 2 students (₦40k)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAiTeachAmount(80000)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                          aiTeachAmount === 80000 
                            ? "bg-white text-primary border-white" 
                            : "bg-transparent text-white border-white/20 hover:bg-white/10"
                        )}
                      >
                        Sponsor 4 students (₦80k)
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPayingAiTeach(true);
                      setSelectedGradeForCheckout(null);
                      setCheckoutSuccess(false);
                      setCheckoutForm({ childName: '', parentName: '', email: '', paymentMethod: 'paystack' });
                    }}
                    className="w-full py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-primary-container hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4 text-primary" />
                    Register for AI Teach (₦{aiTeachAmount.toLocaleString()})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GUIDELINES & REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div>
                <h3 className="text-3xl font-serif font-black text-on-surface">Payment Guidelines</h3>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Rules, Policies and Curriculum Standards</p>
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 text-amber-950 space-y-3">
                <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-amber-900">
                  <span className="material-symbols-outlined text-base">warning</span>
                  Official Registration Policies
                </h4>
                <p className="text-xs leading-relaxed font-semibold">
                  Each grade activation requires a standard contribution of <strong>15,000 Naira</strong>. This grants your child full access to all terms (Terms 1 to 4) of lesson structures, 500+ library story books, and our rapid-fire quizzes. There are <strong>no hidden monthly subscriptions</strong> or extra billing. Pay once per grade level.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-serif text-lg font-black text-on-surface">Syllabus Access Benefits:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-xs font-bold text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      One-time payment per Grade level - No monthly fees.
                    </li>
                    <li className="flex items-start gap-2 text-xs font-bold text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Accessible across all smartphones, tablets, and computers.
                    </li>
                    <li className="flex items-start gap-2 text-xs font-bold text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Full offline storage backup built right into the browser cache.
                    </li>
                    <li className="flex items-start gap-2 text-xs font-bold text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Parent Portal tracking metrics with automatic failed quiz warnings.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-serif text-lg font-black text-on-surface">Our Pedagogic Commitments:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-xs font-bold text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Curriculums strictly aligned with Nigerian and West African Guidelines.
                    </li>
                    <li className="flex items-start gap-2 text-xs font-bold text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Comprehensive worksheets to print and submit.
                    </li>
                    <li className="flex items-start gap-2 text-xs font-bold text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Graduation program with Certificate of Completion for Grade 10.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MY RECEIPTS & REGESTRY */}
          {activeTab === 'receipts' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div>
                <h3 className="text-2xl font-serif font-black text-on-surface">Registered Scholar Registry</h3>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">Tuition activations synced on this machine</p>
              </div>

              {registeredChildren.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {registeredChildren.map((child, idx) => (
                    <div key={idx} className="bg-surface-container-low p-6 rounded-2xl border border-on-surface/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-on-surface">{child.name}</h4>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Activated: Grade {child.grade}</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Fully Paid
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container-low p-8 rounded-3xl text-center border border-dashed border-on-surface/10 space-y-2">
                  <FileText className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
                  <p className="text-xs font-bold text-on-surface-variant">No active tuitions registered locally.</p>
                  <p className="text-[11px] text-on-surface-variant/60 font-medium max-w-sm mx-auto">Activate a grade level or register for an AI Teach Google Meet session to view e-receipt details.</p>
                </div>
              )}

              {/* Sample Past Receipt illustration */}
              <div className="border-t border-on-surface/10 pt-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/50 mb-3">Recent Transactions</h4>
                <div className="bg-surface-container-low rounded-2xl p-4 font-mono text-xs text-on-surface-variant/70 space-y-1.5">
                  <div className="flex justify-between border-b border-dashed pb-1.5 mb-1.5 text-on-surface-variant font-bold uppercase tracking-wider">
                    <span>Payment Gateway</span>
                    <span>Status</span>
                  </div>
                  {registeredChildren.map((child, idx) => (
                    <div key={`rec-${idx}`} className="flex justify-between text-[11px]">
                      <span>ASC-REG-G{child.grade}-{child.name.slice(0,4).toUpperCase()} (Paystack)</span>
                      <span className="text-emerald-600 font-bold">₦15,000 SUCCESS</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[11px]">
                    <span>ASC-DEMO-SECURE-HANDSHAKE (Flutterwave)</span>
                    <span className="text-emerald-600 font-bold">₦20,000 SUCCESS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CHECKOUT MODAL DIALOG */}
      <AnimatePresence>
        {(selectedGradeForCheckout !== null || isPayingAiTeach) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isCheckoutLoading) {
                  setSelectedGradeForCheckout(null);
                  setIsPayingAiTeach(false);
                }
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-8 shadow-2xl overflow-hidden text-left"
            >
              {!checkoutSuccess ? (
                <div className="space-y-6">
                  <div>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-wider">
                      Secured by Paystack / Flutterwave
                    </span>
                    <h3 className="text-3xl font-serif font-black leading-tight mt-2 text-on-surface">
                      {isPayingAiTeach ? "Enroll in AI Teach Class" : `Activate Grade ${selectedGradeForCheckout}`}
                    </h3>
                    <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mt-1 font-sans">
                      {isPayingAiTeach ? "Google Meeting Beginners Cohort" : "Unlocks all subject terms instantly"}
                    </p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsCheckoutLoading(true);
                      
                      // Simulate professional bank connection delay
                      setTimeout(() => {
                        setIsCheckoutLoading(false);
                        setCheckoutSuccess(true);
                        
                        // If it's a grade registration, add the kid dynamically to our local storage registered lists!
                        if (selectedGradeForCheckout !== null) {
                          const newChild = {
                            name: checkoutForm.childName,
                            grade: selectedGradeForCheckout
                          };
                          const currentSaved = localStorage.getItem('asc_registered_children');
                          const list = currentSaved ? JSON.parse(currentSaved) : [];
                          // Avoid duplicates
                          const updated = [...list.filter((c: any) => c.name !== checkoutForm.childName), newChild];
                          localStorage.setItem('asc_registered_children', JSON.stringify(updated));
                          // Update reactive state
                          setRegisteredChildren(updated);
                        }
                      }, 2500);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface/50 ml-1">Student's Full Name</label>
                      <input 
                        required
                        disabled={isCheckoutLoading}
                        type="text" 
                        value={checkoutForm.childName}
                        onChange={(e) => setCheckoutForm({...checkoutForm, childName: e.target.value})}
                        className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold placeholder:text-on-surface/30"
                        placeholder="e.g. Samuel Adebayo" 
                      />
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface/50 ml-1">Parent's Name</label>
                      <input 
                        required
                        disabled={isCheckoutLoading}
                        type="text" 
                        value={checkoutForm.parentName}
                        onChange={(e) => setCheckoutForm({...checkoutForm, parentName: e.target.value})}
                        className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold placeholder:text-on-surface/30"
                        placeholder="e.g. Mrs. Adebayo" 
                      />
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface/50 ml-1">Parent's Email Address</label>
                      <input 
                        required
                        disabled={isCheckoutLoading}
                        type="email" 
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                        className="w-full px-5 py-3.5 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold placeholder:text-on-surface/30"
                        placeholder="e.g. parent@example.com" 
                      />
                    </div>

                    {/* Payment Gateways selection */}
                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface/50 ml-1">Select Payment Solution</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button"
                          disabled={isCheckoutLoading}
                          onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'paystack'})}
                          className={cn(
                            "p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between",
                            checkoutForm.paymentMethod === 'paystack' 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                              : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container"
                          )}
                        >
                          <span>Paystack</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </button>
                        <button 
                          type="button"
                          disabled={isCheckoutLoading}
                          onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'flutterwave'})}
                          className={cn(
                            "p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between",
                            checkoutForm.paymentMethod === 'flutterwave' 
                              ? "bg-orange-50 border-orange-500 text-orange-900" 
                              : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container"
                          )}
                        >
                          <span>Flutterwave</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        </button>
                      </div>
                    </div>

                    {/* Display exact billing breakdown */}
                    <div className="p-4 bg-surface-container-low rounded-2xl border border-on-surface/5 space-y-2 mt-2 font-mono text-xs">
                      <div className="flex justify-between font-bold text-on-surface-variant">
                        <span>Baseline Registration Fee:</span>
                        <span>₦{(selectedGradeForCheckout !== null ? 15000 : 20000).toLocaleString()}</span>
                      </div>
                      {selectedGradeForCheckout !== null && (customAmounts[selectedGradeForCheckout] || 15000) > 15000 && (
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>Voluntary Extra Contribution:</span>
                          <span>₦{((customAmounts[selectedGradeForCheckout] || 15000) - 15000).toLocaleString()}</span>
                        </div>
                      )}
                      {isPayingAiTeach && aiTeachAmount > 20000 && (
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>Voluntary Extra Class Support:</span>
                          <span>₦{(aiTeachAmount - 20000).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-on-surface border-t border-on-surface/5 pt-2">
                        <span>Total Checkout Payment:</span>
                        <span>₦{(selectedGradeForCheckout !== null ? (customAmounts[selectedGradeForCheckout] || 15000) : aiTeachAmount).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCheckoutLoading}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {isCheckoutLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-base">sync</span>
                          Processing Secure Transaction...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pay ₦{(selectedGradeForCheckout !== null ? (customAmounts[selectedGradeForCheckout] || 15000) : aiTeachAmount).toLocaleString()} Naira
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      disabled={isCheckoutLoading}
                      onClick={() => {
                        setSelectedGradeForCheckout(null);
                        setIsPayingAiTeach(false);
                      }}
                      className="w-full text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant/75 hover:text-red-500 transition-colors py-1"
                    >
                      Cancel transaction
                    </button>
                  </form>
                </div>
              ) : (
                // Checkout success e-receipt
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-emerald-600 stroke-[3px]" />
                  </div>

                  <div>
                    <h3 className="text-3xl font-serif font-black leading-tight text-on-surface">Payment Successful!</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mt-1">Transaction Completed Securely</p>
                  </div>

                  {/* E-receipt card layout */}
                  <div className="p-6 bg-surface-container-low rounded-[2rem] border border-on-surface/5 text-left font-mono text-xs space-y-3 relative overflow-hidden">
                    <div className="absolute top-2 right-2 opacity-5">
                      <FileText className="w-12 h-12" />
                    </div>

                    <div className="text-center border-b border-dashed border-on-surface/10 pb-3 mb-1">
                      <h4 className="font-bold text-sm">OFFICIAL ASC E-RECEIPT</h4>
                      <p className="text-[10px] text-on-surface-variant">Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span>Parent Name:</span>
                        <span className="font-bold text-on-surface">{checkoutForm.parentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Student Name:</span>
                        <span className="font-bold text-on-surface">{checkoutForm.childName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Registered:</span>
                        <span className="font-bold text-secondary text-right max-w-[180px] truncate block">
                          {isPayingAiTeach ? "AI Teach Cohort (Google Meet)" : `Grade ${selectedGradeForCheckout} Tuition`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Paid Amount:</span>
                        <span className="font-bold text-on-surface">₦{(selectedGradeForCheckout !== null ? (customAmounts[selectedGradeForCheckout] || 15000) : aiTeachAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Secure Reference:</span>
                        <span className="font-bold text-on-surface">ASC-REF-{Math.floor(Math.random() * 900000 + 100000)}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-on-surface/10 pt-3 text-center space-y-2 mt-4 font-sans">
                      {selectedGradeForCheckout !== null ? (
                        <p className="text-[10px] text-emerald-700 leading-relaxed font-bold uppercase tracking-wider bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                          🎉 GRADE LEVEL ACTIVATED! {checkoutForm.childName} has been fully registered offline. They can log in to begin their lessons immediately!
                        </p>
                      ) : (
                        <p className="text-[10px] text-primary leading-relaxed font-bold uppercase tracking-wider bg-primary/5 p-2.5 rounded-xl border border-primary/10">
                          💻 COHORT ENROLLED! A Google Meet invitation link and schedule has been sent to <strong>{checkoutForm.email}</strong>. See you next Monday!
                        </p>
                      )}
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedGradeForCheckout(null);
                      setIsPayingAiTeach(false);
                      setCheckoutSuccess(false);
                    }}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Done & Close Receipt
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
