import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { User } from '../types';
import Logo from './Logo';
import { useError } from './ErrorManager';

const AVATAR_PRESETS = [
  { url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix', label: 'Felix' },
  { url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Anya', label: 'Anya' },
  { url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Tunde', label: 'Tunde' },
  { url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ngozi', label: 'Ngozi' },
  { url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chioma', label: 'Chioma' },
  { url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Samuel', label: 'Samuel' }
];

export default function LoginScreen({ 
  onLogin, 
  onBack,
  initialRole = 'student'
}: { 
  onLogin: (user: User) => void;
  onBack: () => void;
  initialRole?: 'student' | 'parent';
}) {
  const { reportError } = useError();
  
  // Local Registry state
  const [registeredChildren, setRegisteredChildren] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('asc_registered_children');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Default to registry if children are already registered, otherwise default to register tab
  const [activeTab, setActiveTab] = useState<'registry' | 'register' | 'login'>(() => {
    try {
      const saved = localStorage.getItem('asc_registered_children');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? 'registry' : 'register';
    } catch {
      return 'register';
    }
  });

  const [role, setRole] = useState<'student' | 'parent'>(initialRole);
  
  // Registration form values
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState<number>(3);
  const [regAvatar, setRegAvatar] = useState<string>(AVATAR_PRESETS[0].url);

  // Login form values
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Selected child to unlock in local registry
  const [unlockingChild, setUnlockingChild] = useState<any | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');

  const [showSummary, setShowSummary] = useState(false);
  const [summarySource, setSummarySource] = useState<'Google' | 'ClassLink'>('ClassLink');

  // Register child handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'student') {
      if (!regEmail.toLowerCase().endsWith('@gmail.com') && !regEmail.toLowerCase().endsWith('.org') && !regEmail.toLowerCase().endsWith('.edu')) {
        reportError('Please enter a valid student email address (e.g. name@gmail.com).', 'technical');
        return;
      }
    } else {
      if (!regEmail.includes('@') || !regEmail.includes('.') || regEmail.length < 5) {
        reportError("Please enter a valid parent email address.", "technical");
        return;
      }
    }

    if (regPassword.length < 4) {
      reportError('Password must be at least 4 characters long.', 'technical');
      return;
    }

    // Check if email already registered
    const exists = registeredChildren.some(c => c.email.toLowerCase() === regEmail.toLowerCase());
    if (exists) {
      reportError('This email is already registered on this device. Try signing in.', 'technical');
      return;
    }

    const newChild = {
      id: `child-${Date.now()}`,
      name: regName,
      email: regEmail,
      password: regPassword,
      role,
      grade: role === 'student' ? regGrade : undefined,
      avatar: regAvatar,
      loginMethod: 'Direct'
    };

    const updated = [...registeredChildren, newChild];
    setRegisteredChildren(updated);
    localStorage.setItem('asc_registered_children', JSON.stringify(updated));

    // Sign in immediately as this registered child
    onLogin(newChild as User);
  };

  // Traditional/Direct Login Handler
  const handleTraditionalLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Search in local registered children list
    const found = registeredChildren.find(
      c => c.email.toLowerCase() === loginEmail.toLowerCase() && c.password === loginPassword
    );

    if (found) {
      onLogin(found as User);
      return;
    }

    // 2. Playful fallback for quick tests if no registry match found
    if (loginEmail.toLowerCase().endsWith('@gmail.com') && loginPassword.length >= 4) {
      onLogin({
        id: 'legacy-direct',
        name: loginEmail.split('@')[0],
        role: role,
        grade: role === 'student' ? 3 : undefined,
        loginMethod: 'Direct',
        avatar: role === 'student' ? AVATAR_PRESETS[1].url : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMHkS8PbLZ6-0bQ16CY9M3ovLsBFae21OJYm2U7P6iD2h-qI5XhgTx_C61QsyAA3HCrcRhnI3-S86fCb6Fo9dzDT08JBgJkjBTAeM-Re7VNMsyf3Hc7-ih2YHbX_JURhoRanr6Lskgmn0CbTjogcVt5zANoog9uVaPiNUbx-ug8Sri4pTasXzqitpmR9zqckhJc_apJFFNRCV320XtT08XWEb6CX4b-V5KtVRvLZwU5L4oXFbsD_mxW0DxV2oKl2KxPtaG_CrAh5k'
      });
      return;
    }

    reportError('Incorrect credentials. Please verify your email and password.', 'technical');
  };

  // Unlock selected child from Device Registry
  const handleUnlockChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockingChild) return;

    if (unlockingChild.password === unlockPassword || unlockPassword === '1234' || unlockingChild.password === undefined) {
      onLogin(unlockingChild as User);
    } else {
      reportError('Incorrect password for this student. Please try again.', 'technical');
    }
  };

  // Delete child icon from local registry helper
  const handleDeleteChild = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this student account from this device? Personal history and records will remain saved locally.')) {
      const updated = registeredChildren.filter(c => c.id !== id);
      setRegisteredChildren(updated);
      localStorage.setItem('asc_registered_children', JSON.stringify(updated));
      if (unlockingChild?.id === id) {
        setUnlockingChild(null);
      }
    }
  };

  const handleExternalLogin = (source: 'Google' | 'ClassLink') => {
    setSummarySource(source);
    setShowSummary(true);
  };

  if (showSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-0" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-10 space-y-8 relative z-10 border-4 border-primary/10 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -z-0" />
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center mx-auto shadow-lg mb-6 transform -rotate-3">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            </div>
            <h2 className="text-4xl font-headline font-black text-on-surface tracking-tight">African School Curriculum</h2>
            <p className="text-on-surface-variant font-medium">A Joyful Journey of Discovery for Grades 1-10</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: 'face_3', title: 'Miss Kelechi', desc: 'Your personal AI teacher for interactive lessons.' },
              { icon: 'draw', title: 'Worksheets', desc: 'Interactive activities and 20-page spelling sets.' },
              { icon: 'quiz', title: 'Smart Quizzes', desc: 'Test your knowledge and track your scores.' },
              { icon: 'assignment_turned_in', title: 'Greater Exams', desc: 'Final exams to showcase your mastery.' }
            ].map((feature, i) => (
              <div key={i} className="p-4 bg-surface-container-low rounded-2xl border border-surface-container group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-sm">{feature.icon}</span>
                  </div>
                  <h4 className="font-bold text-on-surface">{feature.title}</h4>
                </div>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col gap-4 text-center">
            <p className="text-xs text-outline-variant font-bold uppercase tracking-widest">Ready to continue to {summarySource}?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowSummary(false)}
                className="flex-1 py-4 bg-surface-container-high text-on-surface rounded-2xl font-bold hover:bg-surface-container transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onLogin({
                    id: summarySource === 'Google' ? 'g-1' : 'cl-1',
                    name: `${summarySource} User`,
                    role: 'student',
                    grade: 3,
                    isBeginner: true,
                    loginMethod: summarySource,
                    avatar: summarySource === 'Google' 
                      ? 'https://lh3.googleusercontent.com/a/default-user=s96-c' 
                      : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuZfhbL2KDdXdJjXH1P6BHLHMJcRWTgitkz_S4RnttiqoZSWs63WKRy2qWGR7tQvCjKLP_R4z-Ix7rrQhn3jt-Kzp2ZyskDrWf-ZVU4TTfT_2aVTuOMUf57FwwnkFpXbjQdwGQIe6FUJEYqDRhJgI-hC76jBnVZ8LEK7KXUYOiPPOAl_QN4M1e2ZFo961o9Nb1Qw4x8MdfykVhZ1M3Xis7L1ImvB6rH2XXftcR-Uj4QkIARu8HZmRIZoZc3vT7ksAyQuC-d5-7yaU'
                  });
                }}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Continue login
                <span className="material-symbols-outlined text-sm">login</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Absolute Header Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 bg-white rounded-full font-bold text-primary shadow-lg hover:scale-105 active:scale-95 transition-all border border-surface-container"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back</span>
      </button>

      <div className="absolute -top-24 -right-24 w-96 h-96 bg-surface-container-high rounded-full opacity-50 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-tertiary-container rounded-full opacity-30 blur-3xl" />

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-surface-container"
      >
        {/* Left Side decorative panel */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-primary-container-low to-surface-container-low relative overflow-hidden border-r border-surface-container">
          <div className="relative z-10">
            <Logo size="lg" className="mb-6" />
            <p className="text-base text-on-surface-variant max-w-xs font-semibold leading-relaxed">
              Your registered child gets 100% full uncompromised study access with clean offline data tracking.
            </p>
          </div>
          
          <div className="relative mt-auto h-64 flex justify-center items-end">
            <img 
              className="w-4/5 h-auto object-contain transform translate-y-6" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxQxijnhQu0tBPoGjsnaDXpjr0ekkxmxODlmR9RdaxzPOTjjhdZHLCcRHB0dMlRkLYRh4Cigd2qise1VBibUvivmSJei3F3P4x52-lywvRrUVSbaI3uJ0apRIaVVk5MxpnIyCBDnB3bIlpEsfDkNjCmvZCo8A7WKiOK8u7rdCshAje9Ug0uNkinq1vjMHjN7Cgn0XNlQNuNWCup8QA-jCGB_rLM_bqXfCZ1AOdOf-GUqam0Y1PeKkUGR9g8qkAltws_9XD-ZbTpp4" 
              alt="Mascot"
            />
          </div>
        </div>

        {/* Right side Form workspace */}
        <div className="p-8 md:p-14 lg:col-span-12 xl:col-span-7 flex flex-col justify-center bg-white">
          {/* Navigation Tab bar */}
          <div className="flex justify-between items-center bg-surface p-1.5 rounded-2xl mb-8 border border-surface-container-high">
            <button
              onClick={() => { setActiveTab('registry'); setUnlockingChild(null); }}
              className={cn(
                "flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                activeTab === 'registry' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-sm">badge</span>
              Local Registry {registeredChildren.length > 0 && `(${registeredChildren.length})`}
            </button>
            <button
              onClick={() => { setActiveTab('register'); setUnlockingChild(null); }}
              className={cn(
                "flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                activeTab === 'register' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Register Child
            </button>
            <button
              onClick={() => { setActiveTab('login'); setUnlockingChild(null); }}
              className={cn(
                "flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                activeTab === 'login' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-sm">key</span>
              Direct Login
            </button>
          </div>

          {/* ACTIVE TAB CONTENTS */}
          <AnimatePresence mode="wait">
            
            {/* 1. DEVICE REGISTRY */}
            {activeTab === 'registry' && (
              <motion.div
                key="registry"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl md:text-3xl font-headline font-black text-on-surface mb-2">
                    Offline Device Registry
                  </h3>
                  <p className="text-on-surface-variant text-sm font-medium">
                    Fully accessible without internet. Select a schoolchild user to begin your class session.
                  </p>
                </div>

                {registeredChildren.length === 0 ? (
                  <div className="py-12 px-6 bg-surface rounded-2xl border-2 border-dashed border-surface-container flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 font-light">school</span>
                    <h4 className="text-lg font-bold text-on-surface mb-1">No children registered yet</h4>
                    <p className="text-sm text-on-surface-variant max-w-sm mb-6">
                      Register your child's educational profile locally to isolate their study records and unlock the client suite.
                    </p>
                    <button
                      onClick={() => setActiveTab('register')}
                      className="px-6 py-3 bg-primary text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                      Register First Child
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {!unlockingChild ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {registeredChildren.map((child) => (
                          <div
                            key={child.id}
                            onClick={() => {
                              setUnlockingChild(child);
                              setUnlockPassword('');
                            }}
                            className="bg-white border border-surface-container hover:border-primary-container hover:shadow-lg p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={child.avatar}
                                alt="avatar"
                                className="w-14 h-14 rounded-full border border-surface-container bg-surface group-hover:scale-105 transition-all"
                              />
                              <div>
                                <h4 className="font-headline font-black text-on-surface text-lg leading-tight">
                                  {child.name}
                                </h4>
                                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                                  {child.role === 'student' ? `Grade ${child.grade}` : 'Parent Profile'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleDeleteChild(child.id, e)}
                              className="text-outline-variant hover:text-error hover:bg-error/10 p-2 rounded-xl transition-all"
                              title="Delete from device registry"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface p-6 rounded-3xl border border-surface-container-high space-y-6"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={unlockingChild.avatar}
                            alt="selected child"
                            className="w-16 h-16 rounded-full border border-primary/20 bg-white"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-headline font-black text-on-surface text-xl">
                                Unlock {unlockingChild.name}'s Suite
                              </h4>
                              <span className="bg-primary/10 text-primary font-bold text-xs px-2 py-0.5 rounded-full">
                                {unlockingChild.role === 'student' ? `Grade ${unlockingChild.grade}` : 'Parent'}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {unlockingChild.email}
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleUnlockChild} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-on-surface uppercase tracking-widest pl-1 block">
                              Enter Workspace Unlock Password
                            </label>
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">lock</span>
                              <input
                                required
                                type="password"
                                value={unlockPassword}
                                onChange={(e) => setUnlockPassword(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-surface-container focus:ring-4 focus:ring-primary-container/30 outline-none transition-all font-body text-sm"
                                placeholder="••••"
                              />
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-medium block pl-1">
                              Hint: Use password assigned during registration. (Leave blank or type '1234' for developer test account bypassing).
                            </span>
                          </div>

                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => setUnlockingChild(null)}
                              className="flex-1 py-4 bg-white border border-surface-container-high rounded-full font-bold text-xs uppercase tracking-widest text-on-surface transition-all active:scale-95"
                            >
                              Back to list
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-4 bg-primary text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                              Unlock Workspace
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. REGISTER NEW CHILD */}
            {activeTab === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl md:text-3xl font-headline font-black text-on-surface mb-2">
                    Register Child Portal
                  </h3>
                  <p className="text-on-surface-variant text-sm font-medium">
                    Configure your student profile locally to bypass public blocks for uncompromised access.
                  </p>
                </div>

                {/* Role Switcher */}
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole('student')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                      role === 'student' ? "bg-primary text-white shadow-md" : "bg-surface text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    Register Student
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('parent')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                      role === 'parent' ? "bg-primary text-white shadow-md" : "bg-surface text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    Register Parent
                  </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-widest ml-1">
                      {role === 'student' ? "Child's Name" : "Parent's Name"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">person_outline</span>
                      <input 
                        required
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={role === 'student' ? "e.g. Samuel, Chinedu, Fatima" : "e.g. Mr. Okafor"}
                        className="w-full pl-14 pr-6 py-3.5 bg-surface border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-4 focus:ring-primary-container/30 transition-all font-body text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-widest ml-1">
                      {role === 'student' ? "Secret student login Email" : "Parent Email"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">alternate_email</span>
                      <input 
                        required
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={role === 'student' ? "child@gmail.com" : "parent@gmail.com"}
                        className="w-full pl-14 pr-6 py-3.5 bg-surface border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-4 focus:ring-primary-container/30 transition-all font-body text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-widest ml-1">
                      {role === 'student' ? "Set Password" : "Parent Password"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">password</span>
                      <input 
                        required
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-14 pr-6 py-3.5 bg-surface border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-4 focus:ring-primary-container/30 transition-all font-body text-sm"
                      />
                    </div>
                  </div>

                  {/* Student Grade Level Segment Selector */}
                  {role === 'student' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-widest ml-1">
                        Select Grade Level (1 - 10)
                      </label>
                      <div className="flex flex-wrap gap-2 bg-surface p-2 rounded-2xl border border-surface-container">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setRegGrade(num)}
                            className={cn(
                              "w-10 h-10 rounded-full font-black text-sm flex items-center justify-center transition-all",
                              regGrade === num 
                                ? "bg-primary text-white shadow-md scale-110" 
                                : "text-on-surface-variant hover:bg-surface-container-high"
                            )}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Avatar Preset Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-widest ml-1">
                      Choose Your Study Companion Avatar
                    </label>
                    <div className="flex gap-3 overflow-x-auto py-2 px-1">
                      {AVATAR_PRESETS.map((preset) => (
                        <div
                          key={preset.url}
                          onClick={() => setRegAvatar(preset.url)}
                          className={cn(
                            "group cursor-pointer flex flex-col items-center gap-1.5 p-1.5 rounded-2xl transition-all border-2",
                            regAvatar === preset.url 
                              ? "border-primary bg-primary/5 scale-105" 
                              : "border-transparent hover:bg-surface"
                          )}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.label} 
                            className="w-12 h-12 rounded-full border border-surface-container-high"
                          />
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                            {preset.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4.5 rounded-xl text-white font-display font-black text-xs uppercase tracking-[0.15em] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 group bg-gradient-to-b from-primary to-primary-container"
                  >
                    Register & Unlock Full Suite
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">rocket_launch</span>
                  </button>
                </form>
              </motion.div>
            )}

            {/* 3. DIRECT LOGIN WORKSPACE */}
            {activeTab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl md:text-3xl font-headline font-black text-on-surface mb-2">
                    Log in with Email
                  </h3>
                  <p className="text-on-surface-variant text-sm font-medium">
                    Authenticate traditional accounts or local registers with credentials.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setRole('student')}
                    className={cn(
                      "px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all",
                      role === 'student' ? "bg-primary text-white" : "bg-surface text-on-surface-variant"
                    )}
                  >
                    Student Account
                  </button>
                  <button 
                    onClick={() => setRole('parent')}
                    className={cn(
                      "px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all",
                      role === 'parent' ? "bg-primary text-white" : "bg-surface text-on-surface-variant"
                    )}
                  >
                    Parent Portal
                  </button>
                </div>

                <form onSubmit={handleTraditionalLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-widest pl-1">
                      {role === 'student' ? "Student Email" : "Parent Email"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">alternate_email</span>
                      <input 
                        required
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={role === 'student' ? "student@gmail.com" : "parent@gmail.com"} 
                        className="w-full pl-14 pr-6 py-4 bg-surface rounded-xl border-none text-on-surface placeholder:text-outline-variant focus:ring-4 focus:ring-primary-container/30 transition-all font-body text-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-widest pl-1">
                      {role === 'student' ? "Student Password" : "Parent Password"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">lock</span>
                      <input 
                        required
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full pl-14 pr-6 py-4 bg-surface rounded-xl border-none text-on-surface placeholder:text-outline-variant focus:ring-4 focus:ring-primary-container/30 transition-all font-body text-sm" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 rounded-xl text-white font-headline font-extrabold text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 group bg-gradient-to-b from-primary to-primary-container hover:shadow-xl"
                  >
                    {role === 'student' ? "Start Learning!" : "Enter Parent Portal"}
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      {role === 'student' ? "auto_stories" : "shield_person"}
                    </span>
                  </button>
                </form>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-surface-container" />
                  <span className="px-4 text-xs font-bold text-outline-variant uppercase tracking-widest">Or login with</span>
                  <div className="flex-grow border-t border-surface-container" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => handleExternalLogin('Google')}
                    className="flex items-center justify-center gap-3 py-3 px-6 bg-surface border border-surface-container rounded-xl font-bold text-on-surface hover:bg-surface-container-high active:scale-95 transition-all"
                  >
                    <img className="w-5 h-5 animate-pulse" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoJuEU62qZqsuJEqVuDThL5kIzXJDVpvLaur0uCeM0SjSBHyQP4lDNz2QoUSXwDbdQm2fboXmiW-N28iC6fFKpsgLnPNjXytWq83HQ3II4s7zsfU4LJGH8yHRHAMAyJylAM3Zlmhb5laIk3xrjuvTrdm8D8-xVeC-3LXFjQlNf1Fg51Dua-_fgf3riorNAvMSmF72C3yAio7P4mkNycTCCOo-nO-EzpLImJTgPSQQ4TM6lA2KWtkoQE6MW4efbS5hymCPSoUTVX5k" alt="Google" />
                    <span className="text-sm">Google</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleExternalLogin('ClassLink')}
                    className="flex items-center justify-center gap-3 py-3 px-6 bg-surface border border-surface-container rounded-xl font-bold text-on-surface hover:bg-surface-container-high active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-blue-600">badge</span>
                    <span className="text-sm">ClassLink</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}
