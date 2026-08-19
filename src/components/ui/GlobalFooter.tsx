'use client';

import React from 'react';

export const GlobalFooter: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4 border-t border-zinc-800/40 bg-transparent mt-auto relative z-10 pointer-events-none select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center">
        <span className="text-[10px] sm:text-[11px] font-hud tracking-[0.2em] text-zinc-500 uppercase">
          ANISKILL © 2026
        </span>
        <span className="hidden sm:inline text-zinc-600 font-bold">•</span>
        <span className="text-[10px] sm:text-[11px] font-hud tracking-[0.18em] text-zinc-400 uppercase">
          CREATED & DEVELOPED BY <span className="text-orange-400/90 font-bold glow-orange-text">ROHITH KRISHNA</span>
        </span>
      </div>
    </footer>
  );
};
