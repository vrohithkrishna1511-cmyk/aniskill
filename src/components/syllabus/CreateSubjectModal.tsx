'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  CheckCircle2,
  Scan,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  Edit3,
  Check,
  BookOpen,
  Layers,
  Zap,
  Clock,
  Shield,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PracticeDifficulty } from '../../lib/ai/gemini';

export type SyllabusInputStep =
  | 'CREATE_SUBJECT'
  | 'CHOOSE_METHOD'
  | 'MANUAL_ENTRY'
  | 'SCREENSHOT_UPLOAD'
  | 'REVIEW_SCREEN';

interface ReviewTopicItem {
  id: string;
  title: string;
  unit: string;
  difficulty: PracticeDifficulty;
  selected: boolean;
  estimatedMinutes?: number;
}

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectId?: string | null;
  initialSubjectTitle?: string | null;
}

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  initialSubjectId = null,
  initialSubjectTitle = null,
}) => {
  const { addSubject, saveSubjectTopics, syllabus } = useApp();

  // Navigation step
  const [step, setStep] = useState<SyllabusInputStep>(
    initialSubjectId ? 'CHOOSE_METHOD' : 'CREATE_SUBJECT'
  );

  // Subject state
  const [subjectId, setSubjectId] = useState<string | null>(initialSubjectId);
  const [subjectTitle, setSubjectTitle] = useState<string>(initialSubjectTitle || '');
  const [subjectNameInput, setSubjectNameInput] = useState<string>('');
  const [isCreatingSubject, setIsCreatingSubject] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // SMART PASTE (Manual Entry) state - Starts completely empty
  const [rawSyllabusText, setRawSyllabusText] = useState<string>('');
  const [isAnalyzingText, setIsAnalyzingText] = useState<boolean>(false);

  // Screenshot Upload state
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  const [isAnalyzingOcr, setIsAnalyzingOcr] = useState<boolean>(false);
  const [ocrScanStep, setOcrScanStep] = useState<number>(0);

  // Review Screen state (Shared by both Manual Paste & Screenshot)
  const [reviewTopics, setReviewTopics] = useState<ReviewTopicItem[]>([]);
  const [reviewViewMode, setReviewViewMode] = useState<'BY_UNIT' | 'BY_LEVEL'>('BY_UNIT');
  const [originMethod, setOriginMethod] = useState<'MANUAL' | 'SCREENSHOT'>('MANUAL');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Inline "Add Missing Topic" state
  const [showAddMissingTopic, setShowAddMissingTopic] = useState<boolean>(false);
  const [newMissingTitle, setNewMissingTitle] = useState<string>('');
  const [newMissingUnit, setNewMissingUnit] = useState<string>('Unit 1');
  const [newMissingDifficulty, setNewMissingDifficulty] = useState<PracticeDifficulty>('EASY');

  const ocrSteps = [
    'UPLOADING PORTAL SCREENSHOTS...',
    'SCANNING SYLLABUS VIA CHAKRA OCR...',
    'EXTRACTING CURRICULUM TOPICS...',
    'ESTIMATING PRACTICE DIFFICULTY...',
    'SYLLABUS READY FOR REVIEW!'
  ];

  if (!isOpen) return null;

  // Handle Step 1: Create New Subject
  const handleCreateSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectNameInput.trim()) return;

    if (syllabus.subjects.length >= 10) {
      setErrorMsg('Subject limit reached (maximum 10 subjects per ninja).');
      return;
    }

    setIsCreatingSubject(true);
    setErrorMsg(null);

    const result = await addSubject(subjectNameInput.trim());
    setIsCreatingSubject(false);

    if (result.success && result.subject) {
      setSubjectId(result.subject.id);
      setSubjectTitle(result.subject.title);
      setStep('CHOOSE_METHOD');
    } else {
      setErrorMsg(result.error || 'Failed to create subject. Please try again.');
    }
  };

  // Handle Step 3 (Smart Paste): Analyze Text
  const handleAnalyzeSyllabusText = async () => {
    if (!rawSyllabusText.trim()) {
      setErrorMsg('Please paste your syllabus text into the input area before analyzing.');
      return;
    }

    setIsAnalyzingText(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/syllabus/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawSyllabusText.trim(),
          subjectTitle: subjectTitle || 'Subject',
        }),
      });

      const data = await res.json();
      if (!data.success || !data.courses) {
        setErrorMsg(data.error || 'Failed to analyze syllabus text.');
        setIsAnalyzingText(false);
        return;
      }

      // Convert parsed courses into Review items
      const items: ReviewTopicItem[] = [];
      data.courses.forEach((course: any, cIdx: number) => {
        const unitName = course.title || `Unit ${cIdx + 1}`;
        (course.todoItems || course.topics || []).forEach((item: any, iIdx: number) => {
          const rawTitle = typeof item === 'string' ? item : item.title || item.normalizedTitle;
          const diff: PracticeDifficulty = typeof item === 'object' && item.difficulty 
            ? (item.difficulty === 'HARD' || item.difficulty === 'COMPLEX' ? 'HARD' : item.difficulty === 'ADVANCED' ? 'ADVANCED' : item.difficulty === 'EASY' ? 'EASY' : 'MODERATE')
            : 'MODERATE';

          if (rawTitle && rawTitle.trim()) {
            items.push({
              id: `rev-${cIdx}-${iIdx}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              title: rawTitle.trim(),
              unit: unitName,
              difficulty: diff,
              selected: true,
              estimatedMinutes: item.estimatedMinutes || (diff === 'EASY' ? 15 : diff === 'ADVANCED' ? 45 : diff === 'HARD' ? 30 : 20),
            });
          }
        });
      });

      if (items.length === 0) {
        setErrorMsg('No distinct topics could be extracted. Please paste clear syllabus text.');
        setIsAnalyzingText(false);
        return;
      }

      setReviewTopics(items);
      setOriginMethod('MANUAL');
      setStep('REVIEW_SCREEN');
      setIsAnalyzingText(false);
    } catch (err: any) {
      console.error('Error analyzing syllabus text:', err);
      setErrorMsg(err.message || 'Error analyzing syllabus text.');
      setIsAnalyzingText(false);
    }
  };

  // Handle Step 3 (Screenshot): Upload & OCR
  const handleScreenshotFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploadingFiles(true);
      try {
        const fileArray = Array.from(e.target.files);
        const readPromises = fileArray.map(
          file =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        );
        const base64s = await Promise.all(readPromises);
        setUploadedScreenshots(prev => [...prev, ...base64s]);
        setIsUploadingFiles(false);
      } catch (err) {
        console.error('Error reading screenshot files:', err);
        setIsUploadingFiles(false);
      }
    }
  };

  const handleTriggerOcrExtraction = async () => {
    if (uploadedScreenshots.length === 0) return;
    setIsAnalyzingOcr(true);
    setOcrScanStep(1);
    setErrorMsg(null);

    try {
      setOcrScanStep(2);
      const res = await fetch('/api/syllabus/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: uploadedScreenshots }),
      });
      const data = await res.json();

      setOcrScanStep(3);

      if (!data.success && !data.detectedTopics && !data.courses) {
        setErrorMsg(data.error || 'Failed to extract topics from screenshots.');
        setIsAnalyzingOcr(false);
        return;
      }

      const items: ReviewTopicItem[] = [];
      const coursesData = data.courses || [
        {
          title: 'Unit 1: Core Fundamentals',
          todoItems: (data.detectedTopics || []).map((t: string) => ({ title: t, difficulty: 'MODERATE' })),
        },
      ];

      coursesData.forEach((course: any, cIdx: number) => {
        const unitName = course.title || `Unit ${cIdx + 1}`;
        (course.todoItems || course.topics || []).forEach((item: any, iIdx: number) => {
          const rawTitle = typeof item === 'string' ? item : item.title || item.normalizedTitle;
          const diff: PracticeDifficulty = typeof item === 'object' && item.difficulty 
            ? (item.difficulty === 'HARD' || item.difficulty === 'COMPLEX' ? 'HARD' : item.difficulty === 'ADVANCED' ? 'ADVANCED' : item.difficulty === 'EASY' ? 'EASY' : 'MODERATE')
            : 'MODERATE';

          if (rawTitle && rawTitle.trim()) {
            items.push({
              id: `ocr-${cIdx}-${iIdx}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              title: rawTitle.trim(),
              unit: unitName,
              difficulty: diff,
              selected: true,
              estimatedMinutes: item.estimatedMinutes || (diff === 'EASY' ? 15 : diff === 'ADVANCED' ? 45 : diff === 'HARD' ? 30 : 20),
            });
          }
        });
      });

      setReviewTopics(items);
      setOriginMethod('SCREENSHOT');
      setOcrScanStep(4);

      setTimeout(() => {
        setIsAnalyzingOcr(false);
        setStep('REVIEW_SCREEN');
      }, 500);
    } catch (e: any) {
      console.error('OCR Extraction error:', e);
      setErrorMsg(e.message || 'OCR Extraction failed.');
      setIsAnalyzingOcr(false);
    }
  };

  // Review Screen Operations
  const handleToggleTopicSelection = (id: string) => {
    setReviewTopics(prev =>
      prev.map(t => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleUpdateTopicTitle = (id: string, newTitle: string) => {
    setReviewTopics(prev =>
      prev.map(t => (t.id === id ? { ...t, title: newTitle } : t))
    );
  };

  const handleUpdateTopicDifficulty = (id: string, newDiff: PracticeDifficulty) => {
    setReviewTopics(prev =>
      prev.map(t => (t.id === id ? { ...t, difficulty: newDiff } : t))
    );
  };

  const handleDeleteTopic = (id: string) => {
    setReviewTopics(prev => prev.filter(t => t.id !== id));
  };

  const handleMoveTopic = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= reviewTopics.length) return;
    setReviewTopics(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Add Missing Topic Form Submit
  const handleAddMissingTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissingTitle.trim()) return;

    const newItem: ReviewTopicItem = {
      id: `manual-new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: newMissingTitle.trim(),
      unit: newMissingUnit.trim() || 'Unit 1',
      difficulty: newMissingDifficulty,
      selected: true,
      estimatedMinutes: newMissingDifficulty === 'EASY' ? 15 : newMissingDifficulty === 'ADVANCED' ? 45 : newMissingDifficulty === 'HARD' ? 30 : 20,
    };

    setReviewTopics(prev => [...prev, newItem]);
    setNewMissingTitle('');
    setShowAddMissingTopic(false);
  };

  // Save Syllabus to Database
  const handleSaveSyllabus = async () => {
    if (!subjectId) return;

    const selectedTopics = reviewTopics.filter(t => t.selected && t.title.trim().length > 0);
    if (selectedTopics.length === 0) {
      setErrorMsg('Please select or add at least one topic before saving.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    // Group selected topics into Courses by Unit
    const unitMap = new Map<string, ReviewTopicItem[]>();
    selectedTopics.forEach(t => {
      const unitKey = t.unit || 'Unit 1';
      if (!unitMap.has(unitKey)) {
        unitMap.set(unitKey, []);
      }
      unitMap.get(unitKey)!.push(t);
    });

    const coursesToSave = Array.from(unitMap.entries()).map(([unitTitle, items], cIdx) => ({
      title: unitTitle,
      order: cIdx,
      todoItems: items.map((item, iIdx) => ({
        title: item.title.trim(),
        normalizedTitle: item.title.trim(),
        difficulty: item.difficulty,
        targetMinutes: item.estimatedMinutes || (item.difficulty === 'EASY' ? 15 : item.difficulty === 'ADVANCED' ? 45 : item.difficulty === 'HARD' ? 30 : 20),
        estimatedMinutes: item.estimatedMinutes || (item.difficulty === 'EASY' ? 15 : item.difficulty === 'ADVANCED' ? 45 : item.difficulty === 'HARD' ? 30 : 20),
        order: iIdx,
      })),
    }));

    const res = await saveSubjectTopics(subjectId, coursesToSave, true);
    setIsSaving(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to save syllabus topics.');
    }
  };

  // Difficulty metrics helpers
  const countEasy = reviewTopics.filter(t => t.selected && t.difficulty === 'EASY').length;
  const countModerate = reviewTopics.filter(t => t.selected && t.difficulty === 'MODERATE').length;
  const countHard = reviewTopics.filter(t => t.selected && t.difficulty === 'HARD').length;
  const countAdvanced = reviewTopics.filter(t => t.selected && t.difficulty === 'ADVANCED').length;
  const totalSelected = reviewTopics.filter(t => t.selected).length;

  // Distinct units for group view
  const distinctUnits = Array.from(new Set(reviewTopics.map(t => t.unit || 'Unit 1')));

  // Distinct levels for practice level view
  const levelsList: { key: PracticeDifficulty; label: string; desc: string; color: string; badge: string }[] = [
    {
      key: 'EASY',
      label: 'LEVEL 1 — EASY',
      desc: 'Foundational syntax, variables, basic I/O (~15 min)',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
      badge: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
    },
    {
      key: 'MODERATE',
      label: 'LEVEL 2 — MODERATE',
      desc: 'Conditionals, loops, functions, lists, basic structures (~20 min)',
      color: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
      badge: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    },
    {
      key: 'HARD',
      label: 'LEVEL 3 — HARD',
      desc: 'OOP, recursion, complex data structures, exceptions (~30 min)',
      color: 'border-rose-500/40 text-rose-400 bg-rose-950/20',
      badge: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
    },
    {
      key: 'ADVANCED',
      label: 'LEVEL 4 — ADVANCED',
      desc: 'Advanced algorithms, dynamic programming, system architecture (~45 min)',
      color: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
      badge: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-3xl bg-zinc-950/95 border border-orange-500/40 rounded-3xl shadow-[0_0_50px_rgba(255,107,0,0.25)] p-5 sm:p-8 space-y-6 text-slate-100 relative my-auto overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-orange-500/10 blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#FF6B00]" />
            <span className="text-[11px] font-hud tracking-widest uppercase text-orange-400 font-bold">
              ANISKILL • SMART SYLLABUS FORGE
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-hud flex items-start space-x-3 shadow-lg relative z-10">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold uppercase tracking-wider text-red-400">ERROR:</span>{' '}
              {errorMsg}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-white font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* STEP 1: CREATE NEW SUBJECT */}
        {step === 'CREATE_SUBJECT' && (
          <div className="space-y-6 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">
                STEP 1 OF 2
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-hud text-white tracking-wider uppercase">
                CREATE NEW SUBJECT
              </h2>
              <p className="text-xs font-body text-gray-400">
                Enter your subject title. Next, you will paste your complete syllabus to auto-extract topics.
              </p>
            </div>

            <form onSubmit={handleCreateSubjectSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-hud text-gray-300 uppercase tracking-widest flex items-center justify-between">
                  <span>Subject Name:</span>
                  <span className="text-[10px] text-orange-400 font-mono">REQUIRED</span>
                </label>
                <input
                  type="text"
                  data-tour="subject-name-input"
                  placeholder="e.g. Python Programming, Database Management, Data Structures"
                  value={subjectNameInput}
                  onChange={e => setSubjectNameInput(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700/80 rounded-2xl px-5 py-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 shadow-inner font-body transition-colors"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl font-hud text-xs text-gray-400 hover:text-white glass-panel cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  data-tour="create-subject-submit"
                  disabled={isCreatingSubject || !subjectNameInput.trim()}
                  className={`px-7 py-3.5 rounded-xl font-hud font-extrabold text-xs tracking-wider text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center space-x-2 ${
                    isCreatingSubject || !subjectNameInput.trim()
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer transform hover:scale-105 active:scale-95'
                  }`}
                >
                  <span>{isCreatingSubject ? 'CREATING SUBJECT...' : 'CREATE SUBJECT'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: CHOOSE SYLLABUS INPUT METHOD */}
        {step === 'CHOOSE_METHOD' && (
          <div className="space-y-6 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-[10px] font-hud uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span>SUBJECT: {subjectTitle}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-hud text-white tracking-wider uppercase mt-1">
                HOW DO YOU WANT TO ADD YOUR SYLLABUS?
              </h2>
              <p className="text-xs font-body text-gray-400">
                Select your preferred syllabus entry method for <strong>{subjectTitle}</strong>:
              </p>
            </div>

            {/* 2 CHOICE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Smart Paste */}
              <div
                data-tour="manual-entry-btn"
                onClick={() => setStep('MANUAL_ENTRY')}
                className="group relative p-6 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-orange-500/80 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-[0_0_25px_rgba(255,107,0,0.25)] transform hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-hud font-extrabold text-base text-white group-hover:text-orange-400 transition-colors tracking-wide">
                      ✍ ENTER MANUALLY (SMART PASTE)
                    </h3>
                    <span className="text-[10px] text-orange-400 font-mono font-bold tracking-wider">
                      RECOMMENDED • INSTANT PASTE
                    </span>
                  </div>
                  <p className="text-xs font-body text-gray-400 leading-relaxed">
                    Paste your entire syllabus directly from your college portal or document. ANISKILL parses units, extracts topics, and estimates practice levels automatically.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStep('MANUAL_ENTRY');
                  }}
                  className="w-full py-2.5 rounded-xl font-hud font-bold text-xs text-orange-300 bg-orange-950/60 border border-orange-500/40 hover:bg-orange-500 hover:text-black transition-all text-center tracking-wider cursor-pointer"
                >
                  [ ENTER MANUALLY ]
                </button>
              </div>

              {/* Option 2: Via Screenshot */}
              <div
                data-tour="screenshot-import-btn"
                onClick={() => setStep('SCREENSHOT_UPLOAD')}
                className="group relative p-6 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-400/80 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] transform hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-hud font-extrabold text-base text-white group-hover:text-amber-400 transition-colors tracking-wide">
                      📷 VIA SCREENSHOT
                    </h3>
                    <span className="text-[10px] text-amber-400 font-mono font-bold tracking-wider">
                      OCR EXTRACTION
                    </span>
                  </div>
                  <p className="text-xs font-body text-gray-400 leading-relaxed">
                    Upload syllabus screenshots or portal images. Our AI OCR extracts topics with difficulty estimation for your review.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStep('SCREENSHOT_UPLOAD');
                  }}
                  className="w-full py-2.5 rounded-xl font-hud font-bold text-xs text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-400 hover:text-black transition-all text-center tracking-wider cursor-pointer"
                >
                  [ VIA SCREENSHOT ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3A: SMART PASTE MODE (EMPTY LARGE TEXT AREA) */}
        {step === 'MANUAL_ENTRY' && (
          <div className="space-y-5 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">
                  ANISKILL // MANUAL SYLLABUS IMPORT
                </span>
                <span className="text-[10px] font-hud text-gray-400 uppercase">
                  SUBJECT: {subjectTitle}
                </span>
              </div>
              <h2 className="text-xl font-extrabold font-hud text-white tracking-wider uppercase">
                PASTE YOUR COMPLETE SYLLABUS
              </h2>
              <p className="text-xs font-body text-gray-400">
                You can paste the syllabus exactly as you received it from your college/portal. Plain text, units, modules, bullet points, or mixed formatting are all supported.
              </p>
            </div>

            {/* ONE LARGE EMPTY TEXT AREA */}
            <div className="space-y-2">
              <textarea
                data-tour="syllabus-textarea"
                value={rawSyllabusText}
                onChange={e => setRawSyllabusText(e.target.value)}
                placeholder="Paste your complete syllabus here..."
                rows={11}
                className="w-full bg-black/80 border border-zinc-700/80 focus:border-orange-500/80 rounded-2xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none shadow-inner font-body transition-colors resize-none leading-relaxed"
                autoFocus
              />
              <div className="flex items-center justify-between text-[11px] font-body text-gray-500">
                <span>ANISKILL will automatically analyze units, extract topics, and assign practice difficulty.</span>
                <span>{rawSyllabusText.length} characters</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setStep('CHOOSE_METHOD')}
                className="px-4 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white glass-panel flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>CHANGE METHOD</span>
              </button>

              <button
                type="button"
                data-tour="analyze-syllabus-btn"
                disabled={isAnalyzingText || !rawSyllabusText.trim()}
                onClick={handleAnalyzeSyllabusText}
                className={`px-7 py-3 rounded-xl font-hud font-extrabold text-xs tracking-wider text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center space-x-2 ${
                  isAnalyzingText || !rawSyllabusText.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer transform hover:scale-105'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isAnalyzingText ? 'ANALYZING SYLLABUS...' : 'ANALYZE SYLLABUS'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3B: SCREENSHOT UPLOAD */}
        {step === 'SCREENSHOT_UPLOAD' && (
          <div className="space-y-5 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">
                  SUBJECT: {subjectTitle}
                </span>
                <span className="text-[10px] font-hud text-gray-400">
                  {uploadedScreenshots.length} SCREENSHOTS
                </span>
              </div>
              <h2 className="text-xl font-extrabold font-hud text-white tracking-wider uppercase">
                IMPORT VIA SCREENSHOT
              </h2>
              <p className="text-xs font-body text-gray-400">
                Upload a screenshot or photo of your syllabus for <strong>{subjectTitle}</strong>.
              </p>
            </div>

            {!isAnalyzingOcr ? (
              <>
                {/* Drag and Drop Zone */}
                <div className="w-full border-2 border-dashed border-zinc-700/80 hover:border-orange-500/60 rounded-2xl p-6 bg-black/60 text-center flex flex-col items-center justify-center space-y-3 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-hud font-bold text-slate-200">
                    DRAG & DROP SYLLABUS SCREENSHOT(S) HERE
                  </span>
                  <input
                    type="file"
                    id="screenshot-modal-input"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleScreenshotFiles}
                  />
                  <label
                    htmlFor="screenshot-modal-input"
                    className="px-5 py-2 rounded-xl text-xs font-hud font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>📷 UPLOAD SCREENSHOT</span>
                  </label>
                </div>

                {/* Uploaded thumbnails */}
                {uploadedScreenshots.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                      SCREENSHOTS READY ({uploadedScreenshots.length})
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {uploadedScreenshots.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
                        >
                          <img src={img} alt="screenshot" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setUploadedScreenshots(prev => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute top-1 right-1 p-1 bg-red-950/80 border border-red-500/40 rounded text-red-400 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setStep('CHOOSE_METHOD')}
                    className="px-4 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white glass-panel flex items-center space-x-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>CHANGE METHOD</span>
                  </button>

                  <button
                    type="button"
                    disabled={uploadedScreenshots.length === 0}
                    onClick={handleTriggerOcrExtraction}
                    className={`px-7 py-3 rounded-xl font-hud font-extrabold text-xs tracking-wider text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center space-x-2 ${
                      uploadedScreenshots.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer transform hover:scale-105'
                    }`}
                  >
                    <Scan className="w-4 h-4" />
                    <span>DETECT SYLLABUS TOPICS</span>
                  </button>
                </div>
              </>
            ) : (
              /* OCR Processing Animation */
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                  <Scan className="w-6 h-6 text-orange-400 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-hud font-bold text-orange-400 tracking-wider">
                    {ocrSteps[ocrScanStep] || 'ANALYZING SCREENSHOTS...'}
                  </h4>
                  <p className="text-[10px] font-hud text-gray-500 uppercase">
                    ANALYZING SCREENSHOTS FOR {subjectTitle}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: REVIEW SCREEN (SMART PASTE & OCR REVIEW) */}
        {step === 'REVIEW_SCREEN' && (
          <div className="space-y-5 relative z-10">
            {/* Review Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-hud uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SYLLABUS ANALYSIS COMPLETE</span>
                </div>
                <span className="text-[10px] font-hud text-orange-400 uppercase font-bold">
                  SUBJECT: {subjectTitle}
                </span>
              </div>

              <h2 className="text-xl font-extrabold font-hud text-white tracking-wider uppercase mt-1">
                REVIEW & ORGANIZE SYLLABUS
              </h2>
              <p className="text-xs font-body text-gray-400">
                Review extracted topics, units, and practice difficulty levels before saving.
              </p>
            </div>

            {/* Difficulty Breakdown Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-[10px] font-hud font-bold text-emerald-400">LEVEL 1 (EASY)</span>
                <span className="text-xs font-mono font-extrabold text-emerald-300">{countEasy}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                <span className="text-[10px] font-hud font-bold text-amber-400">LEVEL 2 (MODERATE)</span>
                <span className="text-xs font-mono font-extrabold text-amber-300">{countModerate}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
                <span className="text-[10px] font-hud font-bold text-rose-400">LEVEL 3 (HARD)</span>
                <span className="text-xs font-mono font-extrabold text-rose-300">{countHard}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                <span className="text-[10px] font-hud font-bold text-purple-400">LEVEL 4 (ADVANCED)</span>
                <span className="text-xs font-mono font-extrabold text-purple-300">{countAdvanced}</span>
              </div>
            </div>

            {/* View Switching Tabs & Selection Quick Actions */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-800 pb-2 text-xs font-hud">
              {/* Tabs */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewViewMode('BY_UNIT')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reviewViewMode === 'BY_UNIT'
                      ? 'bg-orange-500 text-black font-extrabold shadow'
                      : 'text-gray-400 hover:text-white bg-zinc-900 border border-zinc-800'
                  }`}
                >
                  📂 BY UNIT / MODULE
                </button>
                <button
                  type="button"
                  onClick={() => setReviewViewMode('BY_LEVEL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reviewViewMode === 'BY_LEVEL'
                      ? 'bg-orange-500 text-black font-extrabold shadow'
                      : 'text-gray-400 hover:text-white bg-zinc-900 border border-zinc-800'
                  }`}
                >
                  ⚡ BY PRACTICE LEVEL
                </button>
              </div>

              {/* Bulk Select/Deselect */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-[11px]">
                  {totalSelected} OF {reviewTopics.length} SELECTED
                </span>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={() => setReviewTopics(prev => prev.map(t => ({ ...t, selected: true })))}
                  className="text-[11px] text-orange-400 hover:underline cursor-pointer"
                >
                  SELECT ALL
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={() => setReviewTopics(prev => prev.map(t => ({ ...t, selected: false })))}
                  className="text-[11px] text-gray-400 hover:underline cursor-pointer"
                >
                  DESELECT ALL
                </button>
              </div>
            </div>

            {/* TOPIC LIST (View 1: By Unit / Module) */}
            {reviewViewMode === 'BY_UNIT' && (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {distinctUnits.map(unitTitle => {
                  const unitItems = reviewTopics.filter(t => (t.unit || 'Unit 1') === unitTitle);
                  if (unitItems.length === 0) return null;

                  return (
                    <div key={unitTitle} className="space-y-2">
                      <div className="flex items-center space-x-2 px-1">
                        <span className="text-xs font-hud font-extrabold text-orange-400 uppercase tracking-wider">
                          {unitTitle}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ({unitItems.length} topics)
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {unitItems.map((topicItem) => {
                          const globalIdx = reviewTopics.findIndex(t => t.id === topicItem.id);

                          return (
                            <div
                              key={topicItem.id}
                              className={`flex items-center space-x-2 p-2 rounded-xl border transition-all ${
                                topicItem.selected
                                  ? 'bg-zinc-900/90 border-zinc-800 text-white'
                                  : 'bg-black/40 border-zinc-900 text-gray-500 opacity-60'
                              }`}
                            >
                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={topicItem.selected}
                                onChange={() => handleToggleTopicSelection(topicItem.id)}
                                className="w-4 h-4 rounded border-zinc-700 text-orange-500 focus:ring-orange-500 bg-black cursor-pointer flex-shrink-0"
                              />

                              {/* Editable topic title */}
                              <input
                                type="text"
                                value={topicItem.title}
                                onChange={e => handleUpdateTopicTitle(topicItem.id, e.target.value)}
                                placeholder="Topic title..."
                                className="flex-1 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:bg-black/50 rounded-lg font-body"
                              />

                              {/* Difficulty Selector Dropdown */}
                              <select
                                value={topicItem.difficulty}
                                onChange={e => handleUpdateTopicDifficulty(topicItem.id, e.target.value as PracticeDifficulty)}
                                className={`text-[10px] font-hud font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                  topicItem.difficulty === 'EASY'
                                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                                    : topicItem.difficulty === 'ADVANCED'
                                    ? 'bg-purple-950/80 border-purple-500/50 text-purple-400'
                                    : topicItem.difficulty === 'HARD'
                                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-400'
                                    : 'bg-amber-950/80 border-amber-500/50 text-amber-400'
                                }`}
                              >
                                <option value="EASY" className="bg-zinc-900 text-emerald-400">EASY</option>
                                <option value="MODERATE" className="bg-zinc-900 text-amber-400">MODERATE</option>
                                <option value="HARD" className="bg-zinc-900 text-rose-400">HARD</option>
                                <option value="ADVANCED" className="bg-zinc-900 text-purple-400">ADVANCED</option>
                              </select>

                              {/* Move & Delete Controls */}
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <button
                                  type="button"
                                  disabled={globalIdx === 0}
                                  onClick={() => handleMoveTopic(globalIdx, 'up')}
                                  className={`p-1 text-gray-500 hover:text-white ${
                                    globalIdx === 0 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={globalIdx === reviewTopics.length - 1}
                                  onClick={() => handleMoveTopic(globalIdx, 'down')}
                                  className={`p-1 text-gray-500 hover:text-white ${
                                    globalIdx === reviewTopics.length - 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTopic(topicItem.id)}
                                  className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete Topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TOPIC LIST (View 2: By Practice Level) */}
            {reviewViewMode === 'BY_LEVEL' && (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {levelsList.map(lvl => {
                  const levelItems = reviewTopics.filter(t => t.difficulty === lvl.key);

                  return (
                    <div key={lvl.key} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-hud font-extrabold px-2 py-0.5 rounded-md border ${lvl.color}`}>
                            {lvl.label}
                          </span>
                          <span className="text-[10px] font-body text-gray-500">
                            {lvl.desc}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {levelItems.length} topics
                        </span>
                      </div>

                      {levelItems.length === 0 ? (
                        <div className="p-2 rounded-xl bg-black/30 border border-zinc-900 text-center text-[11px] font-body text-zinc-600">
                          No topics assigned to this practice level.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {levelItems.map((topicItem) => {
                            const globalIdx = reviewTopics.findIndex(t => t.id === topicItem.id);

                            return (
                              <div
                                key={topicItem.id}
                                className={`flex items-center space-x-2 p-2 rounded-xl border transition-all ${
                                  topicItem.selected
                                    ? 'bg-zinc-900/90 border-zinc-800 text-white'
                                    : 'bg-black/40 border-zinc-900 text-gray-500 opacity-60'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={topicItem.selected}
                                  onChange={() => handleToggleTopicSelection(topicItem.id)}
                                  className="w-4 h-4 rounded border-zinc-700 text-orange-500 focus:ring-orange-500 bg-black cursor-pointer flex-shrink-0"
                                />

                                <input
                                  type="text"
                                  value={topicItem.title}
                                  onChange={e => handleUpdateTopicTitle(topicItem.id, e.target.value)}
                                  placeholder="Topic title..."
                                  className="flex-1 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:bg-black/50 rounded-lg font-body"
                                />

                                {/* Unit Badge */}
                                <span className="text-[9px] font-hud text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                                  {topicItem.unit}
                                </span>

                                {/* Difficulty Selector */}
                                <select
                                  value={topicItem.difficulty}
                                  onChange={e => handleUpdateTopicDifficulty(topicItem.id, e.target.value as PracticeDifficulty)}
                                  className={`text-[10px] font-hud font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${lvl.badge}`}
                                >
                                  <option value="EASY" className="bg-zinc-900 text-emerald-400">EASY</option>
                                  <option value="MODERATE" className="bg-zinc-900 text-amber-400">MODERATE</option>
                                  <option value="HARD" className="bg-zinc-900 text-rose-400">HARD</option>
                                  <option value="ADVANCED" className="bg-zinc-900 text-purple-400">ADVANCED</option>
                                </select>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTopic(topicItem.id)}
                                  className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete Topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ADD MISSING TOPIC SINGLE INLINE CARD */}
            {!showAddMissingTopic ? (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddMissingTopic(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-hud font-bold text-orange-400 bg-orange-950/40 border border-orange-500/30 hover:bg-orange-900/60 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ADD MISSING TOPIC</span>
                </button>

                <span className="text-[11px] font-body text-gray-500">
                  Click to add any missing topic manually
                </span>
              </div>
            ) : (
              <form onSubmit={handleAddMissingTopicSubmit} className="p-3.5 rounded-2xl bg-zinc-900 border border-orange-500/50 space-y-3">
                <div className="text-[11px] font-hud text-orange-400 font-bold uppercase tracking-wider">
                  ADD MISSING TOPIC
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-hud text-gray-400 block mb-1">TOPIC NAME:</label>
                    <input
                      type="text"
                      placeholder="e.g. Recursion & Tree Traversal"
                      value={newMissingTitle}
                      onChange={e => setNewMissingTitle(e.target.value)}
                      className="w-full bg-black/70 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-body"
                      autoFocus
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-hud text-gray-400 block mb-1">DIFFICULTY:</label>
                    <select
                      value={newMissingDifficulty}
                      onChange={e => setNewMissingDifficulty(e.target.value as PracticeDifficulty)}
                      className="w-full bg-black/70 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-hud"
                    >
                      <option value="EASY">LEVEL 1 (EASY)</option>
                      <option value="MODERATE">LEVEL 2 (MODERATE)</option>
                      <option value="HARD">LEVEL 3 (HARD)</option>
                      <option value="ADVANCED">LEVEL 4 (ADVANCED)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] font-hud text-gray-400">UNIT / MODULE:</label>
                    <input
                      type="text"
                      placeholder="Unit 1"
                      value={newMissingUnit}
                      onChange={e => setNewMissingUnit(e.target.value)}
                      className="bg-black/70 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange-500 font-body w-32"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMissingTopic(false)}
                      className="px-3 py-1 rounded-lg text-xs font-hud text-gray-400 hover:text-white glass-panel cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={!newMissingTitle.trim()}
                      className="px-4 py-1 rounded-lg text-xs font-hud font-bold text-black bg-orange-500 hover:bg-orange-400 transition-colors cursor-pointer"
                    >
                      ADD TOPIC
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  if (originMethod === 'MANUAL') {
                    setStep('MANUAL_ENTRY');
                  } else {
                    setStep('SCREENSHOT_UPLOAD');
                  }
                }}
                className="px-4 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white glass-panel flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{originMethod === 'MANUAL' ? 'EDIT / RE-PASTE TEXT' : 'RE-UPLOAD SCREENSHOT'}</span>
              </button>

              <button
                type="button"
                data-tour="save-syllabus-btn"
                disabled={isSaving || totalSelected === 0}
                onClick={handleSaveSyllabus}
                className={`px-7 py-3 rounded-xl font-hud font-extrabold text-xs tracking-wider text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center space-x-2 ${
                  isSaving || totalSelected === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer transform hover:scale-105'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'SAVING SYLLABUS...' : 'SAVE SYLLABUS'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
