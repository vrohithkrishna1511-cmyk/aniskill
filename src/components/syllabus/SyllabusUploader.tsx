'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Trash2, Plus, ArrowRight, ShieldCheck, FileCheck, AlertTriangle, Check } from 'lucide-react';

import { useApp } from '../../context/AppContext';

interface SyllabusUploaderProps {
  onAnalyze: (files: string[]) => void;
  title?: string;
  subtitle?: string;
}

export const SyllabusUploader: React.FC<SyllabusUploaderProps> = ({
  onAnalyze,
  title = "SHOW ME YOUR TRAINING GROUND",
  subtitle = "Upload screenshots of your complete syllabus from your learning portal."
}) => {
  const { refreshSyllabus } = useApp();
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Target modal state
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [targetOption, setTargetOption] = useState<string>('2 Months');
  const [customDays, setCustomDays] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedSubject, setExtractedSubject] = useState<any>(null);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadProgress(30);

    try {
      const readPromises = fileArray.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );

      setUploadProgress(70);
      const base64Results = await Promise.all(readPromises);
      setImages((prev) => [...prev, ...base64Results]);
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 300);
    } catch (err) {
      console.error('Error reading files:', err);
      setIsUploading(false);
    }
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleConfirmTarget = async () => {
    try {
      setIsProcessing(true);
      setUploadError(null);
      // Post to upload API
      const uploadRes = await fetch('/api/syllabus/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        setUploadError(uploadData.error || 'Failed to extract syllabus from uploaded screenshots.');
        setIsProcessing(false);
        return;
      }

      // Post to plan API
      const planRes = await fetch('/api/syllabus/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetOption, customDays }),
      });
      await planRes.json();

      setIsProcessing(false);
      setExtractedSubject(uploadData.subject);
    } catch (e: any) {
      console.error('Error confirming target plan:', e);
      setUploadError(e.message || 'An error occurred during syllabus upload.');
      setIsProcessing(false);
    }
  };

  const handleFinalizeImport = async () => {
    await refreshSyllabus();
    setShowTargetModal(false);
    setExtractedSubject(null);
    onAnalyze(images);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const item = updated.splice(from, 1)[0];
    updated.splice(to, 0, item);
    setImages(updated);
  };

  return (
    <div className="w-full glass-panel-orange rounded-3xl p-6 md:p-8 border border-orange-500/30 shadow-[0_0_40px_rgba(255,107,0,0.15)] space-y-6">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold font-hud tracking-wider text-white">
          {title}
        </h2>
        <p className="text-xs md:text-sm font-body text-slate-300 max-w-lg mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
          }
        }}
        className={`w-full border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer ${
          isDragging
            ? 'border-orange-400 bg-orange-950/40 shadow-[0_0_25px_rgba(255,107,0,0.3)]'
            : 'border-orange-500/30 bg-black/40 hover:border-orange-500/60 hover:bg-black/60'
        }`}
      >
        <label htmlFor="syllabus-file-input" className="cursor-pointer flex flex-col items-center w-full">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-2 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <span className="text-sm font-hud font-bold text-slate-200">
            DRAG & DROP MULTIPLE SCREENSHOTS HERE
          </span>
          <span className="text-xs font-body text-slate-400 mt-1">
            Supports PNG, JPG, WEBP from any Learning Portal / LMS
          </span>
          <span className="mt-3 px-4 py-2 rounded-xl text-xs font-hud font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-md">
            + ADD SCREENSHOTS
          </span>
          <input
            id="syllabus-file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Progress Bar (if uploading) */}
      {isUploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-hud text-orange-400">
            <span>UPLOADING SYLLABUS SCREENSHOTS...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-200" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded Screenshots Grid & Counter */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-hud font-bold text-orange-400 tracking-wider flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4" />
              <span>UPLOADED SYLLABUS SCROLLS ({images.length})</span>
            </span>
            <span className="text-[11px] font-hud text-gray-400">
              MULTIPLE SCREENSHOTS READY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <AnimatePresence>
              {images.map((imgUrl, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-video rounded-xl bg-zinc-900 overflow-hidden border border-orange-500/30 shadow-md"
                >
                  <img
                    src={imgUrl}
                    alt={`Syllabus Screenshot ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      // Fallback mock thumbnail graphic
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-2">
                    <span className="self-start text-[10px] font-hud px-2 py-0.5 rounded bg-black/70 text-orange-300 border border-orange-500/30">
                      PAGE {idx + 1}
                    </span>

                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1">
                        {idx > 0 && (
                          <button
                            onClick={() => handleMoveImage(idx, idx - 1)}
                            className="p-1 rounded bg-black/80 text-gray-300 hover:text-white text-[9px]"
                          >
                            ←
                          </button>
                        )}
                        {idx < images.length - 1 && (
                          <button
                            onClick={() => handleMoveImage(idx, idx + 1)}
                            className="p-1 rounded bg-black/80 text-gray-300 hover:text-white text-[9px]"
                          >
                            →
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 rounded bg-red-900/80 hover:bg-red-700 text-white transition-colors"
                        title="Remove Screenshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Target Timeframe Selection Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-hud">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#1c120c] via-[#120a07] to-[#0a0503] border border-orange-500/40 text-slate-100 shadow-2xl space-y-6">
            {extractedSubject ? (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>EXTRACTED CURRICULUM PREVIEW</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white uppercase tracking-wider">
                    {extractedSubject.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {extractedSubject.courses?.length || 0} COURSES / MODULES DETECTED
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-3 p-4 rounded-xl bg-black/60 border border-orange-500/30">
                  {extractedSubject.courses?.map((course: any, cIdx: number) => (
                    <div key={cIdx} className="space-y-1.5">
                      <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        {course.title} ({course.todoItems?.length || 0} TOPICS)
                      </div>
                      <ul className="text-xs text-slate-200 space-y-1 pl-3">
                        {course.todoItems?.map((item: any, iIdx: number) => (
                          <li key={iIdx} className="flex items-center space-x-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-orange-500/20 flex justify-end">
                  <button
                    type="button"
                    onClick={handleFinalizeImport}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2"
                  >
                    <span>IMPORT TO SYLLABUS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <span className="text-xs text-orange-400 uppercase tracking-widest">SYLLABUS TARGET PLANNER</span>
                  <h3 className="text-xl font-extrabold text-white">
                    HOW MUCH TIME DO YOU WANT TO TAKE TO COMPLETE THIS SYLLABUS?
                  </h3>
                </div>

                {uploadError && (
                  <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-hud space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>SYLLABUS OCR EXTRACTION ERROR</span>
                    </div>
                    <p className="font-body text-red-300">{uploadError}</p>
                    <p className="text-[11px] text-gray-400 pt-1">
                      Tip: Set <code className="text-orange-400 font-mono">GEMINI_API_KEY</code> in your <code className="text-orange-400 font-mono">.env</code> file.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {['1 Month', '2 Months', '3 Months', 'Custom'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTargetOption(opt)}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                        targetOption === opt
                          ? 'bg-orange-500 border-orange-400 text-black shadow-lg shadow-orange-500/20'
                          : 'bg-black/50 border-orange-500/20 text-slate-300 hover:border-orange-500/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {targetOption === 'Custom' && (
                  <div>
                    <label className="block text-xs uppercase text-orange-300 mb-1">Target Days</label>
                    <input
                      type="number"
                      value={customDays}
                      onChange={(e) => setCustomDays(Number(e.target.value))}
                      min={7}
                      max={365}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-orange-500/30 text-white"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-orange-500/20 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTargetModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmTarget}
                    className="flex-1 py-3 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <span>EXTRACTING WITH AI...</span>
                    ) : (
                      <>
                        <span>GENERATE AI STUDY PLAN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="pt-4 flex justify-end">
        <button
          disabled={images.length === 0 || isUploading}
          onClick={() => setShowTargetModal(true)}
          className={`px-8 py-4 rounded-xl font-hud font-bold text-sm text-black tracking-widest bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_25px_rgba(255,107,0,0.5)] flex items-center space-x-3 group transform hover:scale-105 active:scale-95 ${
            images.length === 0 || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>ANALYZE SYLLABUS</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
