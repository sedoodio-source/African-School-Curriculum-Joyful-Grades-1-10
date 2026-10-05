import React from 'react';
import { BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-3',
    xl: 'gap-4',
  };

  const iconSizes = {
    sm: { main: 18, spark: 10 },
    md: { main: 24, spark: 14 },
    lg: { main: 36, spark: 20 },
    xl: { main: 48, spark: 28 },
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <div className="relative flex flex-col items-center">
        {showText && (
          <div className="relative flex flex-col items-center leading-none">
            {/* The book icon resting ON the ASC word */}
            <motion.div 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "text-primary mb-[-4px] relative z-20",
                size === 'sm' ? "mb-[-2px]" : size === 'xl' ? "mb-[-8px]" : ""
              )}
            >
              <BookOpen size={iconSizes[size].main * 0.8} strokeWidth={3} />
            </motion.div>

            <span className={cn(
              "font-headline font-black tracking-tighter text-on-surface relative z-10",
              textSizes[size]
            )}>
              ASC
            </span>
            <span className={cn(
              "font-body font-bold text-primary tracking-[0.05em] uppercase text-center",
              size === 'sm' ? 'text-[6px] tracking-normal' : size === 'md' ? 'text-[8px]' : 'text-xs'
            )}>
              African School Curriculum
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
