'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Target, Flame, ChevronRight, Check } from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { DailyMission } from '../../components/training/DailyMission';
import { TimerSettings } from '../../components/training/TimerSettings';
import { JiraiyaMentor } from '../../components/anime/JiraiyaMentor';
import { SubjectSelector } from '../../components/training/SubjectSelector';
import { TopicSelector } from '../../components/training/TopicSelector';
import { GlobalFooter } from '../../components/ui/GlobalFooter';
import { Subject, TodoItem } from '../../types';
import { useApp } from '../../context/AppContext';

type TrainingStage = 'SUBJECT_SELECT' | 'TOPIC_SELECT' | 'MISSION_ACTIVE';

export default function TrainingPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const {
    dailyMission,
    updateDailyMission,
    syllabus,
    refreshSyllabus,
    timerMode,
    regularHours,
    regularMinutes,
    manualHours,
    manualMinutes,
    setTrainingSeconds
  } = useApp();

  // Multi-stage training flow state
  const [stage, setStage] = useState<TrainingStage>('SUBJECT_SELECT');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());

  // Always refresh syllabus on mount to ensure latest database state
  useEffect(() => {
    refreshSyllabus();
  }, []);

  // Reconcile completed topics from user database syllabus + localStorage
  useEffect(() => {
    const completedSet = new Set<string>();

    if (syllabus && Array.isArray(syllabus.subjects)) {
      syllabus.subjects.forEach(sub => {
        (sub.courses || sub.chapters || []).forEach(chap => {
          (chap.todoItems || chap.topics || []).forEach((t: any) => {
            if (t.completed || t.status === 'COMPLETED') {
              if (t.id) completedSet.add(t.id);
              if (t.title) completedSet.add(t.title);
            }
          });
        });
      });
    }

    try {
      const savedCompleted = JSON.parse(localStorage.getItem('aniskill_completed_topics') || '[]');
      if (Array.isArray(savedCompleted)) {
        savedCompleted.forEach(id => completedSet.add(id));
      }
    } catch {}

    setCompletedTopicIds(completedSet);
  }, [syllabus]);

  // Validate selectedSubjectId against live syllabus.subjects
  useEffect(() => {
    if (selectedSubjectId && syllabus.subjects) {
      const exists = syllabus.subjects.some(s => s.id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(null);
        setSelectedTopicIds([]);
        setStage('SUBJECT_SELECT');
      }
    }
  }, [syllabus.subjects, selectedSubjectId]);

  // Load saved mission state
  useEffect(() => {
    try {
      // If daily mission has scheduled topics matching an existing subject, activate mission view
      if (dailyMission.scheduledTopics && dailyMission.scheduledTopics.length > 0) {
        setStage('MISSION_ACTIVE');
        if (dailyMission.subjectId) {
          setSelectedSubjectId(dailyMission.subjectId);
        }
      }
    } catch (e) {
      console.error('Error hydrating training stage:', e);
    }
  }, [dailyMission.scheduledTopics]);

  const activeSubject: Subject | undefined = useMemo(() => {
    if (!selectedSubjectId || !syllabus.subjects) return undefined;
    return syllabus.subjects.find(s => s.id === selectedSubjectId);
  }, [selectedSubjectId, syllabus.subjects]);

  // Handler: Select Subject (Stage 1) - Strict Single Selection
  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);

    // Pre-populate with first incomplete topics of this specific database subject
    const subject = syllabus.subjects.find(s => s.id === subjectId);
    if (subject) {
      const allSubjectTopics: TodoItem[] = [];
      (subject.courses || subject.chapters || []).forEach(c => {
        (c.todoItems || c.topics || []).forEach(t => allSubjectTopics.push(t));
      });

      const incomplete = allSubjectTopics.filter(
        t => !t.completed && t.status !== 'COMPLETED' && !completedTopicIds.has(t.id) && !completedTopicIds.has(t.title)
      );
      const defaultToPick = incomplete.length > 0 ? incomplete.slice(0, 4) : allSubjectTopics.slice(0, 4);
      setSelectedTopicIds(defaultToPick.map(t => t.id || t.title));
    } else {
      setSelectedTopicIds([]);
    }
  };

  // Handler: Continue from Stage 1 to Stage 2
  const handleContinueToTopics = () => {
    if (!selectedSubjectId) return;
    setStage('TOPIC_SELECT');
  };

  // Handler: Toggle Topic selection (Stage 2)
  const handleToggleTopic = (topicId: string) => {
    setSelectedTopicIds(prev => {
      return prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId];
    });
  };

  // Handler: Select All Topics in current subject
  const handleSelectAllTopics = () => {
    if (!activeSubject) return;
    const allIds: string[] = [];
    (activeSubject.courses || activeSubject.chapters || []).forEach(c => {
      (c.todoItems || c.topics || []).forEach(t => {
        allIds.push(t.id || t.title);
      });
    });
    setSelectedTopicIds(allIds);
  };

  // Handler: Clear all topic selections
  const handleClearAllTopics = () => {
    setSelectedTopicIds([]);
  };

  // Handler: Change Subject (Returns to Stage 1)
  const handleChangeSubject = () => {
    setStage('SUBJECT_SELECT');
  };

  // Handler: Change Topics (Returns to Stage 2)
  const handleChangeTopics = () => {
    setStage('TOPIC_SELECT');
  };

  // Handler: Start Training Mission (Transitions to Stage 3)
  const handleStartTrainingMission = () => {
    if (!activeSubject || selectedTopicIds.length === 0) return;

    // Collect all topics from active subject
    const allSubjectTopics: (TodoItem & { courseId?: string })[] = [];
    (activeSubject.courses || activeSubject.chapters || []).forEach(c => {
      (c.todoItems || c.topics || []).forEach(t => {
        allSubjectTopics.push({ ...t, courseId: c.id });
      });
    });

    const pickedTopics = allSubjectTopics.filter(
      t => selectedTopicIds.includes(t.id) || selectedTopicIds.includes(t.title)
    );

    // Calculate total minutes
    const calculatedMinutes = pickedTopics.reduce(
      (acc, t) => acc + (t.targetMinutes || t.requiredMinutes || 20),
      0
    );
    const configuredMinutes =
      timerMode === 'REGULAR'
        ? (regularHours * 60) + regularMinutes
        : (manualHours * 60) + manualMinutes;
    const totalMinutes = configuredMinutes > 0 ? configuredMinutes : calculatedMinutes;

    // Build scheduled topics list with real database IDs
    const scheduledTopics = pickedTopics.map(t => {
      const isDone =
        t.completed ||
        t.status === 'COMPLETED' ||
        completedTopicIds.has(t.id) ||
        completedTopicIds.has(t.title);

      const diff =
        t.difficulty === 'EASY'
          ? 'EASY'
          : t.difficulty === 'COMPLEX' || t.difficulty === 'HARD' || t.difficulty === 'VERY_HARD'
          ? 'COMPLEX'
          : 'MODERATE';

      const targetM = t.targetMinutes || t.requiredMinutes || (diff === 'EASY' ? 15 : diff === 'COMPLEX' ? 30 : 20);

      return {
        id: t.id,
        todoItemId: t.id,
        topicId: t.id,
        courseId: t.courseId,
        subjectId: activeSubject.id,
        subjectName: activeSubject.title,
        title: t.title,
        normalizedTitle: t.normalizedTitle || t.title,
        completed: isDone,
        requiredMinutes: targetM,
        difficulty: diff as any,
        targetMinutes: targetM,
        status: isDone ? ('COMPLETED' as const) : ('PLANNED' as const)
      };
    });

    // Update Daily Mission in AppContext
    const newMission = {
      id: `mis-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subjectId: activeSubject.id,
      subjectName: activeSubject.title,
      topicIds: pickedTopics.map(t => t.id),
      topicTitles: pickedTopics.map(t => t.title),
      requiredSeconds: totalMinutes * 60,
      completedSeconds: 0,
      isCompleted: false,
      isVerified: false,
      proofScreenshots: [],
      selectedSubjectIds: [activeSubject.id],
      scheduledTopics
    };

    updateDailyMission(newMission);
    setTrainingSeconds(totalMinutes * 60);

    try {
      localStorage.setItem('aniskill_daily_mission_overhaul', JSON.stringify(newMission));
    } catch {}

    setStage('MISSION_ACTIVE');
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat text-slate-100 overflow-x-hidden bg-[#07080B]"
      style={{ backgroundImage: 'url("/images/training_bg.jpg")' }}
    >
      {/* Light dark overlay for readability (10-25%) */}
      <div className="absolute inset-0 bg-[#07080B]/25 pointer-events-none z-0" />

      {/* Optional subtle scanline */}
      <div className="fixed inset-0 hud-scanline opacity-10 pointer-events-none z-0" />

      {/* Page Content */}
      <div className="relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <div className="flex w-full max-w-[1500px] 2xl:max-w-[1700px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            {/* TOP HEADER WITH STAGE STEPPER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
              <div>
                <span className="text-xs font-hud text-orange-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  <span>SHINOBI ACADEMY TRAINING GROUND</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-0.5 tracking-wider">
                  DAILY TRAINING & TIMERS
                </h1>
              </div>

              {/* STEP PROGRESS INDICATOR (Visible when subjects exist) */}
              {syllabus.subjects && syllabus.subjects.length > 0 && (
                <div className="flex items-center space-x-2 bg-zinc-950/80 p-2 rounded-2xl border border-zinc-800/80 text-[11px] font-hud">
                  {/* Step 1 */}
                  <button
                    onClick={handleChangeSubject}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      stage === 'SUBJECT_SELECT'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold shadow-[0_0_10px_rgba(255,107,0,0.2)]'
                        : selectedSubjectId
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-zinc-500'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>SUBJECT</span>
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />

                  {/* Step 2 */}
                  <button
                    onClick={() => selectedSubjectId && handleChangeTopics()}
                    disabled={!selectedSubjectId}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      stage === 'TOPIC_SELECT'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold shadow-[0_0_10px_rgba(255,107,0,0.2)] cursor-pointer'
                        : selectedSubjectId
                        ? 'text-gray-400 hover:text-gray-200 cursor-pointer'
                        : 'text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>TOPICS</span>
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />

                  {/* Step 3 */}
                  <div
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      stage === 'MISSION_ACTIVE'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold shadow-[0_0_10px_rgba(255,107,0,0.2)]'
                        : 'text-zinc-600'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>MISSION</span>
                  </div>
                </div>
              )}
            </div>

            {/* JIRAIYA MENTOR BRIEFING */}
            <JiraiyaMentor
              mood={stage === 'MISSION_ACTIVE' ? 'MISSION' : stage === 'TOPIC_SELECT' ? 'GUIDANCE' : 'WELCOME'}
            />

            {/* MULTI-STAGE CONTENT SWITCHER */}
            <AnimatePresence mode="wait">
              {stage === 'SUBJECT_SELECT' && (
                <motion.div
                  key="stage-subject"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <SubjectSelector
                    subjects={syllabus.subjects || []}
                    selectedSubjectId={selectedSubjectId}
                    onSelectSubject={handleSelectSubject}
                    onContinue={handleContinueToTopics}
                  />
                </motion.div>
              )}

              {stage === 'TOPIC_SELECT' && activeSubject && (
                <motion.div
                  key="stage-topics"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <TopicSelector
                    subject={activeSubject}
                    selectedTopicIds={selectedTopicIds}
                    completedTopicIds={completedTopicIds}
                    onToggleTopic={handleToggleTopic}
                    onSelectAll={handleSelectAllTopics}
                    onClearAll={handleClearAllTopics}
                    onChangeSubject={handleChangeSubject}
                    onStartTraining={handleStartTrainingMission}
                  />
                </motion.div>
              )}

              {stage === 'MISSION_ACTIVE' && (
                <motion.div
                  key="stage-mission"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
                >
                  <div className="lg:col-span-2">
                    <DailyMission
                      onChangeSubject={handleChangeSubject}
                      onChangeTopics={handleChangeTopics}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <TimerSettings />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}
