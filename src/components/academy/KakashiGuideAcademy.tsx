'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  LayoutDashboard,
  BookOpen,
  Target,
  Timer,
  Trophy,
  Users,
  Swords,
  Award,
  UserCheck,
  Settings,
  Scroll,
  Clock,
  CheckCircle2
} from 'lucide-react';

export interface OnboardingStep {
  id: string;
  stepNum: number;
  sectionTitle: string;
  subtitle: string;
  icon: any;
  dialogue: string[];
  highlightCategory: 'dashboard' | 'syllabus' | 'training' | 'timer' | 'progress' | 'squad' | 'rivalry' | 'achievements' | 'profile' | 'settings';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'dashboard',
    stepNum: 1,
    sectionTitle: 'DASHBOARD',
    subtitle: 'SHINOBI COMMAND CENTER',
    icon: LayoutDashboard,
    highlightCategory: 'dashboard',
    dialogue: [
      "Yo, Shinobi.",
      "Welcome to ANISKILL.",
      "Before you begin your training, let me show you how everything works.",
      "This is your Dashboard — your main command center.",
      "Here you'll see your rank, streak, progress, and important information about your learning journey.",
      "Think of this as your Shinobi headquarters."
    ]
  },
  {
    id: 'syllabus',
    stepNum: 2,
    sectionTitle: 'SYLLABUS',
    subtitle: 'CURRICULUM BUILDER',
    icon: BookOpen,
    highlightCategory: 'syllabus',
    dialogue: [
      "Now let's talk about your Syllabus.",
      "This is where you build the curriculum YOU want to master.",
      "Create your subjects, add your topics, and organize your learning path.",
      "You can enter your syllabus manually or use a screenshot to create it.",
      "Once your syllabus is ready, those subjects become available for your training."
    ]
  },
  {
    id: 'training',
    stepNum: 3,
    sectionTitle: 'TRAINING',
    subtitle: 'PRACTICE GROUND',
    icon: Target,
    highlightCategory: 'training',
    dialogue: [
      "Next is the Training Ground.",
      "Your subjects come directly from the syllabus you created.",
      "Choose a subject, select your topic, and begin your training session."
    ]
  },
  {
    id: 'timer',
    stepNum: 4,
    sectionTitle: 'TRAINING TIMER',
    subtitle: 'FOCUS & DISCIPLINE',
    icon: Timer,
    highlightCategory: 'timer',
    dialogue: [
      "This is your Training Timer.",
      "Use the timer to focus on a topic for a specific target duration.",
      "You can start your session, pause, add +10 minutes, or reset at any time.",
      "When you complete your practice, mark the topic completed to earn chakra and track your progress."
    ]
  },
  {
    id: 'progress',
    stepNum: 5,
    sectionTitle: 'PROGRESS & RANK',
    subtitle: 'HOKAGE ROCK LADDER',
    icon: Trophy,
    highlightCategory: 'progress',
    dialogue: [
      "This is where you see how far your Shinobi journey has taken you.",
      "Your rank reflects your progress and consistency.",
      "Keep training, maintain your streak, and earn chakra points to rise through the Shinobi ranks from Academy Student to Hokage."
    ]
  },
  {
    id: 'squad',
    stepNum: 6,
    sectionTitle: 'SHINOBI STUDIES',
    subtitle: 'SQUAD COLLABORATION',
    icon: Users,
    highlightCategory: 'squad',
    dialogue: [
      "Here in Shinobi Studies, you can choose your Shinobi identity and build your study squad.",
      "Join or create a team using your squad code to study together and push each other toward mastery."
    ]
  },
  {
    id: 'rivalry',
    stepNum: 7,
    sectionTitle: 'RIVALRY',
    subtitle: '1v1 ARENA & GHOST BENCHMARK',
    icon: Swords,
    highlightCategory: 'rivalry',
    dialogue: [
      "Think you can outperform another Shinobi?",
      "Rivalry lets you compete with other students by comparing your training performance and timings.",
      "If your rival is absent, the rivalry doesn't stop. You can challenge their best recorded timing and try to defeat their record."
    ]
  },
  {
    id: 'achievements',
    stepNum: 8,
    sectionTitle: 'ACHIEVEMENTS',
    subtitle: 'MEDALS OF HONOR',
    icon: Award,
    highlightCategory: 'achievements',
    dialogue: [
      "These are your Shinobi achievements.",
      "Here you can see what accomplishments you've already unlocked and what challenges remain.",
      "Earn milestone medals as your streak grows and your syllabus expands."
    ]
  },
  {
    id: 'profile',
    stepNum: 9,
    sectionTitle: 'NINJA PROFILE',
    subtitle: 'SHINOBI IDENTITY',
    icon: UserCheck,
    highlightCategory: 'profile',
    dialogue: [
      "This is your Shinobi identity.",
      "Your rank, title, nickname, streak, progress, achievements and other personal learning information are collected here."
    ]
  },
  {
    id: 'settings',
    stepNum: 10,
    sectionTitle: 'SETTINGS',
    subtitle: 'CUSTOMIZATION & GRADUATION',
    icon: Settings,
    highlightCategory: 'settings',
    dialogue: [
      "Finally, Settings. This is where you can customize your name, nickname, title, daily study goals, and personal preferences.",
      "That's the ANISKILL system.",
      "Now you know where everything is and how your Shinobi journey works.",
      "Your mission is simple:",
      "• Build your syllabus.",
      "• Train consistently.",
      "• Track your progress.",
      "• Challenge yourself.",
      "• Rise through the ranks.",
      "Alright, Shinobi. Your training starts now."
    ]
  }
];

interface KakashiGuideAcademyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KakashiGuideAcademy: React.FC<KakashiGuideAcademyProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = ONBOARDING_STEPS[currentStepIndex] || ONBOARDING_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasCompletedKakashiGuide', 'true');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none font-hud">
        {/* SUBTLE DARK OVERLAY — Real website interface remains visible behind */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* HUD SCANLINE EFFECT */}
        <div className="absolute inset-0 hud-scanline opacity-15 pointer-events-none" />

        {/* TUTORIAL ONBOARDING CARD */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-4xl bg-gradient-to-b from-[#140b07] via-[#0d0604] to-[#080302] border-2 border-orange-500/70 rounded-3xl shadow-[0_0_80px_rgba(255,107,0,0.35)] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER */}
          <div className="p-4 sm:p-5 border-b border-orange-500/30 bg-black/60 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400">
                <Scroll className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-orange-400 tracking-widest uppercase block">
                  LEAF VILLAGE ACADEMY // ONBOARDING
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wider flex items-center space-x-2">
                  <span>{currentStep.sectionTitle}</span>
                </h2>
              </div>
            </div>

            {/* STEP COUNTER & SKIP GUIDE BUTTON */}
            <div className="flex items-center space-x-3">
              <span className="px-3.5 py-1 rounded-full bg-orange-950/80 border border-orange-500/50 text-[11px] font-extrabold text-orange-300 uppercase tracking-wider">
                STEP {currentStep.stepNum} / {ONBOARDING_STEPS.length}
              </span>

              <button
                onClick={handleComplete}
                className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700 text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1"
                title="Skip Tutorial"
              >
                <span>SKIP GUIDE</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* MAIN BODY: KAKASHI STICKER (LEFT) + DIALOGUE & VISUAL HIGHLIGHT (RIGHT) */}
          <div className="p-5 sm:p-7 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* LEFT: DEDICATED KAKASHI STICKER ASSET */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              {/* Chakra Glow */}
              <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-blue-500/20 blur-2xl pointer-events-none animate-pulse" />

              {/* KAKASHI IMAGE */}
              <motion.div
                initial={{ scale: 0.94, y: 6 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 w-44 sm:w-56 md:w-64 max-h-72 flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
              >
                <img
                  src="/images/kakashi_guide_academy.png"
                  alt="Kakashi Hatake Academy Guide"
                  className="w-full h-auto object-contain pointer-events-none transform hover:scale-105 transition-transform duration-300"
                />
              </motion.div>

              {/* KAKASHI NAMEPLATE */}
              <div className="mt-2 text-center relative z-10">
                <span className="px-3.5 py-1 rounded-full bg-black/80 border border-orange-500/40 text-[10px] font-extrabold text-amber-300 tracking-widest uppercase shadow-lg inline-block">
                  🥷 KAKASHI HATAKE // ACADEMY GUIDE
                </span>
              </div>
            </div>

            {/* RIGHT: SPEECH BUBBLE & CURRENT SECTION HIGHLIGHT */}
            <div className="md:col-span-7 space-y-4">
              
              {/* SPEECH BUBBLE */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-5 sm:p-6 rounded-3xl bg-black/80 border-2 border-orange-500/50 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative space-y-3"
              >
                <div className="hidden md:block absolute -left-3 top-12 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-orange-500/60" />

                <div className="flex items-center space-x-2 border-b border-orange-500/20 pb-2">
                  <StepIcon className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    {currentStep.sectionTitle} • {currentStep.subtitle}
                  </span>
                </div>

                <div className="space-y-2.5 pt-1 text-sm sm:text-base font-title text-amber-100 leading-relaxed">
                  {currentStep.dialogue.map((line, lIdx) => (
                    <p
                      key={lIdx}
                      className={
                        line.startsWith('•') || line.startsWith('Yo,') || line.startsWith('Now') || line.startsWith('Alright,')
                          ? 'text-orange-300 font-bold'
                          : ''
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>

              {/* CURRENT FEATURE HIGHLIGHT PREVIEW */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-3.5 rounded-2xl bg-zinc-950/90 border border-orange-500/40 text-xs"
              >
                {currentStep.highlightCategory === 'dashboard' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: COMMAND METRICS
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30">
                        <span className="text-gray-400 block">RANK</span>
                        <span className="font-extrabold text-amber-300">GENIN / JŌNIN</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30">
                        <span className="text-gray-400 block">STREAK</span>
                        <span className="font-extrabold text-orange-400">🔥 WILL OF FIRE</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30">
                        <span className="text-gray-400 block">DAILY MISSION</span>
                        <span className="font-extrabold text-emerald-400">TODAY'S TO-DOS</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'syllabus' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: CURRICULUM IMPORT & TOPICS
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30">
                        <span className="text-orange-300 font-bold block">1. ✍ SMART PASTE</span>
                        <span className="text-gray-400">Paste syllabus text directly</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30">
                        <span className="text-orange-300 font-bold block">2. 📷 SCREENSHOT OCR</span>
                        <span className="text-gray-400">Upload syllabus image</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'training' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: PRACTICE FLOW
                    </span>
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="px-2 py-1 rounded bg-zinc-900 text-gray-300">1. Select Subject</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                      <span className="px-2 py-1 rounded bg-zinc-900 text-gray-300">2. Pick Topics</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                      <span className="px-2 py-1 rounded bg-orange-950 text-orange-300 font-bold">3. Start Training</span>
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'timer' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: FOCUS TIMER & COMPLETION
                    </span>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-black/60 border border-orange-500/30 text-[10px]">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="font-extrabold text-white">TARGET: 20:00</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 text-gray-300">+10 MIN</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-900 text-gray-300">PAUSE</span>
                        <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                          ✓ MARK COMPLETE
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'progress' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: SHINOBI RANK ASCENSION
                    </span>
                    <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30 text-[10px] text-gray-300 text-center">
                      ACADEMY STUDENT ➔ GENIN ➔ CHŪNIN ➔ JŌNIN ➔ ANBU ➔ SANNIN ➔ HOKAGE
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'squad' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: SQUAD COLLABORATION
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30">
                        <span className="text-gray-400 block">IDENTITY</span>
                        <span className="font-bold text-white">CHOOSE SHINOBI</span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30">
                        <span className="text-gray-400 block">SQUAD CODE</span>
                        <span className="font-bold text-orange-300">COLLABORATE IN ROOMS</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'rivalry' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: SUBSTITUTE BEST TIMING CHALLENGE
                    </span>
                    <div className="p-2 rounded-xl bg-black/60 border border-orange-500/40 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-bold">🟢 ACTIVE: CURRENT TIME</span>
                      <span className="font-extrabold text-orange-400">VS</span>
                      <span className="text-amber-400 font-bold">🟠 ABSENT: BEST TIMING RECORD</span>
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'achievements' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: SCROLL MEDALS
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-1.5 rounded-xl bg-black/60 border border-amber-500/30 text-amber-300 font-bold">
                        🏆 WILL OF FIRE
                      </div>
                      <div className="p-1.5 rounded-xl bg-black/60 border border-orange-500/30 text-orange-300 font-bold">
                        📜 SYLLABUS MASTER
                      </div>
                      <div className="p-1.5 rounded-xl bg-black/60 border border-cyan-500/30 text-cyan-300 font-bold">
                        ⚡ SPEED RUNNER
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'profile' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: SHINOBI REGISTRATION
                    </span>
                    <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30 text-[10px] text-gray-300 text-center">
                      NINJA ID • HEADBAND TITLE • TOTAL STUDY HOURS • CHAKRA SCORE
                    </div>
                  </div>
                )}

                {currentStep.highlightCategory === 'settings' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider block">
                      ⚡ HIGHLIGHTED FEATURE: CUSTOMIZATION & PREFERENCES
                    </span>
                    <div className="p-2 rounded-xl bg-black/60 border border-orange-500/30 text-[10px] text-gray-300 text-center">
                      NAME • NICKNAME • DAILY TIME COMMITMENT • AUDIO EFFECTS
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* CONTROLS FOOTER */}
          <div className="p-4 sm:p-5 border-t border-orange-500/30 bg-black/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Step {currentStep.stepNum} of {ONBOARDING_STEPS.length}: {currentStep.sectionTitle}</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {!isFirstStep && (
                <button
                  onClick={handleBack}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-extrabold text-xs text-gray-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>BACK</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex-1 sm:flex-initial px-7 py-2.5 rounded-xl font-extrabold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_25px_rgba(255,107,0,0.5)] transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{isLastStep ? 'START MY TRAINING →' : 'NEXT →'}</span>
                {!isLastStep && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
