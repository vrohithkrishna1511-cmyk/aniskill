'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RotateCcw, ArrowRight } from 'lucide-react';

interface ComebackBannerProps {
  onReturnToTraining: () => void;
}

export const ComebackBanner: React.FC<ComebackBannerProps> = ({ onReturnToTraining }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full glass-panel-purple rounded-2xl p-5 md:p-6 mb-6 border border-purple-500/40 shadow-[0_0_30px_rgba(157,78,221,0.2)] relative overflow-hidden"
    >
      <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-purple-900/30 to-transparent pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-400 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-hud font-bold text-purple-400 tracking-widest uppercase">
                SASUKE // RETURN TO SHADOWS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-hud bg-purple-900/50 border border-purple-500/30 text-purple-300">
                COMEBACK ACTIVE
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold font-title text-slate-100 mt-1">
              "You left the path. You came back. Now continue."
            </h3>
            <p className="text-xs font-body text-slate-400 mt-0.5">
              One missed day does not define your destiny. Reclaim your streak on the training ground today.
            </p>
          </div>
        </div>

        <button
          onClick={onReturnToTraining}
          className="px-5 py-2.5 rounded-xl font-hud font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg flex items-center space-x-2 transform hover:scale-105 flex-shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RETURN TO TRAINING</span>
        </button>
      </div>
    </motion.div>
  );
};
