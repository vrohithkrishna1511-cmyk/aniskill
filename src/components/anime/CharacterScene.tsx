'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CharacterId, CharacterState } from '@/types/characterStateEngine';
import { CharacterRenderer } from './CharacterRenderer';
import { MouseParallaxContainer, ParallaxLayer } from './MouseParallax';
import { ChakraParticles } from './ChakraParticles';
import { EnergyRings } from './EnergyRings';

export type EnvironmentType = 'training-room' | 'hokage-monument' | 'night-forest' | 'battle-arena' | 'dojo';

interface CharacterSceneProps {
  environment?: EnvironmentType;
  characterId: CharacterId;
  characterState?: CharacterState;
  characterPosition?: 'left' | 'right' | 'center' | 'hero-full';
  characterSize?: 'sm' | 'md' | 'lg' | 'hero' | 'full';
  speechBubble?: {
    text: string;
    speakerName?: string;
    actionText?: string;
    onAction?: () => void;
  };
  children?: React.ReactNode;
  className?: string;
}

export const CharacterScene: React.FC<CharacterSceneProps> = ({
  environment = 'training-room',
  characterId,
  characterState = 'idle',
  characterPosition = 'left',
  characterSize = 'lg',
  speechBubble,
  children,
  className = '',
}) => {
  const bgPresets: Record<EnvironmentType, string> = {
    'training-room': 'bg-gradient-to-b from-[#090b10] via-[#111827] to-[#050608]',
    'hokage-monument': 'bg-gradient-to-b from-[#1e1b4b] via-[#311b92] to-[#09090b]',
    'night-forest': 'bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#020617]',
    'battle-arena': 'bg-gradient-to-b from-[#450a0a] via-[#7f1d1d] to-[#09090b]',
    dojo: 'bg-gradient-to-b from-[#292524] via-[#1c1917] to-[#0c0a09]',
  };

  const positionClasses = {
    left: 'lg:justify-start lg:pl-8',
    right: 'lg:justify-end lg:pr-8',
    center: 'justify-center',
    'hero-full': 'justify-center items-center',
  }[characterPosition];

  return (
    <MouseParallaxContainer
      className={`relative w-full min-h-[calc(100vh-4rem)] rounded-3xl border border-orange-500/30 shadow-2xl ${bgPresets[environment]} ${className}`}
    >
      {/* LAYER 1: DEEP ATMOSPHERE & LIGHT RAYS */}
      <ParallaxLayer factor={0.02} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/25 via-transparent to-transparent" />
      </ParallaxLayer>

      {/* LAYER 2: SOFT CHAKRA AURA WAVE */}
      <ParallaxLayer factor={0.04} className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent blur-3xl"
        />
      </ParallaxLayer>

      {/* LAYER 3: CANVAS CHAKRA PARTICLES */}
      <ChakraParticles particleCount={90} colorScheme="orange" interactive={true} />

      {/* LAYER 4: EXPANDING ENERGY PRESSURE RINGS */}
      <EnergyRings color="#FF6B00" />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-20 w-full h-full flex flex-col lg:flex-row items-center justify-between p-4 md:p-8 lg:p-12 gap-8">
        
        {/* LAYER 5 & 6: PARALLAX CHARACTER & SPEECH BUBBLE */}
        <ParallaxLayer factor={0.08} className={`w-full lg:w-1/2 flex items-center ${positionClasses}`}>
          <div className="relative flex flex-col items-center">
            {speechBubble && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-4 relative z-30 max-w-md w-full bg-[#111622]/95 backdrop-blur-2xl border border-orange-500/50 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.85)]"
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <h4 className="text-xs font-hud font-extrabold tracking-widest text-orange-400 uppercase">
                    {speechBubble.speakerName || characterId}
                  </h4>
                </div>
                <p className="text-base md:text-lg font-title text-amber-100 italic leading-relaxed">
                  "{speechBubble.text}"
                </p>
                {speechBubble.actionText && (
                  <button
                    onClick={speechBubble.onAction}
                    className="mt-4 text-xs font-hud text-amber-400 hover:text-amber-300 font-extrabold uppercase tracking-widest flex items-center space-x-1.5 group"
                  >
                    <span>{speechBubble.actionText}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                )}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#111622] border-r border-b border-orange-500/50 transform rotate-45" />
              </motion.div>
            )}

            {/* FULL-BODY LIVING CHARACTER */}
            <CharacterRenderer
              characterId={characterId}
              state={characterState}
              size={characterSize}
              showAura={true}
              interactive={true}
            />
          </div>
        </ParallaxLayer>

        {/* LAYER 7 & 8: GLASS HUD & FOREGROUND INTERACTIVES */}
        {children && (
          <ParallaxLayer factor={0.1} className="w-full lg:w-1/2 flex flex-col justify-center">
            {children}
          </ParallaxLayer>
        )}
      </div>

      {/* BOTTOM GLOW FRAME */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60 pointer-events-none" />
    </MouseParallaxContainer>
  );
};
