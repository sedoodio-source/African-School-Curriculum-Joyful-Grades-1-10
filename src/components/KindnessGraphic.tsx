import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function KindnessGraphic() {
  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 p-8 md:p-12 rounded-[3rem] shadow-xl border border-sky-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl -z-0" />
      
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <div className="text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2 block">Kindness Spotlight</span>
          <h2 className="text-4xl font-black text-slate-800">Friendship in Action</h2>
          <p className="text-slate-500 font-medium mt-2">Always be ready to lend a helping hand to others.</p>
        </div>

        {/* The Scene Interaction */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-white/40 backdrop-blur-sm rounded-[2.5rem] border-4 border-white shadow-inner flex items-center justify-center gap-12 md:gap-24 overflow-visible px-4">
          
          {/* SAM (Helping) */}
          <div className="relative group">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              {/* Character Sam */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-sky-500 rounded-2xl flex items-center justify-center transform rotate-3 shadow-lg border-4 border-white mb-4">
                   <span className="material-symbols-outlined text-white text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                {/* Reaching Hand Effect */}
                <motion.div 
                   animate={{ x: [0, 20, 0] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute -right-8 top-1/2 bg-sky-600 w-12 h-6 md:w-16 md:h-8 rounded-full border-2 border-white shadow-md z-20 flex items-center justify-end px-2"
                >
                   <span className="material-symbols-outlined text-white text-md">front_hand</span>
                </motion.div>
              </div>
              <p className="font-black text-slate-800 tracking-widest text-sm">SAM</p>
            </motion.div>

            {/* Sam's Speech Bubble */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -top-24 -left-8 md:-left-16"
            >
              <div className="bg-white px-6 py-4 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-start min-w-[200px] relative">
                <span className="text-[10px] font-black uppercase text-sky-500 mb-1">Sam says:</span>
                <p className="text-lg font-bold text-slate-700 italic font-serif">"Sorry Karen let me help you"</p>
                {/* Pointer */}
                <div className="absolute -bottom-2 left-12 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45" />
              </div>
            </motion.div>
          </div>

          {/* KAREN (Accepting Help) */}
          <div className="relative group">
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              {/* Character Karen (Leaning/Starting to rise) */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-rose-400 rounded-2xl flex items-center justify-center transform -rotate-6 shadow-lg border-4 border-white mb-4">
                   <span className="material-symbols-outlined text-white text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_4</span>
                </div>
                {/* Grasping Hand Effect */}
                <div className="absolute -left-6 top-1/2 bg-rose-500 w-10 h-6 md:w-12 md:h-8 rounded-full border-2 border-white shadow-md z-20 flex items-center justify-start px-2">
                   <span className="material-symbols-outlined text-white text-md">back_hand</span>
                </div>
              </div>
              <p className="font-black text-slate-800 tracking-widest text-sm">KAREN</p>
            </motion.div>

            {/* Karen's Speech Bubble */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              className="absolute -top-20 -right-4 md:-right-12"
            >
              <div className="bg-white px-6 py-4 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-end min-w-[150px] relative">
                <span className="text-[10px] font-black uppercase text-rose-500 mb-1 text-right">Karen says:</span>
                <p className="text-lg font-black text-slate-700 italic font-serif text-right">"Thank you!"</p>
                {/* Pointer */}
                <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45" />
              </div>
            </motion.div>
          </div>

        </div>

        {/* Moral of the Story */}
        <div className="mt-12 text-center max-w-lg">
          <p className="text-indigo-600 font-black italic text-xl leading-relaxed">
            "No act of kindness, no matter how small, is ever wasted."
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
               <span className="material-symbols-outlined text-indigo-500 text-sm">favorite</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Empathy</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
               <span className="material-symbols-outlined text-indigo-500 text-sm">handshake</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Helping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
