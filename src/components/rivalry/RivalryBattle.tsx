'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Trophy, 
  Sparkles, 
  ArrowUpRight,
  Clock,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CharacterRenderer } from '../anime/CharacterRenderer';
import { CharacterId } from '@/types/characterStateEngine';

export interface RivalryStage {
  id: string;
  stageNum: string;
  title: string;
  subtitle: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  studyTime: string;
  topicTargetText: string;
  targetCount: number;
  characterA: CharacterId;
  characterB: CharacterId;
  userName: string;
  rivalName: string;
  bgGradient: string;
  borderColor: string;
  badgeClass: string;
  userGlowColor: string;
  rivalGlowColor: string;
}

export const RIVALRY_STAGES: RivalryStage[] = [
  {
    id: 'stage-1',
    stageNum: '01',
    title: 'VALLEY OF THE END: NARUTO VS SASUKE',
    subtitle: 'BEGINNER RIVALRY',
    difficulty: 'BEGINNER',
    studyTime: '1–3 HOURS',
    topicTargetText: '10 TOPICS',
    targetCount: 10,
    characterA: 'naruto',
    characterB: 'sasuke',
    userName: 'NARUTO UZUMAKI',
    rivalName: 'SASUKE UCHIHA',
    bgGradient: 'from-[#1b0d09] via-[#1a0a18] to-[#0a0d1e]',
    borderColor: 'border-orange-500/40',
    badgeClass: 'bg-orange-950/80 border-orange-500/50 text-orange-400',
    userGlowColor: '#FF6B00',
    rivalGlowColor: '#6366F1',
  },
  {
    id: 'stage-2',
    stageNum: '02',
    title: 'SHARINGAN RIVALRY: OBITO VS KAKASHI',
    subtitle: 'INTERMEDIATE RIVALRY',
    difficulty: 'INTERMEDIATE',
    studyTime: '3–5 HOURS',
    topicTargetText: '11–15 TOPICS',
    targetCount: 15,
    characterA: 'kakashi',
    characterB: 'obito',
    userName: 'KAKASHI HATAKE',
    rivalName: 'OBITO UCHIHA',
    bgGradient: 'from-[#1c080b] via-[#14081a] to-[#080d1b]',
    borderColor: 'border-red-500/40',
    badgeClass: 'bg-red-950/80 border-red-500/50 text-red-400',
    userGlowColor: '#3B82F6',
    rivalGlowColor: '#EA580C',
  },
  {
    id: 'stage-3',
    stageNum: '03',
    title: 'VALLEY OF GODS: HASHIRAMA VS MADARA',
    subtitle: 'ADVANCED RIVALRY',
    difficulty: 'ADVANCED',
    studyTime: '5–8 HOURS',
    topicTargetText: '20+ TOPICS',
    targetCount: 20,
    characterA: 'hashirama',
    characterB: 'madara',
    userName: 'HASHIRAMA SENJU',
    rivalName: 'MADARA UCHIHA',
    bgGradient: 'from-[#210815] via-[#160821] to-[#071d13]',
    borderColor: 'border-purple-500/40',
    badgeClass: 'bg-purple-950/80 border-purple-500/50 text-purple-400',
    userGlowColor: '#059669',
    rivalGlowColor: '#DC2626',
  },
];

interface RivalryBattleProps {
  activeStageId: string;
  setActiveStageId: (id: string) => void;
}

export const RivalryBattle: React.FC<RivalryBattleProps> = ({ activeStageId, setActiveStageId }) => {
  const { userProfile, rival, syllabus } = useApp();

  // SAFELY calculate actual completed topics from syllabus context (0 fallback for fresh start)
  const userCompletedTopics = syllabus?.subjects?.reduce((acc, sub) => {
    if (!sub?.chapters) return acc;
    return acc + sub.chapters.reduce((chapAcc, chap) => {
      if (!chap?.topics) return chapAcc;
      return chapAcc + chap.topics.filter((t) => t?.completed).length;
    }, 0);
  }, 0) ?? 0;

  const userStudyHours = userProfile?.totalStudyHours ?? 0;

  const activeStage = RIVALRY_STAGES.find((s) => s.id === activeStageId) || RIVALRY_STAGES[0];

  // Baselines for each stage
  const [baselines, setBaselines] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aniskill_rivalry_baselines');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {};
  });

  const [battleStatuses, setBattleStatuses] = useState<Record<string, 'ACTIVE' | 'VICTORY_PLAYING' | 'VICTORY_POPUP' | 'COMPLETED'>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aniskill_rivalry_statuses');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {};
  });

  const [winners, setWinners] = useState<Record<string, 'naruto' | null>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aniskill_rivalry_winners');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {};
  });

  // 1v1 Room states
  const [rivalRoom, setRivalRoom] = useState<any>(null);
  const [isBothFinished, setIsBothFinished] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [isRoomLoading, setIsRoomLoading] = useState<boolean>(false);

  const handleCreateRoom = async () => {
    try {
      setIsRoomLoading(true);
      const res = await fetch('/api/rivalry/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', mode: '1 HOUR', subjectName: 'Python' }),
      });
      const data = await res.json();
      if (data.success) {
        setRivalRoom(data.room);
      }
      setIsRoomLoading(false);
    } catch (e) {
      console.error('Error creating room:', e);
      setIsRoomLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setIsRoomLoading(true);
      const res = await fetch('/api/rivalry/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'JOIN', roomCode: joinCodeInput }),
      });
      const data = await res.json();
      setIsRoomLoading(false);
      if (data.success) {
        setRivalRoom(data.room);
        setShowJoinModal(false);
      } else {
        alert(data.error || 'Failed to join room');
      }
    } catch (e) {
      console.error('Error joining room:', e);
      setIsRoomLoading(false);
    }
  };

  const handleStartSolo = async () => {
    if (!rivalRoom) return;
    try {
      const res = await fetch('/api/rivalry/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START_SOLO', roomCode: rivalRoom.roomCode }),
      });
      const data = await res.json();
      if (data.success) {
        setRivalRoom(data.room);
      }
    } catch (e) {
      console.error('Error starting solo:', e);
    }
  };

  // Presence & Best Timing States for Absent Player / Substitute Challenge Mode
  const [presenceMode, setPresenceMode] = useState<'SUBSTITUTE_MODE' | 'NORMAL' | 'BOTH_ABSENT'>('SUBSTITUTE_MODE');
  const [playerABestTiming, setPlayerABestTiming] = useState<{ seconds: number | null; formattedTime: string | null } | null>(null);
  const [playerBBestTiming, setPlayerBBestTiming] = useState<{ seconds: number | null; formattedTime: string | null } | null>(null);
  const [substituteResult, setSubstituteResult] = useState<{
    isWinner: boolean;
    activeTime: string;
    bestTime: string | null;
    title: string;
    message: string;
    submessage: string;
  } | null>(null);

  // Fetch authentic best timings on load or room change
  useEffect(() => {
    async function fetchBestTimings() {
      try {
        const res = await fetch('/api/rivalry/room');
        const data = await res.json();
        if (data.success && data.userBestTiming) {
          setPlayerABestTiming(data.userBestTiming);
        }
      } catch (e) {
        console.error('Error fetching best timing:', e);
      }
    }
    fetchBestTimings();
  }, [activeStageId]);

  // Sync room mode and timings if 1v1 room is active
  useEffect(() => {
    if (rivalRoom) {
      if (rivalRoom.creatorBestTiming) setPlayerABestTiming(rivalRoom.creatorBestTiming);
      if (rivalRoom.opponentBestTiming) setPlayerBBestTiming(rivalRoom.opponentBestTiming);
      if (rivalRoom.modeType === 'NORMAL' && rivalRoom.opponentPresence === 'PRESENT') {
        setPresenceMode('NORMAL');
      } else {
        setPresenceMode('SUBSTITUTE_MODE');
      }
    }
  }, [rivalRoom]);

  const [trainingStatuses, setTrainingStatuses] = useState<Record<string, 'STOPPED' | 'ACTIVE' | 'PAUSED'>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aniskill_training_statuses');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {};
  });

  const [trainingTimes, setTrainingTimes] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aniskill_training_times');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aniskill_training_statuses', JSON.stringify(trainingStatuses));
    }
  }, [trainingStatuses]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aniskill_training_times', JSON.stringify(trainingTimes));
    }
  }, [trainingTimes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trainingStatuses[activeStageId] === 'ACTIVE') {
      interval = setInterval(() => {
        setTrainingTimes(prev => ({
          ...prev,
          [activeStageId]: (prev[activeStageId] || 0) + 1
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trainingStatuses, activeStageId]);

  const currentTrainingStatus = trainingStatuses[activeStageId] || 'STOPPED';
  const currentTrainingTime = trainingTimes[activeStageId] || 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartTraining = () => {
    if (presenceMode === 'BOTH_ABSENT') return;
    setTrainingStatuses(prev => ({ ...prev, [activeStageId]: 'ACTIVE' }));
  };

  const handlePauseTraining = () => setTrainingStatuses(prev => ({ ...prev, [activeStageId]: 'PAUSED' }));

  const handleEndSession = async () => {
    const timeSpent = currentTrainingTime;
    setTrainingStatuses(prev => ({ ...prev, [activeStageId]: 'STOPPED' }));
    setTrainingTimes(prev => ({ ...prev, [activeStageId]: 0 }));

    if (presenceMode === 'SUBSTITUTE_MODE') {
      const activeFormatted = formatTime(timeSpent);
      const absentBestSeconds = playerBBestTiming?.seconds;
      const absentFormatted = playerBBestTiming?.formattedTime;

      let isWin = false;
      let title = '';
      let msg = '';
      let sub = '';

      if (absentBestSeconds && absentBestSeconds > 0) {
        if (timeSpent <= absentBestSeconds) {
          isWin = true;
          title = '🏆 ACTIVE SHINOBI WINS!';
          msg = `Your challenge time (${activeFormatted}) defeated the absent player's best record of ${absentFormatted}!`;
          sub = `The absent player's historical record remains safe and untouched at ${absentFormatted}.`;
        } else {
          isWin = false;
          title = "ABSENT SHINOBI'S BEST RECORD PREVAILED!";
          msg = `Their best recorded timing of ${absentFormatted} defended against your time (${activeFormatted}).`;
          sub = "Push your limits and train again to break their shadow ghost record!";
        }
      } else {
        isWin = true;
        title = '🏆 BENCHMARK RECORD ESTABLISHED!';
        msg = `The absent player had no prior recorded time. You established the benchmark at ${activeFormatted}!`;
        sub = 'Your recorded time will stand as the standard for future shinobi challenges.';
      }

      setSubstituteResult({
        isWinner: isWin,
        activeTime: activeFormatted,
        bestTime: absentFormatted || null,
        title,
        message: msg,
        submessage: sub,
      });

      // Save active player session to backend if room exists
      if (rivalRoom?.roomCode) {
        try {
          await fetch('/api/rivalry/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'STOP',
              roomCode: rivalRoom.roomCode,
              durationSeconds: timeSpent,
              completedTopics: [],
            }),
          });
        } catch (e) {
          console.error('Error saving session:', e);
        }
      }
    }
  };

  const baseline = baselines[activeStageId] ?? userCompletedTopics;
  const status = battleStatuses[activeStageId] ?? 'ACTIVE';
  const winner = winners[activeStageId] ?? null;

  // Initialize baseline if not set, or reset if completed topics is somehow lower than baseline
  useEffect(() => {
    if (baselines[activeStageId] === undefined || userCompletedTopics < (baselines[activeStageId] ?? 0)) {
      const newBaselines = { ...baselines, [activeStageId]: userCompletedTopics };
      setBaselines(newBaselines);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aniskill_rivalry_baselines', JSON.stringify(newBaselines));
      }
    }
  }, [activeStageId, userCompletedTopics, baselines]);

  // Round user progress (topics done in this round)
  const roundUserProgress = Math.max(0, userCompletedTopics - baseline);

  // Rival progress starts at 0 for fresh account or reflects rival state, based on round user progress
  const rivalRoundProgress = Math.min(
    activeStage.targetCount,
    roundUserProgress > 0 && rival?.streak && rival.streak > 0 
      ? Math.min(roundUserProgress + 1, activeStage.targetCount) 
      : 0
  );

  const isNarutoWinCompleted = winner === 'naruto' && status !== 'ACTIVE';

  const displayedUserTopics = isNarutoWinCompleted 
    ? activeStage.targetCount 
    : roundUserProgress;

  const displayedRivalTopics = isNarutoWinCompleted
    ? activeStage.targetCount - 1
    : rivalRoundProgress;

  const userChakraPercent = isNarutoWinCompleted
    ? Math.max(0, 100 - Math.round((displayedRivalTopics / activeStage.targetCount) * 100))
    : Math.max(0, 100 - Math.round((rivalRoundProgress / activeStage.targetCount) * 100));

  const rivalChakraPercent = isNarutoWinCompleted
    ? 0
    : Math.max(0, 100 - Math.round((roundUserProgress / activeStage.targetCount) * 100));

  const userProgressPercent = Math.min(100, Math.round((displayedUserTopics / activeStage.targetCount) * 100));

  const isUserLeading = displayedUserTopics > displayedRivalTopics;
  const isTied = displayedUserTopics === displayedRivalTopics;
  const topicDifference = Math.abs(displayedUserTopics - displayedRivalTopics);

  const isMissionComplete = displayedUserTopics >= activeStage.targetCount;

  // Determine if Naruto won (only for stage-1 for now, or active stage if characterA is naruto)
  useEffect(() => {
    if (status === 'ACTIVE' && roundUserProgress >= activeStage.targetCount && activeStage.characterA === 'naruto') {
      const newStatuses = { ...battleStatuses, [activeStageId]: 'VICTORY_PLAYING' as const };
      const newWinners = { ...winners, [activeStageId]: 'naruto' as const };
      
      setBattleStatuses(newStatuses);
      setWinners(newWinners);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aniskill_rivalry_statuses', JSON.stringify(newStatuses));
        localStorage.setItem('aniskill_rivalry_winners', JSON.stringify(newWinners));
      }
    }
  }, [roundUserProgress, status, activeStage, activeStageId, battleStatuses, winners]);

  return (
    <div className="w-full space-y-6 select-none">
      
      {/* 3-STAGE CINEMATIC TAB SELECTOR HEADER (ALL 3 STAGES ACCESSIBLE & UNLOCKED) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RIVALRY_STAGES.map((stage) => {
          const isActive = stage.id === activeStageId;

          return (
            <motion.button
              key={stage.id}
              onClick={() => {
                // If currently playing victory animation, prevent switching stages
                if (status === 'VICTORY_PLAYING') return;
                setActiveStageId(stage.id);
              }}
              whileHover={status === 'VICTORY_PLAYING' ? {} : { scale: 1.02 }}
              whileTap={status === 'VICTORY_PLAYING' ? {} : { scale: 0.98 }}
              className={`relative p-4 rounded-2xl border text-left transition-all overflow-hidden ${
                status === 'VICTORY_PLAYING' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border-orange-500/80 shadow-[0_0_25px_rgba(255,107,0,0.35)]'
                  : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 opacity-90'
              }`}
            >
              {/* Active Glow Accent Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeGlowBar"
                  className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-red-500"
                />
              )}

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-hud font-extrabold text-orange-400">{stage.stageNum}</span>
                  <span className="text-xs font-hud font-extrabold text-white uppercase tracking-wider">{stage.title}</span>
                </div>

                <span className="text-[9px] font-hud px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  {isActive ? 'ACTIVE' : 'AVAILABLE'}
                </span>
              </div>

              <div className="text-[11px] font-hud text-gray-400 mb-3 flex items-center justify-between">
                <span>{stage.userName.split(' ')[0]} VS {stage.rivalName.split(' ')[0]}</span>
                <span className="text-amber-400 font-bold">{stage.difficulty}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-hud bg-black/50 p-2 rounded-xl border border-zinc-800/80">
                <div className="flex items-center space-x-1.5 text-gray-400">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span>{stage.studyTime}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-gray-400 justify-end">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                  <span>{stage.topicTargetText}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* RIVALRY ARENA BATTLE CONTAINER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={`w-full relative rounded-3xl p-6 md:p-8 space-y-8 overflow-hidden ${
            (activeStageId === 'stage-1' || activeStageId === 'stage-2' || activeStageId === 'stage-3')
              ? 'bg-black/10' 
              : `bg-gradient-to-r ${activeStage.bgGradient} border ${activeStage.borderColor} shadow-[0_0_60px_rgba(0,0,0,0.8)]`
          }`}
        >
          {/* 1v1 SHINOBI ROOM ENTRY CONTROLS & PRESENCE MODE BAR */}
          <div className="p-4 rounded-2xl bg-black/60 border border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-4 relative z-20 font-hud">
            {!rivalRoom ? (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCreateRoom}
                  disabled={isRoomLoading}
                  className="px-5 py-2.5 rounded-xl font-extrabold text-xs text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>🥷 CREATE SHINOBI ROOM</span>
                </button>

                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-5 py-2.5 rounded-xl font-extrabold text-xs text-orange-300 border border-orange-500/40 bg-orange-950/40 hover:bg-orange-900/60 transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>⚔️ ENTER ROOM CODE</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 text-xs font-bold text-orange-300">
                <span className="px-3 py-1 rounded-lg bg-orange-950/80 border border-orange-500/40 text-orange-400">
                  ROOM CODE: {rivalRoom.roomCode}
                </span>
                <span className="text-slate-300">
                  STATUS: {rivalRoom.opponentId ? '2 / 2 SHINOBI' : '1 / 2 SHINOBI (OPPONENT ABSENT)'}
                </span>
              </div>
            )}

            {/* PRESENCE MODE SELECTOR TABS */}
            <div className="flex items-center space-x-2 bg-zinc-950/90 border border-zinc-800 p-1 rounded-xl text-[11px] font-hud">
              <button
                onClick={() => setPresenceMode('SUBSTITUTE_MODE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  presenceMode === 'SUBSTITUTE_MODE'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚔ SUBSTITUTE (RIVAL ABSENT)
              </button>
              <button
                onClick={() => setPresenceMode('NORMAL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  presenceMode === 'NORMAL'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👥 BOTH PRESENT (LIVE 1v1)
              </button>
              <button
                onClick={() => setPresenceMode('BOTH_ABSENT')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  presenceMode === 'BOTH_ABSENT'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⛔ BOTH ABSENT
              </button>
            </div>
          </div>

          {/* SUBSTITUTE CHALLENGE SPECIAL MODE CARD */}
          {presenceMode === 'SUBSTITUTE_MODE' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1c0d06] via-[#120703] to-[#1c0d06] border-2 border-orange-500/60 shadow-[0_0_40px_rgba(255,107,0,0.25)] relative z-20 space-y-4 font-hud"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-500/20 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Swords className="w-5 h-5 text-orange-400 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wider">
                    ⚔ RIVALRY — SUBSTITUTE CHALLENGE
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-orange-950/80 border border-orange-500/50 text-[10px] font-bold text-orange-400 uppercase tracking-widest self-start sm:self-auto">
                  SHADOW GHOST TRIAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/60 p-4 rounded-2xl border border-orange-500/30">
                {/* ACTIVE PLAYER (YOU) */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                    🟢
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">
                      {activeStage.userName} (YOU)
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                        ACTIVE
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        CURRENT: {formatTime(currentTrainingTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* VS CONNECTOR */}
                <div className="text-center font-extrabold text-xl text-orange-400 animate-pulse hidden md:block">
                  ⚔️ VS ⚔️
                </div>

                {/* ABSENT PLAYER (RIVAL) */}
                <div className="flex items-center space-x-3.5 justify-start md:justify-end">
                  <div className="text-left md:text-right">
                    <div className="text-xs text-gray-400 font-bold uppercase">
                      {activeStage.rivalName}
                    </div>
                    <div className="flex items-center space-x-2 md:justify-end">
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                        ABSENT
                      </span>
                      <span className="text-sm font-extrabold text-amber-300">
                        {playerBBestTiming?.formattedTime ? `BEST TIME: ${playerBBestTiming.formattedTime}` : 'NO BEST TIME RECORDED'}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-lg">
                    🟠
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-300 font-body leading-relaxed">
                ℹ️ <strong>Rule:</strong> You are competing against the absent player's authentic best recorded timing. Start the challenge to test your speed against their ghost benchmark. The absent player's record will <strong>never</strong> be overwritten.
              </p>
            </motion.div>
          )}

          {/* BOTH ABSENT SPECIAL BANNER */}
          {presenceMode === 'BOTH_ABSENT' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl bg-red-950/40 border-2 border-red-500/50 shadow-2xl relative z-20 text-center space-y-4 font-hud"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 text-2xl">
                ⛔
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white uppercase tracking-wider">
                  BOTH SHINOBI ARE ABSENT
                </h3>
                <p className="text-xs text-gray-300 font-body max-w-lg mx-auto">
                  Both Shinobi are currently absent from the arena. The rivalry challenge remains pending until at least one Shinobi enters the arena.
                </p>
              </div>

              <button
                onClick={() => setPresenceMode('SUBSTITUTE_MODE')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-black font-extrabold text-xs uppercase tracking-widest hover:from-orange-400 shadow-lg cursor-pointer"
              >
                🥷 ENTER ARENA AS ACTIVE SHINOBI
              </button>
            </motion.div>
          )}

          {/* Join Code Modal */}
          {showJoinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-hud">
              <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-[#1c120c] via-[#120a07] to-[#0a0503] border border-orange-500/40 text-slate-100 shadow-2xl space-y-4">
                <h3 className="text-lg font-extrabold text-white">ENTER 1v1 RIVALRY ROOM CODE</h3>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. AK-7X92"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-orange-500/30 text-white font-mono text-center tracking-widest text-lg"
                />
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    disabled={!joinCodeInput.trim() || isRoomLoading}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400"
                  >
                    JOIN ROOM
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ARENA HEADER BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4 relative z-20">
            <div className="flex items-center space-x-3">
              <Swords className="w-7 h-7 text-orange-500 animate-pulse" />
              <div>
                <span className="text-[10px] font-hud text-orange-400 tracking-widest uppercase">
                  {activeStage.subtitle} // STAGE {activeStage.stageNum}
                </span>
                <h2 className="font-hud font-extrabold text-2xl text-white tracking-wider">
                  {activeStage.title}: {activeStage.userName.split(' ')[0]} VS {activeStage.rivalName.split(' ')[0]}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`text-xs font-hud px-4 py-1.5 rounded-full font-bold tracking-widest uppercase ${activeStage.badgeClass}`}>
                DIFFICULTY: {activeStage.difficulty}
              </span>
            </div>
          </div>

          {/* DUAL CHARACTER ARENA COMPOSITION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-20">
            
            {/* CENTRAL ANIMATED CHAKRA VS COLLISION EMBLEM */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 150 }}
              className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 border-4 border-white text-black font-hud font-extrabold text-xl items-center justify-center z-30 shadow-[0_0_35px_rgba(255,107,0,0.9)] animate-pulse"
            >
              VS
            </motion.div>

            {/* LEFT SIDE: USER CHARACTER */}
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center p-6 rounded-3xl bg-black/40 border border-orange-500/30 relative shadow-2xl space-y-4"
            >
              <div className="w-full flex items-center justify-between text-xs font-hud">
                <span className="text-orange-400 font-extrabold uppercase tracking-widest flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>YOU ({activeStage.userName})</span>
                </span>
                <span className="text-cyan-400 font-bold">{userChakraPercent}% CHAKRA</span>
              </div>

              {/* Character Sticker Renderer */}
              <CharacterRenderer
                characterId={activeStage.characterA}
                state={winner === 'naruto' ? 'success' : 'challenge'}
                size="hero"
                showAura={true}
                overrideImagePath={
                  activeStage.characterA === 'naruto' ? '/images/rivalry_naruto_character.jpg' :
                  activeStage.characterA === 'kakashi' ? '/images/rivalry_kakashi_character.jpg' :
                  undefined
                }
              />

              {/* User Stats & Chakra Meter */}
              <div className="w-full space-y-3 p-4 rounded-2xl bg-black/70 border border-orange-500/30">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-hud font-extrabold text-orange-400 glow-orange-text">
                      {displayedUserTopics} / {activeStage.targetCount}
                    </div>
                    <div className="text-[10px] font-hud text-gray-400 uppercase">TO-DO ITEMS DONE</div>
                  </div>
                  <div>
                    <div className="text-2xl font-hud font-extrabold text-cyan-400 glow-cyan-text">
                      {userStudyHours}h
                    </div>
                    <div className="text-[10px] font-hud text-gray-400 uppercase">TOTAL STUDY</div>
                  </div>
                </div>

                {/* Chakra Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-hud text-gray-400 uppercase">
                    <span>CHAKRA LEVEL</span>
                    <span className={`text-orange-400 font-bold ${currentTrainingStatus === 'ACTIVE' ? 'animate-pulse' : ''}`}>
                      {userChakraPercent}% {currentTrainingStatus === 'ACTIVE' ? 'ACTIVE' : ''}
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border ${currentTrainingStatus === 'ACTIVE' ? 'border-orange-500 shadow-[0_0_15px_#FF6B00]' : 'border-orange-500/30'} p-0.5 transition-all duration-500`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${userChakraPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_#FF6B00]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE: RIVAL CHARACTER */}
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="flex flex-col items-center p-6 rounded-3xl bg-black/40 border border-indigo-500/30 relative shadow-2xl space-y-4"
            >
              <div className="w-full flex items-center justify-between text-xs font-hud">
                <span className="text-indigo-400 font-extrabold uppercase tracking-widest flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>RIVAL ({activeStage.rivalName})</span>
                </span>
                <span className="text-purple-400 font-bold">
                  {presenceMode === 'SUBSTITUTE_MODE' ? 'ABSENT' : `${rivalChakraPercent}% CHAKRA`}
                </span>
              </div>

              {/* Character Sticker Renderer */}
              <CharacterRenderer
                characterId={activeStage.characterB}
                state={winner === 'naruto' ? 'challenge' : 'challenge'}
                size="hero"
                showAura={true}
                overrideImagePath={
                  activeStage.characterB === 'sasuke' ? '/images/rivalry_sasuke_character.jpg' :
                  activeStage.characterB === 'obito' ? '/images/rivalry_obito_character.jpg' :
                  undefined
                }
              />

              {/* Rival Stats & Chakra Meter */}
              <div className="w-full space-y-3 p-4 rounded-2xl bg-black/70 border border-indigo-500/30 font-hud">
                {presenceMode === 'SUBSTITUTE_MODE' ? (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                      🟠 STATUS: ABSENT
                    </span>
                    <div className="text-lg font-extrabold text-white">
                      {playerBBestTiming?.formattedTime ? `BEST: ${playerBBestTiming.formattedTime}` : 'NO BEST TIME RECORDED'}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase">
                      BENCHMARK TIMING RECORD
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-hud font-extrabold text-indigo-400">
                        {rivalRoom && !isBothFinished ? '???' : displayedRivalTopics} / {activeStage.targetCount}
                      </div>
                      <div className="text-[10px] font-hud text-gray-400 uppercase">
                        {rivalRoom && !isBothFinished ? 'RIVAL IS TRAINING...' : 'TO-DO ITEMS DONE'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-hud font-extrabold text-purple-400">
                        {rivalRoom && !isBothFinished ? '🔒' : `${rival?.totalHours ?? 0}h`}
                      </div>
                      <div className="text-[10px] font-hud text-gray-400 uppercase">TOTAL STUDY</div>
                    </div>
                  </div>
                )}

                {/* Chakra Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-hud text-gray-400 uppercase">
                    <span>CHAKRA LEVEL</span>
                    <span className={`text-indigo-400 font-bold ${currentTrainingStatus === 'ACTIVE' ? 'animate-pulse' : ''}`}>
                      {rivalChakraPercent}% {currentTrainingStatus === 'ACTIVE' ? 'ACTIVE' : ''}
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border ${currentTrainingStatus === 'ACTIVE' ? 'border-indigo-500 shadow-[0_0_15px_#6366F1]' : 'border-indigo-500/30'} p-0.5 transition-all duration-500`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rivalChakraPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_#6366F1]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* TODAY'S MISSION & COMPARISON FOOTER */}
          <div className="space-y-4 pt-2 relative z-20">
            {/* Dynamic Lead Comparison Banner */}
            <div className="p-5 rounded-2xl bg-black/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-hud">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                <span className="text-gray-200">
                  {presenceMode === 'SUBSTITUTE_MODE' ? (
                    <>
                      ⚔️ <strong>SUBSTITUTE TRIAL:</strong> Competing against {activeStage.rivalName.split(' ')[0]}'s best timing of <strong className="text-orange-400">{playerBBestTiming?.formattedTime || 'NO BENCHMARK RECORD'}</strong>. Train hard to beat the ghost record!
                    </>
                  ) : displayedUserTopics === 0 && displayedRivalTopics === 0 ? (
                    <>BOTH SHINOBI ARE READY AT THE STARTING LINE! BEGIN YOUR TRAINING TO TAKE THE LEAD!</>
                  ) : isUserLeading ? (
                    <>YOU ARE LEADING BY <span className="text-orange-400 font-extrabold">{topicDifference} TOPICS</span>! KEEP BURNING YOUR WILL OF FIRE!</>
                  ) : isTied ? (
                    <>EVENLY MATCHED! BOTH SHINOBI ARE TIED AT <span className="text-amber-400 font-extrabold">{displayedUserTopics} TOPICS</span>!</>
                  ) : (
                    <>{activeStage.rivalName.split(' ')[0]} IS LEADING BY <span className="text-indigo-400 font-extrabold">{topicDifference} TOPICS</span>. STUDY NOW TO OVERTAKE HIM!</>
                  )}
                </span>
              </div>
              <span className="text-orange-400 font-bold mt-2 sm:mt-0 flex items-center space-x-1 uppercase tracking-wider">
                <span>ACADEMY BATTLE GOAL</span>
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            {/* Mission Progress Bar Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border border-orange-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-hud">
                <span className="text-gray-300 font-extrabold uppercase tracking-widest flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>TODAY'S MISSION PROGRESS</span>
                </span>
                <span className="text-orange-400 font-extrabold">
                  {displayedUserTopics} / {activeStage.targetCount} TOPICS COMPLETE ({userProgressPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-zinc-900 border border-orange-500/30 overflow-hidden p-0.5 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${userProgressPercent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 shadow-[0_0_15px_#FF6B00]"
                />
              </div>

              {/* Mission Complete Celebratory Banner */}
              {isMissionComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/60 flex items-center justify-center space-x-2 text-xs font-hud text-amber-300 font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  <span>MISSION COMPLETE! {displayedUserTopics} / {activeStage.targetCount} TOPICS. THE WILL OF FIRE BURNS BRIGHTER!</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* TRAINING SESSION CONTROL BAR */}
          <div className="relative z-20 pt-4">
            {currentTrainingStatus === 'STOPPED' ? (
              <button 
                onClick={handleStartTraining}
                disabled={presenceMode === 'BOTH_ABSENT'}
                className={`w-full py-5 rounded-2xl border-2 text-black font-hud font-extrabold text-xl tracking-widest uppercase transition-all transform shadow-2xl ${
                  presenceMode === 'BOTH_ABSENT'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 hover:from-orange-500 hover:to-red-500 border-orange-400/50 shadow-[0_0_30px_rgba(255,107,0,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                }`}
              >
                {presenceMode === 'BOTH_ABSENT' ? 'CANNOT START — BOTH SHINOBI ABSENT' : '⚔ START CHALLENGE'}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 p-6 rounded-2xl bg-black/80 border border-orange-500/50 shadow-[0_0_40px_rgba(255,107,0,0.2)]">
                <div className="flex-1 flex flex-col justify-center items-center sm:items-start">
                  <div className="flex items-center space-x-2 text-orange-400 font-hud font-extrabold uppercase tracking-widest text-sm mb-1">
                    <Zap className="w-5 h-5 animate-pulse" />
                    <span className={currentTrainingStatus === 'ACTIVE' ? 'animate-pulse' : ''}>
                      {currentTrainingStatus === 'ACTIVE' ? 'CHALLENGE ACTIVE' : 'CHALLENGE PAUSED'}
                    </span>
                  </div>
                  <div className="text-4xl font-hud font-extrabold text-white tracking-wider glow-white-text">
                    {formatTime(currentTrainingTime)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {currentTrainingStatus === 'ACTIVE' ? (
                    <button 
                      onClick={handlePauseTraining}
                      className="px-8 py-4 rounded-xl bg-black hover:bg-zinc-900 border border-orange-500/50 text-orange-400 font-hud font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(255,107,0,0.2)] cursor-pointer"
                    >
                      PAUSE
                    </button>
                  ) : (
                    <button 
                      onClick={handleStartTraining}
                      className="px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 border border-orange-400 text-black font-hud font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] cursor-pointer"
                    >
                      RESUME
                    </button>
                  )}
                  <button 
                    onClick={handleEndSession}
                    className="px-8 py-4 rounded-xl bg-zinc-900 hover:bg-red-950/50 border border-red-500/30 text-red-400 hover:text-red-300 font-hud font-bold tracking-widest uppercase transition-all cursor-pointer"
                  >
                    COMPLETE CHALLENGE
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SUBSTITUTE CHALLENGE RESULT MODAL OVERLAY */}
          {substituteResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-hud select-none"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-lg w-full bg-zinc-950 border-2 border-orange-500/60 p-6 sm:p-8 rounded-3xl shadow-[0_0_60px_rgba(255,107,0,0.35)] space-y-6 text-center"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-3xl ${
                  substituteResult.isWinner 
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400 animate-bounce'
                    : 'bg-zinc-800 border border-zinc-700 text-gray-300'
                }`}>
                  {substituteResult.isWinner ? '🏆' : '⚔️'}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-hud text-orange-400 font-extrabold uppercase tracking-widest">
                    SUBSTITUTE CHALLENGE RESULT
                  </span>
                  <h3 className="text-2xl font-extrabold text-white tracking-wider">
                    {substituteResult.title}
                  </h3>
                  <p className="text-sm text-gray-300 font-body">
                    {substituteResult.message}
                  </p>
                </div>

                {/* TIMING COMPARISON BOX */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/80 border border-orange-500/30">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      YOUR TIME (ACTIVE)
                    </span>
                    <span className="text-xl font-extrabold text-emerald-400 glow-emerald-text">
                      {substituteResult.activeTime}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      OPPONENT BEST RECORD
                    </span>
                    <span className="text-xl font-extrabold text-amber-400 glow-amber-text">
                      {substituteResult.bestTime || 'NO RECORD'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 italic">
                  🛡️ {substituteResult.submessage}
                </p>

                <button
                  onClick={() => setSubstituteResult(null)}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-black font-hud font-extrabold text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] cursor-pointer"
                >
                  ⚔ START NEXT CHALLENGE
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* VICTORY PLAYING VIDEO OVERLAY */}
          {status === 'VICTORY_PLAYING' && (
            <div className="absolute inset-0 z-50 bg-black flex items-center justify-center rounded-3xl overflow-hidden">
              <video
                src="/Naruto_Wins_—_Cinematic_Victor.mp4"
                autoPlay
                playsInline
                preload="auto"
                controls={false}
                className="w-full h-full object-contain"
                onEnded={() => {
                  const newStatuses = { ...battleStatuses, [activeStageId]: 'VICTORY_POPUP' as const };
                  setBattleStatuses(newStatuses);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('aniskill_rivalry_statuses', JSON.stringify(newStatuses));
                  }
                }}
                onError={(e) => {
                  console.error("Video error, skipping to popup", e);
                  const newStatuses = { ...battleStatuses, [activeStageId]: 'VICTORY_POPUP' as const };
                  setBattleStatuses(newStatuses);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('aniskill_rivalry_statuses', JSON.stringify(newStatuses));
                  }
                }}
              />
              <button
                onClick={() => {
                  const newStatuses = { ...battleStatuses, [activeStageId]: 'VICTORY_POPUP' as const };
                  setBattleStatuses(newStatuses);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('aniskill_rivalry_statuses', JSON.stringify(newStatuses));
                  }
                }}
                className="absolute top-4 right-4 z-[60] bg-black/60 hover:bg-black/90 border border-white/20 text-white font-hud px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Skip Cinema
              </button>
            </div>
          )}

          {/* VICTORY RESULT POPUP OVERLAY */}
          {status === 'VICTORY_POPUP' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-3xl"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="max-w-md w-full bg-zinc-950 border border-orange-500/40 p-8 rounded-2xl shadow-[0_0_50px_rgba(255,107,0,0.25)] space-y-6"
              >
                <Trophy className="w-16 h-16 text-orange-500 mx-auto animate-bounce" />
                <h3 className="font-hud font-extrabold text-2xl text-white uppercase tracking-wider">
                  VICTORY ACHIEVED!
                </h3>
                <p className="font-hud text-lg text-orange-400 font-bold leading-relaxed">
                  "Naruto wins this time. Better luck next time, Sasuke."
                </p>
                
                <button
                  onClick={() => {
                    const newBaselines = { ...baselines, [activeStageId]: userCompletedTopics };
                    const newStatuses = { ...battleStatuses, [activeStageId]: 'ACTIVE' as const };
                    const newWinners = { ...winners, [activeStageId]: null };
                    
                    setBaselines(newBaselines);
                    setBattleStatuses(newStatuses);
                    setWinners(newWinners);
                    
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('aniskill_rivalry_baselines', JSON.stringify(newBaselines));
                      localStorage.setItem('aniskill_rivalry_statuses', JSON.stringify(newStatuses));
                      localStorage.setItem('aniskill_rivalry_winners', JSON.stringify(newWinners));
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-black font-hud font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  START NEXT RIVALRY
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
