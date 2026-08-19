'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scan, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProofVerificationResult } from '../../types';
import { CharacterRenderer } from '../anime/CharacterRenderer';

interface VerificationStatusProps {
  onDone: () => void;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ onDone }) => {
  const { verifyMission } = useApp();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [result, setResult] = useState<ProofVerificationResult | null>(null);

  const verificationSteps = [
    'RECEIVING PROOF SCREENSHOTS...',
    'SCANNING LEARNING PORTAL DOM STRUCTURE...',
    'READING COMPLETION TIMESTAMPS & QUIZ SCORES...',
    'MATCHING TODAY\'S ASSIGNED SYLLABUS TOPICS...',
    'FINALIZING VERIFICATION RESULT...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < verificationSteps.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stepIndex === verificationSteps.length - 1 && !result) {
      verifyMission().then((res) => setResult(res));
    }
  }, [stepIndex, result, verifyMission]);

  return (
    <div className="w-full bg-gradient-to-b from-[#090e18] via-[#121929] to-[#05070e] rounded-3xl p-6 md:p-10 border border-orange-500/40 shadow-[0_0_60px_rgba(255,107,0,0.25)] relative overflow-hidden space-y-6">
      
      {/* SCANNING STATE WITH JIRAIYA */}
      {!result ? (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-6">
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <CharacterRenderer characterId="jiraiya" state="teaching" size="md" showAura={true} />
          </div>

          <div className="w-full lg:w-2/3 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
              <Scan className="w-12 h-12 text-orange-400 animate-pulse glow-orange-text" />
            </div>

            <div className="space-y-2 text-center">
              <span className="text-xs font-hud font-bold text-orange-400 tracking-widest uppercase">
                JIRAIYA IS EVALUATING YOUR PROOF...
              </span>
              <h3 className="text-xl md:text-2xl font-hud font-bold text-white tracking-widest glow-orange-text">
                {verificationSteps[stepIndex]}
              </h3>
            </div>
          </div>
        </div>
      ) : result.verified ? (
        /* MISSION COMPLETE VICTORY CINEMATIC */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8 py-6"
        >
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <CharacterRenderer characterId="jiraiya" state="success" size="md" showAura={true} />
          </div>

          <div className="w-full lg:w-2/3 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <Award className="w-12 h-12 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-hud text-emerald-400 font-bold uppercase tracking-widest">
                VERIFICATION CONFIDENCE: {result.confidenceScore}%
              </span>
              <h2 className="text-4xl font-extrabold font-hud text-white tracking-widest mt-1">
                MISSION COMPLETE!
              </h2>
              <p className="text-sm font-title text-amber-100 italic max-w-md mx-auto mt-2">
                "{result.message}"
              </p>
            </div>

            <div className="bg-black/60 p-5 rounded-2xl border border-emerald-500/30 w-full max-w-md grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-hud font-extrabold text-emerald-400">+1.0</div>
                <div className="text-[10px] font-hud text-gray-400 uppercase">NINJA STREAK GAIN</div>
              </div>
              <div>
                <div className="text-3xl font-hud font-extrabold text-amber-400">+100 XP</div>
                <div className="text-[10px] font-hud text-gray-400 uppercase">CHAKRA ASCENSION</div>
              </div>
            </div>

            <button
              onClick={onDone}
              className="px-10 py-4 rounded-2xl font-hud font-extrabold text-sm text-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center space-x-3 transform hover:scale-105"
            >
              <span>CLAIM REWARDS & RETURN TO BASE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ) : (
        /* FAILURE STATE */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-6 py-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold font-hud text-red-400 tracking-wide">
              VERIFICATION FAILED
            </h2>
            <p className="text-xs font-body text-slate-300 max-w-md mx-auto mt-2">
              {result.message}
            </p>
          </div>

          <button
            onClick={onDone}
            className="px-8 py-3.5 rounded-xl font-hud font-bold text-xs text-white bg-zinc-800 hover:bg-zinc-700 transition-all"
          >
            RE-UPLOAD PROOF SCREENSHOTS
          </button>
        </motion.div>
      )}
    </div>
  );
};
