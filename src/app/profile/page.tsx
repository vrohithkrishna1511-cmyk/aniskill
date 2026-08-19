'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, Zap, Clock, Award, Calendar, BookOpen, Flame, Sparkles } from 'lucide-react';
import { CinematicBackground } from '../../components/anime/CinematicBackground';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { NicknameBadge } from '../../components/ui/NicknameBadge';
import { useApp } from '../../context/AppContext';
import { RANKS_DATA } from '../../data/mockData';
import { CharacterRenderer } from '../../components/anime/CharacterRenderer';

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { userProfile, syllabus, achievements, rival } = useApp();

  const rankInfo = RANKS_DATA[userProfile.rank];
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <CinematicBackground theme="orange" backgroundImage="/images/profile_bg.jpg" overlayOpacity="bg-black/15">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          
          {/* MAIN SHINOBI DOSSIER BANNER WITH FULL-BODY CHARACTER */}
          <section className="relative bg-[#05050c]/30 backdrop-blur-[2px] p-6 md:p-8 rounded-3xl border border-orange-500/40 shadow-[0_0_50px_rgba(255,107,0,0.2)] overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              
              {/* FULL-BODY PROTAGONIST ARTWORK */}
              <div className="w-full lg:w-1/3 flex flex-col items-center justify-center relative">
                <CharacterRenderer
                  characterId="naruto"
                  state="welcome"
                  size="hero"
                  showAura={true}
                />
              </div>

              {/* DOSSIER DETAILS */}
              <div className="w-full lg:w-2/3 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-6 h-6 text-orange-400 animate-pulse drop-shadow-[0_0_10px_rgba(255,107,0,0.8)]" />
                    <div>
                      <span className="text-[10px] font-hud text-gray-300 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        LEAF VILLAGE REGISTRATION DOSSIER
                      </span>
                      <h1 className="text-3xl sm:text-4xl font-extrabold font-hud text-white tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                        {userProfile?.name || userProfile?.ninjaIdentity || 'Shinobi'}
                      </h1>
                    </div>
                  </div>
                  <NicknameBadge nickname={userProfile.nickname} />
                </div>

                <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-orange-500/30 flex items-center justify-between shadow-md">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" style={{ color: rankInfo.color }} />
                    <div>
                      <div className="text-xs font-hud text-gray-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">CURRENT NINJA RANK</div>
                      <div className="text-lg font-hud font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ color: rankInfo.color }}>
                        {rankInfo.name.toUpperCase()} ({rankInfo.jpName})
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-title italic text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    "{rankInfo.quote}"
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-orange-500/30 shadow-md">
                    <div className="text-2xl font-hud font-extrabold text-orange-400 glow-orange-text">
                      {userProfile.currentStreak} DAYS
                    </div>
                    <div className="text-[9px] font-hud text-gray-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">CURRENT STREAK</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-cyan-500/30 shadow-md">
                    <div className="text-2xl font-hud font-extrabold text-cyan-400 glow-cyan-text">
                      {userProfile.totalStudyHours}h
                    </div>
                    <div className="text-[9px] font-hud text-gray-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">STUDY TIME</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-amber-500/30 shadow-md">
                    <div className="text-2xl font-hud font-extrabold text-amber-400 glow-gold-text">
                      {userProfile.bestStreak} DAYS
                    </div>
                    <div className="text-[9px] font-hud text-gray-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">BEST STREAK</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-purple-500/30 shadow-md">
                    <div className="text-2xl font-hud font-extrabold text-purple-300">
                      {unlockedAchievementsCount}/{achievements.length}
                    </div>
                    <div className="text-[9px] font-hud text-gray-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">ACHIEVEMENTS</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Journey Timeline */}
          <section className="bg-[#05050c]/30 backdrop-blur-[2px] rounded-3xl p-6 md:p-8 border border-orange-500/30 space-y-6 shadow-[0_0_30px_rgba(255,107,0,0.15)]">
            <div className="flex items-center space-x-3 border-b border-orange-500/20 pb-3">
              <Calendar className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(255,107,0,0.6)]" />
              <h3 className="font-hud font-extrabold text-lg text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                TRAINING JOURNEY TIMELINE
              </h3>
            </div>

            {userProfile.currentStreak === 0 && userProfile.totalStudyHours === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-hud text-gray-400">
                  NO TRAINING SESSIONS RECORDED YET
                </p>
                <p className="text-xs font-body text-gray-500">
                  Start your training on the training grounds to record your first shinobi milestone!
                </p>
              </div>
            ) : (
              <div className="space-y-6 border-l-2 border-orange-500/40 pl-6 ml-3">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-emerald-400 absolute -left-[31px] top-0.5 shadow-[0_0_12px_#10B981] ring-4 ring-black" />
                  <div className="text-xs font-hud text-emerald-400 font-bold tracking-widest uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {userProfile.lastActiveDate || 'TODAY'}
                  </div>
                  <div className="text-base font-hud text-white font-bold mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {userProfile.currentStreak > 0 ? `${userProfile.currentStreak}-Day Streak Active` : 'Training in Progress'}
                  </div>
                  <div className="text-xs font-body text-slate-200 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    Logged {userProfile.totalStudyHours} total study hours on the training ground.
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </CinematicBackground>
  );
}
