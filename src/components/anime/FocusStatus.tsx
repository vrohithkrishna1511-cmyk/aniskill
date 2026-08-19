'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield, Zap } from 'lucide-react';

interface FocusStatusProps {
  isActive: boolean;
}

export const FocusStatus: React.FC<FocusStatusProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel-cyan border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] text-cyan-300"
    >
      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
      <Eye className="w-3.5 h-3.5 text-cyan-400" />
      <span className="text-xs font-hud font-bold tracking-widest uppercase glow-cyan-text">
        TOBIRAMA FOCUS MODE ACTIVE
      </span>
    </motion.div>
  );
};
