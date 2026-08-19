'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StreakCounterProps {
  value: number;
  label?: string;
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  value,
  label = 'CURRENT NINJA STREAK',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isIncrementing, setIsIncrementing] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsIncrementing(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF6B00', '#FFD700', '#FF2E54'],
      });

      const t = setTimeout(() => {
        setDisplayValue(value);
        setIsIncrementing(false);
      }, 600);

      return () => clearTimeout(t);
    }
  }, [value, displayValue]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Background Energy Glow Burst on Increment */}
      <AnimatePresence>
        {isIncrementing && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.9 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 blur-xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-3">
        <motion.div
          animate={isIncrementing ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : { scale: [1, 1.08, 1] }}
          transition={{ duration: isIncrementing ? 0.6 : 2, repeat: isIncrementing ? 0 : Infinity }}
        >
          <Flame className="w-8 h-8 text-orange-500 glow-orange-text fill-current" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={displayValue}
            initial={{ y: -15, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 15, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold font-hud tracking-widest text-white glow-orange-text"
          >
            {displayValue}
          </motion.span>
        </AnimatePresence>
        <span className="text-xl font-hud font-bold text-orange-400">DAYS</span>
      </div>

      {label && (
        <span className="text-[10px] font-hud text-gray-400 uppercase tracking-widest mt-1">
          {label}
        </span>
      )}
    </div>
  );
};
