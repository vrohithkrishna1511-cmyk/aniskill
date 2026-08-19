'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Scroll,
  CheckCircle2,
  Flame,
  Zap,
  Target,
  BookOpen,
  Trophy,
  Users,
  Swords,
  Award,
  UserCheck,
  Settings,
  HelpCircle,
  Play
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSession } from 'next-auth/react';

export interface GuideStepConfig {
  id: string;
  stepNum: number;
  expectedPath?: string;
  title: string;
  badge: string;
  dialogue: string[];
  actionPrompt: string;
  targetSelector?: string;
  fallbackTarget?: string;
  allowManualNext?: boolean;
}

export const GUIDE_STEPS: GuideStepConfig[] = [
  // STEP 1: DASHBOARD
  {
    id: 'dashboard-intro',
    stepNum: 1,
    expectedPath: '/dashboard',
    title: 'DASHBOARD COMMAND CENTER',
    badge: 'STEP 1 / 14 • DASHBOARD',
    dialogue: [
      "Welcome to ANISKILL, Shinobi.",
      "This is your Dashboard — your main command center.",
      "Here you'll see your rank, streak, progress, and important information about your learning journey.",
      "Think of this as your Shinobi headquarters."
    ],
    actionPrompt: "Now look over to the left navigation. Click Syllabus to begin building your curriculum.",
    targetSelector: '[data-tour="nav-syllabus"]',
    fallbackTarget: '[data-tour="nav-scroll-trigger"]',
    allowManualNext: true
  },

  // STEP 2: SYLLABUS FORGE
  {
    id: 'syllabus-forge',
    stepNum: 2,
    expectedPath: '/syllabus',
    title: 'SYLLABUS FORGE',
    badge: 'STEP 2 / 14 • SYLLABUS',
    dialogue: [
      "Perfect. Now you're inside the Syllabus Forge.",
      "This is where YOU create the curriculum you want to master.",
      "First, let's create your study subject."
    ],
    actionPrompt: "Click the '+ ADD SUBJECT' button at the top right to start.",
    targetSelector: '[data-tour="add-subject-btn"]',
    allowManualNext: true
  },

  // STEP 3: CREATE SUBJECT INPUT
  {
    id: 'create-subject-modal',
    stepNum: 3,
    expectedPath: '/syllabus',
    title: 'GIVE YOUR SUBJECT A NAME',
    badge: 'STEP 3 / 14 • SUBJECT CREATION',
    dialogue: [
      "Give your subject the exact name you want to study.",
      "For example: Python, JavaScript, Data Structures, or SQL.",
      "Use the name you want to see throughout your training."
    ],
    actionPrompt: "Type your subject name in the input box, then click 'CREATE SUBJECT'.",
    targetSelector: '[data-tour="subject-name-input"]',
    allowManualNext: true
  },

  // STEP 4: CHOOSE INPUT METHOD
  {
    id: 'choose-input-method',
    stepNum: 4,
    expectedPath: '/syllabus',
    title: 'CHOOSE TOPIC ENTRY METHOD',
    badge: 'STEP 4 / 14 • TOPIC METHOD',
    dialogue: [
      "Good. Now we need to add the topics inside your subject.",
      "If you already have your syllabus text, choose 'ENTER MANUALLY'.",
      "If your syllabus is an image or photo, choose 'VIA SCREENSHOT'."
    ],
    actionPrompt: "Click '[ ENTER MANUALLY ]' or '[ VIA SCREENSHOT ]' to continue.",
    targetSelector: '[data-tour="manual-entry-btn"]',
    fallbackTarget: '[data-tour="screenshot-import-btn"]',
    allowManualNext: true
  },

  // STEP 5: SMART PASTE MANUAL ENTRY
  {
    id: 'manual-paste-entry',
    stepNum: 5,
    expectedPath: '/syllabus',
    title: 'PASTE YOUR SYLLABUS',
    badge: 'STEP 5 / 14 • SMART PASTE',
    dialogue: [
      "Paste your syllabus here.",
      "You don't need to create Topic 1, Topic 2 manually.",
      "Paste your complete syllabus text or point-wise list. ANISKILL will automatically analyze units, extract topics, and assign practice difficulty."
    ],
    actionPrompt: "Paste your syllabus text into the box and click 'ANALYZE SYLLABUS'.",
    targetSelector: '[data-tour="syllabus-textarea"]',
    fallbackTarget: '[data-tour="analyze-syllabus-btn"]',
    allowManualNext: true
  },

  // STEP 6: REVIEW & SAVE SYLLABUS
  {
    id: 'review-and-save',
    stepNum: 6,
    expectedPath: '/syllabus',
    title: 'REVIEW & SAVE CURRICULUM',
    badge: 'STEP 6 / 14 • TOPICS REVIEW',
    dialogue: [
      "Excellent! ANISKILL has parsed your syllabus into structured training topics.",
      "Review the extracted topics and practice difficulty levels.",
      "When ready, save your syllabus."
    ],
    actionPrompt: "Click 'SAVE SYLLABUS' to finalize your training curriculum.",
    targetSelector: '[data-tour="save-syllabus-btn"]',
    allowManualNext: true
  },

  // STEP 7: NAVIGATE TO TRAINING
  {
    id: 'navigate-to-training',
    stepNum: 7,
    expectedPath: '/syllabus',
    title: 'READY FOR TRAINING',
    badge: 'STEP 7 / 14 • PATHWAY COMPLETE',
    dialogue: [
      "Your curriculum is ready.",
      "Now let's enter the Training Ground where your actual practice begins."
    ],
    actionPrompt: "Look at the left navigation panel. Click Training.",
    targetSelector: '[data-tour="nav-training"]',
    fallbackTarget: '[data-tour="nav-scroll-trigger"]',
    allowManualNext: true
  },

  // STEP 8: TRAINING GROUND
  {
    id: 'training-ground',
    stepNum: 8,
    expectedPath: '/training',
    title: 'SHINOBI TRAINING GROUND',
    badge: 'STEP 8 / 14 • TRAINING',
    dialogue: [
      "Welcome to the Training Ground.",
      "These subjects come directly from the syllabus you created.",
      "Choose a subject, select your topics, and launch your focus timer session."
    ],
    actionPrompt: "Now let's see how your training affects your rank. Click 'Progress & Rank' in the navigation.",
    targetSelector: '[data-tour="nav-progress"]',
    fallbackTarget: '[data-tour="nav-scroll-trigger"]',
    allowManualNext: true
  },

  // STEP 9: PROGRESS & RANK
  {
    id: 'progress-and-rank',
    stepNum: 9,
    expectedPath: '/progress',
    title: 'PROGRESS & RANK ASCENSION',
    badge: 'STEP 9 / 14 • PROGRESS',
    dialogue: [
      "This is where you see how far your Shinobi journey has taken you.",
      "Your rank reflects your progress and consistency.",
      "Keep training, maintain your streak, and earn chakra points to rise through the Shinobi ranks from Academy Student to Hokage."
    ],
    actionPrompt: "Next, let's meet your squad. Click 'Shinobi Study Squad' in the navigation.",
    targetSelector: '[data-tour="nav-squad"]',
    fallbackTarget: '[data-tour="nav-scroll-trigger"]',
    allowManualNext: true
  },

  // STEP 10: SHINOBI STUDY SQUAD
  {
    id: 'study-squad',
    stepNum: 10,
    expectedPath: '/squad',
    title: 'SHINOBI STUDY SQUAD',
    badge: 'STEP 10 / 14 • SQUAD',
    dialogue: [
      "Here in Shinobi Studies, you can choose your Shinobi identity and build your study squad.",
      "Join or create a team using your squad code to study together and push each other toward mastery."
    ],
    actionPrompt: "Now open Rivalry Arena. Click 'Rivalry Arena' in the navigation.",
    targetSelector: '[data-tour="nav-rivalry"]',
    fallbackTarget: '[data-tour="nav-scroll-trigger"]',
    allowManualNext: true
  },

  // STEP 11: RIVALRY ARENA
  {
    id: 'rivalry-arena',
    stepNum: 11,
    expectedPath: '/rivalry',
    title: 'FRIEND RIVALRY ARENA',
    badge: 'STEP 11 / 14 • RIVALRY',
    dialogue: [
      "Think you can outperform another Shinobi?",
      "Rivalry lets you compete with other students by comparing your training performance and timings.",
      "If your rival is absent, the challenge doesn't stop. You can challenge their best recorded timing and try to beat their ghost record."
    ],
    actionPrompt: "Now let's check your accomplishments. Click 'Achievements' in the navigation.",
    targetSelector: '[data-tour="nav-achievements"]',
    fallbackTarget: '[data-tour="nav-scroll-trigger"]',
    allowManualNext: true
  },

  // STEP 12: ACHIEVEMENTS
  {
    id: 'achievements-milestones',
    stepNum: 12,
    expectedPath: '/achievements',
    title: 'SHINOBI ACHIEVEMENTS',
    badge: 'STEP 12 / 14 • ACHIEVEMENTS',
    dialogue: [
      "These are your Shinobi achievements.",
      "Here you can see what accomplishments you've already unlocked and what challenges remain.",
      "Earn milestone medals as your streak grows and your syllabus expands."
    ],
    actionPrompt: "Next, let's look at your Ninja Profile. Click 'Ninja Profile' in the navigation.",
    targetSelector: '[data-tour="nav-profile"]',
    fallbackTarget: '[data-tour="nav-scroll-trigger"]',
    allowManualNext: true
  },

  // STEP 13: NINJA PROFILE
  {
    id: 'ninja-profile',
    stepNum: 13,
    expectedPath: '/profile',
    title: 'NINJA PROFILE & REGISTRATION',
    badge: 'STEP 13 / 14 • PROFILE',
    dialogue: [
      "This is your Shinobi identity.",
      "Your rank, title, nickname, streak, progress, achievements and other personal learning information are collected here."
    ],
    actionPrompt: "Finally, let's check your Settings. Click 'Settings' in the navigation.",
    targetSelector: '[data-tour="nav-settings"]',
    fallbackTarget: '[data-tour="nav-scroll-trigger"]',
    allowManualNext: true
  },

  // STEP 14: SETTINGS & GRADUATION
  {
    id: 'settings-graduation',
    stepNum: 14,
    expectedPath: '/settings',
    title: 'ACADEMY GRADUATION',
    badge: 'STEP 14 / 14 • GRADUATION',
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
    ],
    actionPrompt: "Click 'START MY TRAINING' to complete your orientation and enter the training ground!",
    allowManualNext: true
  }
];

export const LiveKakashiGuide: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { showGuideAcademy, openGuideAcademy, closeGuideAcademy, syllabus } = useApp();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // SMART STEP ROUTE AUTO-ADAPTATION
  useEffect(() => {
    if (!showGuideAcademy) return;

    if (pathname === '/dashboard') {
      if (currentStepIndex > 1 && currentStepIndex < 13) {
        // user navigated back to dashboard
      } else if (currentStepIndex === 0) {
        // stay on step 1
      }
    } else if (pathname === '/syllabus') {
      if (currentStepIndex < 1 || currentStepIndex > 6) {
        setCurrentStepIndex(1); // Step 2 (Syllabus Forge)
      }
    } else if (pathname === '/training' || pathname.startsWith('/training')) {
      if (currentStepIndex < 7) {
        setCurrentStepIndex(7); // Step 8 (Training)
      }
    } else if (pathname === '/progress') {
      setCurrentStepIndex(8); // Step 9 (Progress)
    } else if (pathname === '/squad') {
      setCurrentStepIndex(9); // Step 10 (Squad)
    } else if (pathname === '/rivalry') {
      setCurrentStepIndex(10); // Step 11 (Rivalry)
    } else if (pathname === '/achievements') {
      setCurrentStepIndex(11); // Step 12 (Achievements)
    } else if (pathname === '/profile') {
      setCurrentStepIndex(12); // Step 13 (Profile)
    } else if (pathname === '/settings') {
      setCurrentStepIndex(13); // Step 14 (Settings & Graduation)
    }
  }, [pathname, showGuideAcademy, currentStepIndex]);

  const currentStep = GUIDE_STEPS[currentStepIndex] || GUIDE_STEPS[0];
  const isLastStep = currentStepIndex === GUIDE_STEPS.length - 1;

  // DOM ELEMENT HIGHLIGHT TRACKING ENGINE
  useEffect(() => {
    if (!showGuideAcademy) {
      setTargetRect(null);
      return;
    }

    const updateTargetPosition = () => {
      let el: HTMLElement | null = null;

      if (currentStep.targetSelector) {
        el = document.querySelector(currentStep.targetSelector) as HTMLElement;
      }
      if (!el && currentStep.fallbackTarget) {
        el = document.querySelector(currentStep.fallbackTarget) as HTMLElement;
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
          return;
        }
      }

      setTargetRect(null);
    };

    updateTargetPosition();
    const interval = setInterval(updateTargetPosition, 400);
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
    };
  }, [currentStepIndex, currentStep, showGuideAcademy, pathname]);

  // SMART ACTION AUTO-ADVANCE FOR MODALS & FORMS
  useEffect(() => {
    if (!showGuideAcademy) return;

    // Detect if Add Subject modal opened on syllabus page
    const checkModalState = () => {
      if (pathname === '/syllabus') {
        const subjectInput = document.querySelector('[data-tour="subject-name-input"]');
        const manualBtn = document.querySelector('[data-tour="manual-entry-btn"]');
        const textarea = document.querySelector('[data-tour="syllabus-textarea"]');
        const saveBtn = document.querySelector('[data-tour="save-syllabus-btn"]');

        if (saveBtn && currentStepIndex < 5) {
          setCurrentStepIndex(5); // Step 6: Review & Save
        } else if (textarea && currentStepIndex < 4) {
          setCurrentStepIndex(4); // Step 5: Manual Paste Entry
        } else if (manualBtn && currentStepIndex < 3) {
          setCurrentStepIndex(3); // Step 4: Choose Method
        } else if (subjectInput && currentStepIndex === 1) {
          setCurrentStepIndex(2); // Step 3: Create Subject Input
        }
      }
    };

    const interval = setInterval(checkModalState, 500);
    return () => clearInterval(interval);
  }, [pathname, showGuideAcademy, currentStepIndex]);

  const isAuthRoute = !pathname || pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname.startsWith('/api');
  if (authStatus !== 'authenticated' || isAuthRoute || !showGuideAcademy) return null;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => Math.min(prev + 1, GUIDE_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasCompletedKakashiGuide', 'true');
    }
    closeGuideAcademy();
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none font-hud select-none">
      
      {/* 1. INTERACTIVE SPOTLIGHT HIGHLIGHTER OVER TARGET ELEMENT */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          className="pointer-events-none z-50 rounded-2xl border-2 border-orange-500 shadow-[0_0_30px_#FF6B00] animate-pulse"
        >
          {/* DIRECTIONAL POINTER ARROW */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-orange-500 text-black px-3 py-1 rounded-full text-[10px] font-extrabold shadow-lg flex items-center space-x-1 whitespace-nowrap">
            <span>👇 CLICK HERE</span>
          </div>
        </motion.div>
      )}

      {/* 2. FLOATING KAKASHI MENTOR DOCK (BOTTOM RIGHT) */}
      <motion.div
        drag
        dragConstraints={{ left: -300, right: 300, top: -300, bottom: 100 }}
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 pointer-events-auto z-50 max-w-lg w-[calc(100vw-32px)] sm:w-[480px]"
      >
        <div className="relative rounded-3xl bg-gradient-to-b from-[#160d09] via-[#0d0604] to-[#080302] border-2 border-orange-500/80 shadow-[0_0_50px_rgba(255,107,0,0.4)] overflow-hidden p-4 sm:p-5 space-y-3">
          
          {/* SCANLINE OVERLAY */}
          <div className="absolute inset-0 hud-scanline opacity-10 pointer-events-none" />

          {/* TOP BAR: BADGE, STEP COUNTER & SKIP */}
          <div className="flex items-center justify-between border-b border-orange-500/30 pb-2 relative z-10">
            <div className="flex items-center space-x-2">
              <Scroll className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-[10px] font-extrabold text-orange-300 tracking-wider uppercase">
                {currentStep.badge}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleComplete}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-gray-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer flex items-center space-x-1"
                title="Skip Onboarding Guide"
              >
                <span>SKIP</span>
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* MAIN MENTOR BODY: KAKASHI STICKER + SPEECH PANEL */}
          <div className="grid grid-cols-12 gap-3 items-center relative z-10">
            
            {/* KAKASHI STICKER (LEFT) */}
            <div className="col-span-4 flex flex-col items-center justify-center relative">
              <div className="absolute w-28 h-28 rounded-full bg-orange-600/20 blur-xl pointer-events-none animate-pulse" />
              <div className="w-24 sm:w-28 h-auto filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
                <img
                  src="/images/kakashi_guide_academy.png"
                  alt="Kakashi Hatake Academy Mentor"
                  className="w-full h-auto object-contain pointer-events-none"
                />
              </div>
              <span className="text-[8px] font-extrabold text-amber-300 tracking-wider bg-black/80 px-2 py-0.5 rounded-full border border-orange-500/40 uppercase mt-1 text-center whitespace-nowrap">
                KAKASHI HATAKE
              </span>
            </div>

            {/* SPEECH BUBBLE & ACTION PROMPT (RIGHT) */}
            <div className="col-span-8 space-y-2 text-left">
              <div className="p-3 rounded-2xl bg-black/70 border border-orange-500/40 text-xs space-y-1.5 shadow-inner">
                {currentStep.dialogue.map((line, lIdx) => (
                  <p
                    key={lIdx}
                    className={`font-title leading-relaxed ${
                      line.startsWith('•') || line.startsWith('Welcome') || line.startsWith('Perfect') || line.startsWith('Alright')
                        ? 'text-orange-300 font-bold'
                        : 'text-amber-100'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* ACTION PROMPT BADGE */}
              <div className="p-2 rounded-xl bg-orange-950/80 border border-orange-500/50 flex items-start space-x-2 text-[10px] text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5 animate-spin" />
                <span className="font-extrabold text-white leading-tight">
                  {currentStep.actionPrompt}
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="flex items-center justify-between pt-2 border-t border-orange-500/20 relative z-10">
            <span className="text-[9px] text-gray-500">
              Drag panel to reposition anywhere
            </span>

            <div className="flex items-center space-x-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-gray-300 hover:text-white transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>BACK</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-xl font-extrabold text-[10px] text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_15px_rgba(255,107,0,0.4)] flex items-center space-x-1 cursor-pointer transform hover:scale-105"
              >
                <span>{isLastStep ? 'START MY TRAINING →' : 'NEXT →'}</span>
                {!isLastStep && <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>

        </div>
      </motion.div>

    </div>
  );
};
