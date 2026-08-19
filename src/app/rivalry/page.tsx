'use client';

import React, { useState } from 'react';
import { Swords } from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { RivalryBattle } from '../../components/rivalry/RivalryBattle';
import { GlobalFooter } from '../../components/ui/GlobalFooter';

export default function RivalryPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeStageId, setActiveStageId] = useState<string>('stage-1');

  // Dynamic Background Image
  const getBackgroundImage = () => {
    if (activeStageId === 'stage-1') return 'url("/images/rivalry_naruto_sasuke.jpg")';
    if (activeStageId === 'stage-2') return 'url("/images/rivalry_kakashi_obito.jpg")';
    if (activeStageId === 'stage-3') return 'url("/images/rivalry_hashirama_madara.jpg")';
    return 'none'; 
  };

  const hasCustomBackground = activeStageId === 'stage-1' || activeStageId === 'stage-2' || activeStageId === 'stage-3';

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-[center_center] bg-no-repeat bg-fixed text-slate-100 overflow-x-hidden transition-all duration-1000 flex flex-col justify-between"
      style={{ 
        backgroundImage: getBackgroundImage(),
        backgroundColor: hasCustomBackground ? 'transparent' : '#140505'
      }}
    >
      {/* Dynamic Overlay */}
      {hasCustomBackground ? (
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/25 pointer-events-none z-0 transition-opacity duration-1000" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#0a0202]/80 to-[#050101] pointer-events-none z-0 transition-opacity duration-1000" />
      )}

      {/* Optional subtle scanline */}
      <div className="fixed inset-0 hud-scanline opacity-10 pointer-events-none z-0" />

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px] flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            <div>
              <span className="text-xs font-hud text-red-500 uppercase tracking-widest">
                ACADEMY COMPETITION
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-0.5">
                FRIEND RIVALRY ARENA
              </h1>
            </div>

            <RivalryBattle activeStageId={activeStageId} setActiveStageId={setActiveStageId} />
          </main>
        </div>
      </div>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}
