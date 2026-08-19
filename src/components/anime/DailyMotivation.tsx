'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CharacterRenderer } from './CharacterRenderer';

interface DailyMotivationProps {
  streakCount: number;
  onContinue: () => void;
}

export const DailyMotivation: React.FC<DailyMotivationProps> = ({ 
  streakCount, 
  onContinue 
}) => {
  React.useEffect(() => {
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F59E0B', '#FF6B00', '#00F0FF']
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="w-full max-w-xl bg-gradient-to-b from-[#091f15] via-[#0d1616] to-[#04080a] rounded-3xl p-6 md:p-8 text-center relative overflow-hidden border border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.3)] space-y-6"
      >
        {/* Background Flame Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          
          {/* FULL BODY ROCK LEE ARTWORK LAYER */}
          <div className="w-full h-56 flex items-center justify-center mb-2">
            <CharacterRenderer
              characterId="rock-lee"
              state="welcome"
              size="lg"
              showAura={true}
            />
          </div>

          <span className="text-xs font-hud text-emerald-400 tracking-widest uppercase mb-1 flex items-center space-x-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>ROCK LEE'S YOUTH & EFFORT MOTIVATION</span>
          </span>

          <h2 className="text-3xl font-extrabold font-hud text-white tracking-wide">
            "YOUR EFFORT IS YOUR GREATEST POWER!"
          </h2>

          <p className="text-sm font-title text-emerald-200 italic max-w-md">
            "A dropouts hard work can surpass a genius! One hour of focused effort today is better than zero hours tomorrow!"
          </p>

          {/* Streak Stat Display */}
          <div className="w-full bg-black/60 rounded-2xl p-4 my-2 flex items-center justify-around border border-emerald-500/30">
            <div>
              <div className="text-2xl font-hud font-extrabold text-orange-400 glow-orange-text">
                {streakCount} DAYS
              </div>
              <div className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                CURRENT STREAK
              </div>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div>
              <div className="text-2xl font-hud font-extrabold text-emerald-400 glow-cyan-text">
                +1.0
              </div>
              <div className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                STREAK GAIN
              </div>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full py-4 rounded-2xl font-hud font-extrabold text-sm tracking-widest text-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center space-x-2 group transform hover:scale-[1.02]"
          >
            <span>CONTINUE TRAINING JOURNEY</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
