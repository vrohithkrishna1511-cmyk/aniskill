'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Trash2, Plus, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CompletionProofUploaderProps {
  onSubmitProof: () => void;
}

export const CompletionProofUploader: React.FC<CompletionProofUploaderProps> = ({ onSubmitProof }) => {
  const { 
    proofScreenshots, 
    addProofScreenshots, 
    removeProofScreenshot, 
    reorderProofScreenshots 
  } = useApp();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(100);

  const handleSimulatedProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(10);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            const newProofMocks = Array.from(e.target.files || []).map((_, i) =>
              `https://picsum.photos/seed/proof_${Date.now()}_${i}/800/500`
            );
            addProofScreenshots(newProofMocks);
            return 100;
          }
          return prev + 30;
        });
      }, 150);
    }
  };

  return (
    <div className="w-full glass-panel-orange rounded-3xl p-6 md:p-8 border border-orange-500/30 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-xs font-hud">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>VERIFICATION REQUIRED</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-hud tracking-wider text-white">
          SHOW YOUR PROGRESS
        </h2>
        <p className="text-xs md:text-sm font-body text-slate-300 max-w-md mx-auto">
          Upload screenshots proving today's training was completed in your learning portal. Multiple screenshots supported.
        </p>
      </div>

      {/* Drag & Drop Proof Uploader */}
      <div className="w-full border-2 border-dashed border-orange-500/30 bg-black/40 hover:border-orange-500/60 rounded-2xl p-8 text-center transition-all">
        <label htmlFor="proof-file-input" className="cursor-pointer flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-2">
            <UploadCloud className="w-7 h-7" />
          </div>
          <span className="text-sm font-hud font-bold text-slate-200">
            UPLOAD MULTIPLE COMPLETION SCREENSHOTS
          </span>
          <span className="text-xs font-body text-slate-400 mt-1">
            Portal Quiz Results, Progress Bar, or Completed Video Timestamp
          </span>
          <span className="mt-3 px-4 py-2 rounded-xl text-xs font-hud font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-md">
            + ADD PROOF
          </span>
          <input
            id="proof-file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleSimulatedProofUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-hud text-orange-400">
            <span>UPLOADING PROOF SCREENSHOTS...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Uploaded Proof Grid */}
      {proofScreenshots.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-hud">
            <span className="text-orange-400 font-bold flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4" />
              <span>PROOF ATTACHMENTS ({proofScreenshots.length})</span>
            </span>
            <span className="text-emerald-400">READY FOR ANALYSIS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <AnimatePresence>
              {proofScreenshots.map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-video rounded-xl bg-zinc-900 overflow-hidden border border-orange-500/30"
                >
                  <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-center justify-between">
                    <span className="text-[10px] font-hud text-orange-300">PROOF #{idx + 1}</span>
                    <button
                      onClick={() => removeProofScreenshot(idx)}
                      className="p-1.5 rounded bg-red-900 text-white"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs font-hud text-red-400 text-center">
          WITHOUT PROOF SCREENSHOTS, MISSION CANNOT BE MARKED COMPLETE.
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <button
          disabled={proofScreenshots.length === 0 || isUploading}
          onClick={onSubmitProof}
          className={`px-8 py-4 rounded-xl font-hud font-bold text-sm text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_25px_rgba(255,107,0,0.5)] flex items-center space-x-2 group ${
            proofScreenshots.length === 0 || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>SUBMIT FOR VERIFICATION</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
