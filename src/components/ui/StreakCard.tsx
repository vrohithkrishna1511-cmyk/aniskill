'use client';

import React from 'react';
import { Zap, Flame, Shield, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RANKS_DATA } from '../../data/mockData';
import { RankType } from '../../types';

export const StreakCard: React.FC = () => {
  const { userProfile } = useApp();

  const rankKeys: RankType[] = ['NINJA_STUDENT', 'GENIN', 'CHUNIN', 'JONIN', 'ANBU_BLACK_OPS', 'HOKAGE'];
  const currentIndex = rankKeys.indexOf(userProfile.rank);
  const nextRankKey = rankKeys[Math.min(currentIndex + 1, rankKeys.length - 1)];
  const nextRankInfo = RANKS_DATA[nextRankKey];

  const daysNeeded = Math.max(0, nextRankInfo.minStreakRequired - userProfile.currentStreak);

  return (
    <div className="w-full bg-[#05050c]/30 backdrop-blur-[2px] rounded-2xl p-6 border border-orange-500/30 shadow-[0_0_30px_rgba(255,107,0,0.15)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-orange-400 animate-bounce" />
          <h3 className="font-hud font-bold text-base text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            STREAK METRICS
          </h3>
        </div>
        <span className="text-[10px] font-hud px-2.5 py-1 rounded-full bg-orange-950/40 border border-orange-500/30 text-orange-300">
          DAILY MINIMUM: 1 HOUR
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-black/40 border border-orange-500/30 text-center backdrop-blur-sm shadow-md">
          <div className="text-2xl font-hud font-extrabold text-orange-400 glow-orange-text">
            {userProfile.currentStreak}
          </div>
          <div className="text-[10px] font-hud text-gray-300 uppercase tracking-widest mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            CURRENT STREAK
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/30 text-center backdrop-blur-sm shadow-md">
          <div className="text-2xl font-hud font-extrabold text-amber-300 glow-gold-text">
            {userProfile.bestStreak}
          </div>
          <div className="text-[10px] font-hud text-gray-300 uppercase tracking-widest mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            BEST STREAK
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-cyan-500/30 text-center backdrop-blur-sm shadow-md">
          <div className="text-sm font-hud font-bold text-cyan-300 truncate mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {nextRankInfo.name}
          </div>
          <div className="text-[10px] font-hud text-gray-300 uppercase tracking-widest mt-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            NEXT RANK
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 text-center backdrop-blur-sm shadow-md">
          <div className="text-2xl font-hud font-extrabold text-purple-300">
            {daysNeeded}
          </div>
          <div className="text-[10px] font-hud text-gray-300 uppercase tracking-widest mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            DAYS UNTIL RANK
          </div>
        </div>
      </div>

      {/* Streak Rules Explanation Footer */}
      <div className="pt-2 border-t border-orange-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-hud text-gray-300 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        <div>FULL DAY: <span className="text-emerald-400 font-bold">+1.0</span></div>
        <div>PARTIAL: <span className="text-amber-400 font-bold">+0.5</span></div>
        <div>EXCUSED: <span className="text-cyan-400 font-bold">0.0</span></div>
        <div>UNEXCUSED: <span className="text-red-400 font-bold">-3.0</span></div>
      </div>
    </div>
  );
};
