'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Clock,
  BookOpen,
  Play,
  CheckCircle2,
  Zap,
  PlusCircle,
  Sparkles,
  Award,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CharacterRenderer } from '../anime/CharacterRenderer';
import { DailyQuizModal } from './DailyQuizModal';
import { ShinobiRestModal } from './ShinobiRestModal';
import { GeneratedQuizQuestion } from '@/lib/ai/gemini';

interface DailyMissionProps {
  onChangeSubject?: () => void;
  onChangeTopics?: () => void;
}

export const DailyMission: React.FC<DailyMissionProps> = ({
  onChangeSubject,
  onChangeTopics
}) => {
  const {
    dailyMission,
    updateDailyMission,
    startTraining,
    isTrainingActive,
    syllabus,
    resetDailyMissionForNextSubject,
    completeTopic,
    setTrainingSeconds,
    userProfile,
    updateUserProfile
  } = useApp();

  // Modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<GeneratedQuizQuestion[]>([]);
  const [isEvaluatingQuiz, setIsEvaluatingQuiz] = useState(false);
  const [quizEvaluation, setQuizEvaluation] = useState<any>(null);
  const [showRestModal, setShowRestModal] = useState(false);

  const handleMarkTopicCompleted = async (topic: any) => {
    const targetId = topic.todoItemId || topic.topicId || topic.id || topic.title;
    if (!targetId) return;

    // Save to local storage cache for instant persistence
    try {
      const savedCompleted = JSON.parse(localStorage.getItem('aniskill_completed_topics') || '[]');
      if (!savedCompleted.includes(targetId)) {
        savedCompleted.push(targetId);
        localStorage.setItem('aniskill_completed_topics', JSON.stringify(savedCompleted));
      }
    } catch {}

    // Call API
    await completeTopic(targetId, true);

    // Optimistically update daily mission
    updateDailyMission({
      scheduledTopics: (dailyMission.scheduledTopics || []).map((t: any) => {
        if ((t.todoItemId || t.topicId || t.title) === targetId || t.id === targetId) {
          return { ...t, completed: true, status: 'COMPLETED' };
        }
        return t;
      }),
    });
  };

  const handleEndTraining = async () => {
    try {
      const studiedFromSyllabus: string[] = [];
      syllabus.subjects.forEach(sub => {
        if (dailyMission.selectedSubjectIds?.includes(sub.id)) {
          (sub.courses || sub.chapters || []).forEach(chap => {
            (chap.todoItems || chap.topics || []).forEach((top: any) => {
              if (top.completed || top.status === 'COMPLETED') {
                studiedFromSyllabus.push(top.title);
              }
            });
          });
        }
      });
      const studied = Array.from(new Set([
        ...(dailyMission.scheduledTopics?.filter(t => t.completed || t.status === 'COMPLETED').map(t => t.title) || []),
        ...studiedFromSyllabus
      ]));
      const finalStudied = studied.length > 0 ? studied : ['Core Concepts', 'Logic & Functions'];

      const res = await fetch('/api/study/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GENERATE', studiedTopics: finalStudied }),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setQuizQuestions(data.questions);
      }
      setQuizEvaluation(null);
      setShowQuizModal(true);
    } catch (e) {
      console.error('Error ending training:', e);
    }
  };

  const handleQuizSubmit = async (answers: number[]) => {
    try {
      setIsEvaluatingQuiz(true);
      const studiedFromSyllabus: string[] = [];
      syllabus.subjects.forEach(sub => {
        if (dailyMission.selectedSubjectIds?.includes(sub.id)) {
          (sub.courses || sub.chapters || []).forEach(chap => {
            (chap.todoItems || chap.topics || []).forEach((top: any) => {
              if (top.completed || top.status === 'COMPLETED') {
                studiedFromSyllabus.push(top.title);
              }
            });
          });
        }
      });
      const studied = Array.from(new Set([
        ...(dailyMission.scheduledTopics?.filter(t => t.completed || t.status === 'COMPLETED').map(t => t.title) || []),
        ...studiedFromSyllabus
      ]));
      const finalStudied = studied.length > 0 ? studied : ['Core Concepts', 'Logic & Functions'];

      const res = await fetch('/api/study/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EVALUATE',
          subjectId: dailyMission.subjectId,
          studiedTopics: finalStudied,
          questions: quizQuestions,
          answers,
          durationSeconds: dailyMission.completedSeconds || 3600,
        }),
      });
      const data = await res.json();
      setIsEvaluatingQuiz(false);

      if (data.success) {
        setQuizEvaluation(data);
        if (data.passed && data.newStreak) {
          updateUserProfile({
            currentStreak: data.newStreak,
            totalStudyHours: userProfile.totalStudyHours + 1,
          });
        }
      }
    } catch (e) {
      console.error('Error submitting quiz:', e);
      setIsEvaluatingQuiz(false);
    }
  };

  const handleRestConfirm = async (reason: string) => {
    try {
      const res = await fetch('/api/rest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      alert(data.message || 'Shinobi Rest approved!');
      setShowRestModal(false);
    } catch (e) {
      console.error('Error confirming rest:', e);
      setShowRestModal(false);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
  };

  const hasScheduledTopics = Boolean(
    dailyMission.scheduledTopics && dailyMission.scheduledTopics.length > 0
  );

  return (
    <div className="w-full relative p-6 md:p-8">
      {/* BACKGROUND SCROLL MOTIF */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* LEFT: JIRAIYA / MISSION CHARACTER VISUAL */}
        <div className="w-full lg:w-1/3 flex flex-col items-center justify-center relative">
          <div className="text-xs font-hud font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>MISSION BRIEFING BY JIRAIYA</span>
          </div>
          <CharacterRenderer
            characterId="jiraiya"
            state={hasScheduledTopics ? "mission" : "teaching"}
            size="md"
            showAura={true}
          />
        </div>

        {/* RIGHT: QUEST PANEL */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <Target className="w-7 h-7 text-orange-400 animate-pulse" />
              <div>
                <span className="text-[10px] font-hud text-gray-400 tracking-widest uppercase">
                  DAILY QUEST // RANK ASSIGNMENT
                </span>
                <h3 className="font-hud font-extrabold text-xl text-white tracking-wider">
                  TODAY'S TRAINING MISSION
                </h3>
              </div>
            </div>

            {hasScheduledTopics && (
              <div className="flex items-center space-x-2">
                {dailyMission.isVerified ? (
                  <span className="px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-hud font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MISSION VERIFIED</span>
                  </span>
                ) : dailyMission.isCompleted ? (
                  <span className="px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 text-xs font-hud font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>READY FOR PROOF</span>
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-orange-950/80 border border-orange-500/50 text-orange-400 text-xs font-hud font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    <Zap className="w-4 h-4" />
                    <span>ACTIVE QUEST</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 1. NO SCHEDULED TOPICS SELECTED YET */}
          {!hasScheduledTopics && (
            <div className="text-center space-y-4 py-8 px-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <BookOpen className="w-10 h-10 text-orange-400/80 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="font-hud font-extrabold text-lg text-white">
                  NO ACTIVE MISSION SCHEDULED
                </h4>
                <p className="text-sm font-body text-gray-400 max-w-md mx-auto">
                  Select a training subject and pick the Jutsu topics you wish to master today.
                </p>
              </div>

              <div className="pt-2">
                {onChangeSubject ? (
                  <button
                    onClick={onChangeSubject}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-hud font-extrabold text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 shadow-[0_0_20px_rgba(255,107,0,0.4)] cursor-pointer transform hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>SELECT TRAINING SUBJECT</span>
                  </button>
                ) : (
                  <Link
                    href="/training"
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-hud font-extrabold text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 shadow-[0_0_20px_rgba(255,107,0,0.4)] cursor-pointer transform hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>GO TO TRAINING GROUND</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* 2. MISSION GENERATED - ACTIVE TOPICS LIST */}
          {hasScheduledTopics && (
            <div className="space-y-5">
              {/* Target Subjects Details + Change Action */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-hud text-gray-400 uppercase tracking-widest">
                    TARGET SUBJECT:
                  </span>
                  <span className="text-sm font-hud font-extrabold text-orange-400 glow-orange-text uppercase">
                    {dailyMission.subjectName}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {onChangeTopics && (
                    <button
                      onClick={onChangeTopics}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-hud font-bold text-gray-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                      <span>CHANGE TOPICS</span>
                    </button>
                  )}

                  {onChangeSubject && (
                    <button
                      onClick={onChangeSubject}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-hud font-bold text-gray-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
                      <span>CHANGE SUBJECT</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TOPIC CARDS */}
              <div className="space-y-3">
                <div className="text-xs font-hud text-gray-400 uppercase tracking-widest">
                  TO-DO JUTSU ITEMS TO MASTER TODAY
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {dailyMission.scheduledTopics?.map((t, idx) => {
                    const diff =
                      t.difficulty === 'EASY'
                        ? 'EASY'
                        : t.difficulty === 'ADVANCED'
                        ? 'ADVANCED'
                        : t.difficulty === 'HARD' || t.difficulty === 'COMPLEX' || t.difficulty === 'VERY_HARD'
                        ? 'HARD'
                        : 'MODERATE';
                    const targetM = t.targetMinutes || (diff === 'EASY' ? 15 : diff === 'ADVANCED' ? 45 : diff === 'HARD' ? 30 : 20);
                    const isDone = Boolean(t.completed || t.status === 'COMPLETED');

                    return (
                      <div
                        key={t.topicId || t.todoItemId || idx}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col space-y-3.5 ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-zinc-950/90 border-zinc-800 text-amber-100 hover:border-orange-500/40 shadow-sm'
                        }`}
                      >
                        {/* ROW 1: NUMBER + TITLE & SUBJECT */}
                        <div className="flex items-start space-x-3.5 w-full">
                          <span className="text-sm font-hud font-extrabold text-orange-400 pt-0.5 flex-shrink-0">
                            #{idx + 1}
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Target className="w-5 h-5 text-orange-400/80 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex flex-col flex-1 space-y-1">
                            <h4
                              className={`font-title font-bold text-base sm:text-lg text-white leading-snug break-words ${
                                isDone ? 'line-through text-gray-400' : ''
                              }`}
                            >
                              {t.normalizedTitle || t.title}
                            </h4>
                            <span className="text-xs font-hud text-gray-400 tracking-wide">
                              Subject: <strong className="text-amber-300 font-semibold">{t.subjectName || dailyMission.subjectName}</strong>
                            </span>
                          </div>
                        </div>

                        {/* ROW 2: DIFFICULTY, TARGET TIME, STATUS BADGES */}
                        <div className="flex flex-wrap items-center gap-2.5 text-xs font-hud pt-1 border-t border-zinc-900">
                          <span
                            className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider ${
                              diff === 'EASY'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : diff === 'ADVANCED'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : diff === 'HARD'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            DIFFICULTY: {diff}
                          </span>
                          <span className="text-orange-400 font-bold px-3 py-1 rounded-lg bg-orange-950/40 border border-orange-500/30">
                            TARGET: {targetM} MIN
                          </span>
                          <span
                            className={`px-3 py-1 rounded-lg font-bold uppercase tracking-widest ${
                              isDone
                                ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/40'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            STATUS: {isDone ? '✓ COMPLETED' : 'PLANNED'}
                          </span>
                        </div>

                        {/* ROW 3: ACTION BUTTONS */}
                        {!isDone && (
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Link
                              href="/training/session"
                              onClick={() => {
                                setTrainingSeconds(targetM * 60);
                                startTraining();
                              }}
                              className="px-5 py-2.5 rounded-xl text-xs font-hud font-extrabold text-black bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 shadow-md flex items-center space-x-2 cursor-pointer transform hover:scale-105"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>▶ START TOPIC</span>
                            </Link>

                            <button
                              onClick={() => handleMarkTopicCompleted(t)}
                              className="px-5 py-2.5 rounded-xl text-xs font-hud font-extrabold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 shadow-md flex items-center space-x-2 cursor-pointer transition-all transform hover:scale-105"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>✓ MARK TOPIC COMPLETED</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metrics & Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-3">
                <div className="flex items-center space-x-8">
                  <div>
                    <div className="text-[10px] font-hud text-gray-400 tracking-widest uppercase">
                      AVAILABLE TIMERS
                    </div>
                    <div className="text-2xl font-hud font-extrabold text-orange-400 glow-orange-text">
                      {formatTime(dailyMission.requiredSeconds)}
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-800" />
                  <div>
                    <div className="text-[10px] font-hud text-gray-400 tracking-widest uppercase">
                      TODAY'S TO-DO ITEMS
                    </div>
                    <div className="text-2xl font-hud font-extrabold text-cyan-400 glow-cyan-text">
                      {dailyMission.scheduledTopics?.filter(t => t.completed || t.status === 'COMPLETED').length} / {dailyMission.scheduledTopics?.length}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {(dailyMission.isVerified || dailyMission.isCompleted) && (
                    <button
                      onClick={() => {
                        resetDailyMissionForNextSubject();
                        if (onChangeSubject) onChangeSubject();
                      }}
                      className="px-6 py-4 rounded-xl font-hud font-extrabold text-xs tracking-widest text-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-105"
                    >
                      <PlusCircle className="w-4 h-4 text-black fill-current" />
                      <span>+ START NEXT SUBJECT / SESSION</span>
                    </button>
                  )}

                  {!dailyMission.isVerified && (
                    <>
                      {/* Shinobi Rest Button */}
                      <button
                        onClick={() => setShowRestModal(true)}
                        className="px-4 py-4 rounded-xl text-xs font-hud font-bold text-purple-300 border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 transition-all cursor-pointer"
                      >
                        NOT TODAY (REST)
                      </button>

                      {/* End Today's Training Button */}
                      <button
                        onClick={handleEndTraining}
                        className="px-5 py-4 rounded-xl text-xs font-hud font-extrabold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 transition-all shadow-lg cursor-pointer"
                      >
                        END TODAY'S TRAINING
                      </button>

                      <Link
                        href="/training/session"
                        onClick={() => !isTrainingActive && startTraining()}
                        className="flex-1 sm:flex-initial px-6 py-4 rounded-xl font-hud font-extrabold text-xs tracking-widest text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_25px_rgba(255,107,0,0.5)] flex items-center justify-center space-x-2 transform hover:scale-105"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isTrainingActive ? 'RESUME TIMER' : 'BEGIN TIMER'}</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DailyQuizModal
        isOpen={showQuizModal}
        questions={quizQuestions}
        onComplete={handleQuizSubmit}
        isEvaluating={isEvaluatingQuiz}
        evaluationResult={quizEvaluation}
        onClose={() => setShowQuizModal(false)}
        onRetryQuiz={handleEndTraining}
      />

      {/* Shinobi Rest Modal */}
      <ShinobiRestModal
        isOpen={showRestModal}
        onClose={() => setShowRestModal(false)}
        onConfirmRest={handleRestConfirm}
      />
    </div>
  );
};
