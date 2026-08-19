'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Trophy, 
  Swords, 
  Award, 
  UserCheck, 
  Settings,
  X,
  Play,
  Users,
  Flame,
  Scroll,
  ChevronUp,
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setIntroSeen } = useApp();
  
  // Internal state for desktop animation toggle
  const [isScrollOpen, setIsScrollOpen] = useState(false);

  // Sync mobile isOpen prop with our internal state
  useEffect(() => {
    setIsScrollOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsScrollOpen(false);
    if (onClose) onClose();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Syllabus', href: '/syllabus', icon: BookOpen },
    { name: 'Training', href: '/training', icon: Target },
    { name: 'Chūnin Exam Prep', href: '/exam-prep', icon: Flame },
    { name: 'Progress & Rank', href: '/progress', icon: Trophy },
    { name: 'Shinobi Study Squad', href: '/squad', icon: Users },
    { name: 'Rivalry Arena', href: '/rivalry', icon: Swords },
    { name: 'Achievements', href: '/achievements', icon: Award },
    { name: 'Ninja Profile', href: '/profile', icon: UserCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isScrollOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Desktop spacer to prevent main content from shifting under fixed sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 pointer-events-none" />

      {/* Desktop Closed Horizontal Rolled Ninja Scroll Trigger */}
      <AnimatePresence>
        {!isScrollOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed z-50 left-[16px] top-[75px] lg:top-[80px] flex flex-col items-center pointer-events-auto cursor-pointer group"
            onClick={() => setIsScrollOpen(true)}
            title="Click to Unroll Ninja Navigation Scroll"
          >
            {/* The Horizontal Rolled Ninja Scroll from Reference Image */}
            <div 
              data-tour="nav-scroll-trigger"
              className="relative w-[220px] h-[80px] transform transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(255,107,0,0.8)]"
            >
              <img 
                src="/images/horizontal_scroll.png" 
                alt="Horizontal Rolled Ninja Scroll"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-hud font-extrabold text-[10px] text-amber-300 tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                  NAV SCROLL
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Animated Vertical Scroll Sidebar */}
      <AnimatePresence>
        {isScrollOpen && (
          <motion.aside
            initial={{ height: 0, opacity: 0, scaleY: 0.05 }}
            animate={{ height: 'calc(100vh - 65px)', opacity: 1, scaleY: 1 }}
            exit={{ height: 0, opacity: 0, scaleY: 0.05 }}
            style={{ transformOrigin: 'top center' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 bottom-auto left-0 z-40 w-64 flex flex-col overflow-hidden lg:top-[65px] lg:left-0 pointer-events-auto shadow-[0_0_40px_rgba(255,107,0,0.25)] border-r border-orange-500/30"
          >
            {/* Vertical Scroll Background */}
            <div className="absolute inset-0 -z-20 bg-[url('/images/vertical_scroll.jpg')] bg-[length:100%_100%] bg-center bg-no-repeat" />
            
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 -z-10 bg-[#07080B]/85 backdrop-blur-[2px]" />

            {/* Content Container */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col h-full w-full justify-between p-5 overflow-y-auto"
            >
              <div className="space-y-3">
                {/* Scroll Top Header / Close handle */}
                <div className="flex items-center justify-between border-b border-orange-500/30 pb-2.5">
                  <span className="font-hud font-bold text-orange-400 text-xs tracking-wider flex items-center space-x-1.5">
                    <Scroll className="w-4 h-4 text-orange-400" />
                    <span>NINJA SCROLL NAV</span>
                  </span>
                  <button 
                    onClick={handleClose} 
                    className="p-1 text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"
                    title="Roll Up Scroll"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>

                {/* Vertical Navigation Links */}
                <nav className="flex flex-col pt-1">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const tourId = `nav-${item.href.replace('/', '')}`;
                    
                    return (
                      <React.Fragment key={item.href}>
                        <Link
                          href={item.href}
                          onClick={handleClose}
                          data-tour={tourId}
                          className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-hud text-xs tracking-wider transition-all group ${
                            isActive
                              ? 'bg-gradient-to-r from-orange-600/30 to-amber-600/20 border border-orange-500/50 text-orange-300 font-bold shadow-[0_0_15px_rgba(255,107,0,0.15)]'
                              : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                          }`}
                        >
                          <Icon className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-orange-400 glow-orange-text' : 'text-gray-400 group-hover:text-orange-400'
                          }`} />
                          <span>{item.name}</span>
                        </Link>
                        
                        {/* Separator Line */}
                        {index < navItems.length - 1 && (
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent my-1" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions: Log Out & Replay Intro */}
              <div className="pt-4 flex flex-col space-y-2 border-t border-gray-600/40 mt-auto pb-1">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('aniskill_academy_entered');
                    }
                    signOut({ callbackUrl: '/login' });
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-hud text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOG OUT SHINOBI</span>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('aniskill_academy_entered');
                    }
                    setIntroSeen(false);
                    handleClose();
                    router.push('/');
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-hud text-gray-300 hover:text-orange-400 bg-white/5 hover:bg-white/10 border border-transparent hover:border-orange-500/40 transition-all flex items-center justify-center space-x-2 shadow-[0_0_10px_rgba(0,0,0,0.2)] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>REPLAY CINEMATIC INTRO</span>
                </button>

                {/* Subtle Creator Credit */}
                <div className="pt-2 text-center text-[9px] font-hud text-zinc-500 tracking-wider">
                  ANISKILL © 2026 • Created & Developed by Rohith Krishna
                </div>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
