'use client';

import React, { useState } from 'react';
import { BookOpen, RefreshCw, Plus } from 'lucide-react';
import { CinematicBackground } from '../../components/anime/CinematicBackground';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { SyllabusTree } from '../../components/syllabus/SyllabusTree';
import { SyllabusUpdater } from '../../components/syllabus/SyllabusUpdater';
import { CreateSubjectModal } from '../../components/syllabus/CreateSubjectModal';
import { GlobalFooter } from '../../components/ui/GlobalFooter';

export default function SyllabusPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat text-slate-100 overflow-x-hidden bg-[#07080B] flex flex-col justify-between"
      style={{ backgroundImage: 'url("/images/missions_bg.jpg")' }}
    >
      {/* Dark overlay for readability (reduced opacity as requested) */}
      <div className="absolute inset-0 bg-[#07080B]/40 pointer-events-none z-0" />
      
      {/* Optional subtle scanline to blend with existing ANISKILL theme */}
      <div className="fixed inset-0 hud-scanline opacity-10 pointer-events-none z-0" />

      {/* Page Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <div className="flex w-full max-w-7xl xl:max-w-[1450px] 2xl:max-w-[1650px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px] flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-hud text-orange-400 uppercase tracking-widest">
                  TRAINING PATHWAY
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-0.5">
                  SYLLABUS TRACKER
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  data-tour="add-subject-btn"
                  className="px-4 py-2.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:from-orange-400 hover:to-amber-300 transition-all shadow-md flex items-center space-x-2 cursor-pointer transform hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ ADD SUBJECT</span>
                </button>

                <button
                  onClick={() => setIsUpdating(!isUpdating)}
                  className="px-4 py-2.5 rounded-xl font-hud font-bold text-xs text-orange-300 border border-orange-500/40 bg-orange-950/40 hover:bg-orange-900/60 transition-all flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isUpdating ? 'CANCEL' : 'UPDATE SYLLABUS'}</span>
                </button>
              </div>
            </div>

            {isUpdating ? (
              <SyllabusUpdater onUpdateConfirmed={() => setIsUpdating(false)} />
            ) : (
              <SyllabusTree onOpenAddSubjectModal={() => setShowCreateModal(true)} />
            )}
          </main>
        </div>
      </div>

      {/* Global Footer */}
      <GlobalFooter />

      {/* Subject Creation & Syllabus Input Flow Modal */}
      <CreateSubjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
