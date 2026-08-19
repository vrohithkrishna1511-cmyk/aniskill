'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Square,
  CheckSquare,
  Clock,
  Zap,
  Target,
  Sparkles,
  BookOpen,
  Plus
} from 'lucide-react';
import { Subject, TodoItem } from '../../types';

interface FlatTopic extends TodoItem {
  courseId?: string;
  courseTitle?: string;
}

interface TopicSelectorProps {
  subject: Subject;
  selectedTopicIds: string[];
  completedTopicIds: Set<string>;
  onToggleTopic: (topicId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onChangeSubject: () => void;
  onStartTraining: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  subject,
  selectedTopicIds,
  completedTopicIds,
  onToggleTopic,
  onSelectAll,
  onClearAll,
  onChangeSubject,
  onStartTraining
}) => {
  // Extract all topics from subject's courses / chapters
  const allTopics: FlatTopic[] = [];
  (subject.courses || subject.chapters || []).forEach(c => {
    (c.todoItems || c.topics || []).forEach((t: TodoItem) => {
      allTopics.push({
        ...t,
        courseId: c.id,
        courseTitle: c.title
      });
    });
  });

  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MODERATE' | 'HARD' | 'ADVANCED'>('ALL');

  // Filter topics by selected difficulty practice level if active
  const filteredTopics = allTopics.filter(t => {
    if (difficultyFilter === 'ALL') return true;
    const diff = t.difficulty === 'EASY' ? 'EASY' : t.difficulty === 'ADVANCED' ? 'ADVANCED' : (t.difficulty === 'HARD' || t.difficulty === 'COMPLEX' || t.difficulty === 'VERY_HARD') ? 'HARD' : 'MODERATE';
    return diff === difficultyFilter;
  });

  // Calculate total minutes for selected topics
  const totalMinutes = allTopics
    .filter(t => selectedTopicIds.includes(t.id) || selectedTopicIds.includes(t.title))
    .reduce((acc, t) => acc + (t.targetMinutes || t.requiredMinutes || 20), 0);

  const completedCountInSubject = allTopics.filter(t =>
    t.completed || t.status === 'COMPLETED' || completedTopicIds.has(t.id) || completedTopicIds.has(t.title)
  ).length;

  // 1. EMPTY TOPICS STATE
  if (allTopics.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800/80">
          <button
            onClick={onChangeSubject}
            className="px-3.5 py-2 rounded-xl text-xs font-hud font-bold text-gray-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>CHANGE SUBJECT</span>
          </button>
          <div className="h-6 w-px bg-zinc-800" />
          <h2 className="text-xl sm:text-2xl font-extrabold font-hud text-white tracking-wider uppercase">
            {subject.title}
          </h2>
        </div>

        <div className="w-full max-w-2xl mx-auto text-center py-12 px-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400 animate-pulse">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold font-hud text-white tracking-wider uppercase">
              NO TOPICS IMPORTED YET
            </h3>
            <p className="text-sm font-body text-gray-400 max-w-md mx-auto">
              This subject does not have any topics in your Syllabus yet. Import or paste topics to begin training.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onChangeSubject}
              className="px-5 py-3 rounded-xl font-hud font-bold text-xs text-gray-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
            >
              CHOOSE ANOTHER SUBJECT
            </button>

            <Link
              href="/syllabus"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-hud font-extrabold text-xs tracking-widest text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>IMPORT TOPICS IN SYLLABUS</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. DYNAMIC TOPIC SELECTION
  return (
    <div className="w-full relative space-y-6">
      {/* TOP BAR / NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <button
            onClick={onChangeSubject}
            className="px-3.5 py-2 rounded-xl text-xs font-hud font-bold text-gray-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center space-x-2 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>CHANGE SUBJECT</span>
          </button>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-hud text-orange-400 tracking-widest uppercase font-bold">
                STAGE 2 • SYLLABUS TOPIC SELECTION
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-hud text-white tracking-wider uppercase flex items-center space-x-2 break-words">
              <span>{subject.title} SYLLABUS</span>
            </h2>
          </div>
        </div>

        {/* METRICS BADGES */}
        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] font-hud text-gray-400 flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>TOTAL: <strong className="text-white">{allTopics.length}</strong></span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-hud text-emerald-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>COMPLETED: <strong className="text-emerald-300">{completedCountInSubject}/{allTopics.length}</strong></span>
          </div>
        </div>
      </div>

      {/* PRACTICE LEVEL FILTER TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-hud scrollbar-none">
        <button
          onClick={() => setDifficultyFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
            difficultyFilter === 'ALL'
              ? 'bg-orange-500 border-orange-400 text-black font-extrabold shadow'
              : 'bg-zinc-900/80 border-zinc-800 text-gray-400 hover:text-white'
          }`}
        >
          ALL TOPICS ({allTopics.length})
        </button>
        <button
          onClick={() => setDifficultyFilter('EASY')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
            difficultyFilter === 'EASY'
              ? 'bg-emerald-500 border-emerald-400 text-black font-extrabold shadow'
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30'
          }`}
        >
          LEVEL 1 — EASY
        </button>
        <button
          onClick={() => setDifficultyFilter('MODERATE')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
            difficultyFilter === 'MODERATE'
              ? 'bg-amber-500 border-amber-400 text-black font-extrabold shadow'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-400 hover:bg-amber-900/30'
          }`}
        >
          LEVEL 2 — MODERATE
        </button>
        <button
          onClick={() => setDifficultyFilter('HARD')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
            difficultyFilter === 'HARD'
              ? 'bg-rose-500 border-rose-400 text-black font-extrabold shadow'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-900/30'
          }`}
        >
          LEVEL 3 — HARD
        </button>
        <button
          onClick={() => setDifficultyFilter('ADVANCED')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
            difficultyFilter === 'ADVANCED'
              ? 'bg-purple-500 border-purple-400 text-black font-extrabold shadow'
              : 'bg-purple-950/20 border-purple-500/30 text-purple-400 hover:bg-purple-900/30'
          }`}
        >
          LEVEL 4 — ADVANCED
        </button>
      </div>

      {/* SYLLABUS CONTROLS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-hud text-gray-300">
          <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
          <span>
            Select the specific topics you want to train in today's mission.
          </span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={onSelectAll}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-hud font-bold text-orange-400 hover:text-orange-300 bg-orange-950/30 border border-orange-500/30 hover:border-orange-500/60 transition-all cursor-pointer"
          >
            SELECT ALL
          </button>
          <button
            onClick={onClearAll}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-hud font-bold text-gray-400 hover:text-gray-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
          >
            CLEAR SELECTION
          </button>
        </div>
      </div>

      {/* TOPICS LIST */}
      <div className="space-y-3">
        {filteredTopics.map((topic, index) => {
          const isSelected = selectedTopicIds.includes(topic.id) || selectedTopicIds.includes(topic.title);
          const isCompleted =
            topic.completed ||
            topic.status === 'COMPLETED' ||
            completedTopicIds.has(topic.id) ||
            completedTopicIds.has(topic.title);

          const diff =
            topic.difficulty === 'EASY'
              ? 'EASY'
              : topic.difficulty === 'ADVANCED'
              ? 'ADVANCED'
              : topic.difficulty === 'HARD' || topic.difficulty === 'COMPLEX' || topic.difficulty === 'VERY_HARD'
              ? 'HARD'
              : 'MODERATE';

          const targetM = topic.targetMinutes || topic.requiredMinutes || (diff === 'EASY' ? 15 : diff === 'ADVANCED' ? 45 : diff === 'HARD' ? 30 : 20);

          const diffBadge =
            diff === 'EASY'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : diff === 'ADVANCED'
              ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
              : diff === 'HARD'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-400';

          return (
            <motion.div
              key={topic.id || index}
              onClick={() => onToggleTopic(topic.id || topic.title)}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none ${
                isSelected
                  ? 'bg-orange-950/20 border-orange-500/70 shadow-[0_0_20px_rgba(255,107,0,0.15)] ring-1 ring-orange-500/30'
                  : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
            >
              {/* LEFT: CHECKBOX + TOPIC NUMBER + TITLE */}
              <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0">
                <div className="pt-0.5 sm:pt-0 flex-shrink-0">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-orange-500" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                  )}
                </div>

                <span className="text-xs font-hud font-extrabold text-orange-400 flex-shrink-0 pt-0.5 sm:pt-0">
                  #{index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h4
                      className={`font-title font-bold text-sm sm:text-base text-white break-words ${
                        isCompleted ? 'text-gray-300' : ''
                      }`}
                    >
                      {topic.title}
                    </h4>

                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-hud font-bold inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>COMPLETED</span>
                      </span>
                    )}
                  </div>

                  {topic.courseTitle && (
                    <p className="text-xs font-body text-gray-500 line-clamp-1 mt-0.5">
                      Chapter: {topic.courseTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT: DIFFICULTY & TARGET TIME BADGES */}
              <div className="flex items-center space-x-2.5 flex-shrink-0 self-end sm:self-center">
                <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-hud font-bold uppercase tracking-wider ${diffBadge}`}>
                  {diff}
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-hud font-bold text-orange-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{targetM} MIN</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="sticky bottom-4 z-20 mt-8 p-4 sm:p-5 rounded-2xl bg-zinc-950/95 border border-zinc-800/90 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Target className="w-5 h-5" />
          </div>

          <div>
            <div className="text-xs font-hud text-gray-400 uppercase tracking-wider">
              MISSION TARGET SUMMARY
            </div>
            <div className="text-sm sm:text-base font-hud font-extrabold text-white">
              <span className="text-orange-400">{selectedTopicIds.length}</span> Topics Selected
              <span className="text-zinc-600 mx-2">•</span>
              <span className="text-cyan-400">{totalMinutes} MIN</span> Estimated Mission Time
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onChangeSubject}
            className="px-4 py-3.5 rounded-xl text-xs font-hud font-bold text-gray-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
          >
            CHANGE SUBJECT
          </button>

          <button
            onClick={onStartTraining}
            disabled={selectedTopicIds.length === 0}
            className={`flex-1 sm:flex-initial px-8 py-3.5 rounded-xl font-hud font-extrabold text-xs tracking-widest flex items-center justify-center space-x-2 transition-all ${
              selectedTopicIds.length > 0
                ? 'text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 shadow-[0_0_25px_rgba(255,107,0,0.5)] transform hover:scale-[1.02] cursor-pointer'
                : 'text-zinc-500 bg-zinc-900 border border-zinc-800 cursor-not-allowed opacity-60'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>START TRAINING</span>
          </button>
        </div>
      </div>
    </div>
  );
};
