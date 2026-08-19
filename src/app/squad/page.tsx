'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  LogIn, 
  Share2, 
  Trophy, 
  TrendingUp, 
  LogOut, 
  Sparkles, 
  Flame, 
  Sword, 
  ShieldAlert,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { CinematicBackground } from '../../components/anime/CinematicBackground';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { CharacterRenderer } from '../../components/anime/CharacterRenderer';

const SHINOBI_IDENTITIES = [
  {
    name: 'Naruto Uzumaki',
    title: 'Future Hokage & Kyuubi Jinchuriki',
    themeColor: 'from-orange-500 to-amber-500',
    glowColor: '#FF6B00',
    characterId: 'naruto' as const,
    imagePath: '/characters/squad/naruto.jpg',
  },
  {
    name: 'Sasuke Uchiha',
    title: 'Shadow Hokage & Uchiha Survivor',
    themeColor: 'from-indigo-600 to-cyan-500',
    glowColor: '#6366F1',
    characterId: 'sasuke' as const,
    imagePath: '/characters/squad/sasuke.png',
  },
  {
    name: 'Kakashi Hatake',
    title: 'Copy Ninja & Sixth Hokage',
    themeColor: 'from-blue-600 to-slate-400',
    glowColor: '#3B82F6',
    characterId: 'kakashi' as const,
    imagePath: '/characters/squad/kakashi.jpg',
  },
  {
    name: 'Minato — Yellow Flash of the Leaf',
    title: 'Fourth Hokage & Teleportation Master',
    themeColor: 'from-amber-400 to-yellow-500',
    glowColor: '#F59E0B',
    characterId: 'minato' as const,
    imagePath: '/characters/squad/minato.jpg',
  },
  {
    name: 'Jiraiya',
    title: 'Toad Sage & Legendary Mentor',
    themeColor: 'from-red-600 to-amber-600',
    glowColor: '#FF4500',
    characterId: 'jiraiya' as const,
    imagePath: '/characters/squad/jiraiya.png',
  },
  {
    name: 'Hinata Hyuga',
    title: 'Byakugan Princess of the Hyuga Clan',
    themeColor: 'from-pink-400 to-purple-600',
    glowColor: '#EC4899',
    characterId: 'sakura' as const,
    imagePath: '/characters/squad/hinata.png',
  },
  {
    name: 'Shikamaru Nara',
    title: 'Genius Strategist & Hokage Advisor',
    themeColor: 'from-emerald-600 to-slate-500',
    glowColor: '#10B981',
    characterId: 'tobirama' as const,
    imagePath: '/characters/squad/shikamaru.jpg',
  },
  {
    name: 'Gaara',
    title: 'Fifth Kazekage & Sand Controller',
    themeColor: 'from-amber-800 to-red-700',
    glowColor: '#D97706',
    characterId: 'obito' as const,
    imagePath: '/characters/squad/gaara.jpg',
  }
];

interface IdentitySelectorGridProps {
  squad: any;
  onSelect: (name: string) => void;
  onCancel?: () => void;
}

const IdentitySelectorGrid: React.FC<IdentitySelectorGridProps> = ({ squad, onSelect, onCancel }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {SHINOBI_IDENTITIES.map((identity) => {
          const takenMember = squad.members.find((m: any) => m.name === identity.name);
          const isTaken = !!takenMember;
          return (
            <motion.div
              key={identity.name}
              whileHover={isTaken ? {} : { scale: 1.02 }}
              className={`relative rounded-2xl border p-5 flex flex-col justify-between h-[360px] overflow-hidden transition-all ${
                isTaken 
                  ? 'bg-zinc-950/80 border-zinc-800 opacity-60' 
                  : `bg-gradient-to-b from-[#1a120b] to-[#0a0704] border-orange-500/20 hover:border-orange-500/60 shadow-[0_0_15px_rgba(0,0,0,0.5)]`
              }`}
              style={!isTaken ? { boxShadow: `0 0 20px ${identity.glowColor}15` } : {}}
            >
              {!isTaken && (
                <div 
                  className="absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-all group-hover:scale-150 animate-pulse"
                  style={{ backgroundColor: identity.glowColor, opacity: 0.15 }}
                />
              )}
              
              <div className="space-y-4 z-10">
                <div className="w-full h-32 flex items-center justify-center relative overflow-hidden bg-black/40 border border-gray-800/50 rounded-xl p-2">
                  <CharacterRenderer
                    characterId={identity.characterId}
                    overrideImagePath={identity.imagePath}
                    state="idle"
                    size="sm"
                    showAura={!isTaken}
                    interactive={!isTaken}
                  />
                </div>

                <div>
                  <h3 className={`font-hud font-extrabold text-base tracking-wide ${isTaken ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {identity.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-body">
                    {identity.title}
                  </p>
                </div>
              </div>

              <div className="space-y-3 z-10">
                {isTaken ? (
                  <div className="space-y-1">
                    <span className="w-full py-2 rounded-xl font-hud font-bold text-[10px] text-center bg-zinc-900 border border-zinc-800 text-zinc-500 tracking-wider flex items-center justify-center space-x-1 uppercase">
                      <span>TAKEN</span>
                    </span>
                    <span className="block text-center text-[9px] text-orange-500 font-hud tracking-wider uppercase">
                      Reserved by: {takenMember.isMe ? 'You' : takenMember.name.split(' ')[0]}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelect(identity.name)}
                    className="w-full py-2.5 rounded-xl font-hud font-bold text-[10px] text-black bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 transition-all cursor-pointer tracking-wider uppercase shadow-md"
                  >
                    SELECT
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {onCancel && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-hud font-bold text-xs text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white transition-all cursor-pointer"
          >
            CANCEL JOIN
          </button>
        </div>
      )}
    </div>
  );
};

export default function ShinobiStudySquadPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { 
    squad, 
    createSquad, 
    joinSquad, 
    leaveSquad, 
    selectShinobiIdentity,
    leaderOvertaken,
    setLeaderOvertaken,
    rankOvertaken,
    setRankOvertaken,
    isTrainingActive,
    trainingSeconds,
    userProfile
  } = useApp();

  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [simulatingMemberId, setSimulatingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (leaderOvertaken) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#FFD700', '#00F0FF']
      });
    }
  }, [leaderOvertaken]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    createSquad(createName.trim());
    setCreateName('');
    setErrorMsg(null);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const res = joinSquad(joinCode.trim());
    if (!res.success) {
      setErrorMsg(res.error || 'SQUAD NOT FOUND');
    } else {
      setJoinCode('');
      setErrorMsg(null);
    }
  };

  const copyToClipboard = () => {
    if (!squad) return;
    navigator.clipboard.writeText(squad.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSecondsToHM = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const meMember = squad?.members.find(m => m.isMe);
  const myRank = squad && meMember ? squad.leaderboardOrder.indexOf(meMember.id) + 1 : 0;
  
  const aboveMemberId = squad && myRank > 1 ? squad.leaderboardOrder[myRank - 2] : null;
  const aboveMember = squad && aboveMemberId ? squad.members.find(m => m.id === aboveMemberId) : null;
  
  const secondsNeeded = squad && meMember && aboveMember 
    ? Math.max(0, aboveMember.studyTimeSeconds - meMember.studyTimeSeconds) 
    : 0;

  return (
    <CinematicBackground theme="orange" backgroundImage="/images/squad_bg.jpg" overlayOpacity="bg-black/15">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      {/* NEW LEADER MODAL / OVERLAY */}
      <AnimatePresence>
        {leaderOvertaken && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-xl bg-gradient-to-b from-[#2e1d08] via-[#1a0f05] to-[#0a0703] border border-amber-400 rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_0_85px_rgba(245,158,11,0.5)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-transparent to-transparent pointer-events-none animate-pulse" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-full h-48 flex items-center justify-center mb-4">
                  <CharacterRenderer
                    characterId="naruto"
                    state="welcome"
                    size="lg"
                    showAura={true}
                  />
                </div>

                <span className="text-xs font-hud text-amber-400 tracking-[0.3em] uppercase mb-1 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>SQUAD LEADERBOARDS</span>
                </span>

                <h2 className="text-3xl md:text-4xl font-extrabold font-hud tracking-widest text-white mb-2">
                  NEW SQUAD LEADER!
                </h2>

                <p className="text-sm font-title text-amber-100 italic mb-6 max-w-md">
                  "You have overtaken rank #1. Your Will of Fire guides the entire squad!"
                </p>

                <button
                  onClick={() => setLeaderOvertaken(false)}
                  className="px-8 py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-[0_0_20px_rgba(255,107,0,0.5)] cursor-pointer"
                >
                  CONTINUE TRAINING
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RANK OVERTAKEN ALERT */}
      <AnimatePresence>
        {rankOvertaken && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="w-full max-w-md bg-zinc-950 border border-orange-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400">
                  <Sword className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              
              <h3 className="font-hud font-bold text-lg text-white uppercase tracking-wider">
                Rank Record Beaten!
              </h3>
              
              <p className="text-xs text-gray-300">
                You have overtaken <span className="text-orange-400 font-bold">{rankOvertaken}</span> in the leaderboard!
              </p>

              <button
                onClick={() => setRankOvertaken(null)}
                className="w-full py-2.5 rounded-xl font-hud font-bold text-xs text-black bg-orange-500 hover:bg-orange-400 transition-all cursor-pointer"
              >
                HELL YES
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIMULATED JOIN MODAL */}
      <AnimatePresence>
        {simulatingMemberId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl bg-gradient-to-b from-[#1c1107] via-[#0f0a05] to-[#050302] border border-orange-500/40 rounded-3xl p-6 md:p-8 relative overflow-y-auto max-h-[90vh] shadow-2xl"
            >
              <div className="text-center mb-6">
                <span className="text-xs font-hud text-orange-400 tracking-[0.2em] uppercase">NEW MEMBER JOINING</span>
                <h2 className="text-2xl font-extrabold font-hud text-white mt-1">SELECT SHINOBI IDENTITY FOR MEMBER</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Assign one of the remaining shinobi identities to the joining squad member.
                </p>
              </div>

              <IdentitySelectorGrid
                squad={squad}
                onSelect={(name) => {
                  const randomStudyTime = Math.floor((Math.random() * 5 + 1) * 3600); // 1-6 hours of initial mock study time
                  const res = selectShinobiIdentity(simulatingMemberId, name, randomStudyTime);
                  if (res && !res.success) {
                    setErrorMsg(res.error || 'COULD NOT SELECT IDENTITY');
                  } else {
                    setSimulatingMemberId(null);
                    setErrorMsg(null);
                  }
                }}
                onCancel={() => setSimulatingMemberId(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* TITLE SECTION */}
          <div>
            <span className="text-xs font-hud text-orange-400 uppercase tracking-widest">
              COOPERATIVE ACADEMY TRAINING
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-0.5">
              SHINOBI STUDY SQUAD
            </h1>
            <p className="text-xs font-body text-gray-400 mt-1">
              "Train together. Study together. Take their rank."
            </p>
          </div>

          {!squad || !squad.joined ? (
            /* JOIN / CREATE FORMS */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* CREATE SQUAD CARD */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-[#05050c]/35 backdrop-blur-[4px] rounded-3xl p-6 md:p-8 border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.15)] space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-hud font-extrabold text-lg text-white tracking-wider">
                      CREATE SQUAD
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Establish a private training ground for you and up to 7 friends. Invite them using a custom code.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-hud text-purple-300 uppercase tracking-wider">SQUAD NAME</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hidden Leaf Scholars" 
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      className="w-full bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/80 transition-all font-body"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!createName.trim()}
                    className="w-full py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-300 hover:to-indigo-400 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                  >
                    <span>SUMMON NEW SQUAD</span>
                  </button>
                </form>
              </motion.div>

              {/* JOIN SQUAD CARD */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-[#05050c]/35 backdrop-blur-[4px] rounded-3xl p-6 md:p-8 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-hud font-extrabold text-lg text-white tracking-wider">
                      JOIN SQUAD
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Enter an invite code provided by your companion to join their active squad and compete together.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleJoin} className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-hud text-cyan-300 uppercase tracking-wider">SQUAD INVITE CODE</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ANSK-4821" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="w-full bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/80 transition-all font-hud uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="w-full py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                  >
                    <span>ENTER SQUAD ROOM</span>
                  </button>
                </form>
              </motion.div>

              {errorMsg && (
                <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center space-x-3 text-red-400">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-hud font-bold uppercase">{errorMsg}</span>
                </div>
              )}
            </div>
          ) : !meMember ? (
            /* SELECT YOUR SHINOBI IDENTITY FIRST */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-black/60 border border-orange-500/30">
                <h3 className="font-hud font-extrabold text-lg text-white uppercase tracking-wider">
                  CHOOSE YOUR SHINOBI IDENTITY
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Select one of the 8 legendary shinobi to represent you in the squad: {squad.name}. Once chosen, it cannot be selected by anyone else in this squad.
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center space-x-3 text-red-400">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-hud font-bold uppercase">{errorMsg}</span>
                </div>
              )}

              <IdentitySelectorGrid
                squad={squad}
                onSelect={(name) => {
                  const res = selectShinobiIdentity('me', name, 0);
                  if (res && !res.success) {
                    setErrorMsg(res.error || 'COULD NOT SELECT IDENTITY');
                  } else {
                    setErrorMsg(null);
                  }
                }}
              />
            </div>
          ) : (
            /* ACTIVE SQUAD DISPLAY */
            <div className="space-y-8">
              
              {/* SQUAD OVERVIEW BANNER */}
              <div className="bg-[#05050c]/35 backdrop-blur-[4px] p-6 rounded-3xl border border-orange-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_0_30px_rgba(255,107,0,0.15)]">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-hud text-gray-400 uppercase tracking-widest">ACTIVE TRAINING CELL</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-hud font-bold">
                      {squad.members.length} / 8 SHINOBI
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold font-hud text-white tracking-wide uppercase">
                    {squad.name}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={copyToClipboard}
                    className="px-5 py-3 rounded-xl font-hud font-bold text-xs text-white glass-panel hover:border-orange-500/40 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>INVITE CODE: {squad.code}</span>
                  </button>

                  {squad.members.length < 8 && (
                    <button 
                      onClick={() => setSimulatingMemberId(`mock-${Date.now()}`)}
                      className="px-5 py-3 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>SIMULATE MEMBER JOIN</span>
                    </button>
                  )}

                  <button 
                    onClick={leaveSquad}
                    className="px-5 py-3 rounded-xl font-hud font-bold text-xs text-red-400 bg-red-950/20 border border-red-500/20 hover:border-red-500/50 hover:bg-red-950/40 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>RETREAT FROM SQUAD</span>
                  </button>
                </div>
              </div>

              {/* USER STATS OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-black/60 border border-orange-500/20 space-y-2">
                  <div className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">YOUR RANK</div>
                  <div className="text-3xl font-extrabold font-hud text-orange-400 glow-orange-text">
                    #{myRank}
                  </div>
                  <div className="text-xs text-slate-300">
                    Defend your position or ascend further!
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/20 space-y-2">
                  <div className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">STUDY TIME</div>
                  <div className="text-3xl font-extrabold font-hud text-cyan-400 glow-cyan-text flex items-center space-x-2">
                    <span>{formatSecondsToHM(meMember?.studyTimeSeconds || 0)}</span>
                    {isTrainingActive && (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300">
                    {isTrainingActive ? 'Currently training in the chamber!' : 'Use training timer to increase.'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-black/60 border border-amber-500/20 space-y-2">
                  <div className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">NEXT TARGET</div>
                  {aboveMember ? (
                    <>
                      <div className="text-3xl font-extrabold font-hud text-amber-400 tracking-wide truncate">
                        {aboveMember.name.split(' ')[0]}
                      </div>
                      <div className="text-xs text-slate-300">
                        Total record: {formatSecondsToHM(aboveMember.studyTimeSeconds)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-extrabold font-hud text-amber-400 tracking-wide">
                        SQUAD LEADER
                      </div>
                      <div className="text-xs text-slate-300">
                        You stand at the absolute pinnacle!
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* RANK CHALLENGE BANNER */}
              {myRank > 1 && aboveMember && (
                <div className="relative bg-gradient-to-r from-red-950/60 to-orange-950/60 border border-orange-500/40 p-5 rounded-2xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-orange-400">
                      <Sword className="w-5 h-5 animate-chakra-float" />
                    </div>
                    <div>
                      <h4 className="font-hud font-bold text-sm text-white tracking-wide uppercase">
                        ⚔️ CHALLENGE TO ASCEND
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Beat their record to take their rank.
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:text-right relative z-10">
                    <span className="font-hud font-extrabold text-sm sm:text-base text-orange-400 glow-orange-text uppercase tracking-wider block">
                      {formatSecondsToHM(secondsNeeded)} TO TAKE RANK #{myRank - 1}
                    </span>
                  </div>
                </div>
              )}

              {/* LEADERBOARD CARD */}
              <div className="glass-panel border border-orange-500/20 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <div>
                      <h3 className="font-hud font-extrabold text-lg text-white tracking-wider">
                        SHINOBI LEADERBOARD
                      </h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                        Will of Fire Study Rankings
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-hud text-gray-400 font-bold italic">
                    Record locks until overtaken
                  </span>
                </div>

                <div className="space-y-3">
                  {squad.leaderboardOrder.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-hud text-sm uppercase">
                      No members yet.
                    </div>
                  ) : (
                    squad.leaderboardOrder.map((id, index) => {
                      const member = squad.members.find(m => m.id === id);
                      if (!member) return null;

                      const isMe = member.isMe;
                      const displayRank = index + 1;
                      
                      let rankEmoji = '';
                      if (displayRank === 1) rankEmoji = '🥇';
                      else if (displayRank === 2) rankEmoji = '🥈';
                      else if (displayRank === 3) rankEmoji = '🥉';

                      return (
                        <motion.div 
                          key={member.id}
                          layoutId={`member-${member.id}`}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            isMe 
                              ? 'glass-panel-orange border-orange-500/50 shadow-[0_0_20px_rgba(255,107,0,0.15)]' 
                              : 'bg-black/40 border-gray-800/60 hover:bg-black/60'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-black/60 border border-gray-800 flex items-center justify-center text-sm font-hud font-bold text-gray-300">
                              {rankEmoji ? rankEmoji : `#${displayRank}`}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`font-hud font-bold text-sm ${isMe ? 'text-orange-400' : 'text-white'}`}>
                                  {member.name}
                                </span>
                                {isMe && (
                                  <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/40 text-[8px] font-hud text-orange-400 font-bold uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-hud tracking-wider">
                                {member.id.startsWith('mock') ? 'ACADEMY MOCK COMPANION' : 'SQUAD FOUNDER'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex items-center space-x-3">
                            <span className={`font-hud font-extrabold text-sm ${isMe ? 'text-cyan-400' : 'text-slate-300'}`}>
                              {formatSecondsToHM(member.studyTimeSeconds)}
                            </span>
                            {isMe && isTrainingActive && (
                              <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/30 text-[8px] font-hud text-cyan-400 font-bold uppercase tracking-wider animate-pulse">
                                TRAINING ACTIVE
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </CinematicBackground>
  );
}
