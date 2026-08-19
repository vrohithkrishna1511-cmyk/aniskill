'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterId, CharacterState, CHARACTER_REGISTRY } from '@/types/characterStateEngine';
import { EnergyRings } from './EnergyRings';

interface CharacterRendererProps {
  characterId: CharacterId;
  state?: CharacterState;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'full';
  showAura?: boolean;
  interactive?: boolean;
  overrideImagePath?: string;
  onClick?: () => void;
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  characterId,
  state = 'idle',
  className = '',
  size = 'lg',
  showAura = true,
  interactive = true,
  overrideImagePath,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageErrorCount, setImageErrorCount] = useState(0);

  const config = CHARACTER_REGISTRY[characterId] || CHARACTER_REGISTRY.naruto;

  const sizeClasses = {
    sm: 'h-48 w-36',
    md: 'h-72 w-56',
    lg: 'h-[440px] w-[340px]',
    hero: 'h-[560px] w-[460px]',
    full: 'h-[80vh] w-[90vw] max-w-4xl',
  }[size];

  // Primary character artwork resolution: config state path / fullBodyPath / state fallback
  const candidatePaths = [
    overrideImagePath,
    config.stateImagePaths?.[state],
    config.fullBodyPath,
    `/characters/${characterId}/hero.webp`,
    `/characters/${characterId}/hero.png`,
    `/characters/${characterId}/hero.jpg`,
    `/characters/${characterId}/${state}.webp`,
    `/characters/${characterId}/${state}.png`,
    `/characters/${characterId}/${state}.jpg`,
  ].filter(Boolean) as string[];

  const currentImagePath = candidatePaths[imageErrorCount % candidatePaths.length] || config.fullBodyPath;

  const handleImageError = () => {
    if (imageErrorCount < candidatePaths.length - 1) {
      setImageErrorCount((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{
        opacity: 1,
        scale: isHovered ? 1.04 : 1,
        y: [0, -7, 0],
      }}
      transition={{
        opacity: { duration: 0.6 },
        scale: { duration: 0.4 },
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
      className={`relative flex items-end justify-center select-none ${sizeClasses} ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* 1. LAYERED NINE-TAILS AWAKENING BACKDROP (when Naruto is in awakening state) */}
      {characterId === 'naruto' && state === 'awakening' && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.75, 0.95, 0.75] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-85"
        >
          <img
            src="/characters/nine-tails/hero.jpg"
            alt="Nine-Tails Spirit"
            className="w-full h-full object-contain filter drop-shadow-[0_0_60px_rgba(255,46,84,0.9)]"
          />
        </motion.div>
      )}

      {/* 2. EXPANDING CHAKRA PRESSURE RINGS */}
      {showAura && isHovered && <EnergyRings color={config.glowColor} />}

      {/* 3. DUAL-LAYER CHARACTER SPECIFIC CHAKRA AURA GLOW */}
      {showAura && (
        <motion.div
          animate={{
            scale: isHovered ? [1.1, 1.25, 1.1] : [1, 1.12, 1],
            opacity: isHovered ? [0.65, 0.95, 0.65] : [0.4, 0.65, 0.4],
          }}
          transition={{ duration: isHovered ? 1.8 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-500 z-0"
          style={{
            background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* 4. REAL FULL-BODY CHARACTER IMAGE ARTWORK LAYER */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-end overflow-hidden">
        <img
          src={currentImagePath}
          alt={`${config.name} (${state})`}
          onError={handleImageError}
          className="w-full h-full object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* 5. FOREGROUND CHAKRA EMBERS / GROUND GLOW */}
      {showAura && (
        <motion.div
          animate={{
            y: [-3, 3, -3],
            opacity: isHovered ? [0.75, 1, 0.75] : [0.4, 0.75, 0.4],
            scaleX: isHovered ? [1, 1.15, 1] : [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-4 z-20 w-3/4 h-8 blur-md pointer-events-none rounded-full"
          style={{ background: config.glowColor }}
        />
      )}
    </motion.div>
  );
};
