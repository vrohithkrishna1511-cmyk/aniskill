'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle2, Cpu, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SyllabusAnalyzerProps {
  imageUrls: string[];
  onConfirm: () => void;
}

export const SyllabusAnalyzer: React.FC<SyllabusAnalyzerProps> = ({ imageUrls, onConfirm }) => {
  const { syllabus } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    'UPLOADING MULTIPLE SCREENSHOTS...',
    'READING SYLLABUS TEXT VIA CHAKRA OCR...',
    'IDENTIFYING CORE SUBJECTS & DOMAINS...',
    'EXTRACTING INDIVIDUAL TOPICS & ESTIMATED HOURS...',
    'ORGANIZING PERSONALIZED TRAINING PATH...',
    'ANALYSIS COMPLETE!'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  const isComplete = currentStep === steps.length - 1;

  return (
    <div className="w-full glass-panel-orange rounded-3xl p-6 md:p-10 border border-orange-500/40 shadow-[0_0_50px_rgba(255,107,0,0.2)] text-center relative overflow-hidden space-y-6">
      {!isComplete ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-6">
          {/* Animated Chakra Scanner Ring */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-cyan-500/30 border-b-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
            <Scan className="w-12 h-12 text-orange-400 animate-pulse glow-orange-text" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-hud font-bold text-orange-400 tracking-widest glow-orange-text">
              {steps[currentStep]}
            </h3>
            <p className="text-xs font-hud text-gray-400">
              SCANNING {imageUrls.length} SYLLABUS SCREENSHOTS
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center space-x-2 max-w-md w-full justify-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= currentStep ? 'bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_8px_#FF6B00]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-left"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-hud">
              <CheckCircle2 className="w-4 h-4" />
              <span>ANALYSIS COMPLETE</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold font-hud tracking-wider text-white">
              WE FOUND YOUR TRAINING PATH.
            </h2>
            <p className="text-xs font-body text-gray-300">
              Extracted from your uploaded scrolls into structured training modules.
            </p>
          </div>

          {/* Extracted Subjects Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {syllabus.subjects.map(sub => {
              const courseList = sub.courses || sub.chapters || [];
              const totalItems = courseList.reduce((acc, c) => acc + (c.todoItems || c.topics || []).length, 0);
              const completedItems = courseList.reduce(
                (acc, c) => acc + (c.todoItems || c.topics || []).filter(t => t.completed || t.status === 'COMPLETED').length,
                0
              );
              const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl glass-panel border border-orange-500/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-hud font-bold text-orange-400 uppercase">
                      {sub.title}
                    </span>
                    <span className="text-xs font-hud font-bold text-cyan-400">
                      {percent}% DONE
                    </span>
                  </div>

                  <div className="text-2xl font-hud font-extrabold text-white">
                    {courseList.length} COURSES
                  </div>

                  <div className="flex items-center justify-between text-xs font-hud text-gray-400">
                    <span>{totalItems} TO-DO ITEMS</span>
                    <span>{completedItems} COMPLETED</span>
                  </div>

                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onConfirm}
              className="px-8 py-4 rounded-xl font-hud font-bold text-sm text-black tracking-widest bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_25px_rgba(255,107,0,0.5)] flex items-center space-x-3 group transform hover:scale-105"
            >
              <span>CONFIRM SYLLABUS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
