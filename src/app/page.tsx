'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Lock, 
  User, 
  Mail, 
  ArrowRight, 
  Play, 
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CharacterRenderer } from '../components/anime/CharacterRenderer';

type AppPhase = 
  | 'intro'           // Full-screen clean video playback
  | 'login'           // Sign in screen (Google OAuth + Email/Password)
  | 'signup';         // Register screen (Shinobi Name, Email, Password, Confirm)

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { updateUserProfile, saveProfileToBackend, setIntroSeen } = useApp();

  // Phase State: Default to 'intro' on SSR to avoid hydration mismatch
  const [phase, setPhase] = useState<AppPhase>('intro');
  const [mounted, setMounted] = useState(false);

  // Sync phase with pathname and client storage after mount
  useEffect(() => {
    setMounted(true);
    if (pathname === '/login') {
      setPhase('login');
    } else if (pathname === '/signup') {
      setPhase('signup');
    } else {
      const seen = localStorage.getItem('aniskill_intro_seen');
      if (seen === 'true') {
        setPhase('login');
      }
    }
  }, [pathname]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnteringAcademy, setIsEnteringAcademy] = useState(false);

  // Video Autoplay: Starts the intro cleanly
  useEffect(() => {
    if (phase === 'intro') {
      if (pathname === '/login') {
        setPhase('login');
        return;
      }
      if (pathname === '/signup') {
        setPhase('signup');
        return;
      }

      if (videoRef.current) {
        const video = videoRef.current;
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Autoplay waiting/interaction required:', err);
          });
        }
      }
    }
  }, [phase, pathname]);

  // Video completion handler: Transition strictly to Google Authentication page when video ends naturally
  const handleVideoEnded = () => {
    setIntroSeen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aniskill_intro_seen', 'true');
    }
    setPhase('login');
  };

  // Credentials Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('aniskill_academy_entered');
      }

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setAuthError('Authentication failed. Please verify your email and password.');
        setIsSubmitting(false);
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('aniskill_academy_entered', 'true');
        }
        setIntroSeen(true);
        setIsEnteringAcademy(true);
        router.push('/dashboard');
      }
    } catch (err) {
      setAuthError('Sign in failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Credentials Signup / Registration
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setAuthError('Please enter your Shinobi name.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please verify your chakra seal!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('aniskill_academy_entered');
      }

      const res = await signIn('credentials', {
        email,
        password,
        name: cleanName,
        isSignUp: 'true',
        redirect: false,
      });

      if (res?.error) {
        setAuthError('Account registration failed. Please try again.');
        setIsSubmitting(false);
      } else {
        // Save actual entered user name directly to local state & database
        updateUserProfile({ name: cleanName, ninjaIdentity: cleanName });
        await saveProfileToBackend({
          shinobiName: cleanName,
          nickname: 'The Copy Ninja',
          dailyAvailableMinutes: 60,
        });

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('aniskill_academy_entered', 'true');
        }
        setIntroSeen(true);
        setIsEnteringAcademy(true);
        router.push('/dashboard');
      }
    } catch (err) {
      setAuthError('Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Google OAuth SignIn
  const handleGoogleSignIn = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aniskill_academy_entered', 'true');
    }
    setIntroSeen(true);
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#030406] select-none">
      
      {/* ========================================================================= */}
      {/* 1. CLEAN FULL-SCREEN INTRO VIDEO (No controls, overlays, skip, or logos)   */}
      {/* ========================================================================= */}
      {phase === 'intro' && (
        <motion.div
          key="intro-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 w-full h-full z-50 bg-black flex items-center justify-center pointer-events-none select-none"
        >
          <video
            ref={videoRef}
            src="/intro.mp4"
            playsInline
            autoPlay
            muted
            onEnded={handleVideoEnded}
            onError={handleVideoEnded}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 2. AUTHENTICATION SCREENS (Google OAuth & Credentials)                     */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {/* Sign In Screen */}
        {phase === 'login' && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 w-full max-w-md p-6 sm:p-8 my-auto"
          >
            <div className="w-full bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,107,0,0.15)] space-y-6 relative overflow-hidden backdrop-blur-xl">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 p-0.5 mx-auto shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-[#0E121E] flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-hud font-extrabold tracking-widest text-white">
                  SIGN IN TO ANISKILL
                </h1>
                <p className="text-xs font-hud text-orange-400 uppercase tracking-widest font-bold">
                  SHINOBI ACADEMY ACCESS
                </p>
                <p className="text-xs text-gray-400 font-title italic">
                  Welcome back, Shinobi.
                </p>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-hud flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isEnteringAcademy}
                className="w-full py-3.5 rounded-xl font-hud font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-orange-400/80 transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-orange-500/20 w-full" />
                <span className="bg-[#0e121e] px-3 text-[10px] font-hud text-gray-500 uppercase tracking-widest absolute">OR</span>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-orange-400 absolute left-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="shinobi@academy.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                    PASSWORD
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-orange-400 absolute left-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isEnteringAcademy}
                  className="w-full py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting || isEnteringAcademy ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="pt-3 border-t border-gray-800/80 text-center space-y-2 text-xs font-hud">
                <div>
                  <span className="text-gray-400">New to ANISKILL? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setPhase('signup');
                    }}
                    className="text-orange-400 font-bold hover:underline cursor-pointer ml-1"
                  >
                    Create Shinobi Account
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sign Up Screen */}
        {phase === 'signup' && (
          <motion.div
            key="signup-screen"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 w-full max-w-md p-6 sm:p-8 my-auto"
          >
            <div className="w-full bg-[#0e121e]/90 border border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,107,0,0.15)] space-y-6 relative overflow-hidden backdrop-blur-xl">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 p-0.5 mx-auto shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-[#0E121E] flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-hud font-extrabold tracking-widest text-white">
                  CREATE SHINOBI ACCOUNT
                </h1>
                <p className="text-xs font-hud text-orange-400 uppercase tracking-widest font-bold">
                  BEGIN AS A NINJA STUDENT
                </p>
                <p className="text-xs text-gray-400 font-title italic">
                  Enroll as a new ninja student.
                </p>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-hud flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isEnteringAcademy}
                className="w-full py-3.5 rounded-xl font-hud font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-orange-400/80 transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-orange-500/20 w-full" />
                <span className="bg-[#0e121e] px-3 text-[10px] font-hud text-gray-500 uppercase tracking-widest absolute">OR</span>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                    SHINOBI NAME / FULL NAME
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-orange-400 absolute left-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your Shinobi Name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-orange-400 absolute left-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="shinobi@academy.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                    PASSWORD
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-orange-400 absolute left-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-hud text-gray-400 uppercase tracking-widest">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-orange-400 absolute left-3.5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-orange-500/30 text-xs font-hud text-white focus:outline-none focus:border-orange-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isEnteringAcademy}
                  className="w-full py-3.5 rounded-xl font-hud font-bold text-xs text-black bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 hover:from-orange-400 hover:to-amber-300 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting || isEnteringAcademy ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="pt-3 border-t border-gray-800/80 text-center space-y-2 text-xs font-hud">
                <div>
                  <span className="text-gray-400">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setPhase('login');
                    }}
                    className="text-orange-400 font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
