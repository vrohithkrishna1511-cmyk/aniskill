'use client';

import React from 'react';
import { Sparkles, Zap, Award } from 'lucide-react';
import { NicknameType } from '../../types';

interface NicknameBadgeProps {
  nickname: NicknameType;
  className?: string;
}

export const NicknameBadge: React.FC<NicknameBadgeProps> = ({ nickname, className = '' }) => {
  if (!nickname || nickname === 'Select Your Shinobi Title') {
    return null;
  }

  const getNicknameStyle = (name: string) => {
    switch (name) {
      case 'The Copy Ninja':
      case 'Copy Ninja':
        return 'from-cyan-500 via-blue-600 to-indigo-600 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] glow-cyan-text';
      case 'The Yellow Flash of the Leaf':
      case 'Yellow Flash':
        return 'from-yellow-400 via-amber-500 to-orange-500 text-yellow-300 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.3)] glow-gold-text';
      case 'Itachi of the Sharingan':
        return 'from-red-600 via-rose-700 to-red-950 text-red-300 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] glow-red-text';
      case 'Ghost of the Uchiha':
        return 'from-purple-600 via-indigo-700 to-purple-950 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] glow-purple-text';
      case 'The Noble Green Beast of Konoha':
        return 'from-emerald-500 via-green-600 to-teal-700 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] glow-emerald-text';
      case 'The Toad Sage':
        return 'from-amber-500 via-orange-600 to-red-700 text-amber-300 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)] glow-orange-text';
      case 'God of Shinobi':
        return 'from-emerald-600 via-teal-600 to-emerald-950 text-teal-300 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.3)] glow-teal-text';
      case 'The Child of Prophecy':
      case 'Sage of Six Paths':
        return 'from-orange-500 via-amber-500 to-yellow-500 text-orange-300 border-orange-500/40 shadow-[0_0_15px_rgba(255,107,0,0.3)] glow-orange-text';
      case 'Gaara of the Sand':
        return 'from-amber-600 via-yellow-700 to-orange-900 text-amber-200 border-amber-500/40 shadow-[0_0_15px_rgba(217,119,6,0.3)] glow-gold-text';
      case 'The Last Uchiha':
        return 'from-indigo-500 via-violet-600 to-blue-800 text-indigo-300 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)] glow-indigo-text';
      default:
        return 'from-orange-500 via-amber-500 to-red-500 text-orange-300 border-orange-500/40 shadow-[0_0_15px_rgba(255,107,0,0.3)] glow-orange-text';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-black/60 border backdrop-blur-sm ${getNicknameStyle(nickname)} ${className}`}>
      <Sparkles className="w-3.5 h-3.5" />
      <span className="text-xs font-hud font-bold tracking-wider uppercase">
        {nickname}
      </span>
    </div>
  );
};
