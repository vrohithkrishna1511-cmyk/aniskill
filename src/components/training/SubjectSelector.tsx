'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Flame,
  Plus,
  Layers,
  Code,
  Database,
  Cpu,
  Terminal,
  Globe,
  Award
} from 'lucide-react';
import { Subject } from '../../types';

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
  onContinue: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Layers,
  Code,
  Database,
  Cpu,
  Terminal,
  Globe,
  Award
};

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onContinue
}) => {
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  // 1. EMPTY STATE: NO SUBJECTS IN SYLLABUS
  if (subjects.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12 px-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400 animate-pulse">
          <BookOpen className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold font-hud text-white tracking-wider uppercase">
            NO TRAINING SUBJECTS YET
          </h3>
          <p className="text-sm font-body text-gray-400 max-w-md mx-auto">
            Add a subject in Syllabus first to begin your Shinobi training.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/syllabus"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-hud font-extrabold text-xs tracking-widest text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>GO TO SYLLABUS</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. DYNAMIC SUBJECT SELECTION
  return (
    <div className="w-full relative">
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-[11px] font-hud tracking-widest uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]">
          <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span>STAGE 1 • PATHWAY SELECTION</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-hud text-white tracking-wider uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          SELECT YOUR TRAINING SUBJECT
        </h2>

        <p className="text-sm sm:text-base font-body text-gray-300">
          Choose the path you want to train today.
        </p>
      </div>

      {/* DYNAMIC SUBJECT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject, index) => {
          const isSelected = selectedSubjectId === subject.id;
          const IconComponent = ICON_MAP[subject.icon] || BookOpen;

          // Calculate total topics in this subject from syllabus
          const topicCount = (subject.courses || subject.chapters || []).reduce(
            (acc, course) => acc + (course.todoItems || course.topics || []).length,
            0
          );

          const completedCount = (subject.courses || subject.chapters || []).reduce(
            (acc, course) =>
              acc +
              (course.todoItems || course.topics || []).filter(
                (t: any) => t.completed || t.status === 'COMPLETED'
              ).length,
            0
          );

          return (
            <motion.div
              key={subject.id}
              data-tour="training-subject-card"
              onClick={() => onSelectSubject(subject.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
              className={`relative p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between group overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-zinc-950/95 border-orange-500 shadow-[0_0_25px_rgba(255,107,0,0.35)] ring-1 ring-orange-500/80'
                  : 'bg-zinc-950/70 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              {/* TOP ROW: ICON & RADIO BUTTON */}
              <div className="relative z-10 flex items-center justify-between w-full mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    isSelected
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(255,107,0,0.4)]'
                      : 'bg-zinc-900 border-zinc-800 text-gray-400 group-hover:text-white group-hover:border-zinc-700'
                  }`}
                  style={{
                    color: isSelected ? subject.color || '#FF6B00' : undefined,
                    borderColor: isSelected ? subject.color || '#FF6B00' : undefined
                  }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* RADIO BUTTON INDICATOR */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_10px_rgba(255,107,0,0.5)]'
                        : 'border-zinc-700 bg-zinc-900 text-transparent group-hover:border-zinc-500'
                    }`}
                  >
                    {isSelected ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                    )}
                  </div>
                  <span className={`text-[11px] font-hud uppercase tracking-wider ${isSelected ? 'text-orange-400 font-bold' : 'text-zinc-500'}`}>
                    {isSelected ? 'SELECTED' : 'SELECT'}
                  </span>
                </div>
              </div>

              {/* MIDDLE ROW: EXACT SUBJECT NAME */}
              <div className="relative z-10 space-y-1 mb-5 flex-1">
                <h3 className="font-hud font-extrabold text-xl text-white group-hover:text-amber-200 transition-colors tracking-wide break-words">
                  {subject.title}
                </h3>
              </div>

              {/* BOTTOM ROW: TOPICS COUNT & COMPLETION */}
              <div className="relative z-10 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-hud">
                <span className="text-gray-400">
                  {topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}
                </span>

                {topicCount > 0 && (
                  <span className={`text-[11px] ${completedCount === topicCount ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                    {completedCount} / {topicCount} Mastered
                  </span>
                )}
              </div>

              {/* Active selection pulse indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-ping pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          {selectedSubject ? (
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-xs font-hud text-gray-300">
                Selected Path: <strong className="text-orange-400 font-extrabold">{selectedSubject.title}</strong>
              </span>
            </div>
          ) : (
            <span className="text-xs font-hud text-zinc-500 uppercase tracking-wider">
              Please select a subject to unlock syllabus topics
            </span>
          )}
        </div>

        <button
          onClick={onContinue}
          disabled={!selectedSubjectId}
          className={`w-full sm:w-auto px-8 py-4 rounded-xl font-hud font-extrabold text-xs tracking-widest flex items-center justify-center space-x-3 transition-all duration-300 ${
            selectedSubjectId
              ? 'text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 shadow-[0_0_25px_rgba(255,107,0,0.5)] transform hover:scale-[1.02] cursor-pointer'
              : 'text-zinc-500 bg-zinc-900/80 border border-zinc-800 cursor-not-allowed opacity-60'
          }`}
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
