import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function SubjectMotivation({ subject, grade }: { subject: string, grade: number }) {
  const [motivation, setMotivation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMotivation = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai/motivation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, grade })
        });
        const data = await res.json();
        setMotivation(data.motivation || "");
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMotivation();
  }, [subject, grade]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border border-primary/10 flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="material-symbols-outlined text-primary animate-bounce">rocket_launch</span>
      </div>
      <div>
        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-1">Why learn this?</h4>
        {isLoading ? (
          <div className="h-4 w-48 bg-surface-container-high rounded animate-pulse mt-2" />
        ) : (
          <p className="text-sm font-medium text-on-surface-variant italic leading-relaxed">
            "{motivation}"
          </p>
        )}
      </div>
    </motion.div>
  );
}
