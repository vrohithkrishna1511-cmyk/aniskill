'use client';

import React, { useState } from 'react';
import { Trophy, Shield, Zap } from 'lucide-react';
import { CinematicBackground } from '../../components/anime/CinematicBackground';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { RankProgress } from '../../components/ui/RankProgress';
import { StreakCard } from '../../components/ui/StreakCard';
import { RANKS_DATA } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { RankType } from '../../types';

export default function ProgressPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { userProfile } = useApp();

  const rankKeys: RankType[] = ['NINJA_STUDENT', 'GENIN', 'CHUNIN', 'JONIN', 'ANBU_BLACK_OPS', 'HOKAGE'];

  return (
    <CinematicBackground theme="orange" backgroundImage="/images/hokage_rock_ascension.jpg" overlayOpacity="bg-black/15">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div>
            <span className="text-xs font-hud text-orange-400 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              SHINOBI ASCENSION
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              RANK & STREAK PROGRESSION
            </h1>
          </div>

          <RankProgress currentRank={userProfile.rank} currentStreak={userProfile.currentStreak} />
          <StreakCard />

          {/* Full Rank Hierarchy Ladder */}
          <section className="bg-[#05050c]/30 backdrop-blur-[2px] rounded-3xl p-6 border border-orange-500/30 shadow-[0_0_30px_rgba(255,107,0,0.15)] space-y-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-orange-400 drop-shadow-[0_0_10px_rgba(255,107,0,0.6)]" />
              <h3 className="font-hud font-bold text-base text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                SHINOBI RANK LADDER HIERARCHY
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rankKeys.map((rkKey) => {
                const rkInfo = RANKS_DATA[rkKey];
                const isUnlocked = userProfile.currentStreak >= rkInfo.minStreakRequired;
                const isCurrent = userProfile.rank === rkKey;

                return (
                  <div
                    key={rkKey}
                    className={`p-5 rounded-2xl border transition-all space-y-2 relative overflow-hidden backdrop-blur-sm shadow-md ${
                      isCurrent
                        ? 'bg-orange-950/40 border-orange-400 shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                        : isUnlocked
                        ? 'bg-black/35 border-emerald-500/40'
                        : 'bg-black/45 border-gray-700/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Shield className="w-6 h-6 flex-shrink-0 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" style={{ color: rkInfo.color }} />
                      {isCurrent ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-black font-hud font-bold text-[10px] shadow-sm">
                          CURRENT RANK
                        </span>
                      ) : isUnlocked ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-hud">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] font-hud text-gray-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          {rkInfo.minStreakRequired} DAYS STREAK REQ
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-hud font-bold text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ color: rkInfo.color }}>
                        {rkInfo.name} <span className="text-xs font-normal text-gray-300">({rkInfo.jpName})</span>
                      </h4>
                      <p className="text-xs font-body text-gray-200 italic mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        "{rkInfo.quote}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </CinematicBackground>
  );
}
