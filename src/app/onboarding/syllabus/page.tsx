'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CinematicBackground } from '../../../components/anime/CinematicBackground';
import { SyllabusAnalyzer } from '../../../components/syllabus/SyllabusAnalyzer';
import { Navbar } from '../../../components/ui/Navbar';

export default function OnboardingSyllabusPage() {
  const router = useRouter();

  return (
    <CinematicBackground theme="orange">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <SyllabusAnalyzer
          imageUrls={['/images/syllabus_sample_1.png', '/images/syllabus_sample_2.png']}
          onConfirm={() => router.push('/onboarding/schedule')}
        />
      </main>
    </CinematicBackground>
  );
}
