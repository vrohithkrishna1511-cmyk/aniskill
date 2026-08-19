'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Moon, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface ShinobiRestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRest: (reason: string) => void;
}

export const ShinobiRestModal: React.FC<ShinobiRestModalProps> = ({ isOpen, onClose, onConfirmRest }) => {
  const [reason, setReason] = useState('Shinobi Chakra Recovery');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onConfirmRest(reason);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-hud">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-[#191220] via-[#100b17] to-[#08050e] border border-purple-500/40 shadow-2xl text-slate-100 hud-box"
        >
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-purple-500/30">
            <Moon className="w-6 h-6 text-purple-400 animate-pulse" />
            <div>
              <span className="text-xs text-purple-400 uppercase tracking-widest">
                ABSENCE & RECOVERY
              </span>
              <h2 className="text-lg font-extrabold text-white">SHINOBI REST DAY</h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Need a rest day? Mark <strong className="text-purple-300">NOT TODAY</strong> to postpone your mission training to tomorrow while protecting your streak count.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-purple-300/80 mb-1">
                Reason for Rest (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Examinations, Recovery, Travel"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>Rest day rules: Maximum 3 approved rest days per month to maintain academy integrity.</span>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 shadow-lg shadow-purple-500/20"
              >
                APPROVE REST DAY
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
