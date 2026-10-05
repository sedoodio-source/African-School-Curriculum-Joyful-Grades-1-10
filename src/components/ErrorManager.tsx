import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AppError {
  id: string;
  message: string;
  type: 'technical' | 'academic' | 'connection';
  timestamp: number;
}

interface ErrorContextType {
  reportError: (message: string, type: AppError['type']) => void;
  clearError: (id: string) => void;
  errors: AppError[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const reportError = (message: string, type: AppError['type']) => {
    const newError: AppError = {
      id: Math.random().toString(36).substring(7),
      message,
      type,
      timestamp: Date.now(),
    };
    setErrors(prev => [...prev, newError]);
    
    // Auto-clear after 10 seconds for technical/connection issues
    if (type !== 'academic') {
      setTimeout(() => clearError(newError.id), 10000);
    }
  };

  const clearError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  return (
    <ErrorContext.Provider value={{ reportError, clearError, errors }}>
      {children}
      <div className="fixed bottom-24 left-6 right-6 z-[200] pointer-events-none flex flex-col gap-3 items-center">
        <AnimatePresence>
          {errors.map(error => (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto bg-white rounded-2xl shadow-2xl border-2 border-red-500 p-4 max-w-md w-full flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                <span className="material-symbols-outlined">
                  {error.type === 'connection' ? 'wifi_off' : error.type === 'academic' ? 'quiz' : 'engineering'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-on-surface uppercase tracking-widest mb-1">
                  {error.type} Issue
                </p>
                <p className="text-sm font-medium text-on-surface-variant leading-tight">
                  {error.message}
                </p>
              </div>
              <button 
                onClick={() => clearError(error.id)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-outline">close</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}
