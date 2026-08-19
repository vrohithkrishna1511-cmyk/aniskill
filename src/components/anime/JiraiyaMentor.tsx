'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, AlertCircle, Award, Scroll, RefreshCw } from 'lucide-react';
import { JiraiyaMood } from '../../types';
import { JIRAIYA_DIALOGUES } from '../../data/mockData';
import { CharacterRenderer } from './CharacterRenderer';
import { CharacterState } from '@/types/characterStateEngine';

interface JiraiyaMentorProps {
  mood?: JiraiyaMood;
  customText?: string | null;
  onActionClick?: () => void;
  actionText?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  overrideImagePath?: string;
}

export const JiraiyaMentor: React.FC<JiraiyaMentorProps> = ({
  mood = 'WELCOME',
  customText,
  onActionClick,
  actionText,
  size = 'lg',
  overrideImagePath,
}) => {
  const [dialogueIndex, setDialogueIndex] = useState<number>(0);

  const dialogues = JIRAIYA_DIALOGUES[mood] || JIRAIYA_DIALOGUES.WELCOME;
  const currentText = customText || dialogues[dialogueIndex % dialogues.length];

  const handleNextQuote = () => {
    if (!customText) {
      setDialogueIndex((prev) => prev + 1);
    }
  };

  // Map mood to CharacterState for Jiraiya pose
  const moodToState: Record<JiraiyaMood, CharacterState> = {
    IDLE: 'idle',
    WELCOME: 'welcome',
    GUIDANCE: 'teaching',
    MISSION: 'mission',
    WARNING: 'warning',
    SUCCESS: 'success',
    COMEBACK: 'comeback',
  };

  const getMoodBadge = () => {
    switch (mood) {
      case 'SUCCESS':
        return { label: 'VICTORY PRAISE', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40', icon: Award };
      case 'MISSION':
        return { label: 'TACTICAL ADVICE', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40', icon: Scroll };
      case 'WARNING':
        return { label: 'DISCIPLINE NOTICE', color: 'text-red-400 border-red-500/40 bg-red-950/40', icon: AlertCircle };
      case 'COMEBACK':
        return { label: 'WARRIOR RETURN', color: 'text-purple-400 border-purple-500/40 bg-purple-950/40', icon: Sparkles };
      default:
        return { label: 'SAGE GUIDANCE', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40', icon: MessageSquare };
    }
  };

  const badge = getMoodBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="w-full relative p-6 md:p-8">
      {/* Background Watermark & Chakra Rays */}
      <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
        <Scroll className="w-48 h-48 text-orange-400" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* FULL-BODY JIRAIYA CHARACTER ARTWORK LAYER */}
        <div className="flex-shrink-0 flex items-center justify-center relative">
          <CharacterRenderer
            characterId="jiraiya"
            state={moodToState[mood] || 'idle'}
            size={size === 'hero' ? 'hero' : 'md'}
            showAura={true}
            overrideImagePath={overrideImagePath}
          />
        </div>

        {/* SPEECH & DIALOGUE SCROLL PANEL */}
        <div className="flex-1 w-full flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <h3 className="text-sm font-hud font-bold text-orange-400 uppercase tracking-widest">
                JIRAIYA SENSEI // TOAD SAGE
              </h3>
              <span className={`text-xs font-hud px-3 py-1 rounded-full border ${badge.color} flex items-center space-x-1.5`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                <span>{badge.label}</span>
              </span>
            </div>

            {!customText && dialogues.length > 1 && (
              <button
                onClick={handleNextQuote}
                className="text-xs font-hud text-gray-400 hover:text-orange-400 flex items-center space-x-1.5 transition-colors bg-zinc-900/60 px-3 py-1 rounded-lg border border-gray-800"
                title="Next Advice"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>NEXT SAGE ADVICE</span>
              </button>
            )}
          </div>

          {/* ANIME SCROLL SPEECH CONTAINER */}
          <div className="relative bg-black/45 backdrop-blur-sm border border-orange-500/35 rounded-2xl p-6 shadow-xl">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-black/45 border-l border-b border-orange-500/35 transform rotate-45 hidden lg:block" />

            <AnimatePresence mode="wait">
              <motion.p
                key={currentText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-base md:text-lg font-title text-amber-100 leading-relaxed italic"
              >
                "{currentText}"
              </motion.p>
            </AnimatePresence>

            {onActionClick && actionText && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={onActionClick}
                  className="px-6 py-2.5 rounded-xl text-xs font-hud font-extrabold text-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] transform hover:scale-105"
                >
                  {actionText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
