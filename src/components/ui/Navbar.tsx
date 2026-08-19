'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Shield, Zap, Volume2, VolumeX, Menu, X, Timer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RANKS_DATA } from '../../data/mockData';
import { LiveKakashiGuide } from '../academy/LiveKakashiGuide';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const { userProfile, updateUserProfile, isTrainingActive, trainingSeconds } = useApp();

  const currentRankInfo = RANKS_DATA[userProfile.rank] || RANKS_DATA.GENIN;

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent !border-none !shadow-none px-4 lg:px-8 py-3 h-[65px] pointer-events-none transition-all">
        <div className="max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1700px] mx-auto flex items-center justify-between pointer-events-auto">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center space-x-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white glass-panel"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[10px] bg-[#0A0D14]/80 backdrop-blur-sm flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400 group-hover:animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-hud font-extrabold text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                ANISKILL
              </span>
              <span className="text-[9px] font-hud text-gray-400 tracking-wider uppercase -mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                SHINOBI TRAINING
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Timer Badge (if training) */}
        {isTrainingActive && (
          <Link
            href="/training/session"
            className="hidden sm:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-xs font-hud animate-pulse"
          >
            <Timer className="w-4 h-4 text-orange-400" />
            <span>TRAINING IN PROGRESS:</span>
            <span className="font-bold text-white glow-orange-text">
              {formatSeconds(trainingSeconds)}
            </span>
          </Link>
        )}

        {/* Right: HUD User Status Badges */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Rank Badge */}
          <Link href="/progress" className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-orange-500/40 transition-colors shadow-lg">
            <Shield className="w-4 h-4" style={{ color: currentRankInfo.color }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-hud text-gray-400 uppercase tracking-widest leading-none">
                RANK
              </span>
              <span className="text-xs font-hud font-bold leading-tight" style={{ color: currentRankInfo.color }}>
                {currentRankInfo.name}
              </span>
            </div>
          </Link>

          {/* Streak Counter */}
          <Link href="/progress" className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-orange-500/30 hover:border-orange-400 transition-colors shadow-lg">
            <Zap className="w-4 h-4 text-orange-400 animate-bounce" />
            <span className="text-xs font-hud font-extrabold text-orange-400 glow-orange-text">
              {userProfile.currentStreak} DAYS
            </span>
          </Link>

          {/* Sound Toggle */}
          <button
            onClick={() => updateUserProfile({ soundEnabled: !userProfile.soundEnabled })}
            className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-orange-500/40 text-gray-400 hover:text-orange-400 transition-colors shadow-lg cursor-pointer"
            title="Toggle Sound Effects"
          >
            {userProfile.soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5 text-gray-600" />}
          </button>
        </div>
      </div>
      </header>
      <LiveKakashiGuide />
    </>
  );
};
