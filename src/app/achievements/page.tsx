'use client';

import React, { useState } from 'react';
import { Award, Filter } from 'lucide-react';
import { CinematicBackground } from '../../components/anime/CinematicBackground';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { AchievementCard } from '../../components/achievements/AchievementCard';
import { useApp } from '../../context/AppContext';

export default function AchievementsPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { achievements } = useApp();
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  const filteredAchievements = achievements.filter(a => {
    if (activeTab === 'UNLOCKED') return a.unlocked;
    if (activeTab === 'LOCKED') return !a.unlocked;
    return true;
  });

  return (
    <CinematicBackground theme="orange" backgroundImage="/images/achievements_bg.jpg" overlayOpacity="bg-black/15">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-hud text-orange-400 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                SHINOBI ACHIEVEMENTS
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                ACHIEVEMENTS & MILESTONES
              </h1>
            </div>

            <div className="flex items-center space-x-1.5 bg-black/40 p-1.5 rounded-xl border border-orange-500/30 backdrop-blur-sm shadow-md">
              {(['ALL', 'UNLOCKED', 'LOCKED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-hud tracking-wider transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-[0_0_10px_rgba(255,107,0,0.4)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.length === 0 ? (
              <div className="col-span-full py-12 text-center space-y-2 rounded-2xl bg-black/40 border border-orange-500/20">
                <Award className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs font-hud text-gray-400">
                  NO ACHIEVEMENTS UNLOCKED YET
                </p>
                <p className="text-[11px] font-body text-gray-500">
                  Complete training missions, maintain streaks, and clear syllabus topics to unlock medals!
                </p>
              </div>
            ) : (
              filteredAchievements.map(ach => (
                <AchievementCard key={ach.id} achievement={ach} />
              ))
            )}
          </div>
        </main>
      </div>
    </CinematicBackground>
  );
}
