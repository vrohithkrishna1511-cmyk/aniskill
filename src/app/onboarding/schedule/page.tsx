'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { CinematicBackground } from '../../../components/anime/CinematicBackground';
import { Navbar } from '../../../components/ui/Navbar';
import { useApp } from '../../../context/AppContext';

export default function OnboardingSchedulePage() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useApp();

  const [selectedOption, setSelectedOption] = useState<number>(60); // 60 mins
  const [schedule, setSchedule] = useState<Record<string, number>>({
    Mon: 60,
    Tue: 90,
    Wed: 60,
    Thu: 90,
    Fri: 60,
    Sat: 120,
    Sun: 60
  });

  const handleFinish = () => {
    updateUserProfile({
      dailyTimeCommitmentMinutes: selectedOption,
      schedule: schedule
    });
    router.push('/dashboard');
  };

  return (
    <CinematicBackground theme="orange">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="w-full glass-panel-orange rounded-3xl p-6 md:p-10 border border-orange-500/40 shadow-[0_0_50px_rgba(255,107,0,0.2)] space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-xs font-hud">
              <Clock className="w-3.5 h-3.5" />
              <span>MINIMUM COMMITMENT: 1 HOUR PER DAY</span>
            </div>
            <h1 className="text-3xl font-extrabold font-hud tracking-wider text-white">
              HOW MUCH TIME CAN YOU TRAIN?
            </h1>
            <p className="text-xs md:text-sm font-body text-slate-300 max-w-md mx-auto">
              YOUR PLAN ADAPTS TO YOUR LIFE. Choose your daily commitment or customize by day of the week.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '1 HOUR', mins: 60, desc: 'Academy Standard' },
              { label: '1.5 HOURS', mins: 90, desc: 'Genin Sprint' },
              { label: '2 HOURS', mins: 120, desc: 'Chūnin Trial' },
              { label: '3 HOURS', mins: 180, desc: 'Hokage Mastery' }
            ].map(opt => (
              <button
                key={opt.mins}
                onClick={() => setSelectedOption(opt.mins)}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  selectedOption === opt.mins
                    ? 'bg-gradient-to-br from-orange-600/40 to-amber-600/30 border-orange-400 text-white shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                    : 'glass-panel border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xl font-hud font-bold">{opt.label}</div>
                <div className="text-[10px] font-hud text-gray-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* Custom Daily Schedule Grid */}
          <div className="p-6 rounded-2xl glass-panel border border-orange-500/20 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-hud text-orange-400 font-bold">
              <Calendar className="w-4 h-4" />
              <span>CUSTOM DAILY SCHEDULE ADJUSTER</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {Object.entries(schedule).map(([day, mins]) => (
                <div key={day} className="p-3 rounded-xl bg-black/40 border border-orange-500/20 space-y-1">
                  <div className="text-xs font-hud font-bold text-gray-300">{day}</div>
                  <input
                    type="number"
                    min="60"
                    step="30"
                    value={mins}
                    onChange={(e) => setSchedule(prev => ({ ...prev, [day]: Number(e.target.value) }))}
                    className="w-full bg-zinc-900 border border-orange-500/30 rounded text-center text-xs font-hud text-orange-400 py-1"
                  />
                  <div className="text-[9px] font-hud text-gray-500">MINS</div>
                </div>
              ))}
            </div>
          </div>

          {/* Finish Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleFinish}
              className="px-8 py-4 rounded-xl font-hud font-bold text-sm text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_25px_rgba(255,107,0,0.5)] flex items-center space-x-2 group transform hover:scale-105"
            >
              <span>CONFIRM SCHEDULE & ENTER DASHBOARD</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </CinematicBackground>
  );
}
