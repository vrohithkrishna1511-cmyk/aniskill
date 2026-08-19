'use client';

import React, { useState } from 'react';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/ui/Sidebar';
import { TrainingTimer } from '../../../components/training/TrainingTimer';

export default function TrainingSessionPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="relative min-h-screen w-full bg-[#04070e] text-slate-100 overflow-x-hidden">
      {/* BACKGROUND LAYER: Tobirama on the Left (Blue Chakra) + Dark Center + Naruto on the Right (Fire Chakra) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/training_dual_bg.jpg")' }}
      >
        {/* Subtle center darkening vignette to ensure maximum text & button contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#04070e]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04070e]/80 via-transparent to-[#04070e]/40" />
      </div>

      <div className="relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Centered Main Container — Equidistant between Left Tobirama and Right Naruto */}
        <div className="w-full max-w-xl lg:max-w-2xl mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-14 pb-2 px-4 flex flex-col items-center justify-center">
          <main className="w-full flex flex-col items-center space-y-2">
            <div className="text-center w-full space-y-0.5">
              <span className="text-[10px] font-hud text-cyan-400 uppercase tracking-[0.25em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                CHAKRA SYNCHRONIZATION
              </span>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold font-hud text-white tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                SHINOBI TRAINING SESSION
              </h1>
            </div>

            <TrainingTimer />

            {/* Focus Mode Active Footer */}
            <div className="pt-0.5 flex items-center justify-center space-x-2 text-[10px] sm:text-xs font-hud tracking-widest text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-400 font-bold uppercase">FOCUS MODE ACTIVE</span>
              <span>•</span>
              <span className="text-slate-300 uppercase">STAY DISCIPLINED, SHINOBI!</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
