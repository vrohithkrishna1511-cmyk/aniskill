'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Play, 
  Save, 
  CheckCircle2, 
  Scroll, 
  ChevronUp, 
  Flame, 
  Sparkles, 
  Shield,
  BookOpen
} from 'lucide-react';
import { CinematicBackground } from '../../components/anime/CinematicBackground';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { useApp } from '../../context/AppContext';
import { NicknameType, SHINOBI_TITLES } from '../../types';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeScroll, setActiveScroll] = useState<'settings' | 'credits' | null>(null);
  const { userProfile, updateUserProfile, setIntroSeen, openGuideAcademy } = useApp();

  const [name, setName] = useState<string>(userProfile?.name || '');
  const [nickname, setNickname] = useState<NicknameType>(userProfile?.nickname || '');
  const [mins, setMins] = useState<number>(userProfile?.dailyTimeCommitmentMinutes || 0);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile?.name) {
      setName(userProfile.name);
    }
    if (userProfile?.nickname !== undefined) {
      setNickname(userProfile.nickname);
    }
    if (userProfile?.dailyTimeCommitmentMinutes !== undefined) {
      setMins(userProfile.dailyTimeCommitmentMinutes);
    }
  }, [userProfile?.name, userProfile?.nickname, userProfile?.dailyTimeCommitmentMinutes]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    updateUserProfile({
      name: cleanName,
      nickname,
      dailyTimeCommitmentMinutes: mins
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleScroll = (scrollType: 'settings' | 'credits') => {
    setActiveScroll(prev => (prev === scrollType ? null : scrollType));
  };

  return (
    <CinematicBackground theme="orange" backgroundImage="/images/settings_bg.jpg" overlayOpacity="bg-black/15">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          
          {/* 1. PAGE HEADER */}
          <div className="space-y-1 max-w-5xl mx-auto text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-[10px] font-hud uppercase tracking-widest shadow-inner">
              <Scroll className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>NINJA PARCHMENT ARCHIVES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-hud text-white mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              SHINOBI SETTINGS & ARCHIVES
            </h1>
            <p className="text-xs sm:text-sm font-body text-gray-300">
              Select an authentic ninja scroll below to unroll its sealed configuration.
            </p>
          </div>

          {/* 2. TWO INDEPENDENT CLOSED SCROLL SELECTORS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* SCROLL 1 TRIGGER: SETTINGS SCROLL */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleScroll('settings')}
              className={`p-6 rounded-3xl backdrop-blur-[4px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4 group ${
                activeScroll === 'settings'
                  ? 'bg-[#140b07]/90 border-orange-500 shadow-[0_0_35px_rgba(255,107,0,0.4)] ring-2 ring-orange-500/50'
                  : 'bg-[#05050c]/40 border-orange-500/40 hover:border-orange-400 shadow-[0_0_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_35px_rgba(255,107,0,0.25)]'
              }`}
            >
              <span className="text-[11px] font-hud font-extrabold text-orange-400 tracking-[0.25em] uppercase">
                SCROLL I • CONFIGURATION
              </span>

              {/* The Ninja Scroll Asset */}
              <div className="relative w-60 h-20 transform transition-transform group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(255,107,0,0.8)]">
                <img 
                  src="/images/horizontal_scroll.png" 
                  alt="Settings Ninja Scroll"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-hud font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                  SYSTEM CONFIGURATION
                </h3>
                <p className="text-xs font-body text-gray-400 max-w-xs">
                  Shinobi identity, daily commitment, audio cues, and training guide.
                </p>
              </div>

              <div className={`px-4 py-1.5 rounded-full text-xs font-hud font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                activeScroll === 'settings'
                  ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(255,107,0,0.5)]'
                  : 'bg-black/60 text-orange-300 border border-orange-500/30 group-hover:bg-orange-500/20'
              }`}>
                <Scroll className="w-3.5 h-3.5" />
                <span>{activeScroll === 'settings' ? 'ROLL UP SCROLL ▲' : 'CLICK TO UNROLL SCROLL ▼'}</span>
              </div>
            </motion.div>

            {/* SCROLL 2 TRIGGER: CREDITS / SHINOBI ARCHIVES */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleScroll('credits')}
              className={`p-6 rounded-3xl backdrop-blur-[4px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4 group ${
                activeScroll === 'credits'
                  ? 'bg-[#140b07]/90 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.4)] ring-2 ring-amber-500/50'
                  : 'bg-[#05050c]/40 border-orange-500/40 hover:border-amber-400 shadow-[0_0_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]'
              }`}
            >
              <span className="text-[11px] font-hud font-extrabold text-amber-400 tracking-[0.25em] uppercase">
                SCROLL II • ARCHIVES
              </span>

              {/* The Ninja Scroll Asset */}
              <div className="relative w-60 h-20 transform transition-transform group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]">
                <img 
                  src="/images/horizontal_scroll.png" 
                  alt="Shinobi Archives Scroll"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-hud font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                  SHINOBI ARCHIVES // CREDITS
                </h3>
                <p className="text-xs font-body text-gray-400 max-w-xs">
                  Creator credits, Will of Fire manifesto, and academy founder details.
                </p>
              </div>

              <div className={`px-4 py-1.5 rounded-full text-xs font-hud font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                activeScroll === 'credits'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-black/60 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500/20'
              }`}>
                <Flame className="w-3.5 h-3.5" />
                <span>{activeScroll === 'credits' ? 'ROLL UP SCROLL ▲' : 'CLICK TO UNROLL SCROLL ▼'}</span>
              </div>
            </motion.div>

          </div>

          {/* 3. UNROLLED PARCHMENT DISPLAY AREA */}
          <AnimatePresence mode="wait">
            
            {/* UNROLLED SCROLL 1: SYSTEM CONFIGURATION / SETTINGS */}
            {activeScroll === 'settings' && (
              <motion.div
                key="unrolled-settings-scroll"
                initial={{ height: 0, opacity: 0, scaleY: 0.05 }}
                animate={{ height: 'auto', opacity: 1, scaleY: 1 }}
                exit={{ height: 0, opacity: 0, scaleY: 0.05 }}
                style={{ transformOrigin: 'top center' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,107,0,0.3)] border-2 border-orange-500/50"
              >
                {/* Vertical Scroll Parchment Background */}
                <div className="absolute inset-0 -z-20 bg-[url('/images/vertical_scroll.jpg')] bg-[length:100%_100%] bg-center bg-no-repeat" />
                <div className="absolute inset-0 -z-10 bg-[#07080B]/85 backdrop-blur-[3px]" />

                {/* Staggered Content Reveal */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="p-6 sm:p-10 space-y-6"
                >
                  {/* Top Header & Roll Up Button */}
                  <div className="flex items-center justify-between border-b border-orange-500/30 pb-4">
                    <div>
                      <span className="text-xs font-hud text-orange-400 uppercase tracking-widest flex items-center space-x-1.5">
                        <Scroll className="w-4 h-4 text-orange-400" />
                        <span>SCROLL I UNROLLED</span>
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-1">
                        SYSTEM CONFIGURATION
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveScroll(null)}
                      className="px-4 py-2 rounded-xl font-hud font-bold text-xs text-orange-400 border border-orange-500/40 hover:bg-orange-500/20 transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                      title="Roll Up Settings Scroll"
                    >
                      <ChevronUp className="w-4 h-4" />
                      <span>ROLL UP SCROLL</span>
                    </button>
                  </div>

                  {/* Settings Form */}
                  <form onSubmit={handleSave} className="space-y-6">
                    {saved && (
                      <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-hud flex items-center space-x-2 animate-bounce">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>SETTINGS SAVED SUCCESSFULLY!</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Shinobi Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-hud text-gray-300 uppercase flex items-center justify-between">
                          <span>SHINOBI NAME</span>
                          <span className="text-[10px] text-orange-400 font-mono">REQUIRED</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your Shinobi Name"
                          className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-zinc-700/80 focus:border-orange-500 text-xs font-hud text-white placeholder-zinc-600 focus:outline-none transition-colors shadow-inner"
                        />
                      </div>

                      {/* Nickname / Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-hud text-gray-300 uppercase">
                          NICKNAME / SHINOBI TITLE
                        </label>
                        <select
                          value={nickname || ''}
                          onChange={(e) => setNickname(e.target.value as NicknameType)}
                          className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-zinc-700/80 focus:border-orange-500 text-xs font-hud text-white focus:outline-none transition-colors shadow-inner cursor-pointer"
                        >
                          <option value="" disabled className="bg-slate-900 text-gray-500">
                            Select Your Shinobi Title
                          </option>
                          {SHINOBI_TITLES.map((item) => (
                            <option key={item.title} value={item.title} className="bg-slate-900 text-white">
                              {item.title} — {item.character}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Daily Commitment */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-hud text-gray-300 uppercase">
                        DAILY TRAINING COMMITMENT (MINUTES)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="15"
                        value={mins > 0 ? mins : ''}
                        placeholder="Not set (e.g. 60)"
                        onChange={(e) => setMins(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-zinc-700/80 focus:border-orange-500 text-xs font-hud text-white placeholder-zinc-600 focus:outline-none transition-colors shadow-inner"
                      />
                    </div>

                    {/* Action Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {/* Audio Toggle */}
                      <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-hud text-white font-bold">
                            CHAKRA AUDIO
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Timer sound cues
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateUserProfile({ soundEnabled: !userProfile?.soundEnabled })}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            userProfile?.soundEnabled 
                              ? 'bg-orange-500 text-black border-orange-400 shadow-[0_0_12px_rgba(255,107,0,0.4)]' 
                              : 'bg-zinc-900 text-gray-500 border-zinc-700'
                          }`}
                        >
                          {userProfile?.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Replay Tutorial */}
                      <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-hud text-white font-bold">
                            KAKASHI GUIDE
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Interactive tutorial
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              localStorage.removeItem('hasCompletedKakashiGuide');
                            }
                            openGuideAcademy();
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-hud font-bold text-orange-400 border border-orange-500/40 hover:bg-orange-500/10 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Scroll className="w-3 h-3" />
                          <span>REPLAY</span>
                        </button>
                      </div>

                      {/* Replay Intro */}
                      <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-hud text-white font-bold">
                            NINE-TAILS INTRO
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Cinematic opening
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIntroSeen(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-hud font-bold text-orange-400 border border-orange-500/40 hover:bg-orange-500/10 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>RESET</span>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-orange-500/20 flex justify-end">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-hud font-extrabold text-xs tracking-wider text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-105 active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>SAVE PREFERENCES</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}

            {/* UNROLLED SCROLL 2: SHINOBI ARCHIVES / CREATOR CREDITS */}
            {activeScroll === 'credits' && (
              <motion.div
                key="unrolled-credits-scroll"
                initial={{ height: 0, opacity: 0, scaleY: 0.05 }}
                animate={{ height: 'auto', opacity: 1, scaleY: 1 }}
                exit={{ height: 0, opacity: 0, scaleY: 0.05 }}
                style={{ transformOrigin: 'top center' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_55px_rgba(245,158,11,0.35)] border-2 border-amber-500/60"
              >
                {/* Vertical Scroll Parchment Background */}
                <div className="absolute inset-0 -z-20 bg-[url('/images/vertical_scroll.jpg')] bg-[length:100%_100%] bg-center bg-no-repeat" />
                <div className="absolute inset-0 -z-10 bg-[#07080B]/85 backdrop-blur-[3px]" />

                {/* Staggered Content Reveal */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="p-8 sm:p-12 text-center space-y-8"
                >
                  {/* Top Header & Roll Up Button */}
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
                    <div className="text-left">
                      <span className="text-xs font-hud text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
                        <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>SCROLL II UNROLLED</span>
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-1">
                        SHINOBI ARCHIVES
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveScroll(null)}
                      className="px-4 py-2 rounded-xl font-hud font-bold text-xs text-amber-400 border border-amber-500/40 hover:bg-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                      title="Roll Up Credits Scroll"
                    >
                      <ChevronUp className="w-4 h-4" />
                      <span>ROLL UP SCROLL</span>
                    </button>
                  </div>

                  {/* Archives Seal & Title */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 text-xs font-hud uppercase tracking-[0.25em] shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                      <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>OFFICIAL ACADEMY SEAL</span>
                      <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    </div>
                    
                    <h3 className="text-2xl sm:text-4xl font-extrabold font-hud text-white tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      ANISKILL // SHINOBI ARCHIVES
                    </h3>
                  </div>

                  {/* Creator Prominence Section */}
                  <div className="space-y-4 py-2">
                    <span className="text-xs sm:text-sm font-hud text-gray-400 uppercase tracking-[0.3em] block">
                      CREATED BY
                    </span>
                    
                    <h2 className="text-4xl sm:text-6xl font-extrabold font-hud text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-100 tracking-wider drop-shadow-[0_4px_25px_rgba(255,107,0,0.7)] animate-pulse">
                      ROHITH KRISHNA
                    </h2>

                    {/* Roles Badges */}
                    <div className="inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-black/60 border border-amber-500/40 shadow-inner">
                      <span className="text-xs sm:text-sm font-hud font-extrabold text-orange-300 tracking-widest uppercase">
                        FOUNDER
                      </span>
                      <span className="text-zinc-600 font-bold">•</span>
                      <span className="text-xs sm:text-sm font-hud font-extrabold text-amber-300 tracking-widest uppercase">
                        DESIGNER
                      </span>
                      <span className="text-zinc-600 font-bold">•</span>
                      <span className="text-xs sm:text-sm font-hud font-extrabold text-cyan-300 tracking-widest uppercase">
                        DEVELOPER
                      </span>
                    </div>

                    {/* Will of Fire Quote */}
                    <div className="mt-4 p-6 rounded-3xl bg-black/70 border border-amber-500/30 max-w-xl mx-auto shadow-2xl space-y-1">
                      <p className="text-sm sm:text-base font-title text-amber-100/95 font-bold uppercase tracking-wider leading-relaxed">
                        "BUILT WITH DETERMINATION, DISCIPLINE & THE WILL OF FIRE"
                      </p>
                    </div>
                  </div>

                  {/* Bottom Academy Metadata */}
                  <div className="pt-4 border-t border-amber-500/20 flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm font-hud text-amber-400 uppercase tracking-widest font-extrabold">
                      <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>ANISKILL • SHINOBI LEARNING ACADEMY</span>
                      <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-hud text-zinc-500 tracking-wider uppercase">
                      EST. 2026 // MASTER YOUR CURRICULUM
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>

        </main>
      </div>
    </CinematicBackground>
  );
}
