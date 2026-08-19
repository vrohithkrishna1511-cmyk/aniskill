'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { CharacterRenderer } from './CharacterRenderer';
import { ChakraParticles } from './ChakraParticles';
import { EnergyRings } from './EnergyRings';
import { MouseParallaxContainer, ParallaxLayer } from './MouseParallax';

interface NineTailsEntryProps {
  onComplete: () => void;
  isReturningVisitor?: boolean;
}

export const NineTailsEntry: React.FC<NineTailsEntryProps> = ({
  onComplete,
  isReturningVisitor = false,
}) => {
  const [step, setStep] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isClickBursting, setIsClickBursting] = useState<boolean>(false);

  // Cinematic Sequence Timings:
  // Step 0: Pitch Black & Atmospheric Wind (0 - 1.8s)
  // Step 1: Atmospheric fog & Nine-Tails Creature Emergence (1.8s - 4.5s)
  // Step 2: Energy Surge & Kurama Awakening (4.5s - 7.5s)
  // Step 3: Protagonist Naruto Reveal + Letter-by-Letter ANISKILL Title + CTA (7.5s+)
  useEffect(() => {
    if (isReturningVisitor) {
      setStep(3);
      return;
    }

    const t1 = setTimeout(() => setStep(1), 1800);
    const t2 = setTimeout(() => setStep(2), 4500);
    const t3 = setTimeout(() => setStep(3), 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isReturningVisitor]);

  const handleEnterJourney = () => {
    setIsClickBursting(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const titleLetters = 'ANISKILL'.split('');

  return (
    <div className="fixed inset-0 z-50 bg-[#030406] flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* 8-LAYER KURAMA DEPTH ATMOSPHERE & PARALLAX */}
      <MouseParallaxContainer className="absolute inset-0 w-full h-full">
        {/* Layer 1: Atmospheric Radial Fog */}
        <ParallaxLayer factor={0.02} className="absolute inset-0">
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              step >= 1 ? 'opacity-100' : 'opacity-0'
            } bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/50 via-[#030406]/95 to-[#030406] pointer-events-none`}
          />
        </ParallaxLayer>

        {/* Layer 2: Canvas Chakra Particles Engine */}
        {step >= 1 && <ChakraParticles particleCount={120} colorScheme="red" interactive={true} />}

        {/* Layer 3: Expanding Energy Rings */}
        {step >= 2 && <EnergyRings color="#FF2E54" />}

        {/* Layer 4: Nine-Tails Full-Viewport Creature Reveal */}
        <AnimatePresence>
          {step >= 1 && (
            <ParallaxLayer factor={0.06} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: step >= 2 ? 1.05 : 0.95, opacity: 1 }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
                className="relative w-[90vw] max-w-4xl h-[75vh] flex items-center justify-center"
              >
                <CharacterRenderer
                  characterId="nine-tails"
                  state={step >= 2 ? 'awakening' : 'idle'}
                  size="full"
                  showAura={true}
                />
              </motion.div>
            </ParallaxLayer>
          )}
        </AnimatePresence>

        {/* Layer 5: Click Energy Burst Overlay */}
        <AnimatePresence>
          {isClickBursting && (
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 blur-2xl z-40 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Layer 6: Protagonist Naruto Reveal + Title + CTA */}
        {step >= 3 && (
          <ParallaxLayer factor={0.1} className="relative z-30 flex flex-col items-center justify-center text-center px-4 max-w-3xl my-auto h-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col items-center justify-center"
            >
              {/* Protagonist Naruto Avatar */}
              <div className="w-36 h-36 mb-2">
                <CharacterRenderer characterId="naruto" state="welcome" size="sm" showAura={false} />
              </div>

              {/* Letter-by-Letter Staggered ANISKILL Title Reveal */}
              <div className="flex items-center space-x-2 mb-3">
                <Flame className="w-10 h-10 text-orange-500 animate-bounce" />
                <div className="flex space-x-1.5 text-5xl md:text-7xl font-extrabold font-hud tracking-[0.2em]">
                  {titleLetters.map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-amber-300 drop-shadow-[0_10px_30px_rgba(255,107,0,0.8)]"
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Animated Line-by-Line Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-base md:text-xl font-title text-gray-200 tracking-wider mb-8 max-w-xl italic"
              >
                "THE WILL OF FIRE LIVES IN YOUR CONSISTENCY.<br />
                <span className="text-orange-400 font-bold glow-orange-text not-italic">
                  TRAIN DAILY. ASCEND TO HOKAGE.
                </span>"
              </motion.p>

              {/* Interactive CTA Button with Breathing & Sweep Glow */}
              <motion.button
                onClick={handleEnterJourney}
                whileHover={{ scale: 1.06, boxShadow: '0 0 45px rgba(255,107,0,0.9)' }}
                whileTap={{ scale: 0.95 }}
                className="relative px-10 py-5 rounded-2xl font-hud font-extrabold text-base tracking-widest text-black bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 shadow-[0_0_35px_rgba(255,107,0,0.7)] flex items-center space-x-4 cursor-pointer overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                <Play className="w-6 h-6 fill-current text-black" />
                <span>ENTER YOUR JOURNEY</span>
              </motion.button>
            </motion.div>
          </ParallaxLayer>
        )}
      </MouseParallaxContainer>

      {/* TOP CONTROL HUD */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3 text-xs font-hud text-gray-400 tracking-widest uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-red-500 font-bold">ANISKILL // PROLOGUE: NINE-TAILS AWAKENING</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2.5 rounded-xl bg-zinc-950/80 border border-red-500/30 text-gray-400 hover:text-red-400 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-600" />}
          </button>
          <button
            onClick={onComplete}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-900/60 to-orange-900/60 border border-orange-500/50 text-xs font-hud text-orange-400 hover:text-orange-300 font-bold tracking-widest uppercase transition-all transform hover:scale-105"
          >
            <span>SKIP INTRO</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="absolute bottom-6 text-center text-xs font-hud text-gray-600 tracking-widest z-50">
        ANIME SYLLABUS SYSTEM // NINJA WAY ENGINE
      </div>
    </div>
  );
};
