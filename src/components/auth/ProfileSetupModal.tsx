'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Sparkles, User, Clock, Award, ShieldCheck } from 'lucide-react';
import { NicknameType, SHINOBI_TITLES } from '@/types';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onSave: (data: { shinobiName: string; nickname: NicknameType; dailyAvailableMinutes: number }) => void;
}

import { useApp } from '@/context/AppContext';

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onSave }) => {
  const { userProfile } = useApp();
  const [shinobiName, setShinobiName] = useState(userProfile?.name || '');
  const [nickname, setNickname] = useState<NicknameType>(userProfile?.nickname || '');
  const [dailyMinutes, setDailyMinutes] = useState(userProfile?.dailyTimeCommitmentMinutes || 60);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      shinobiName: shinobiName.trim() || 'Shinobi',
      nickname,
      dailyAvailableMinutes: Number(dailyMinutes) || 60,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#1c120c] via-[#120a07] to-[#0a0503] border border-orange-500/40 shadow-2xl text-slate-100 hud-box"
        >
          {/* Scroll Header Decoration */}
          <div className="flex items-center space-x-3 mb-6 border-b border-orange-500/30 pb-4">
            <Scroll className="w-7 h-7 text-orange-400 animate-pulse" />
            <div>
              <span className="text-xs font-hud text-orange-400 uppercase tracking-widest">
                ACADEMY REGISTRATION
              </span>
              <h2 className="text-xl font-extrabold font-hud text-white">
                SHINOBI PROFILE SETUP
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 font-hud">
            <div>
              <label className="block text-xs uppercase tracking-wider text-orange-300/80 mb-1.5 flex items-center space-x-2">
                <User className="w-4 h-4 text-orange-400" />
                <span>Shinobi Name</span>
              </label>
              <input
                type="text"
                value={shinobiName}
                onChange={(e) => setShinobiName(e.target.value)}
                placeholder="Enter your Shinobi Name"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-orange-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-orange-300/80 mb-1.5 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Ninja Title / Nickname</span>
              </label>
              <select
                value={nickname}
                onChange={(e) => setNickname(e.target.value as NicknameType)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-orange-500/30 text-white focus:outline-none focus:border-orange-500 transition-all"
              >
                <option value="" disabled className="bg-slate-900 text-gray-500">
                  Select Your Shinobi Title
                </option>
                {SHINOBI_TITLES.map((item) => (
                  <option key={item.title} value={item.title} className="bg-slate-900 text-white">
                    {item.title} — {item.character}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-orange-300/80 mb-1.5 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Daily Available Study Time (Minutes)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[60, 90, 120, 180].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setDailyMinutes(mins)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      dailyMinutes === mins
                        ? 'bg-orange-500 border-orange-400 text-black shadow-lg shadow-orange-500/20'
                        : 'bg-black/40 border-orange-500/20 text-slate-300 hover:border-orange-500/40'
                    }`}
                  >
                    {mins}m ({mins / 60}h)
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-orange-500/20">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center space-x-2 uppercase tracking-wider"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>ENTER SHINOBI ACADEMY</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
