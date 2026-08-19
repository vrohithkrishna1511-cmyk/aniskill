'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CinematicBackground } from '../../../components/anime/CinematicBackground';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/ui/Sidebar';
import { CompletionProofUploader } from '../../../components/training/CompletionProofUploader';
import { VerificationStatus } from '../../../components/training/VerificationStatus';

export default function TrainingProofPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  return (
    <CinematicBackground theme="orange">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex w-full max-w-7xl xl:max-w-[1450px] mx-auto min-h-[calc(100vh-65px)] min-h-[calc(100dvh-65px)] pt-[65px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div>
            <span className="text-xs font-hud text-orange-400 uppercase tracking-widest">
              PROOF OF TRAINING WORK
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-hud text-white mt-0.5">
              VERIFICATION PORTAL
            </h1>
          </div>

          {isVerifying ? (
            <VerificationStatus onDone={() => router.push('/dashboard')} />
          ) : (
            <CompletionProofUploader onSubmitProof={() => setIsVerifying(true)} />
          )}
        </main>
      </div>
    </CinematicBackground>
  );
}
