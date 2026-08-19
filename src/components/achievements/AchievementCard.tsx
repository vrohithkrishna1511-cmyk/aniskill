'use client';

import React from 'react';
import { Award, Zap, Clock, BookOpen, Lock, CheckCircle2 } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden space-y-3 backdrop-blur-sm shadow-lg ${
        achievement.unlocked
          ? 'bg-amber-950/35 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:border-amber-400'
          : 'bg-black/35 border-gray-600/30 opacity-75 hover:opacity-100 hover:border-gray-500/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center font-hud text-white shadow-lg border border-amber-500/30"
          style={{ backgroundColor: achievement.unlocked ? achievement.badgeGlow : '#1E293B' }}
        >
          <Award className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
        </div>

        {achievement.unlocked ? (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-hud flex items-center space-x-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-zinc-700 text-gray-300 text-[10px] font-hud flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>LOCKED</span>
          </span>
        )}
      </div>

      <div>
        <h4 className="font-hud font-bold text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {achievement.title}
        </h4>
        <p className="text-xs font-body text-gray-200 mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {achievement.description}
        </p>
      </div>

      {achievement.unlockedDate && (
        <div className="text-[10px] font-hud text-amber-300/80 pt-2 border-t border-amber-500/20 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          UNLOCKED: {achievement.unlockedDate}
        </div>
      )}
    </div>
  );
};
