'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Award, Zap } from 'lucide-react';
import { RankType } from '../../types';
import { RANKS_DATA } from '../../data/mockData';

interface RankProgressProps {
  currentRank: RankType;
  currentStreak: number;
}

export const RankProgress: React.FC<RankProgressProps> = ({ currentRank, currentStreak }) => {
  const rankKeys: RankType[] = [
    'NINJA_STUDENT',
    'GENIN',
    'CHUNIN',
    'JONIN',
    'ANBU_BLACK_OPS',
    'HOKAGE'
  ];

  const currentIndex = rankKeys.indexOf(currentRank);
  const nextRankKey = rankKeys[Math.min(currentIndex + 1, rankKeys.length - 1)];

  const currentRankInfo = RANKS_DATA[currentRank];
  const nextRankInfo = RANKS_DATA[nextRankKey];

  const isMaxRank = currentIndex === rankKeys.length - 1;

  const currentReq = currentRankInfo.minStreakRequired;
  const nextReq = nextRankInfo.minStreakRequired;
  const daysNeeded = Math.max(0, nextReq - currentStreak);
  
  const progressPercent = isMaxRank 
    ? 100 
    : Math.min(100, Math.max(0, ((currentStreak - currentReq) / (nextReq - currentReq)) * 100));

  return (
    <div className="w-full bg-[#05050c]/30 backdrop-blur-[2px] rounded-2xl p-6 border border-orange-500/30 shadow-[0_0_30px_rgba(255,107,0,0.15)] relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <div>
          <div className="text-xs font-hud text-gray-300 tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            CURRENT SHINOBI RANK
          </div>
          <div className="flex items-center space-x-3 mt-1">
            <Shield className="w-7 h-7 flex-shrink-0 drop-shadow-[0_0_10px_rgba(255,107,0,0.5)]" style={{ color: currentRankInfo.color }} />
            <div>
              <h3 className="text-xl font-bold font-hud drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" style={{ color: currentRankInfo.color }}>
                {currentRankInfo.name} <span className="text-xs font-normal text-gray-300">({currentRankInfo.jpName})</span>
              </h3>
              <p className="text-xs font-body text-gray-200 italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                "{currentRankInfo.quote}"
              </p>
            </div>
          </div>
        </div>

        {!isMaxRank && (
          <div className="mt-4 md:mt-0 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-black/40 border border-orange-500/30 text-right backdrop-blur-sm shadow-md">
            <div>
              <div className="text-[10px] font-hud text-gray-300 uppercase tracking-wider">NEXT RANK UNLOCK</div>
              <div className="text-xs font-hud font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ color: nextRankInfo.color }}>
                {nextRankInfo.name}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-400" />
          </div>
        )}
      </div>

      {/* Progress Bar Track */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs font-hud">
          <span className="text-gray-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">STREAK PROGRESS</span>
          <span className="text-orange-400 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {isMaxRank ? 'MAX RANK ACHIEVED' : `${daysNeeded} DAYS REMAINING TO ${nextRankInfo.name.toUpperCase()}`}
          </span>
        </div>

        <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-orange-500/30 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_15px_rgba(255,107,0,0.9)]"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-hud text-gray-300 pt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          <span>{currentStreak} / {nextReq} DAYS STREAK</span>
          <span className="font-bold text-amber-300">{progressPercent.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
