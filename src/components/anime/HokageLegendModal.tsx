'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Award, ArrowRight, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CharacterRenderer } from './CharacterRenderer';
import { useApp } from '@/context/AppContext';

interface HokageLegendModalProps {
  onClose: () => void;
}

export const HokageLegendModal: React.FC<HokageLegendModalProps> = ({ onClose }) => {
  const { userProfile } = useApp();

  useEffect(() => {
    // Massive gold/orange fireworks confetti explosion
    const interval = setInterval(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FF6B00', '#FF2E54', '#FFFFFF', '#F59E0B'],
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl select-none">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-gradient-to-b from-[#3b2207] via-[#211104] to-[#090703] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden border-2 border-amber-400 shadow-[0_0_120px_rgba(245,158,11,0.6)]"
      >
        {/* Golden Energy Surge Background Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/30 via-orange-600/20 to-transparent pointer-events-none animate-pulse" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          
          {/* HOKAGE MONUMENT BACKDROP & FULL BODY KURAMA / NARUTO CHARACTER */}
          <div className="w-full h-72 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <CharacterRenderer characterId="nine-tails" state="awakening" size="hero" showAura={true} />
            </div>
            <div className="relative z-20">
              <CharacterRenderer characterId="naruto" state="hokage" size="lg" showAura={true} />
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-950/90 border border-amber-400 text-amber-300 text-xs font-hud font-bold tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>LEGENDARY CONSISTENCY MILESTONE</span>
          </div>

          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold font-hud tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 drop-shadow-[0_10px_30px_rgba(245,158,11,0.9)]">
              YOU HAVE BECOME HOKAGE
            </h1>
            <p className="text-sm md:text-base font-title text-amber-100 italic mt-3 max-w-xl mx-auto">
              "YOUR JOURNEY HAS BECOME YOUR LEGACY.<br />
              <span className="text-amber-400 font-bold not-italic glow-orange-text">
                THE WILL OF FIRE LIVES IN YOUR CONSISTENCY.
              </span>"
            </p>
          </div>

          {/* Shareable Achievement Dossier Card */}
          <div className="w-full max-w-md bg-black/80 p-6 rounded-2xl border border-amber-500/40 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-hud font-extrabold text-amber-400 glow-orange-text">
                {userProfile.currentStreak} DAYS
              </div>
              <div className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">PERFECT CONSISTENCY</div>
            </div>
            <div>
              <div className="text-3xl font-hud font-extrabold text-cyan-400 glow-cyan-text">
                {userProfile.totalStudyHours} HOURS
              </div>
              <div className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">SYLLABUS MASTERED</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl font-hud font-extrabold text-sm tracking-widest text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 transition-all shadow-[0_0_30px_rgba(245,158,11,0.7)] flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <Flame className="w-5 h-5 fill-current" />
              <span>RETURN TO VILLAGE</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
