'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IbukiInstructorProps {
  isSpeaking: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IbukiInstructor: React.FC<IbukiInstructorProps> = ({
  isSpeaking,
  className = '',
  size = 'lg'
}) => {
  const [blink, setBlink] = useState(false);
  const [mouthState, setMouthState] = useState(0); // 0: Closed, 1: Slightly Open, 2: Open, 3: Wide

  // Blinking loop (every 3.5 seconds, blink for 150ms)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3500);

    return () => clearInterval(blinkInterval);
  }, []);

  // Speaking mouth cycle
  useEffect(() => {
    let speakInterval: NodeJS.Timeout;
    if (isSpeaking) {
      speakInterval = setInterval(() => {
        // Natural speech variation: mostly open states, occasionally closed
        const states = [0, 1, 2, 3, 2, 1, 3];
        const nextState = states[Math.floor(Math.random() * states.length)];
        setMouthState(nextState);
      }, 120);
    } else {
      setMouthState(0);
    }

    return () => clearInterval(speakInterval);
  }, [isSpeaking]);

  const sizeClasses = {
    sm: 'h-64 w-48',
    md: 'h-96 w-72',
    lg: 'h-[440px] w-[340px]',
  }[size];

  return (
    <div className={`relative select-none flex items-end justify-center overflow-hidden ${sizeClasses} ${className}`}>
      {/* Subtle Breathing Animation */}
      <motion.div
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.004, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Base Ibuki Image */}
        <img
          src="/characters/ibuki/hero.png"
          alt="Ibuki Morino"
          className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        />

        {/* 1. Blinking Eyelids Overlay */}
        {blink && (
          <>
            {/* Left Eyelid */}
            <div 
              className="absolute bg-[#c79275] border-t border-b border-black/40 rounded-full pointer-events-none"
              style={{
                top: '17.4%',
                left: '45.1%',
                width: '3.6%',
                height: '1.2%',
                zIndex: 20
              }}
            />
            {/* Right Eyelid */}
            <div 
              className="absolute bg-[#c79275] border-t border-b border-black/40 rounded-full pointer-events-none"
              style={{
                top: '17.4%',
                left: '51.3%',
                width: '3.6%',
                height: '1.2%',
                zIndex: 20
              }}
            />
          </>
        )}

        {/* 2. Speaking Mouth Overlay */}
        {mouthState > 0 && (
          <div 
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              top: '20.6%',
              left: '48.4%',
              width: '3.2%',
              height: '1.6%',
              zIndex: 10
            }}
          >
            {/* Mouth Interior shape based on mouthState */}
            <div 
              className="bg-[#291313] border border-[#a27157] rounded-full transition-all duration-75"
              style={{
                width: mouthState === 1 ? '70%' : '100%',
                height: mouthState === 1 ? '40%' : mouthState === 2 ? '75%' : '100%',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)'
              }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
