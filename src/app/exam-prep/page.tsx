'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Flame, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Layers,
  ChevronRight,
  Upload,
  Check,
  XCircle,
  TrendingUp,
  Award,
  Trash2,
  FileText,
  CheckSquare,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { IbukiInstructor } from '../../components/anime/IbukiInstructor';
import { SyllabusUploader } from '../../components/syllabus/SyllabusUploader';

// Types for Exam Prep Planner
export interface VerifiedTopicItem {
  id: string;
  enteredTitle: string;
  matchedTopicId?: string;
  matchedTitle?: string;
  status: 'FOUND' | 'SIMILAR' | 'NOT_FOUND' | 'EXAM_ONLY';
  suggestedTopicId?: string;
  suggestedTitle?: string;
  userDecision?: 'USE_SUGGESTION' | 'KEEP_UNVERIFIED' | 'REMOVE' | 'KEEP_EXTRA';
  progress?: number;
  completed?: boolean;
  estimatedMinutes?: number;
}

export interface DayScheduleItem {
  dayNumber: number;
  dateStr: string;
  isRevisionDay: boolean;
  topics: {
    id: string;
    title: string;
    estimatedMinutes: number;
    completed: boolean;
  }[];
  allocatedMinutes: number;
}

export interface ExamPrepPlan {
  status: 'REALISTIC' | 'TIGHT_SCHEDULE' | 'DIFFICULT';
  examDate: string;
  subject: string;
  subjectId?: string;
  daysRemaining: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  remainingTopics: number;
  completionPercent: number;
  requiredHours: number;
  availableHours: number;
  dailyStudyMinutes: number;
  schedule: DayScheduleItem[];
  prioritizedTopics: { id: string; title: string; status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'; progress: number; isExamOnly?: boolean }[];
  updatedAt: string;
}

const IBUKI_INTRO_DIALOGUES = [
  "Your Chūnin Examination is approaching.",
  "I have analyzed your verified syllabus topics, current progress, and available study hours.",
  "Review your custom preparation roadmap below. Execution is everything."
];

// Helper function to verify entered topic lines against database syllabus topics (Source of Truth)
function verifySyllabusTopics(
  enteredLines: string[],
  dbSubject: any
): VerifiedTopicItem[] {
  const existingTopics: { id: string; title: string; completed: boolean; progress: number; estimatedMinutes: number }[] = [];
  
  if (dbSubject) {
    const coursesList = dbSubject.courses || dbSubject.chapters || [];
    coursesList.forEach((c: any) => {
      const items = c.todoItems || c.topics || [];
      items.forEach((t: any) => {
        existingTopics.push({
          id: t.id,
          title: t.title || t.name,
          completed: Boolean(t.completed || t.status === 'COMPLETED'),
          progress: t.progress !== undefined ? t.progress : t.completed ? 100 : 0,
          estimatedMinutes: t.estimatedMinutes || t.requiredMinutes || 30,
        });
      });
    });
  }

  // If no existing syllabus topics exist for this subject
  if (existingTopics.length === 0) {
    return enteredLines.map((line, idx) => ({
      id: `vtop-${idx}`,
      enteredTitle: line.trim(),
      status: 'EXAM_ONLY',
      userDecision: 'KEEP_EXTRA',
      progress: 0,
      completed: false,
      estimatedMinutes: 30,
    }));
  }

  return enteredLines.map((line, idx) => {
    const cleanLine = line.trim();
    const normLine = cleanLine.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Check exact / normalized match
    const exactMatch = existingTopics.find((t) => {
      const normDb = t.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normDb === normLine || normDb.includes(normLine) || normLine.includes(normDb);
    });

    if (exactMatch) {
      return {
        id: `vtop-${idx}`,
        enteredTitle: cleanLine,
        matchedTopicId: exactMatch.id,
        matchedTitle: exactMatch.title,
        status: 'FOUND',
        userDecision: 'USE_SUGGESTION',
        progress: exactMatch.progress,
        completed: exactMatch.completed,
        estimatedMinutes: exactMatch.estimatedMinutes,
      };
    }

    // 2. Check partial / fuzzy word match for SIMILAR
    const lineWords = cleanLine.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const similarMatch = existingTopics.find((t) => {
      const dbWords = t.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const commonWords = lineWords.filter((w) => dbWords.includes(w));
      return commonWords.length > 0;
    });

    if (similarMatch) {
      return {
        id: `vtop-${idx}`,
        enteredTitle: cleanLine,
        status: 'SIMILAR',
        suggestedTopicId: similarMatch.id,
        suggestedTitle: similarMatch.title,
        userDecision: undefined,
        progress: similarMatch.progress,
        completed: similarMatch.completed,
        estimatedMinutes: similarMatch.estimatedMinutes,
      };
    }

    // 3. NOT FOUND IN SYLLABUS
    return {
      id: `vtop-${idx}`,
      enteredTitle: cleanLine,
      status: 'NOT_FOUND',
      userDecision: undefined,
      progress: 0,
      completed: false,
      estimatedMinutes: 30,
    };
  });
}

export default function ChuninExamPrepPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { userProfile, updateUserProfile, syllabus, refreshSyllabus } = useApp();

  // 7-STEP WIZARD STATES
  const [step, setStep] = useState<
    | 'STEP_1_DATE'
    | 'STEP_2_SUBJECT'
    | 'STEP_3_TOPICS'
    | 'STEP_4_VERIFICATION'
    | 'STEP_5_PROGRESS'
    | 'STEP_6_FEASIBILITY'
    | 'STEP_7_SCHEDULE'
    | 'IBUKI_INTRO'
    | 'DASHBOARD'
  >('STEP_1_DATE');

  // STEP 1: Exam Date State (Empty by default until user chooses to create or selects an existing exam)
  const [selectedExamDate, setSelectedExamDate] = useState<string>('');
  const [savedExams, setSavedExams] = useState<any[]>([]);
  const [isCreatingExam, setIsCreatingExam] = useState<boolean>(false);

  // STEP 2: Subject State
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');
  const [isEnteringCustomSubject, setIsEnteringCustomSubject] = useState<boolean>(false);

  // STEP 3: Topic Input Mode & Manual Text (Empty by default, ZERO demo topics)
  const [inputOption, setInputOption] = useState<'MANUAL' | 'SCREENSHOT'>('MANUAL');
  const [manualTopicsText, setManualTopicsText] = useState<string>('');

  // STEP 4: Verified topics list
  const [verifiedTopics, setVerifiedTopics] = useState<VerifiedTopicItem[]>([]);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Active preparation plan
  const [activePlan, setActivePlan] = useState<ExamPrepPlan | null>(null);

  // Ibuki Dialogue state
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [advisorMessage, setAdvisorMessage] = useState<string>('');

  // Feasibility workload state
  const [tempDailyTime, setTempDailyTime] = useState<number>(userProfile.dailyTimeCommitmentMinutes || 60);

  // Fetch real saved exams from Supabase/Prisma for authenticated user
  const loadSavedExams = useCallback(async () => {
    try {
      const res = await fetch('/api/exam');
      const data = await res.json();
      if (data.success && Array.isArray(data.exams)) {
        setSavedExams(data.exams);
        if (data.exams.length > 0) {
          if (!selectedSubject && !isCreatingExam) {
            const first = data.exams[0];
            if (first.examDate) setSelectedExamDate(first.examDate);
            if (first.subject) setSelectedSubject(first.subject);
            if (first.subjectId) setSelectedSubjectId(first.subjectId);
            if (first.planData) {
              try {
                const parsed = typeof first.planData === 'string' ? JSON.parse(first.planData) : first.planData;
                setActivePlan(parsed);
                setStep('DASHBOARD');
              } catch (e) {}
            }
          }
        } else {
          // Zero exams in database -> Clean empty state
          setActivePlan(null);
          setSelectedExamDate('');
          setSelectedSubject('');
          setSelectedSubjectId('');
        }
      }
    } catch (err) {
      console.error('Error fetching saved exams:', err);
    }
  }, [isCreatingExam, selectedSubject]);

  useEffect(() => {
    loadSavedExams();
  }, [loadSavedExams]);

  // Handle Ibuki Typewriter
  useEffect(() => {
    if (step !== 'IBUKI_INTRO') return;
    setTypedText('');
    setIsSpeaking(true);
    const targetText = IBUKI_INTRO_DIALOGUES[dialogueIdx];
    let charIdx = 0;

    const interval = setInterval(() => {
      if (charIdx <= targetText.length) {
        setTypedText(targetText.substring(0, charIdx));
        charIdx++;
      } else {
        clearInterval(interval);
        setIsSpeaking(false);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [dialogueIdx, step]);

  const handleNextDialogue = () => {
    if (dialogueIdx < IBUKI_INTRO_DIALOGUES.length - 1) {
      setDialogueIdx((prev) => prev + 1);
    } else {
      setStep('DASHBOARD');
      setAdvisorMessage('Preparation roadmap generated. Follow your daily schedule strictly.');
    }
  };

  // STEP 1 HANDLER: Confirm Exam Date
  const handleConfirmDate = () => {
    if (!selectedExamDate) return;
    const matchingExam = savedExams.find((e) => e.examDate === selectedExamDate);
    if (matchingExam) {
      if (matchingExam.subject) setSelectedSubject(matchingExam.subject);
      if (matchingExam.subjectId) setSelectedSubjectId(matchingExam.subjectId);
    }
    setStep('STEP_2_SUBJECT');
  };

  // STEP 2 HANDLER: Subject Selection & Normalization
  const handleSelectSubjectName = (subjName: string, subjId?: string) => {
    const cleanName = subjName.trim();
    if (!cleanName) return;

    const matchingSub = syllabus.subjects.find(
      (s) => s.title.toLowerCase().trim() === cleanName.toLowerCase()
    );

    if (matchingSub) {
      setSelectedSubject(matchingSub.title);
      setSelectedSubjectId(matchingSub.id);
    } else {
      setSelectedSubject(cleanName);
      setSelectedSubjectId(subjId || '');
    }
    setStep('STEP_3_TOPICS');
  };

  // Target Subject in database
  const existingSubjectInDb = syllabus.subjects.find(
    (s) =>
      (selectedSubjectId && s.id === selectedSubjectId) ||
      s.title.toLowerCase().trim() === selectedSubject.toLowerCase().trim()
  );

  // STEP 3 HANDLER: Run Topic Verification
  const handleRunTopicVerification = () => {
    const lines = manualTopicsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;
    const verified = verifySyllabusTopics(lines, existingSubjectInDb);
    setVerifiedTopics(verified);
    setStep('STEP_4_VERIFICATION');
  };

  // Decision handlers for Similar / Not Found topics
  const handleDecision = (topicId: string, decision: 'USE_SUGGESTION' | 'KEEP_UNVERIFIED' | 'REMOVE' | 'KEEP_EXTRA') => {
    setVerifiedTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, userDecision: decision } : t))
    );
  };

  // STEP 5 & 6 HANDLER: Run Feasibility Analysis & Roadmap Generation
  const runFeasibilityAnalysis = useCallback((): ExamPrepPlan => {
    const targetDailyMinutes = tempDailyTime || userProfile.dailyTimeCommitmentMinutes || 60;
    const activeVerified = verifiedTopics.filter((t) => t.userDecision !== 'REMOVE');

    const topicList: {
      id: string;
      title: string;
      status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
      progress: number;
      estimatedMinutes: number;
      isExamOnly?: boolean;
    }[] = [];

    activeVerified.forEach((vt) => {
      const finalTitle = vt.userDecision === 'USE_SUGGESTION' ? (vt.matchedTitle || vt.suggestedTitle || vt.enteredTitle) : vt.enteredTitle;
      const finalProgress = vt.progress || 0;
      let finalStatus: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' = 'NOT_STARTED';
      if (finalProgress >= 100 || vt.completed) {
        finalStatus = 'COMPLETED';
      } else if (finalProgress > 0) {
        finalStatus = 'IN_PROGRESS';
      }

      topicList.push({
        id: vt.matchedTopicId || vt.suggestedTopicId || vt.id,
        title: finalTitle,
        status: finalStatus,
        progress: finalProgress,
        estimatedMinutes: vt.estimatedMinutes || 30,
        isExamOnly: vt.status === 'EXAM_ONLY' || vt.status === 'NOT_FOUND',
      });
    });

    if (topicList.length === 0 && existingSubjectInDb) {
      const coursesList = existingSubjectInDb.courses || existingSubjectInDb.chapters || [];
      coursesList.forEach((c: any) => {
        const items = c.todoItems || c.topics || [];
        items.forEach((t: any) => {
          topicList.push({
            id: t.id,
            title: t.title || t.name,
            status: t.completed ? 'COMPLETED' : t.status || 'NOT_STARTED',
            progress: t.progress || (t.completed ? 100 : 0),
            estimatedMinutes: t.estimatedMinutes || t.requiredMinutes || 30,
            isExamOnly: false,
          });
        });
      });
    }

    const totalTopics = topicList.length;
    const completedTopics = topicList.filter((t) => t.status === 'COMPLETED').length;
    const inProgressTopics = topicList.filter((t) => t.status === 'IN_PROGRESS').length;
    const remainingTopicsList = topicList.filter((t) => t.status !== 'COMPLETED');
    const remainingTopicsCount = remainingTopicsList.length;

    const completionPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Calculate days remaining from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = selectedExamDate ? new Date(selectedExamDate) : new Date(Date.now() + 14 * 86400000);
    targetDate.setHours(0, 0, 0, 0);
    const timeDiff = targetDate.getTime() - today.getTime();
    const daysRemaining = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    // Workload calculation
    const rawRemainingMinutes = remainingTopicsList.reduce((acc, t) => acc + t.estimatedMinutes, 0);
    const revisionMinutes = Math.round(rawRemainingMinutes * 0.25);
    const totalRequiredMinutes = rawRemainingMinutes + revisionMinutes;

    const requiredHours = Number((totalRequiredMinutes / 60).toFixed(1));
    const totalAvailableMinutes = daysRemaining * targetDailyMinutes;
    const availableHours = Number((totalAvailableMinutes / 60).toFixed(1));

    // Determine readiness status
    let status: 'REALISTIC' | 'TIGHT_SCHEDULE' | 'DIFFICULT' = 'REALISTIC';
    if (totalAvailableMinutes >= totalRequiredMinutes * 1.15) {
      status = 'REALISTIC';
    } else if (totalAvailableMinutes >= totalRequiredMinutes * 0.8) {
      status = 'TIGHT_SCHEDULE';
    } else {
      status = 'DIFFICULT';
    }

    // Generate day-by-day prep schedule
    const schedule: DayScheduleItem[] = [];
    const studyDays = Math.max(1, daysRemaining - 1);
    const topicsPerDay = Math.ceil(remainingTopicsList.length / studyDays);

    let topicPointer = 0;
    for (let d = 1; d <= daysRemaining; d++) {
      const currentDayDate = new Date(today.getTime() + (d - 1) * 86400000);
      const dateStr = currentDayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      if (d === daysRemaining) {
        schedule.push({
          dayNumber: d,
          dateStr: `${dateStr} (FINAL REVISION)`,
          isRevisionDay: true,
          topics: [
            { id: 'rev-1', title: 'Comprehensive Exam Mock & Weak Spot Drill', estimatedMinutes: 45, completed: false },
            { id: 'rev-2', title: 'Final Formula & Keyword Flash Revision', estimatedMinutes: 45, completed: false },
          ],
          allocatedMinutes: 90,
        });
      } else {
        const dayTopics = remainingTopicsList.slice(topicPointer, topicPointer + topicsPerDay).map((t) => ({
          id: t.id,
          title: t.title,
          estimatedMinutes: t.estimatedMinutes,
          completed: false,
        }));
        topicPointer += topicsPerDay;
        const totalMins = dayTopics.reduce((a, b) => a + b.estimatedMinutes, 0);

        schedule.push({
          dayNumber: d,
          dateStr,
          isRevisionDay: false,
          topics: dayTopics,
          allocatedMinutes: totalMins,
        });
      }
    }

    const prioritizedTopics = [...remainingTopicsList, ...topicList.filter((t) => t.status === 'COMPLETED')].map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      progress: t.progress,
      isExamOnly: t.isExamOnly,
    }));

    return {
      status,
      examDate: selectedExamDate,
      subject: selectedSubject,
      subjectId: selectedSubjectId,
      daysRemaining,
      totalTopics,
      completedTopics,
      inProgressTopics,
      remainingTopics: remainingTopicsCount,
      completionPercent,
      requiredHours,
      availableHours,
      dailyStudyMinutes: targetDailyMinutes,
      schedule,
      prioritizedTopics,
      updatedAt: new Date().toISOString(),
    };
  }, [existingSubjectInDb, selectedExamDate, selectedSubject, selectedSubjectId, tempDailyTime, userProfile.dailyTimeCommitmentMinutes, verifiedTopics]);

  // Save generated plan to database
  const handleSaveAndProceedPlan = async (generatedPlan: ExamPrepPlan) => {
    setActivePlan(generatedPlan);
    setIsCreatingExam(false);
    try {
      await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          subjectId: selectedSubjectId,
          examDate: selectedExamDate,
          planData: generatedPlan,
        }),
      });
      loadSavedExams();
    } catch (err) {
      console.error('Error saving exam prep plan:', err);
    }
    setStep('IBUKI_INTRO');
  };

  // Delete Exam handler — Permanently removes exam record from database and returns to clean state
  const handleDeleteExam = async () => {
    setIsDeleting(true);
    try {
      const targetExam = savedExams.find(
        (e) => e.examDate === selectedExamDate || (activePlan && e.subject === activePlan.subject)
      );
      const examId = targetExam?.id;

      if (examId) {
        await fetch(`/api/exam?id=${examId}`, { method: 'DELETE' });
      }

      // Reset state cleanly without auto-substituting demo data
      setActivePlan(null);
      setSelectedExamDate('');
      setSelectedSubject('');
      setSelectedSubjectId('');
      setShowDeleteModal(false);
      setIsDeleting(false);
      setIsCreatingExam(false);

      const res = await fetch('/api/exam');
      const data = await res.json();
      if (data.success && Array.isArray(data.exams)) {
        setSavedExams(data.exams);
      }
      setStep('STEP_1_DATE');
    } catch (err) {
      console.error('Error deleting exam:', err);
      setIsDeleting(false);
    }
  };

  // Toggle topic completion inside the exam schedule
  const handleToggleScheduleTopic = (dayIdx: number, topicId: string) => {
    if (!activePlan) return;
    const updatedSchedule = activePlan.schedule.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      const updatedTopics = day.topics.map((t) => {
        if (t.id !== topicId) return t;
        return { ...t, completed: !t.completed };
      });
      return { ...day, topics: updatedTopics };
    });

    const updatedPlan: ExamPrepPlan = {
      ...activePlan,
      schedule: updatedSchedule,
      completedTopics: Math.min(activePlan.totalTopics, activePlan.completedTopics + 1),
      completionPercent: activePlan.totalTopics > 0 ? Math.round(((activePlan.completedTopics + 1) / activePlan.totalTopics) * 100) : activePlan.completionPercent,
    };

    setActivePlan(updatedPlan);
    fetch('/api/exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: activePlan.subject,
        subjectId: activePlan.subjectId,
        examDate: activePlan.examDate,
        planData: updatedPlan,
      }),
    }).catch(console.error);
  };

  // Format date nicely for display
  const formattedDisplayDate = selectedExamDate
    ? new Date(selectedExamDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-[center_center] bg-no-repeat bg-fixed text-slate-100 overflow-x-hidden"
      style={{ backgroundImage: 'url("/images/chuninexam_classroom.jpg")' }}
    >
      <div className="absolute inset-0 bg-[#120a05]/75 pointer-events-none" />
      <div className="relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
            {/* PAGE TITLE BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e121e]/80 border border-orange-500/30 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
              <div>
                <span className="text-xs font-hud text-orange-400 uppercase tracking-widest flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>REAL EXAM PLANNING SYSTEM</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-0.5">
                  CHŪNIN EXAM PREP
                </h1>
                <p className="text-xs font-hud text-gray-400 mt-1">
                  "Real exam dates. Real syllabus verification. Real feasibility analysis."
                </p>
              </div>

              {step === 'DASHBOARD' && activePlan && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2.5 rounded-xl font-hud font-bold text-xs text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 transition-all flex items-center space-x-2 cursor-pointer shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>DELETE EXAM</span>
                  </button>
                  <button
                    onClick={() => {
                      const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
                      setSelectedExamDate(defaultDate);
                      setSelectedSubject('');
                      setSelectedSubjectId('');
                      setIsCreatingExam(true);
                      setStep('STEP_1_DATE');
                    }}
                    className="px-4 py-2.5 rounded-xl font-hud font-bold text-xs text-orange-400 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>CREATE NEW EXAM PLAN</span>
                  </button>
                </div>
              )}
            </div>

            {/* CLEAN EMPTY STATE WHEN USER HAS NO SAVED EXAMS & IS NOT IN CREATION WIZARD */}
            {savedExams.length === 0 && !isCreatingExam && step === 'STEP_1_DATE' && !selectedExamDate && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 sm:p-12 rounded-3xl bg-[#0e121e]/90 border border-orange-500/40 text-center space-y-6 shadow-2xl backdrop-blur-md max-w-xl mx-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-orange-950/60 border border-orange-500/40 flex items-center justify-center mx-auto shadow-lg">
                  <Calendar className="w-8 h-8 text-orange-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-hud font-extrabold text-white">NO UPCOMING EXAMS</h2>
                  <p className="text-xs font-hud text-gray-400 leading-relaxed">
                    "Create an examination plan to start preparing."
                  </p>
                </div>
                <button
                  onClick={() => {
                    const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
                    setSelectedExamDate(defaultDate);
                    setIsCreatingExam(true);
                    setStep('STEP_1_DATE');
                  }}
                  className="px-8 py-4 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 transition-all shadow-lg inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>CREATE EXAM PLAN</span>
                </button>
              </motion.div>
            )}

            {/* 7-STEP EXAM PREPARATION WIZARD & DASHBOARD */}
            {(savedExams.length > 0 || isCreatingExam || selectedExamDate) && (
              <AnimatePresence mode="wait">
                {/* STEP 1: EXAM DATE */}
                {step === 'STEP_1_DATE' && (
                  <motion.div
                    key="step-1-date"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">STEP 1 OF 7</span>
                      <h2 className="text-xl font-hud font-bold text-white flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <span>EXAM DATE</span>
                      </h2>
                      <p className="text-xs font-hud text-gray-400">
                        "When is your examination?" Choose an upcoming examination date.
                      </p>
                    </div>

                    {savedExams.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-xs font-hud text-orange-300">YOUR SAVED EXAMINATIONS:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {savedExams.slice(0, 10).map((ex) => (
                            <button
                              key={ex.id}
                              onClick={() => {
                                setSelectedExamDate(ex.examDate);
                                if (ex.subject) setSelectedSubject(ex.subject);
                                if (ex.subjectId) setSelectedSubjectId(ex.subjectId);
                                if (ex.planData) {
                                  try {
                                    const parsed = typeof ex.planData === 'string' ? JSON.parse(ex.planData) : ex.planData;
                                    setActivePlan(parsed);
                                    setStep('DASHBOARD');
                                  } catch (e) {}
                                }
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                                selectedExamDate === ex.examDate
                                  ? 'bg-orange-500/20 border-orange-400 shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                                  : 'bg-black/40 border-gray-700/60 hover:border-orange-500/40'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-hud font-extrabold text-white">{ex.subject || 'GENERAL EXAM'}</span>
                                <Calendar className="w-4 h-4 text-orange-400" />
                              </div>
                              <div className="text-sm font-hud font-bold text-orange-300">{ex.examDate}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-5 rounded-2xl bg-black/50 border border-orange-500/40 space-y-3 max-w-md">
                      <label className="text-xs font-hud text-gray-300 flex items-center justify-between">
                        <span>SELECT EXAM DATE:</span>
                        <span className="text-[10px] text-orange-400 font-bold">{formattedDisplayDate}</span>
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedExamDate}
                        onChange={(e) => setSelectedExamDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black border border-orange-500/40 text-sm font-hud text-white focus:outline-none focus:border-orange-400"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex justify-end">
                      <button
                        onClick={handleConfirmDate}
                        disabled={!selectedExamDate}
                        className="px-6 py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 transition-all shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>CONTINUE ({formattedDisplayDate || selectedExamDate})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: EXAM SUBJECT */}
                {step === 'STEP_2_SUBJECT' && (
                  <motion.div
                    key="step-2-subject"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">STEP 2 OF 7</span>
                      <h2 className="text-xl font-hud font-bold text-white flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-orange-400" />
                        <span>SELECT EXAM SUBJECT ({formattedDisplayDate})</span>
                      </h2>
                      <p className="text-xs font-hud text-gray-400">
                        "What subject is this examination for?" Select an existing subject or enter a custom subject.
                      </p>
                    </div>

                    {/* A: Existing Syllabus Subjects */}
                    {syllabus.subjects.length > 0 ? (
                      <div className="space-y-3">
                        <label className="text-xs font-hud text-orange-300">SELECT FROM YOUR EXISTING SUBJECTS:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {syllabus.subjects.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSelectSubjectName(sub.title, sub.id)}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                selectedSubject.toLowerCase().trim() === sub.title.toLowerCase().trim()
                                  ? 'bg-orange-500/20 border-orange-400 shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                                  : 'bg-black/40 border-gray-700/60 hover:border-orange-500/40'
                              }`}
                            >
                              <div>
                                <div className="text-sm font-hud font-extrabold text-white">{sub.title}</div>
                                <div className="text-[10px] font-hud text-gray-400 mt-1">
                                  {(sub.courses || sub.chapters || []).length} COURSES / MODULES
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-orange-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-black/50 border border-orange-500/30 text-center space-y-2">
                        <span className="text-xs font-hud text-gray-300 font-bold uppercase tracking-wider">NO SUBJECTS FOUND</span>
                        <p className="text-xs font-hud text-gray-400 max-w-md mx-auto">
                          Add a subject and syllabus before creating an exam plan, or enter an exam subject manually.
                        </p>
                      </div>
                    )}

                    {/* B: Manual Subject Entry */}
                    <div className="space-y-3 pt-2">
                      {!isEnteringCustomSubject && syllabus.subjects.length > 0 ? (
                        <button
                          onClick={() => setIsEnteringCustomSubject(true)}
                          className="px-5 py-3 rounded-xl font-hud font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-orange-400" />
                          <span>ENTER SUBJECT NAME MANUALLY</span>
                        </button>
                      ) : (
                        <div className="p-5 rounded-2xl bg-black/50 border border-orange-500/40 space-y-3 max-w-md">
                          <label className="text-xs font-hud text-gray-300">ENTER SUBJECT NAME:</label>
                          <input
                            type="text"
                            value={customSubjectInput}
                            onChange={(e) => setCustomSubjectInput(e.target.value)}
                            placeholder="Enter subject name (e.g. Python, Mathematics, DSA)"
                            className="w-full px-4 py-3 rounded-xl bg-black border border-orange-500/40 text-sm font-hud text-white focus:outline-none focus:border-orange-400"
                          />
                          <button
                            onClick={() => handleSelectSubjectName(customSubjectInput)}
                            disabled={!customSubjectInput.trim()}
                            className="px-5 py-2.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 transition-all cursor-pointer disabled:opacity-50"
                          >
                            USE THIS SUBJECT
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex justify-between">
                      <button
                        onClick={() => setStep('STEP_1_DATE')}
                        className="px-4 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white cursor-pointer"
                      >
                        ← BACK TO EXAM DATE
                      </button>

                      {selectedSubject && (
                        <button
                          onClick={() => setStep('STEP_3_TOPICS')}
                          className="px-6 py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 transition-all shadow-lg flex items-center space-x-2 cursor-pointer"
                        >
                          <span>NEXT: EXAM SYLLABUS ({selectedSubject})</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: EXAM SYLLABUS / TOPICS (NON-BLOCKING DUAL INPUT) */}
                {step === 'STEP_3_TOPICS' && (
                  <motion.div
                    key="step-3-topics"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">STEP 3 OF 7 — EXAM SYLLABUS / TOPICS</span>
                      <h2 className="text-xl font-hud font-bold text-white flex items-center space-x-2">
                        <Layers className="w-5 h-5 text-orange-400" />
                        <span>HOW DO YOU WANT TO PROVIDE YOUR EXAM SYLLABUS FOR {selectedSubject.toUpperCase()}?</span>
                      </h2>
                    </div>

                    {/* NON-BLOCKING SYLLABUS STATUS BANNER */}
                    {existingSubjectInDb ? (
                      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                        <div>
                          <h3 className="font-hud font-extrabold text-sm text-emerald-300">EXISTING SYLLABUS DETECTED ✓</h3>
                          <p className="text-xs font-hud text-emerald-200/80">
                            ANISKILL found existing topics for {selectedSubject}. You can type exam topics to verify against your syllabus, or upload new screenshots.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center space-x-3">
                        <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0" />
                        <div>
                          <h3 className="font-hud font-extrabold text-sm text-amber-300">NO EXISTING SYLLABUS FOUND</h3>
                          <p className="text-xs font-hud text-amber-200/80">
                            That's okay! You can provide your examination topics manually or upload screenshots of your examination syllabus.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* DUAL INPUT CHOICE TABS */}
                    <div className="flex border-b border-gray-800 space-x-4">
                      <button
                        onClick={() => setInputOption('MANUAL')}
                        className={`pb-3 text-xs font-hud font-bold cursor-pointer transition-all flex items-center space-x-2 border-b-2 ${
                          inputOption === 'MANUAL'
                            ? 'border-orange-500 text-orange-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>ENTER TOPICS MANUALLY</span>
                      </button>
                      <button
                        onClick={() => setInputOption('SCREENSHOT')}
                        className={`pb-3 text-xs font-hud font-bold cursor-pointer transition-all flex items-center space-x-2 border-b-2 ${
                          inputOption === 'SCREENSHOT'
                            ? 'border-orange-500 text-orange-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>UPLOAD SYLLABUS SCREENSHOTS</span>
                      </button>
                    </div>

                    {/* OPTION 1: MANUAL TOPIC ENTRY */}
                    {inputOption === 'MANUAL' && (
                      <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-hud text-orange-300">
                            ENTER YOUR EXAM TOPICS (ONE TOPIC PER LINE, UNLIMITED TOPICS ALLOWED):
                          </label>
                          <textarea
                            rows={8}
                            value={manualTopicsText}
                            onChange={(e) => setManualTopicsText(e.target.value)}
                            placeholder="Enter the topics you need to prepare for this exam (one topic per line)..."
                            className="w-full p-4 rounded-2xl bg-black/60 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 leading-relaxed"
                          />
                        </div>

                        <button
                          onClick={handleRunTopicVerification}
                          disabled={!manualTopicsText.trim()}
                          className="w-full py-4 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span>CHECK TOPICS & VERIFY</span>
                        </button>
                      </div>
                    )}

                    {/* OPTION 2: SCREENSHOT INPUT */}
                    {inputOption === 'SCREENSHOT' && (
                      <div className="space-y-4 pt-2">
                        <SyllabusUploader
                          onAnalyze={async (files) => {
                            if (refreshSyllabus) await refreshSyllabus();
                            setStep('STEP_5_PROGRESS');
                          }}
                        />
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-800 flex justify-between">
                      <button
                        onClick={() => setStep('STEP_2_SUBJECT')}
                        className="px-4 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white cursor-pointer"
                      >
                        ← BACK TO SUBJECT
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: SYLLABUS VERIFICATION RESULT */}
                {step === 'STEP_4_VERIFICATION' && (
                  <motion.div
                    key="step-4-verification"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">STEP 4 OF 7 — SYLLABUS VERIFICATION</span>
                      <h2 className="text-xl font-hud font-bold text-white flex items-center space-x-2">
                        <Layers className="w-5 h-5 text-orange-400" />
                        <span>EXAM SYLLABUS VERIFICATION</span>
                      </h2>
                    </div>

                    {/* SUMMARY BADGES */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                        <span className="text-[10px] font-hud text-emerald-400">FOUND IN SYLLABUS</span>
                        <div className="text-2xl font-hud font-extrabold text-emerald-300 mt-1">
                          ✓ {verifiedTopics.filter((t) => t.status === 'FOUND' || t.userDecision === 'USE_SUGGESTION').length}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center">
                        <span className="text-[10px] font-hud text-amber-400">SIMILAR TOPICS</span>
                        <div className="text-2xl font-hud font-extrabold text-amber-300 mt-1">
                          ⚠ {verifiedTopics.filter((t) => t.status === 'SIMILAR' && !t.userDecision).length}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-center">
                        <span className="text-[10px] font-hud text-red-400">NOT FOUND</span>
                        <div className="text-2xl font-hud font-extrabold text-red-300 mt-1">
                          ✗ {verifiedTopics.filter((t) => (t.status === 'NOT_FOUND' || t.status === 'EXAM_ONLY') && !t.userDecision).length}
                        </div>
                      </div>
                    </div>

                    {/* VERIFIED LIST */}
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                      {/* FOUND TOPICS */}
                      <div className="space-y-2">
                        <span className="text-xs font-hud text-emerald-400 font-bold">✓ FOUND IN SYLLABUS:</span>
                        {verifiedTopics
                          .filter((t) => t.status === 'FOUND' || t.userDecision === 'USE_SUGGESTION')
                          .map((vt) => (
                            <div key={vt.id} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-hud">
                              <span className="text-emerald-200 font-bold">{vt.matchedTitle || vt.suggestedTitle || vt.enteredTitle}</span>
                              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                                ✓ MATCHED EXISTING TOPIC
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* SIMILAR TOPICS */}
                      {verifiedTopics.some((t) => t.status === 'SIMILAR' && !t.userDecision) && (
                        <div className="space-y-2 pt-2 border-t border-gray-800">
                          <span className="text-xs font-hud text-amber-400 font-bold">⚠ SIMILAR TOPICS:</span>
                          {verifiedTopics
                            .filter((t) => t.status === 'SIMILAR' && !t.userDecision)
                            .map((vt) => (
                              <div key={vt.id} className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3 text-xs font-hud">
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Entered: <strong className="text-white">{vt.enteredTitle}</strong></span>
                                  <span className="text-amber-400 font-bold">Possible match: "{vt.suggestedTitle}"</span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleDecision(vt.id, 'USE_SUGGESTION')}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold cursor-pointer"
                                  >
                                    [ YES, USE THIS TOPIC ]
                                  </button>
                                  <button
                                    onClick={() => handleDecision(vt.id, 'KEEP_UNVERIFIED')}
                                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] cursor-pointer"
                                  >
                                    [ KEEP AS UNVERIFIED ]
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* NOT FOUND / EXAM ONLY TOPICS */}
                      {verifiedTopics.some((t) => (t.status === 'NOT_FOUND' || t.status === 'EXAM_ONLY') && !t.userDecision) && (
                        <div className="space-y-2 pt-2 border-t border-gray-800">
                          <span className="text-xs font-hud text-red-400 font-bold">✗ NOT FOUND IN SYLLABUS / EXAM TOPICS:</span>
                          {verifiedTopics
                            .filter((t) => (t.status === 'NOT_FOUND' || t.status === 'EXAM_ONLY') && !t.userDecision)
                            .map((vt) => (
                              <div key={vt.id} className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 space-y-3 text-xs font-hud">
                                <div className="flex justify-between">
                                  <span className="text-red-300 font-bold">✗ {vt.enteredTitle}</span>
                                  <span className="text-gray-400 text-[10px]">EXAM-ONLY TOPIC</span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleDecision(vt.id, 'REMOVE')}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-[11px] font-bold cursor-pointer"
                                  >
                                    [ REMOVE ]
                                  </button>
                                  <button
                                    onClick={() => handleDecision(vt.id, 'KEEP_EXTRA')}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold cursor-pointer"
                                  >
                                    [ KEEP AS EXTRA EXAM TOPIC ]
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex justify-between">
                      <button
                        onClick={() => setStep('STEP_3_TOPICS')}
                        className="px-4 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>EDIT TOPICS</span>
                      </button>

                      <button
                        onClick={() => setStep('STEP_5_PROGRESS')}
                        className="px-6 py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 transition-all shadow-lg flex items-center space-x-2 cursor-pointer"
                      >
                        <span>CONTINUE TO PROGRESS ANALYSIS</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: PROGRESS ANALYSIS */}
                {step === 'STEP_5_PROGRESS' && (() => {
                  const plan = runFeasibilityAnalysis();

                  return (
                    <motion.div
                      key="step-5-progress"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">STEP 5 OF 7 — PROGRESS ANALYSIS</span>
                        <h2 className="text-xl font-hud font-bold text-white flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-orange-400" />
                          <span>HISTORICAL LEARNING PROGRESS FOR {plan.subject.toUpperCase()}</span>
                        </h2>
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-hud text-gray-400">TOPIC PROGRESS BREAKDOWN:</span>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                          {plan.prioritizedTopics.map((top) => (
                            <div key={top.id} className="p-4 rounded-2xl bg-black/50 border border-gray-800 space-y-2">
                              <div className="flex justify-between items-center text-xs font-hud">
                                <span className="text-white font-bold">{top.title}</span>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                                  top.status === 'COMPLETED'
                                    ? 'text-emerald-400 bg-emerald-950/60'
                                    : top.status === 'IN_PROGRESS'
                                    ? 'text-amber-400 bg-amber-950/60'
                                    : top.isExamOnly
                                    ? 'text-purple-400 bg-purple-950/60'
                                    : 'text-gray-400 bg-gray-900'
                                }`}>
                                  {top.status === 'COMPLETED'
                                    ? '✓ COMPLETED (100%)'
                                    : top.status === 'IN_PROGRESS'
                                    ? `⚠ IN PROGRESS (${top.progress}%)`
                                    : top.isExamOnly
                                    ? 'EXAM-ONLY TOPIC'
                                    : '✗ NOT STARTED (0%)'}
                                </span>
                              </div>
                              <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/5">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    top.status === 'COMPLETED'
                                      ? 'bg-emerald-400'
                                      : top.status === 'IN_PROGRESS'
                                      ? 'bg-amber-400'
                                      : top.isExamOnly
                                      ? 'bg-purple-500'
                                      : 'bg-slate-700'
                                  }`}
                                  style={{ width: `${top.progress}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-800 flex justify-between">
                        <button
                          onClick={() => setStep('STEP_4_VERIFICATION')}
                          className="px-4 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white cursor-pointer"
                        >
                          ← BACK TO VERIFICATION
                        </button>

                        <button
                          onClick={() => setStep('STEP_6_FEASIBILITY')}
                          className="px-6 py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 transition-all shadow-lg flex items-center space-x-2 cursor-pointer"
                        >
                          <span>NEXT: FEASIBILITY ANALYSIS</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* STEP 6: FEASIBILITY ANALYSIS */}
                {step === 'STEP_6_FEASIBILITY' && (() => {
                  const plan = runFeasibilityAnalysis();

                  return (
                    <motion.div
                      key="step-6-feasibility"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-hud text-orange-400 uppercase tracking-widest">STEP 6 OF 7 — FEASIBILITY ANALYSIS</span>
                        <h2 className="text-2xl font-hud font-extrabold text-white flex items-center space-x-3">
                          <span>EXAM READINESS</span>
                          <span className="text-xs px-3 py-1 rounded-full font-hud font-bold border border-orange-500/40 bg-orange-950/40 text-orange-400">
                            {plan.daysRemaining} DAYS REMAINING ({formattedDisplayDate})
                          </span>
                        </h2>
                      </div>

                      {/* METRICS CARDS */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-black/50 border border-orange-500/30 text-center">
                          <span className="text-[10px] font-hud text-gray-400">TOTAL TOPICS</span>
                          <div className="text-2xl font-hud font-extrabold text-white mt-1">{plan.totalTopics}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 text-center">
                          <span className="text-[10px] font-hud text-emerald-400">COMPLETED</span>
                          <div className="text-2xl font-hud font-extrabold text-emerald-300 mt-1">{plan.completedTopics}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 text-center">
                          <span className="text-[10px] font-hud text-amber-400">REMAINING</span>
                          <div className="text-2xl font-hud font-extrabold text-amber-300 mt-1">{plan.remainingTopics}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/50 border border-orange-500/30 text-center">
                          <span className="text-[10px] font-hud text-orange-400">WORKLOAD</span>
                          <div className="text-2xl font-hud font-extrabold text-orange-300 mt-1">{plan.requiredHours} hrs</div>
                        </div>
                      </div>

                      {/* READINESS STATUS BADGE */}
                      <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                        plan.status === 'REALISTIC'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : plan.status === 'TIGHT_SCHEDULE'
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                          : 'bg-red-950/40 border-red-500/40 text-red-300'
                      }`}>
                        <div className="flex items-center space-x-3">
                          {plan.status === 'REALISTIC' ? (
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                          ) : plan.status === 'TIGHT_SCHEDULE' ? (
                            <AlertTriangle className="w-8 h-8 text-amber-400" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-400" />
                          )}
                          <div>
                            <div className="text-sm font-hud font-extrabold">
                              {plan.status === 'REALISTIC'
                                ? '✓ REALISTIC WORKLOAD'
                                : plan.status === 'TIGHT_SCHEDULE'
                                ? '⚠️ TIGHT SCHEDULE'
                                : '✕ DIFFICULT TO COMPLETE WITH CURRENT TIME'}
                            </div>
                            <div className="text-xs font-hud opacity-80 mt-0.5">
                              Required: {plan.requiredHours} hrs | Available: {plan.availableHours} hrs ({plan.dailyStudyMinutes} min/day)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* WORKLOAD ADJUSTMENTS IF TIGHT / DIFFICULT */}
                      {plan.status === 'DIFFICULT' && (
                        <div className="p-5 rounded-2xl bg-red-950/60 border border-red-500/50 space-y-4">
                          <div className="text-xs font-hud text-red-200">
                            "Your current daily study time is not enough to complete all remaining topics before the exam date."
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              onClick={() => {
                                const newTime = tempDailyTime + 30;
                                setTempDailyTime(newTime);
                                updateUserProfile({ dailyTimeCommitmentMinutes: newTime });
                              }}
                              className="p-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-xs font-hud text-orange-300 font-bold text-center cursor-pointer"
                            >
                              [ +30 MIN DAILY STUDY TIME ]
                            </button>
                            <button
                              onClick={() => {
                                const newTime = tempDailyTime + 60;
                                setTempDailyTime(newTime);
                                updateUserProfile({ dailyTimeCommitmentMinutes: newTime });
                              }}
                              className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-hud text-amber-300 font-bold text-center cursor-pointer"
                            >
                              [ PRIORITIZE KEY TOPICS ]
                            </button>
                            <button
                              onClick={() => {
                                const newTime = 120;
                                setTempDailyTime(newTime);
                                updateUserProfile({ dailyTimeCommitmentMinutes: 120 });
                              }}
                              className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-hud text-red-300 font-bold text-center cursor-pointer"
                            >
                              [ INTENSIVE 2-HR PLAN ]
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-800 flex justify-between">
                        <button
                          onClick={() => setStep('STEP_5_PROGRESS')}
                          className="px-4 py-2.5 rounded-xl font-hud text-xs text-gray-400 hover:text-white cursor-pointer"
                        >
                          ← BACK TO PROGRESS
                        </button>

                        <button
                          onClick={() => handleSaveAndProceedPlan(plan)}
                          className="px-6 py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 transition-all shadow-lg flex items-center space-x-2 cursor-pointer"
                        >
                          <span>GENERATE PREPARATION SCHEDULE</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* STEP 16: IBUKI MORINO CINEMATIC BRIEFING */}
                {step === 'IBUKI_INTRO' && (
                  <motion.div
                    key="step-ibuki"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4"
                  >
                    <div className="md:col-span-5 flex justify-center">
                      <IbukiInstructor isSpeaking={isSpeaking} size="lg" />
                    </div>

                    <div className="md:col-span-7 space-y-6">
                      <div className="bg-[#120a05]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative backdrop-blur-md">
                        <div className="space-y-2">
                          <span className="text-[10px] font-hud text-orange-400 tracking-wider">CHIEF EXAMINER</span>
                          <h3 className="font-hud font-extrabold text-xl text-white">IBUKI MORINO</h3>
                        </div>

                        <p className="font-hud text-base md:text-lg text-orange-100/90 leading-relaxed min-h-[4rem]">
                          "{typedText}"
                        </p>

                        <div className="flex justify-end pt-4 border-t border-orange-500/20">
                          <button
                            onClick={handleNextDialogue}
                            className="px-6 py-3 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 transition-all flex items-center space-x-2 cursor-pointer"
                          >
                            <span>{dialogueIdx < IBUKI_INTRO_DIALOGUES.length - 1 ? 'CONTINUE...' : 'ENTER DASHBOARD'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 7: EXAM PREPARATION SCHEDULE / DASHBOARD */}
                {step === 'DASHBOARD' && activePlan && (
                  <motion.div
                    key="step-dashboard"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-8"
                  >
                    {/* DASHBOARD HEADER BANNER */}
                    <div className="p-6 rounded-3xl bg-[#0e121e]/90 border border-orange-500/40 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      <div>
                        <span className="text-[10px] font-hud text-gray-400">EXAM DATE</span>
                        <div className="text-xl font-hud font-extrabold text-orange-400 mt-0.5">{activePlan.examDate}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-hud text-gray-400">TARGET SUBJECT</span>
                        <div className="text-xl font-hud font-extrabold text-white mt-0.5">{activePlan.subject}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-hud text-gray-400">COMPLETION</span>
                        <div className="text-xl font-hud font-extrabold text-emerald-400 mt-0.5">{activePlan.completionPercent}%</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-hud text-gray-400">READINESS STATUS</span>
                        <div className={`text-xs px-3 py-1.5 rounded-xl font-hud font-bold mt-1 inline-block border ${
                          activePlan.status === 'REALISTIC'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : activePlan.status === 'TIGHT_SCHEDULE'
                            ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                            : 'bg-red-950/60 border-red-500/50 text-red-300'
                        }`}>
                          {activePlan.status === 'REALISTIC' ? '✓ REALISTIC' : activePlan.status === 'TIGHT_SCHEDULE' ? '⚠️ TIGHT SCHEDULE' : '✕ DIFFICULT'}
                        </div>
                      </div>
                    </div>

                    {/* DAY-BY-DAY PREPARATION SCHEDULE */}
                    <div className="bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-hud font-extrabold text-white flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-orange-400" />
                          <span>DAY-BY-DAY PREPARATION SCHEDULE</span>
                        </h2>
                        <span className="text-xs font-hud text-orange-400">
                          {activePlan.schedule.length} DAYS ALLOCATED
                        </span>
                      </div>

                      <div className="space-y-4">
                        {activePlan.schedule.map((day, dIdx) => (
                          <div
                            key={day.dayNumber}
                            className={`p-5 rounded-2xl border transition-all ${
                              day.isRevisionDay
                                ? 'bg-amber-950/30 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                : 'bg-black/50 border-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                              <div className="flex items-center space-x-3">
                                <span className="px-3 py-1 rounded-xl bg-orange-500/20 border border-orange-500/40 text-xs font-hud font-extrabold text-orange-400">
                                  DAY {day.dayNumber}
                                </span>
                                <span className="text-xs font-hud text-gray-300 font-bold">{day.dateStr}</span>
                              </div>
                              <span className="text-[11px] font-hud text-gray-400 flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-orange-400" />
                                <span>{day.allocatedMinutes} MIN</span>
                              </span>
                            </div>

                            <div className="space-y-2">
                              {day.topics.map((t) => (
                                <div
                                  key={t.id}
                                  onClick={() => handleToggleScheduleTopic(dIdx, t.id)}
                                  className="p-3 rounded-xl bg-black/40 border border-gray-800/80 hover:border-orange-500/40 flex items-center justify-between text-xs font-hud cursor-pointer transition-all"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold ${
                                      t.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-gray-600 text-gray-500'
                                    }`}>
                                      {t.completed ? '✓' : ''}
                                    </span>
                                    <span className={t.completed ? 'line-through text-gray-500' : 'text-gray-200'}>
                                      {t.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-400">{t.estimatedMinutes} min</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      {/* DELETE THIS EXAM CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#0e121e] border border-red-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden"
            >
              <div className="space-y-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto shadow-lg">
                  <Trash2 className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-hud font-extrabold text-white">DELETE THIS EXAM?</h3>
                <div className="text-xs font-hud text-gray-300 leading-relaxed text-left space-y-2 bg-black/50 p-4 rounded-2xl border border-red-500/30">
                  <p className="text-red-300 font-bold">This will remove this exam preparation plan and its schedule:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px]">
                    <li>Exam date ({selectedExamDate || activePlan?.examDate})</li>
                    <li>Selected subject ({selectedSubject || activePlan?.subject})</li>
                    <li>Exam preparation plan</li>
                    <li>Exam readiness schedule</li>
                  </ul>
                  <p className="text-[10px] text-emerald-400 border-t border-gray-800 pt-2 mt-2">
                    ✓ Your main syllabus, learning history, study sessions, and streaks will remain completely untouched.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl font-hud text-xs text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDeleteExam}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl font-hud font-bold text-xs text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isDeleting ? 'DELETING...' : 'DELETE EXAM'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
