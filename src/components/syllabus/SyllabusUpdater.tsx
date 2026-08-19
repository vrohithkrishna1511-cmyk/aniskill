'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, PlusCircle, MinusCircle, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { SyllabusUploader } from './SyllabusUploader';

interface SyllabusUpdaterProps {
  onUpdateConfirmed: () => void;
}

export const SyllabusUpdater: React.FC<SyllabusUpdaterProps> = ({ onUpdateConfirmed }) => {
  const [step, setStep] = useState<'UPLOAD' | 'COMPARISON'>('UPLOAD');
  const [newScreenshots, setNewScreenshots] = useState<string[]>([]);

  const handleUploadComplete = (files: string[]) => {
    setNewScreenshots(files);
    setStep('COMPARISON');
  };

  return (
    <div className="w-full space-y-6">
      {step === 'UPLOAD' ? (
        <SyllabusUploader
          title="UPDATE SYLLABUS SCROLLS"
          subtitle="Upload updated screenshots of your syllabus from your portal to compare changes."
          onAnalyze={handleUploadComplete}
        />
      ) : (
        <div className="glass-panel-orange rounded-3xl p-6 md:p-8 border border-orange-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-orange-500/20 pb-4">
            <div>
              <span className="text-xs font-hud text-orange-400 tracking-widest uppercase">
                OLD SYLLABUS VS NEW SYLLABUS
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-hud text-white mt-1">
                REVIEW DETECTED SYLLABUS CHANGES
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-hud">
              4 DIFF CHANGES FOUND
            </span>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Added Topics */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-hud text-xs font-bold">
                <PlusCircle className="w-4 h-4" />
                <span>+ 2 NEW TOPICS ADDED</span>
              </div>
              <ul className="text-xs font-body text-slate-300 space-y-1 pl-6 list-disc">
                <li>PyTorch Neural Networks & Tensors</li>
                <li>FastAPI Async Endpoint Optimization</li>
              </ul>
            </div>

            {/* Removed Topics */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-red-400 font-hud text-xs font-bold">
                <MinusCircle className="w-4 h-4" />
                <span>- 1 TOPIC REMOVED</span>
              </div>
              <ul className="text-xs font-body text-slate-300 space-y-1 pl-6 list-disc">
                <li>Legacy Python 2.7 Migration Syntax</li>
              </ul>
            </div>

            {/* Changed Topics */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-hud text-xs font-bold">
                <RefreshCw className="w-4 h-4" />
                <span>↻ 1 TOPIC ESTIMATED TIME CHANGED</span>
              </div>
              <ul className="text-xs font-body text-slate-300 space-y-1 pl-6 list-disc">
                <li>MVCC Postgres Transactions (60m → 90m)</li>
              </ul>
            </div>

            {/* Already Completed Preserved */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-hud text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ 6 COMPLETED TOPICS PRESERVED</span>
              </div>
              <p className="text-xs font-body text-slate-300">
                Your historical training progress and streak data will remain 100% intact.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-orange-500/20">
            <button
              onClick={() => setStep('UPLOAD')}
              className="px-5 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white glass-panel"
            >
              RE-UPLOAD SCREENSHOTS
            </button>

            <button
              onClick={onUpdateConfirmed}
              className="px-8 py-3.5 rounded-xl font-hud font-bold text-sm text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-lg flex items-center space-x-2"
            >
              <span>CONFIRM SYLLABUS UPDATE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
