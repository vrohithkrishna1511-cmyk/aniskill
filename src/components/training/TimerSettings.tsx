'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Settings, Save, Play, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const TimerSettings: React.FC = () => {
  const {
    timerMode,
    setTimerMode,
    regularHours,
    regularMinutes,
    saveRegularSettings,
    manualHours,
    manualMinutes,
    setManualDuration,
    syllabus,
    generateDailyPlan,
    startTraining,
    setTrainingSeconds
  } = useApp();

  const router = useRouter();

  const [inputRegHours, setInputRegHours] = useState<number>(regularHours);
  const [inputRegMinutes, setInputRegMinutes] = useState<number>(regularMinutes);
  const [inputManHours, setInputManHours] = useState<number>(manualHours);
  const [inputManMinutes, setInputManMinutes] = useState<number>(manualMinutes);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setInputRegHours(regularHours);
    setInputRegMinutes(regularMinutes);
  }, [regularHours, regularMinutes]);

  useEffect(() => {
    setInputManHours(manualHours);
    setInputManMinutes(manualMinutes);
  }, [manualHours, manualMinutes]);

  const handleSaveRegular = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRegHours === 0 && inputRegMinutes === 0) {
      alert("Duration cannot be 0 hours and 0 minutes.");
      return;
    }
    saveRegularSettings(inputRegHours, inputRegMinutes);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleStartManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputManHours === 0 && inputManMinutes === 0) {
      alert("Duration cannot be 0 hours and 0 minutes.");
      return;
    }
    
    // Save the selected duration for today
    setManualDuration(inputManHours, inputManMinutes);
    const totalMinutes = (inputManHours * 60) + inputManMinutes;
    const totalSeconds = totalMinutes * 60;

    // Find subjects with topics to generate plan
    const subjectsWithTopics = syllabus.subjects.filter(
      s => s.chapters.some(c => c.topics.length > 0)
    );
    const subjectIds = subjectsWithTopics.map(s => s.id);

    // Generate daily plan
    if (subjectIds.length > 0) {
      generateDailyPlan(subjectIds, totalMinutes);
    } else {
      // Create a dummy plan if no subjects exist yet
      generateDailyPlan([], totalMinutes);
    }

    // Set countdown timer duration and start
    setTrainingSeconds(totalSeconds);
    startTraining();
    router.push('/training/session');
  };

  return (
    <div className="w-full relative p-6 md:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-orange-400 animate-spin-slow" />
        <div>
          <span className="text-[10px] font-hud text-gray-400 tracking-widest uppercase">
            CHAKRA TIMING SYSTEM
          </span>
          <h3 className="font-hud font-extrabold text-lg text-white tracking-wider">
            TIMER SETTINGS
          </h3>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="space-y-3 mb-6">
        <span className="text-[10px] font-hud text-gray-400 tracking-widest uppercase block">
          TIMER MODE
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTimerMode('REGULAR')}
            className={`py-3.5 px-4 rounded-xl font-hud font-extrabold text-xs tracking-wider transition-all cursor-pointer border ${
              timerMode === 'REGULAR'
                ? 'bg-gradient-to-r from-orange-600/30 to-amber-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(255,107,0,0.2)]'
                : 'bg-zinc-950/80 border-zinc-800 text-gray-500 hover:text-gray-300'
            }`}
          >
            REGULAR MODE
          </button>
          <button
            onClick={() => setTimerMode('MANUAL')}
            className={`py-3.5 px-4 rounded-xl font-hud font-extrabold text-xs tracking-wider transition-all cursor-pointer border ${
              timerMode === 'MANUAL'
                ? 'bg-gradient-to-r from-orange-600/30 to-amber-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(255,107,0,0.2)]'
                : 'bg-zinc-950/80 border-zinc-800 text-gray-500 hover:text-gray-300'
            }`}
          >
            MANUAL / FLEXIBLE
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {timerMode === 'REGULAR' ? (
          <motion.form
            key="regular"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSaveRegular}
            className="space-y-5"
          >
            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-hud flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>REGULAR SETTINGS SAVED SUCCESSFULLY!</span>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[10px] font-hud text-gray-400 tracking-widest uppercase block">
                DAILY TRAINING TIME
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-hud text-gray-500 uppercase">HOURS</label>
                  <select
                    value={inputRegHours}
                    onChange={(e) => setInputRegHours(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 font-bold"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')} h
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-hud text-gray-500 uppercase">MINUTES</label>
                  <select
                    value={inputRegMinutes}
                    onChange={(e) => setInputRegMinutes(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 font-bold"
                  >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                      <option key={m} value={m}>
                        {m.toString().padStart(2, '0')} m
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-hud font-extrabold text-xs tracking-widest text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>SAVE SETTINGS</span>
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleStartManual}
            className="space-y-5"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-hud text-gray-400 tracking-widest uppercase block">
                TODAY'S AVAILABLE TIME
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-hud text-gray-500 uppercase">HOURS</label>
                  <select
                    value={inputManHours}
                    onChange={(e) => setInputManHours(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 font-bold"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')} h
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-hud text-gray-500 uppercase">MINUTES</label>
                  <select
                    value={inputManMinutes}
                    onChange={(e) => setInputManMinutes(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 font-bold"
                  >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                      <option key={m} value={m}>
                        {m.toString().padStart(2, '0')} m
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-hud font-extrabold text-xs tracking-widest text-black bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-teal-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.01]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START TODAY'S TIMER</span>
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
