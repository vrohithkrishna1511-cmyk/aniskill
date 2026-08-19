'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Pause, Square, CheckCircle, ArrowRight, ShieldAlert, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FocusStatus } from '../anime/FocusStatus';

export const TrainingTimer: React.FC = () => {
  const { 
    isTrainingActive, 
    trainingSeconds, 
    startTraining, 
    pauseTraining, 
    finishTraining,
    dailyMission,
    isFocusMode,
    setTrainingSeconds,
    resetDailyMissionForNextSubject,
    refreshSyllabus
  } = useApp();

  const [showWarningModal, setShowWarningModal] = React.useState(false);
  const [hasDismissedWarning, setHasDismissedWarning] = React.useState(false);
  const [isManualMode, setIsManualMode] = React.useState(false);

  const formatHMS = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    };
  };

  const time = formatHMS(trainingSeconds);
  const targetTime = formatHMS(dailyMission.requiredSeconds);
  const elapsedSeconds = Math.max(0, dailyMission.requiredSeconds - trainingSeconds);
  const progressPercent = dailyMission.requiredSeconds > 0
    ? Math.min(100, (elapsedSeconds / dailyMission.requiredSeconds) * 100)
    : 0;

  // Trigger 10-minute warning when 10 minutes remain (600s)
  React.useEffect(() => {
    if (isTrainingActive && trainingSeconds <= 600 && trainingSeconds > 0 && !hasDismissedWarning && !isManualMode) {
      setShowWarningModal(true);
    }
  }, [isTrainingActive, trainingSeconds, hasDismissedWarning, isManualMode]);

  const handlePlusTenMinutes = () => {
    setTrainingSeconds(prev => prev + 600);
    setShowWarningModal(false);
    setHasDismissedWarning(true);
    // Reset warning trigger for next 10-minute boundary
    setTimeout(() => setHasDismissedWarning(false), 30000);
  };

  const handleNoImDone = () => {
    setShowWarningModal(false);
    setHasDismissedWarning(true);
    finishTraining();
  };

  const handleSelectManualMode = () => {
    setShowWarningModal(false);
    setHasDismissedWarning(true);
    setIsManualMode(true);
  };

  return (
    <div className="w-full relative bg-[#070b14]/90 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)] text-center overflow-hidden space-y-2.5 max-w-lg mx-auto">
      {/* Top HUD Focus Status */}
      <div className="flex flex-row items-center justify-between gap-2 relative z-20 border-b border-cyan-500/20 pb-2">
        <FocusStatus isActive={isFocusMode} />
        <div className="flex items-center space-x-2">
          <span className="text-[10px] sm:text-xs font-hud px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider">
            MENTOR // TOBIRAMA
          </span>
          <span className="text-[10px] sm:text-xs font-hud text-cyan-400 font-bold tracking-wider uppercase">
            TARGET: {targetTime.h}:{targetTime.m}:{targetTime.s}
          </span>
        </div>
      </div>

      {/* CENTER STAGE: CIRCULAR TIMER & ACTIVE TOPIC */}
      <div className="flex flex-col items-center justify-center space-y-2.5 relative z-20">
        {/* Compact Circular Progress Ring */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="url(#chakra-gradient)"
              strokeWidth="6"
              strokeDasharray="270"
              strokeDashoffset={270 - (270 * progressPercent) / 100}
              strokeLinecap="round"
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="chakra-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {trainingSeconds === 0 ? (
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold font-hud tracking-wide text-emerald-400 glow-emerald-text animate-pulse">
                COMPLETE
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-hud tracking-widest text-white glow-cyan-text">
                {time.h}:{time.m}:{time.s}
              </div>
            )}
            <span className="text-[9px] sm:text-[10px] font-hud text-cyan-300 uppercase tracking-widest mt-0.5">
              {trainingSeconds === 0 ? 'GOAL ACHIEVED' : isTrainingActive ? 'CHAKRA FLOW ACTIVE' : 'TRAINING PAUSED'}
            </span>
            <span className="text-[9px] sm:text-[10px] font-hud text-amber-400 mt-0.5 font-bold">
              {progressPercent.toFixed(0)}% COMPLETED
            </span>
          </div>
        </div>

        {/* Compact Active Topic Context */}
        {(() => {
          const activeTopic = dailyMission.scheduledTopics?.find(t => !t.completed && t.status !== 'COMPLETED') || dailyMission.scheduledTopics?.[0];
          const activeTitle = activeTopic?.normalizedTitle || activeTopic?.title || dailyMission.topicTitles?.[0] || 'Shinobi Core Master Curriculum';
          const activeSubject = activeTopic?.subjectName || dailyMission.subjectName;
          const activeDiff = activeTopic?.difficulty === 'EASY' ? 'EASY' : (activeTopic?.difficulty === 'COMPLEX' || activeTopic?.difficulty === 'HARD' || activeTopic?.difficulty === 'VERY_HARD' ? 'COMPLEX' : 'MODERATE');
          const activeTargetM = activeTopic?.targetMinutes || (activeDiff === 'EASY' ? 15 : activeDiff === 'COMPLEX' ? 30 : 20);

          return (
            <div className="p-2.5 sm:p-3 rounded-xl bg-black/75 backdrop-blur-md border border-cyan-500/30 w-full text-left space-y-1 shadow-lg">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1">
                <span className="text-[9px] sm:text-[10px] font-hud text-cyan-400 uppercase tracking-widest font-bold">
                  ACTIVE TOPIC
                </span>
                <span className="text-[9px] sm:text-[10px] font-hud px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                  {activeDiff} • {activeTargetM} MIN
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-title font-bold text-white leading-snug line-clamp-1">
                {activeTitle}
              </h3>
              <div className="text-[9px] sm:text-[10px] font-hud text-gray-400 flex items-center justify-between">
                <span>Subject: <strong className="text-amber-300 font-semibold">{activeSubject}</strong></span>
              </div>
            </div>
          );
        })()}

        {/* Compact Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5 w-full">
            {trainingSeconds > 0 && (
              isTrainingActive ? (
                <button
                  onClick={pauseTraining}
                  className="px-3.5 py-1.5 rounded-xl font-hud font-bold text-xs text-white bg-amber-600/90 hover:bg-amber-500 border border-amber-500/50 transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE</span>
                </button>
              ) : (
                <button
                  onClick={startTraining}
                  className="px-3.5 py-1.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>CONTINUE</span>
                </button>
              )
            )}

            <button
              onClick={() => setTrainingSeconds(prev => prev + 600)}
              className="px-3 py-1.5 rounded-xl font-hud font-bold text-xs text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              title="Add 10 minutes to current session"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+10 MIN</span>
            </button>

            <button
              onClick={() => {
                pauseTraining();
                setTrainingSeconds(dailyMission.requiredSeconds);
              }}
              className="px-3 py-1.5 rounded-xl font-hud font-bold text-xs text-gray-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <span>RESET</span>
            </button>

            <button
              onClick={async () => {
                finishTraining();
                // Submit topic completion to backend API
                if (dailyMission.topicIds && dailyMission.topicIds.length > 0) {
                  try {
                    await fetch('/api/study/session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'END_TRAINING',
                        sessionId: `sess-${Date.now()}`,
                        durationSeconds: Math.max(60, (dailyMission.requiredSeconds || 900) - trainingSeconds),
                        topicsCovered: dailyMission.topicIds,
                      }),
                    });
                    // Refresh database syllabus state so completed topic updates progress percentage
                    refreshSyllabus();
                  } catch (e) {
                    console.error('Error submitting topic completion:', e);
                  }
                }
              }}
              className="px-3.5 py-1.5 rounded-xl font-hud font-extrabold text-xs tracking-wider text-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center space-x-1.5 cursor-pointer transform hover:scale-105"
            >
              <CheckCircle className="w-3.5 h-3.5 fill-current text-black" />
              <span>✓ MARK TOPIC COMPLETED</span>
            </button>
        </div>
      </div>

      {/* 10-Minute Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-hud">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#1c120c] via-[#120a07] to-[#0a0503] border border-orange-500/40 text-slate-100 shadow-2xl space-y-4 text-center">
            <div className="space-y-1.5">
              <span className="text-[10px] text-orange-400 uppercase tracking-widest font-bold">1 HOUR CHECKPOINT</span>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">
                10 MINUTES REMAINING!
              </h3>
              <p className="text-xs text-slate-300 font-body">
                Do you want to extend training for {dailyMission.subjectName}?
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handlePlusTenMinutes}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-black fill-current" />
                <span>+10 MINUTES (EXTEND SESSION)</span>
              </button>

              <button
                type="button"
                onClick={handleNoImDone}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-red-950/80 hover:bg-red-900 border border-red-500/50 shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Square className="w-4 h-4 text-white fill-current" />
                <span>NO, I'M DONE (START DAILY QUIZ)</span>
              </button>

              <button
                type="button"
                onClick={handleSelectManualMode}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>MANUAL — I'M GOING TO END SOON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Training Proof CTA prompt (if finished) */}
      {(!isTrainingActive && (trainingSeconds === 0 || dailyMission.isCompleted)) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2.5 sm:p-3 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-left mt-2 relative z-20 shadow-lg"
        >
          <div className="space-y-0.5">
            <div className="text-[11px] font-hud font-bold text-cyan-400 uppercase tracking-wider">
              TRAINING SESSION COMPLETE!
            </div>
            <p className="text-[10px] font-body text-slate-300">
              Proof required for mission verification & streak increment.
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={resetDailyMissionForNextSubject}
              className="px-3 py-1.5 rounded-xl font-hud font-bold text-xs text-black bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 fill-current text-black" />
              <span>+ NEXT SUBJECT</span>
            </button>
            <Link
              href="/training/proof"
              className="px-3.5 py-1.5 rounded-xl font-hud font-bold text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-md flex items-center space-x-1.5"
            >
              <span>SUBMIT PROOF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};
