'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Flame, 
  Target, 
  BookOpen, 
  Trophy, 
  Swords, 
  Award, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Scroll
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CinematicBackground } from '../../components/anime/CinematicBackground';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { JiraiyaMentor } from '../../components/anime/JiraiyaMentor';
import { RankProgress } from '../../components/ui/RankProgress';
import { StreakCard } from '../../components/ui/StreakCard';
import { NicknameBadge } from '../../components/ui/NicknameBadge';
import { DailyMission } from '../../components/training/DailyMission';
import { RivalryBattle } from '../../components/rivalry/RivalryBattle';
import { DailyMotivation } from '../../components/anime/DailyMotivation';
import { RankUpModal } from '../../components/ui/RankUpModal';
import { ComebackBanner } from '../../components/anime/ComebackBanner';
import { CharacterRenderer } from '../../components/anime/CharacterRenderer';
import { ProfileSetupModal } from '../../components/auth/ProfileSetupModal';

export default function DashboardPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { 
    userProfile, 
    syllabus, 
    showDailyMotivation, 
    dismissDailyMotivation, 
    showRankUpModal, 
    dismissRankUpModal,
    showProfileSetupModal,
    saveProfileToBackend,
    openGuideAcademy
  } = useApp();

  // Prevent Dashboard Flash:
  // Only render dashboard when user is authenticated AND has entered the academy in active session
  useEffect(() => {
    if (authStatus === 'loading') return;

    if (authStatus === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (authStatus === 'authenticated') {
      const hasEntered = typeof window !== 'undefined' ? sessionStorage.getItem('aniskill_academy_entered') : null;
      if (hasEntered !== 'true') {
        router.replace('/');
        return;
      }
      setIsAuthorized(true);
    }
  }, [authStatus, router]);

  // First-Time User Kakashi Onboarding Auto-Launch
  useEffect(() => {
    if (isAuthorized) {
      const isCompleted = typeof window !== 'undefined' ? localStorage.getItem('hasCompletedKakashiGuide') : null;
      if (isCompleted !== 'true') {
        openGuideAcademy();
      }
    }
  }, [isAuthorized, openGuideAcademy]);

  const totalTopics = syllabus.subjects.reduce(
    (acc, sub) => acc + (sub.courses || sub.chapters || []).reduce((cAcc, chap) => cAcc + (chap.todoItems || chap.topics || []).length, 0), 0
  );
  const completedTopics = syllabus.subjects.reduce(
    (acc, sub) => acc + (sub.courses || sub.chapters || []).reduce((cAcc, chap) => cAcc + (chap.todoItems || chap.topics || []).filter(t => t.completed || t.status === 'COMPLETED').length, 0), 0
  );
  const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#030406] flex items-center justify-center z-50">
        <div className="space-y-4 text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
          <div className="flex flex-col space-y-1">
            <span className="font-hud font-extrabold text-sm tracking-[0.2em] text-white">
              ACCESSING SHINOBI TRAINING GROUND
            </span>
            <span className="text-[10px] font-hud text-orange-500 tracking-wider animate-pulse">
              SYNCING CHAKRA PROFILE...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CinematicBackground theme="orange" backgroundImage="/images/dashboard_bg.jpg" overlayOpacity="bg-black/20">
      <ProfileSetupModal
        isOpen={showProfileSetupModal}
        onSave={saveProfileToBackend}
      />

      {showDailyMotivation && (
        <DailyMotivation
          streakCount={userProfile.currentStreak}
          onContinue={dismissDailyMotivation}
        />
      )}

      {showRankUpModal && (
        <RankUpModal rank={showRankUpModal} onClose={dismissRankUpModal} />
      )}

      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Comeback Banner (if streak was interrupted) */}
          {userProfile.hasInterruptedStreak && (
            <ComebackBanner onReturnToTraining={() => {}} />
          )}

          {/* ANIME TRAINING ROOM HERO BANNER */}
          <section className="relative bg-transparent p-6 md:p-8 rounded-3xl overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
              
              {/* NARUTO PROTAGONIST WELCOME VISUAL */}
              <div className="w-full lg:w-1/3 flex flex-col items-center justify-center">
                <CharacterRenderer
                  characterId="naruto"
                  state="welcome"
                  size="hero"
                  showAura={true}
                />
              </div>

              {/* WELCOME HERO DETAILS */}
              <div className="w-full lg:w-2/3 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-hud text-gray-400 uppercase tracking-widest">SHINOBI STUDENT</span>
                  <NicknameBadge nickname={userProfile.nickname} />
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold font-hud text-white tracking-wide">
                  WELCOME TO THE TRAINING GROUND, {(userProfile?.name || 'Shinobi').toUpperCase()}!
                </h1>

                <p className="text-sm font-title text-amber-100 italic leading-relaxed">
                  "YOUR WILL OF FIRE IS CURRENTLY BURNING WITH A <span className="text-orange-400 font-bold not-italic glow-orange-text">{userProfile.currentStreak} DAY STREAK</span>!"
                </p>

                <div className="flex items-center space-x-4 pt-2">
                  <Link
                    href="/syllabus"
                    className="px-6 py-3 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.5)] flex items-center space-x-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>OPEN SYLLABUS SKILL TREE</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* JIRAIYA SAGE MENTOR DIALOGUE */}
          <section>
            <JiraiyaMentor mood="MISSION" size="hero" />
          </section>

          {/* TODAY'S TRAINING MISSION WIDGET */}
          <section>
            <DailyMission />
          </section>

          {/* RANK & STREAK GRID */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RankProgress currentRank={userProfile.rank} currentStreak={userProfile.currentStreak} />
            <StreakCard />
          </section>

          {/* OVERALL SYLLABUS PROGRESS SNAPSHOT */}
          <section className="bg-transparent rounded-3xl p-6 md:p-8 border border-orange-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-orange-400" />
                <h3 className="font-hud font-extrabold text-lg text-white tracking-wider">
                  SYLLABUS CHAKRA PROGRESS
                </h3>
              </div>
              <span className="text-xs font-hud font-extrabold text-cyan-400 glow-cyan-text">
                {completedTopics}/{totalTopics} TOPICS CLEAR ({overallPercent}%)
              </span>
            </div>

            <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-gray-800">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>

            {syllabus.subjects.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-hud text-gray-400">
                  NO SYLLABUS TOPICS REGISTERED YET
                </p>
                <Link
                  href="/syllabus"
                  className="inline-flex items-center space-x-1.5 text-xs font-hud text-orange-400 hover:text-amber-300 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>+ CREATE YOUR FIRST SUBJECT</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {syllabus.subjects.map(sub => {
                  const subTotal = (sub.courses || sub.chapters || []).reduce((acc, c) => acc + (c.todoItems || c.topics || []).length, 0);
                  const subDone = (sub.courses || sub.chapters || []).reduce((acc, c) => acc + (c.todoItems || c.topics || []).filter(t => t.completed || t.status === 'COMPLETED').length, 0);
                  const subPercent = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

                  return (
                    <div key={sub.id} className="p-4 rounded-2xl bg-transparent border border-orange-500/30 space-y-2">
                      <div className="text-xs font-hud font-bold text-orange-400 truncate">{sub.title}</div>
                      <div className="flex items-center justify-between text-xs font-hud text-gray-400">
                        <span>{subDone}/{subTotal} TOPICS</span>
                        <span className="text-white font-bold">{subPercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </CinematicBackground>
  );
}
