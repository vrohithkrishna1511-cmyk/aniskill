'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Lock, 
  Sparkles, 
  Plus, 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Scan,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CharacterRenderer } from '../anime/CharacterRenderer';
import { CreateSubjectModal } from './CreateSubjectModal';

interface SyllabusTreeProps {
  onOpenAddSubjectModal?: () => void;
}

export const SyllabusTree: React.FC<SyllabusTreeProps> = ({ onOpenAddSubjectModal }) => {
  const { 
    syllabus, 
    deleteSubject,
    addTopic,
    deleteTopic,
    refreshSyllabus
  } = useApp();

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  
  // Create Subject & Syllabus Modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [modalSubjectId, setModalSubjectId] = useState<string | null>(null);
  const [modalSubjectTitle, setModalSubjectTitle] = useState<string | null>(null);
  const [subjectLimitError, setSubjectLimitError] = useState<boolean>(false);

  // Delete Subject & Topic state
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<{ id: string; title: string } | null>(null);

  // Inline single topic addition state
  const [addingTopicCourseId, setAddingTopicCourseId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState<string>('');

  // Dynamic Counters
  let totalActive = 0;
  let totalCompleted = 0;
  const completedItemsList: { topic: any, subjectName: string, chapterId: string, subjectId: string }[] = [];

  syllabus.subjects.forEach(sub => {
    (sub.courses || sub.chapters || []).forEach(chap => {
      (chap.todoItems || chap.topics || []).forEach(top => {
        if (top.completed || top.status === 'COMPLETED') {
          totalCompleted++;
          completedItemsList.push({
            topic: top,
            subjectName: sub.title,
            chapterId: chap.id,
            subjectId: sub.id
          });
        } else {
          totalActive++;
        }
      });
    });
  });

  // Sort completed items by date descending (newest first)
  completedItemsList.sort((a, b) => {
    if (!a.topic.completionDate) return 1;
    if (!b.topic.completionDate) return -1;
    return new Date(b.topic.completionDate).getTime() - new Date(a.topic.completionDate).getTime();
  });

  const handleOpenAddSubject = () => {
    if (syllabus.subjects.length >= 10) {
      setSubjectLimitError(true);
      return;
    }
    setSubjectLimitError(false);
    if (onOpenAddSubjectModal) {
      onOpenAddSubjectModal();
    } else {
      setModalSubjectId(null);
      setModalSubjectTitle(null);
      setShowCreateModal(true);
    }
  };

  const handleOpenAddSyllabusForSubject = (subjId: string, subjTitle: string) => {
    setModalSubjectId(subjId);
    setModalSubjectTitle(subjTitle);
    setShowCreateModal(true);
  };

  const handleCreateTopic = async (subjectId: string, courseId: string) => {
    if (!newTopicTitle.trim()) return;
    const success = await addTopic(subjectId, newTopicTitle.trim(), courseId);
    if (success) {
      setNewTopicTitle('');
      setAddingTopicCourseId(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* MAIN TOP-LEVEL NAVIGATION TABS */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-hud tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'ACTIVE'
              ? 'bg-zinc-900 border-b-2 border-orange-500 text-orange-400 font-extrabold shadow-[0_-5px_15px_rgba(255,107,0,0.1)]'
              : 'text-gray-500 hover:text-gray-300 hover:bg-zinc-900/50'
          }`}
        >
          <span>ACTIVE SYLLABUS</span>
          <span className={`px-2 py-0.5 rounded text-[10px] ${activeTab === 'ACTIVE' ? 'bg-orange-950 text-orange-400' : 'bg-zinc-800 text-gray-400'}`}>
            {totalActive}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-hud tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'COMPLETED'
              ? 'bg-zinc-900 border-b-2 border-emerald-500 text-emerald-400 font-extrabold shadow-[0_-5px_15px_rgba(16,185,129,0.1)]'
              : 'text-gray-500 hover:text-gray-300 hover:bg-zinc-900/50'
          }`}
        >
          <span>COMPLETED</span>
          <span className={`px-2 py-0.5 rounded text-[10px] ${activeTab === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-gray-400'}`}>
            {totalCompleted}
          </span>
        </button>
      </div>

      {activeTab === 'ACTIVE' && (
        <>
          {/* RPG NINJA SKILL TREE HEADER BANNER */}
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-orange-600/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex-1 space-y-3 z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-400 text-xs font-hud">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NINJA TRAINING SKILL TREE</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-hud text-white tracking-wider">
                MASTER YOUR JUTSU PATHWAYS
              </h2>
              <div className="flex items-center space-x-3 text-xs md:text-sm font-body text-slate-300">
                <span>Subject Slots:</span>
                <span className="font-hud font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-950/60 border border-orange-500/30">
                  SUBJECTS {syllabus.subjects.length} / 10
                </span>
              </div>
            </div>

            {/* Action Button: ADD SUBJECT */}
            <div className="z-10 flex-shrink-0 flex flex-col items-center space-y-3">
              <button
                onClick={handleOpenAddSubject}
                className="px-6 py-4 rounded-2xl font-hud font-bold text-sm text-black tracking-widest bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center space-x-2 cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>ADD SUBJECT</span>
              </button>
              
              <div className="w-24 h-24 hidden md:block">
                <CharacterRenderer characterId="naruto" state="training" size="sm" showAura={false} />
              </div>
            </div>
          </div>

          {/* Subject Limit Error Dialog */}
          {subjectLimitError && (
            <div className="p-5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-start space-x-3 shadow-xl">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-hud font-bold uppercase tracking-wider text-red-400">SUBJECT LIMIT REACHED</h4>
                <p className="text-xs font-body mt-1">
                  You can add a maximum of 10 subjects. Please clear or complete existing training paths before adding more.
                </p>
                <button
                  onClick={() => setSubjectLimitError(false)}
                  className="mt-3 px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-[10px] font-hud uppercase font-bold transition-colors cursor-pointer"
                >
                  DISMISS
                </button>
              </div>
            </div>
          )}

          {/* EMPTY STATE - 0 SUBJECTS */}
          {syllabus.subjects.length === 0 && (
            <div className="text-center p-12 space-y-4 flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-zinc-500 drop-shadow-md" />
              <h3 className="font-hud font-extrabold text-white text-lg tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                NO TRAINING SUBJECTS REGISTERED
              </h3>
              <p className="text-xs font-body text-gray-400 max-w-sm">
                Begin your training path by clicking the "+ Add Subject" button. Enter the name of the learning portal syllabus you want to track.
              </p>
              <button
                onClick={handleOpenAddSubject}
                className="mt-2 px-6 py-3 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 shadow-lg cursor-pointer"
              >
                + ADD FIRST SUBJECT
              </button>
            </div>
          )}

          {/* SKILL TREE SUBJECT BRANCHES */}
          <div className="space-y-6">
            {syllabus.subjects.map((subject, index) => {
              const isExpanded = expandedSubject === subject.id;
              const totalTopics = (subject.courses || subject.chapters || []).reduce((acc, c) => acc + (c.todoItems || c.topics || []).length, 0);
              const completedTopics = (subject.courses || subject.chapters || []).reduce(
                (acc, c) => acc + (c.todoItems || c.topics || []).filter((t) => t.completed || t.status === 'COMPLETED').length,
                0
              );
              const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

              return (
                <div
                  key={subject.id}
                  className="relative overflow-hidden"
                >
                  {/* CHAKRA NODE CONNECTING LINE */}
                  <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-orange-500 via-amber-400 to-cyan-500 opacity-30 pointer-events-none" />

                  {/* Subject Header Accordion Toggle */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setExpandedSubject(isExpanded ? null : subject.id);
                    }}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors relative z-10 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Glowing Node Badge */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-hud font-extrabold text-white text-lg shadow-[0_0_20px_rgba(255,107,0,0.4)] border border-white/20"
                        style={{ backgroundColor: subject.color }}
                      >
                        0{index + 1}
                      </div>
                      <div>
                        <h4 className="font-hud font-extrabold text-lg text-white tracking-wide uppercase">
                          {subject.title}
                        </h4>
                        <span className="text-xs font-body text-gray-400">
                          {(subject.courses || subject.chapters || []).length} COURSES • {completedTopics}/{totalTopics} TO-DO ITEMS CLEAR
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {totalTopics > 0 && (
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-xs font-hud font-extrabold text-orange-400 glow-orange-text">
                            {percent}% CHAKRA COMPLETE
                          </span>
                          <div className="w-32 h-2 bg-zinc-900 rounded-full overflow-hidden mt-1.5 p-0.5 border border-gray-800">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {totalTopics === 0 && (
                        <span className="text-[10px] font-hud bg-zinc-900 border border-zinc-800 text-gray-400 px-3 py-1 rounded-xl uppercase tracking-wider">
                          EMPTY PATH
                        </span>
                      )}
                      {/* Delete Subject Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubjectToDelete(subject.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-950/50 hover:text-red-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all group cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="w-6 h-6 text-orange-400" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 space-y-6 relative z-10"
                      >
                        
                        {/* EMPTY TOPICS PATH - CLEAN ADD TOPICS TRIGGER */}
                        {totalTopics === 0 && (
                          <div className="text-center p-8 space-y-4 flex flex-col items-center justify-center bg-black/40 rounded-2xl border border-dashed border-zinc-800">
                            <UploadCloud className="w-10 h-10 text-orange-500/60" />
                            <h4 className="font-hud font-bold text-white text-sm tracking-wider uppercase">
                              NO TOPICS ADDED TO {subject.title} YET
                            </h4>
                            <p className="text-xs font-body text-gray-400 max-w-sm mx-auto">
                              Choose how you want to add your syllabus: Enter topics manually or extract them via screenshots.
                            </p>
                            <button
                              onClick={() => handleOpenAddSyllabusForSubject(subject.id, subject.title)}
                              className="px-6 py-2.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-md cursor-pointer flex items-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>+ ADD SYLLABUS TOPICS</span>
                            </button>
                          </div>
                        )}

                        {/* COLLAPSIBLE COURSES AND TO-DO ITEMS TREE */}
                        {totalTopics > 0 && (
                          <div className="space-y-6">
                            {(subject.courses || subject.chapters || []).map((chapter, chapIdx) => {
                              const filteredTopics = (chapter.todoItems || chapter.topics || []).filter((t) => !t.completed && t.status !== 'COMPLETED');

                              return (
                                <div key={chapter.id} className="space-y-3 pl-4 border-l-2 border-orange-500/30">
                                  <div className="flex items-center justify-between text-xs font-hud font-bold text-amber-300 tracking-widest uppercase">
                                    <span>COURSE {chapIdx + 1}: {chapter.title}</span>
                                    <div className="flex items-center space-x-3">
                                      <span className="text-gray-500">{filteredTopics.length} TO-DO ITEMS</span>
                                      <button
                                        onClick={() => setAddingTopicCourseId(addingTopicCourseId === chapter.id ? null : chapter.id)}
                                        className="px-2.5 py-1 rounded-lg text-[10px] font-hud font-bold text-orange-400 bg-orange-950/50 border border-orange-500/30 hover:bg-orange-900/60 transition-colors cursor-pointer"
                                      >
                                        {addingTopicCourseId === chapter.id ? 'CANCEL' : '+ ADD TOPIC'}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Inline Topic Addition Form */}
                                  {addingTopicCourseId === chapter.id && (
                                    <div className="p-3 rounded-2xl bg-zinc-950 border border-orange-500/40 flex items-center space-x-2">
                                      <input
                                        type="text"
                                        placeholder="Enter topic title (e.g. Loops, Functions)..."
                                        value={newTopicTitle}
                                        onChange={(e) => setNewTopicTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleCreateTopic(subject.id, chapter.id);
                                        }}
                                        className="flex-1 px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white text-xs font-body focus:outline-none focus:border-orange-500"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleCreateTopic(subject.id, chapter.id)}
                                        className="px-4 py-2 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 transition-colors cursor-pointer"
                                      >
                                        ADD TOPIC
                                      </button>
                                    </div>
                                  )}

                                  {filteredTopics.length === 0 && addingTopicCourseId !== chapter.id && (
                                    <div className="text-xs text-gray-500 italic py-2">
                                      No active topics in this course. Click "+ ADD TOPIC" to add topics.
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredTopics.map((topic) => {
                                        const diff = topic.difficulty === 'EASY' ? 'EASY' : (topic.difficulty === 'COMPLEX' || topic.difficulty === 'HARD' || topic.difficulty === 'VERY_HARD' ? 'COMPLEX' : 'MODERATE');
                                        const targetM = diff === 'EASY' ? 15 : (diff === 'COMPLEX' ? 30 : 20);

                                        return (
                                          <div
                                            key={topic.id}
                                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                                              topic.completed || topic.status === 'COMPLETED'
                                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                                : 'bg-zinc-950/70 border-zinc-800 text-gray-300'
                                            }`}
                                          >
                                            <div className="flex items-center space-x-3.5">
                                              <BookOpen className="w-5 h-5 text-orange-400/80 flex-shrink-0" />
                                              <div className="flex flex-col space-y-1">
                                                <span className="text-xs md:text-sm font-title font-bold text-white">
                                                  {topic.normalizedTitle || topic.title}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-2 text-[10px] font-hud text-gray-400">
                                                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                                    diff === 'EASY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                                    diff === 'COMPLEX' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                                                    'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                  }`}>
                                                    {diff}
                                                  </span>
                                                  <span className="text-orange-400 font-bold">
                                                    Target: {topic.targetMinutes || targetM} MIN
                                                  </span>
                                                  {(topic.completed || topic.status === 'COMPLETED') && (
                                                    <span className="text-emerald-400 font-bold">
                                                      Actual: {topic.actualMinutes || topic.targetMinutes || targetM} MIN
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                              {topic.completed || topic.status === 'COMPLETED' ? (
                                                <span className="text-[10px] font-hud font-bold text-emerald-400 uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                                                  ✓ COMPLETED
                                                </span>
                                              ) : (
                                                <span className="text-[10px] font-hud text-gray-400 uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                                                  ○ CURRICULUM ITEM
                                                </span>
                                              )}
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setTopicToDelete({ id: topic.id, title: topic.normalizedTitle || topic.title });
                                                }}
                                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
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

                            {/* APPEND MORE TOPICS / SCREENSHOTS BUTTON */}
                            <div className="flex justify-end pt-2 border-t border-zinc-800">
                              <button
                                onClick={() => handleOpenAddSyllabusForSubject(subject.id, subject.title)}
                                className="px-4 py-2 rounded-xl text-xs font-hud font-bold text-orange-400 hover:text-white glass-panel cursor-pointer flex items-center space-x-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ ADD / APPEND SYLLABUS TOPICS</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'COMPLETED' && (
        <div className="space-y-4 pt-4">
          {completedItemsList.length === 0 ? (
            <div className="text-center p-12 space-y-4 flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-zinc-500 drop-shadow-md" />
              <h3 className="font-hud font-extrabold text-white text-lg tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                NO TOPICS COMPLETED YET
              </h3>
              <p className="text-xs font-body text-gray-400 max-w-sm">
                Keep training! Once you complete topics in your active syllabus, they will appear here in your completion history.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {completedItemsList.map((item) => (
                  <motion.div 
                    key={item.topic.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden group"
                  >
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500" />
                    <div className="space-y-1 pl-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <h4 className="font-title text-base font-bold text-white">{item.topic.title}</h4>
                      </div>
                      <div className="text-xs font-hud text-gray-400 tracking-wider flex items-center space-x-2 pl-9">
                        <span className="text-amber-400 font-bold">{item.subjectName}</span>
                        <span>•</span>
                        <span>COMPLETED: {item.topic.completionDate ? new Date(item.topic.completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pl-3 md:pl-0">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-hud font-bold tracking-widest uppercase">
                        STATUS: ✓ COMPLETED
                      </div>
                      <button
                        onClick={() => setTopicToDelete({ id: item.topic.id, title: item.topic.title })}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
                        title="Delete Completed Topic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      <AnimatePresence>
        {subjectToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-[#0e121e] border border-orange-500/50 shadow-[0_0_40px_rgba(255,107,0,0.3)] space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500" />
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-950/50 rounded-2xl border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="font-hud font-extrabold text-white text-xl tracking-wider">
                    DELETE SUBJECT
                  </h3>
                  <p className="text-sm font-body text-gray-400 mt-2">
                    Are you sure you want to delete <span className="font-bold text-orange-400">"{syllabus.subjects.find(s => s.id === subjectToDelete)?.title}"</span>?
                  </p>
                  <p className="text-xs font-body text-gray-500 mt-2">
                    This will permanently remove the subject and all its topics from your database.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setSubjectToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-hud font-bold text-xs text-gray-300 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={async () => {
                    await deleteSubject(subjectToDelete);
                    setSubjectToDelete(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-hud font-bold text-xs text-white bg-red-600 hover:bg-red-500 border border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
                >
                  DELETE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Topic Confirmation Modal */}
      <AnimatePresence>
        {topicToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-[#0e121e] border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500" />
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-950/50 rounded-2xl border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="font-hud font-extrabold text-white text-xl tracking-wider">
                    DELETE TOPIC
                  </h3>
                  <p className="text-sm font-body text-gray-400 mt-2">
                    Are you sure you want to delete <span className="font-bold text-orange-400">"{topicToDelete.title}"</span>?
                  </p>
                  <p className="text-xs font-body text-gray-500 mt-2">
                    This will permanently remove the topic from your database and training schedule.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setTopicToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-hud font-bold text-xs text-gray-300 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={async () => {
                    await deleteTopic(topicToDelete.id);
                    setTopicToDelete(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-hud font-bold text-xs text-white bg-red-600 hover:bg-red-500 border border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
                >
                  DELETE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Creation & Syllabus Input Flow Modal */}
      <CreateSubjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialSubjectId={modalSubjectId}
        initialSubjectTitle={modalSubjectTitle}
      />
    </div>
  );
};
