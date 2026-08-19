'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Award, Flame, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { GeneratedQuizQuestion } from '@/lib/ai/gemini';

interface DailyQuizModalProps {
  isOpen: boolean;
  questions: GeneratedQuizQuestion[];
  onComplete: (answers: number[]) => void;
  isEvaluating: boolean;
  evaluationResult?: {
    passed?: boolean;
    scorePercent: number;
    correctCount: number;
    totalQuestions: number;
    attemptNumber?: number;
    attemptsRemaining?: number;
    subjectStreakUpdated?: boolean;
    subjectStreakBroken?: boolean;
    newSubjectStreak?: number;
    newStreak: number;
    xpEarned: number;
  };
  onClose: () => void;
  onRetryQuiz?: () => void;
}

export const DailyQuizModal: React.FC<DailyQuizModalProps> = ({
  isOpen,
  questions,
  onComplete,
  isEvaluating,
  evaluationResult,
  onClose,
  onRetryQuiz,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx];

  const handleSelect = (optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[currentIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      onComplete(selectedAnswers);
    }
  };

  const isPassed = evaluationResult?.passed ?? (evaluationResult ? evaluationResult.scorePercent >= 60 : false);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#1c120c] via-[#120a07] to-[#0a0503] border border-orange-500/40 shadow-2xl text-slate-100 font-hud hud-box overflow-hidden"
        >
          {!evaluationResult ? (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-orange-500/20">
                <div className="flex items-center space-x-3">
                  <Award className="w-7 h-7 text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-xs text-orange-400 uppercase tracking-widest">
                      END TODAY'S TRAINING VERIFICATION
                    </span>
                    <h2 className="text-xl font-extrabold text-white">DAILY AI ACADEMY QUIZ (5 QUESTIONS)</h2>
                  </div>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-300 font-bold">
                  QUESTION {currentIdx + 1} / {questions.length}
                </div>
              </div>

              {currentQ ? (
                <div className="space-y-6">
                  {/* Difficulty Badge */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        currentQ.difficulty === 'BASIC'
                          ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                          : currentQ.difficulty === 'INTERMEDIATE'
                          ? 'bg-amber-950 border border-amber-500/40 text-amber-400'
                          : 'bg-rose-950 border border-rose-500/40 text-rose-400'
                      }`}
                    >
                      {currentQ.difficulty} DIFFICULTY
                    </span>
                    <span className="text-xs text-slate-400">Topic: {currentQ.topicTitle}</span>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((optionText, oIdx) => {
                      const isSelected = selectedAnswers[currentIdx] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelect(oIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-orange-500/20 border-orange-400 text-orange-200 shadow-lg shadow-orange-500/10'
                              : 'bg-black/50 border-orange-500/20 text-slate-300 hover:border-orange-500/40 hover:bg-black/70'
                          }`}
                        >
                          <span>{optionText}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-orange-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next / Submit Button */}
                  <div className="pt-4 border-t border-orange-500/20 flex justify-end">
                    <button
                      onClick={handleNext}
                      disabled={selectedAnswers[currentIdx] === undefined || isEvaluating}
                      className="px-6 py-3 rounded-xl font-extrabold text-sm text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 disabled:opacity-50 transition-all shadow-lg flex items-center space-x-2"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>EVALUATING CHAKRA...</span>
                        </>
                      ) : (
                        <>
                          <span>{currentIdx < questions.length - 1 ? 'NEXT QUESTION' : 'SUBMIT QUIZ'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">Generating 5-question quiz from studied topics...</div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6 text-center py-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border ${
                isPassed
                  ? 'bg-emerald-500/20 border-emerald-500'
                  : 'bg-red-500/20 border-red-500'
              }`}>
                {isPassed ? (
                  <Sparkles className="w-8 h-8 text-emerald-400 animate-bounce" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
              </div>

              <div>
                <span className={`text-xs uppercase tracking-widest font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPassed ? 'QUIZ PASSED — VERIFICATION SUCCESS' : 'QUIZ FAILED — RETRY REQUIRED'}
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-1">
                  SCORE: {evaluationResult.scorePercent}%
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Answered {evaluationResult.correctCount} out of {evaluationResult.totalQuestions} questions correctly!
                </p>
                {evaluationResult.attemptNumber && (
                  <p className="text-xs text-amber-400 mt-1 font-bold">
                    Attempt {evaluationResult.attemptNumber} of 5 • {evaluationResult.attemptsRemaining ?? (5 - evaluationResult.attemptNumber)} attempts remaining
                  </p>
                )}
              </div>

              {evaluationResult.subjectStreakBroken && (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-hud space-y-1">
                  <div className="font-bold text-red-400 flex items-center justify-center space-x-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>SUBJECT STREAK BROKEN</span>
                  </div>
                  <p className="text-red-300">
                    All 5 quiz attempts failed for this subject today. Subject streak has been reset to 0. Other subject streaks remain untouched!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-black/60 border border-orange-500/30 text-center">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase block">SUBJECT STREAK</span>
                  <span className="text-xl font-extrabold text-white">
                    {evaluationResult.newSubjectStreak ?? evaluationResult.newStreak} DAYS 🔥
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-black/60 border border-amber-500/30 text-center">
                  <Zap className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase block">XP EARNED</span>
                  <span className="text-xl font-extrabold text-amber-400">+{evaluationResult.xpEarned} XP</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {!isPassed && (evaluationResult.attemptsRemaining ?? 0) > 0 && onRetryQuiz && (
                  <button
                    onClick={() => {
                      setCurrentIdx(0);
                      setSelectedAnswers([]);
                      onRetryQuiz();
                    }}
                    className="flex-1 py-3.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>TRY AGAIN ({(evaluationResult.attemptsRemaining ?? 0)} RETRIES LEFT)</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl font-extrabold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-xl shadow-orange-500/20 uppercase tracking-wider cursor-pointer"
                >
                  {isPassed ? 'COMPLETE SESSION & CONTINUE' : 'CLOSE QUIZ'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
