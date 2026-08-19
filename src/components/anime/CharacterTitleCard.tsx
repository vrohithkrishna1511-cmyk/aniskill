'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Flame, Award } from 'lucide-react';
import { NicknameType } from '@/types';
import { CharacterRenderer } from './CharacterRenderer';
import { CharacterId } from '@/types/characterStateEngine';

interface CharacterTitleCardProps {
  nickname: NicknameType;
  titleName?: string;
  description?: string;
  characterId?: CharacterId;
  glowColor?: string;
  className?: string;
}

export const CHARACTER_TITLE_DETAILS: Record<
  string,
  {
    characterId: CharacterId;
    title: string;
    description: string;
    glowColor: string;
    gradient: string;
  }
> = {
  'The Yellow Flash of the Leaf': {
    characterId: 'naruto',
    title: 'The Yellow Flash of the Leaf',
    description: 'Minato Namikaze • Unmatched speed and teleportation-like study efficiency. Clears topics with lightning precision.',
    glowColor: '#F59E0B',
    gradient: 'from-amber-500 via-yellow-400 to-orange-600',
  },
  'The Copy Ninja': {
    characterId: 'kakashi',
    title: 'The Copy Ninja',
    description: 'Kakashi Hatake • Master of 1,000 jutsu. Adapts effortlessly to any complex syllabus topic with laser focus.',
    glowColor: '#3B82F6',
    gradient: 'from-blue-600 via-indigo-600 to-slate-800',
  },
  'Itachi of the Sharingan': {
    characterId: 'sasuke',
    title: 'Itachi of the Sharingan',
    description: 'Itachi Uchiha • Genius intellect and calm discipline. Sees through the deepest algorithms with Sharingan clarity.',
    glowColor: '#EF4444',
    gradient: 'from-red-600 via-rose-700 to-red-950',
  },
  'Ghost of the Uchiha': {
    characterId: 'sasuke',
    title: 'Ghost of the Uchiha',
    description: 'Madara Uchiha • Formidable legendary warrior. Surmounted broken momentum and commands overwhelming mastery.',
    glowColor: '#8B5CF6',
    gradient: 'from-purple-600 via-indigo-600 to-red-900',
  },
  'The Noble Green Beast of Konoha': {
    characterId: 'naruto',
    title: 'The Noble Green Beast of Konoha',
    description: 'Might Guy • Pure dedication, hard work, and unyielding Taijutsu discipline that surpasses pure talent.',
    glowColor: '#10B981',
    gradient: 'from-emerald-600 via-green-600 to-teal-800',
  },
  'The Toad Sage': {
    characterId: 'jiraiya',
    title: 'The Toad Sage',
    description: 'Jiraiya • Master of Senjutsu and mentor of legends. Brings wisdom, endurance, and unbreakable spirit.',
    glowColor: '#F97316',
    gradient: 'from-orange-600 via-amber-600 to-red-800',
  },
  'God of Shinobi': {
    characterId: 'naruto',
    title: 'God of Shinobi',
    description: 'Hashirama Senju • Founded the academy ideals. Possesses limitless stamina and colossal knowledge reserves.',
    glowColor: '#14B8A6',
    gradient: 'from-teal-600 via-emerald-600 to-emerald-950',
  },
  'The Child of Prophecy': {
    characterId: 'naruto',
    title: 'The Child of Prophecy',
    description: 'Naruto Uzumaki • The Will of Fire personified. Never gives up, never goes back on their study nindo.',
    glowColor: '#FF6B00',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
  },
  'Gaara of the Sand': {
    characterId: 'naruto',
    title: 'Gaara of the Sand',
    description: 'Gaara • Unshakable defense and quiet determination. Protects their daily study streak at all costs.',
    glowColor: '#D97706',
    gradient: 'from-amber-600 via-yellow-700 to-orange-900',
  },
  'The Last Uchiha': {
    characterId: 'sasuke',
    title: 'The Last Uchiha',
    description: 'Sasuke Uchiha • Relentless pursuit of power and precision. Strikes down difficult coding challenges without hesitation.',
    glowColor: '#6366F1',
    gradient: 'from-indigo-600 via-violet-700 to-blue-900',
  },
};

export const CharacterTitleCard: React.FC<CharacterTitleCardProps> = ({
  nickname,
  className = '',
}) => {
  const details = CHARACTER_TITLE_DETAILS[nickname] || CHARACTER_TITLE_DETAILS['The Copy Ninja'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-r ${details.gradient} rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl overflow-hidden ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* CHARACTER ARTWORK */}
        <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center">
          <CharacterRenderer
            characterId={details.characterId}
            state="welcome"
            size="sm"
            showAura={true}
          />
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-xs font-hud font-bold text-white tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SHINOBI TITLE ASSIGNED</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold font-hud text-white tracking-wider">
            {details.title}
          </h3>

          <p className="text-xs md:text-sm font-body text-slate-100 max-w-lg leading-relaxed">
            {details.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
