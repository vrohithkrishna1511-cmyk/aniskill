'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Award, ArrowRight, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RankType } from '../../types';
import { RANKS_DATA } from '../../data/mockData';
import { CharacterRenderer } from '../anime/CharacterRenderer';

interface RankUpModalProps {
  rank: RankType | null;
  onClose: () => void;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({ rank, onClose }) => {
  useEffect(() => {
    if (rank) {
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FF6B00', '#FFD700', '#00F0FF', '#9D4EDD', '#FF2E54'],
      });
    }
  }, [rank]);

  if (!rank) return null;

  const rankInfo = RANKS_DATA[rank];
  const isHokage = rank === 'HOKAGE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl select-none">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`w-full max-w-2xl bg-gradient-to-b ${
          isHokage ? 'from-[#2e1d08] via-[#1a0f05] to-[#0a0703] border-amber-400' : 'from-[#1a0f0d] via-[#120a10] to-[#07080f] border-orange-500/50'
        } rounded-3xl p-8 text-center relative overflow-hidden border shadow-[0_0_90px_rgba(255,107,0,0.5)]`}
      >
        {/* Background Energy Explosion Radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-600/30 via-transparent to-transparent pointer-events-none animate-pulse" />

        <div className="relative z-10 flex flex-col items-center">
          
          {/* FULL BODY CHARACTER CELEBRATION ARTWORK */}
          <div className="w-full h-64 flex items-center justify-center mb-2">
            <CharacterRenderer
              characterId="jiraiya"
              state="rank-up"
              size="lg"
              showAura={true}
            />
          </div>

          <span className="text-xs font-hud text-amber-400 tracking-[0.3em] uppercase mb-1 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{isHokage ? 'LEGENDARY VILLAGE ASCENSION' : 'SHINOBI RANK ASCENSION'}</span>
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold font-hud tracking-widest text-white mb-1">
            {isHokage ? 'SEVENTH HOKAGE' : `RANK UP: ${rankInfo.name.toUpperCase()}`}
          </h2>
          <div className="text-sm font-hud text-orange-300 mb-3">
            ({rankInfo.jpName})
          </div>

          <p className="text-base font-title text-amber-100 italic mb-8 max-w-lg leading-relaxed">
            "{rankInfo.quote}"
          </p>

          <button
            onClick={onClose}
            className="w-full max-w-md py-5 rounded-2xl font-hud font-extrabold text-sm tracking-widest text-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-[0_0_35px_rgba(245,158,11,0.6)] flex items-center justify-center space-x-3 group transform hover:scale-105"
          >
            <Flame className="w-5 h-5 fill-current" />
            <span>CLAIM RANK DESTINY</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
