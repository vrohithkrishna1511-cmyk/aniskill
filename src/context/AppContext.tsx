'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  UserProfile, 
  Syllabus, 
  Subject,
  DailyMission, 
  Rival, 
  Achievement, 
  JiraiyaMood, 
  RankType,
  NicknameType,
  ProofVerificationResult,
  Squad,
  SquadMember
} from '../types';
import { 
  INITIAL_USER_PROFILE, 
  INITIAL_SYLLABUS, 
  INITIAL_DAILY_MISSION, 
  RIVAL_DATA, 
  ACHIEVEMENTS_DATA, 
  RANKS_DATA 
} from '../data/mockData';

interface AppContextType {
  introSeen: boolean;
  setIntroSeen: (seen: boolean) => void;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  syllabus: Syllabus;
  updateSyllabus: (newSyllabus: Syllabus) => void;
  dailyMission: DailyMission;
  updateDailyMission: (updates: Partial<DailyMission>) => void;
  rival: Rival;
  achievements: Achievement[];
  jiraiyaMood: JiraiyaMood;
  jiraiyaTextOverride: string | null;
  setJiraiyaMood: (mood: JiraiyaMood, customText?: string) => void;
  
  // Training state
  isTrainingActive: boolean;
  trainingSeconds: number;
  isFocusMode: boolean;
  startTraining: () => void;
  pauseTraining: () => void;
  finishTraining: () => void;
  setTrainingSeconds: React.Dispatch<React.SetStateAction<number>>;

  // Proof & Verification
  proofScreenshots: string[];
  addProofScreenshots: (urls: string[]) => void;
  removeProofScreenshot: (index: number) => void;
  reorderProofScreenshots: (newOrder: string[]) => void;
  verifyMission: () => Promise<ProofVerificationResult>;

  // Rank up & Motivation modals
  showRankUpModal: RankType | null;
  dismissRankUpModal: () => void;
  showDailyMotivation: boolean;
  dismissDailyMotivation: () => void;

  // Guide Academy Modal
  showGuideAcademy: boolean;
  openGuideAcademy: () => void;
  closeGuideAcademy: () => void;

  // Profile Setup Modal
  showProfileSetupModal: boolean;
  setShowProfileSetupModal: (show: boolean) => void;
  saveProfileToBackend: (data: { shinobiName: string; nickname: NicknameType; dailyAvailableMinutes: number }) => Promise<void>;

  // Topic Completion & Management
  toggleTopicCompletion: (subjectId: string, chapterId: string, topicId: string) => Promise<void>;
  completeTopic: (topicId: string, completed?: boolean) => Promise<boolean>;
  deleteTopic: (topicId: string) => Promise<boolean>;
  addTopic: (subjectId: string, title: string, courseId?: string) => Promise<boolean>;

  // Syllabus Overhaul additions
  addSubject: (name: string) => Promise<{ success: boolean; subject?: any; error?: string }>;
  saveSubjectTopics: (subjectId: string, topics: (string | any)[], replaceExisting?: boolean) => Promise<{ success: boolean; subject?: any; error?: string }>;
  deleteSubject: (subjectId: string) => Promise<boolean>;
  importTopics: (subjectId: string, pageNum: number) => void;
  generateDailyPlan: (subjectIds: string[], availableMinutes: number) => void;
  resetDailyMissionForNextSubject: () => void;
  refreshSyllabus: () => Promise<any>;

  // Timer Settings additions
  timerMode: 'REGULAR' | 'MANUAL';
  setTimerMode: (mode: 'REGULAR' | 'MANUAL') => void;
  regularHours: number;
  regularMinutes: number;
  saveRegularSettings: (hours: number, minutes: number) => void;
  manualHours: number;
  manualMinutes: number;
  setManualDuration: (hours: number, minutes: number) => void;

  // Shinobi Study Squad additions
  squad: Squad | null;
  createSquad: (name: string) => void;
  joinSquad: (code: string) => { success: boolean; error?: string };
  leaveSquad: () => void;
  simulateMemberJoin: () => void;
  selectShinobiIdentity: (memberId: string, name: string, studyTimeSeconds?: number) => { success: boolean; error?: string };
  leaderOvertaken: boolean;
  setLeaderOvertaken: (val: boolean) => void;
  rankOvertaken: string | null;
  setRankOvertaken: (val: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [introSeen, setIntroSeenState] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [syllabus, setSyllabus] = useState<Syllabus>(INITIAL_SYLLABUS);
  const [dailyMission, setDailyMission] = useState<DailyMission>(INITIAL_DAILY_MISSION);
  const [rival, setRival] = useState<Rival>(RIVAL_DATA);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_DATA);
  const [jiraiyaMood, setJiraiyaMoodState] = useState<JiraiyaMood>('WELCOME');
  const [jiraiyaTextOverride, setJiraiyaTextOverride] = useState<string | null>(null);

  // Training state
  const [isTrainingActive, setIsTrainingActive] = useState<boolean>(false);
  const [trainingSeconds, setTrainingSeconds] = useState<number>(0);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Timer Settings state
  const [timerMode, setTimerModeState] = useState<'REGULAR' | 'MANUAL'>('REGULAR');
  const [regularHours, setRegularHours] = useState<number>(1);
  const [regularMinutes, setRegularMinutes] = useState<number>(0);
  const [manualHours, setManualHours] = useState<number>(1);
  const [manualMinutes, setManualMinutes] = useState<number>(0);

  // Proof screenshots
  const [proofScreenshots, setProofScreenshots] = useState<string[]>([]);

  // Shinobi Study Squad State
  const [squad, setSquad] = useState<Squad | null>(null);
  const [leaderOvertaken, setLeaderOvertaken] = useState<boolean>(false);
  const [rankOvertaken, setRankOvertaken] = useState<string | null>(null);

  // Modals
  const [showRankUpModal, setShowRankUpModal] = useState<RankType | null>(null);
  const [showDailyMotivation, setShowDailyMotivation] = useState<boolean>(false);
  const [showProfileSetupModal, setShowProfileSetupModal] = useState<boolean>(false);
  const [showGuideAcademy, setShowGuideAcademy] = useState<boolean>(false);

  const openGuideAcademy = () => setShowGuideAcademy(true);
  const closeGuideAcademy = () => setShowGuideAcademy(false);

  const { data: session, status: authStatus } = useSession();

  const sanitizeName = (val: any): string => {
    if (!val || val === 'null' || val === 'undefined' || typeof val !== 'string' || !val.trim() || val.trim() === 'Uzumaki Naruto' || val.trim() === 'Shinobi Trainee' || val.trim() === 'Shinobi Learner') {
      return '';
    }
    return val.trim();
  };

  // Sync profile & syllabus from authenticated NextAuth session
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const dbUser = data.user;
            const cleanName = sanitizeName(dbUser.shinobiName || dbUser.name || session?.user?.name);
            setUserProfile((prev) => ({
              ...prev,
              name: cleanName,
              ninjaIdentity: cleanName,
              nickname: (dbUser.nickname as NicknameType) || '',
              rank: dbUser.rank || 'NINJA_STUDENT',
              currentStreak: dbUser.currentStreak ?? 0,
              bestStreak: dbUser.bestStreak ?? 0,
              chakra: dbUser.chakra ?? 0,
              totalXp: dbUser.totalXp ?? 0,
              dailyTimeCommitmentMinutes: dbUser.dailyAvailableMinutes ?? 0,
              avatarUrl: dbUser.avatarUrl || session?.user?.image || '',
              lastActiveDate: dbUser.lastActiveDate || '',
            }));
          }
        })
        .catch((err) => console.error('Error syncing profile from NextAuth session:', err));

      refreshSyllabus();
    }
  }, [authStatus, session]);

  // Do not show profile setup modal automatically on unauthenticated state

  const saveProfileToBackend = async (data: { shinobiName: string; nickname: NicknameType; dailyAvailableMinutes: number }) => {
    const cleanName = sanitizeName(data.shinobiName);
    try {
      setUserProfile((prev) => {
        const updated = {
          ...prev,
          name: cleanName,
          ninjaIdentity: cleanName,
          nickname: data.nickname,
          dailyTimeCommitmentMinutes: data.dailyAvailableMinutes,
        };
        localStorage.setItem('aniskill_profile_overhaul', JSON.stringify(updated));
        return updated;
      });

      localStorage.setItem('aniskill_profile_setup_done', 'true');
      setShowProfileSetupModal(false);

      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shinobiName: cleanName,
          nickname: data.nickname,
          dailyAvailableMinutes: data.dailyAvailableMinutes,
        }),
      });
    } catch (e) {
      console.error('Error saving profile to backend:', e);
    }
  };

  // Fetch real database syllabus tree (Authoritative database source of truth)
  const refreshSyllabus = async () => {
    try {
      const res = await fetch('/api/syllabus/tree');
      const data = await res.json();
      if (data.success && Array.isArray(data.subjects)) {
        const freshSubjects = data.subjects;
        setSyllabus({
          id: 'syl-001',
          title: 'Shinobi Training Syllabus',
          subjects: freshSubjects,
          lastUpdated: new Date().toISOString(),
        });

        // Reconcile dailyMission with live database topics
        const validTopicIds = new Set<string>();
        const validSubjectIds = new Set<string>();
        freshSubjects.forEach((s: any) => {
          validSubjectIds.add(s.id);
          (s.courses || s.chapters || []).forEach((c: any) => {
            (c.todoItems || c.topics || []).forEach((t: any) => {
              if (t.id) validTopicIds.add(t.id);
              if (t.title) validTopicIds.add(t.title);
            });
          });
        });

        setDailyMission((prevMission) => {
          if (!prevMission.scheduledTopics || prevMission.scheduledTopics.length === 0) {
            return prevMission;
          }

          // Filter out deleted topics
          const filteredScheduled = prevMission.scheduledTopics.filter((t: any) => {
            const idMatch = t.topicId ? validTopicIds.has(t.topicId) : false;
            const todoMatch = t.todoItemId ? validTopicIds.has(t.todoItemId) : false;
            const directIdMatch = t.id ? validTopicIds.has(t.id) : false;
            const titleMatch = t.title ? validTopicIds.has(t.title) : false;
            const subjectValid = t.subjectId ? validSubjectIds.has(t.subjectId) : true;
            return subjectValid && (idMatch || todoMatch || directIdMatch || titleMatch);
          });

          if (filteredScheduled.length === 0 && prevMission.scheduledTopics.length > 0) {
            const resetMission = INITIAL_DAILY_MISSION;
            localStorage.setItem('aniskill_daily_mission_overhaul', JSON.stringify(resetMission));
            return resetMission;
          }

          if (filteredScheduled.length !== prevMission.scheduledTopics.length) {
            const updatedMission = {
              ...prevMission,
              scheduledTopics: filteredScheduled,
              topicIds: filteredScheduled.map((t: any) => t.topicId || t.todoItemId || t.id || ''),
              topicTitles: filteredScheduled.map((t: any) => t.title),
            };
            localStorage.setItem('aniskill_daily_mission_overhaul', JSON.stringify(updatedMission));
            return updatedMission;
          }

          return prevMission;
        });

        return freshSubjects;
      }
    } catch (e) {
      console.error('Error fetching syllabus tree:', e);
    }
    return [];
  };

  // Load from database and session on mount (safe for Next.js SSR hydration)
  useEffect(() => {
    refreshSyllabus();
    const savedIntro = localStorage.getItem('aniskill_intro_seen');
    if (savedIntro === 'true') {
      setIntroSeenState(true);
    }

    const savedDailyMission = localStorage.getItem('aniskill_daily_mission_overhaul');
    if (savedDailyMission) {
      try {
        const parsedMission = JSON.parse(savedDailyMission);
        if (parsedMission.id === 'mis-today' || parsedMission.subjectName === 'No Active Quest' && (!parsedMission.scheduledTopics || parsedMission.scheduledTopics.length === 0)) {
          setDailyMission(INITIAL_DAILY_MISSION);
        } else {
          setDailyMission(parsedMission);
        }
      } catch (e) {
        console.error('Error loading daily mission', e);
      }
    }
    const savedProfile = localStorage.getItem('aniskill_profile_overhaul');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        const cleanName = sanitizeName(parsed.name || parsed.ninjaIdentity);
        setUserProfile((prev) => ({
          ...prev,
          ...parsed,
          name: cleanName,
          ninjaIdentity: cleanName,
          nickname: parsed.nickname === 'The Copy Ninja' && !cleanName ? '' : (parsed.nickname || ''),
          dailyTimeCommitmentMinutes: parsed.dailyTimeCommitmentMinutes || 0,
        }));
      } catch (e) {
        console.error('Error loading profile', e);
      }
    }

    // Sync with backend SQLite DB
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const dbName = sanitizeName(data.user.shinobiName || data.user.name);
          setUserProfile((prev) => {
            const updated = {
              ...prev,
              name: dbName,
              ninjaIdentity: dbName,
              nickname: (data.user.nickname as NicknameType) || prev.nickname,
              rank: data.user.rank || prev.rank,
              currentStreak: data.user.currentStreak ?? prev.currentStreak,
              bestStreak: data.user.bestStreak ?? prev.bestStreak,
              chakra: data.user.chakra ?? prev.chakra ?? 0,
              totalXp: data.user.totalXp ?? prev.totalXp ?? 0,
              dailyTimeCommitmentMinutes: data.user.dailyAvailableMinutes ?? prev.dailyTimeCommitmentMinutes,
            };
            localStorage.setItem('aniskill_profile_overhaul', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch((err) => console.error('Error syncing backend profile:', err));

    // Load timer settings
    const savedTimerMode = localStorage.getItem('aniskill_timer_mode');
    if (savedTimerMode === 'REGULAR' || savedTimerMode === 'MANUAL') {
      setTimerModeState(savedTimerMode);
    }
    const savedRegularHours = localStorage.getItem('aniskill_regular_hours');
    if (savedRegularHours) setRegularHours(Number(savedRegularHours));
    const savedRegularMinutes = localStorage.getItem('aniskill_regular_minutes');
    if (savedRegularMinutes) setRegularMinutes(Number(savedRegularMinutes));
    const savedManualHours = localStorage.getItem('aniskill_manual_hours');
    if (savedManualHours) setManualHours(Number(savedManualHours));
    const savedManualMinutes = localStorage.getItem('aniskill_manual_minutes');
    if (savedManualMinutes) setManualMinutes(Number(savedManualMinutes));

    const savedTrainingSeconds = localStorage.getItem('aniskill_training_seconds');
    if (savedTrainingSeconds) setTrainingSeconds(Number(savedTrainingSeconds));

    const savedSquad = localStorage.getItem('aniskill_squad');
    if (savedSquad) {
      try {
        setSquad(JSON.parse(savedSquad));
      } catch (e) {
        console.error('Error loading squad', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aniskill_daily_mission_overhaul', JSON.stringify(dailyMission));
  }, [dailyMission]);

  useEffect(() => {
    localStorage.setItem('aniskill_profile_overhaul', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('aniskill_training_seconds', String(trainingSeconds));
  }, [trainingSeconds]);

  useEffect(() => {
    if (squad) {
      localStorage.setItem('aniskill_squad', JSON.stringify(squad));
    } else {
      localStorage.removeItem('aniskill_squad');
    }
  }, [squad]);

  const setTimerMode = (mode: 'REGULAR' | 'MANUAL') => {
    setTimerModeState(mode);
    localStorage.setItem('aniskill_timer_mode', mode);
  };

  const saveRegularSettings = (hours: number, minutes: number) => {
    setRegularHours(hours);
    setRegularMinutes(minutes);
    localStorage.setItem('aniskill_regular_hours', String(hours));
    localStorage.setItem('aniskill_regular_minutes', String(minutes));
  };

  const setManualDuration = (hours: number, minutes: number) => {
    setManualHours(hours);
    setManualMinutes(minutes);
    localStorage.setItem('aniskill_manual_hours', String(hours));
    localStorage.setItem('aniskill_manual_minutes', String(minutes));
  };

  const setIntroSeen = (seen: boolean) => {
    setIntroSeenState(seen);
    localStorage.setItem('aniskill_intro_seen', seen ? 'true' : 'false');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const rawName = updates.name !== undefined ? updates.name : (updates.ninjaIdentity !== undefined ? updates.ninjaIdentity : prev.name);
      const cleanName = sanitizeName(rawName);
      const updated = {
        ...prev,
        ...updates,
        name: cleanName,
        ninjaIdentity: cleanName,
      };
      localStorage.setItem('aniskill_profile_overhaul', JSON.stringify(updated));

      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shinobiName: cleanName,
          nickname: updated.nickname,
          dailyAvailableMinutes: updated.dailyTimeCommitmentMinutes,
          rank: updated.rank,
        }),
      }).catch(() => {});

      return updated;
    });
  };

  const updateSyllabus = (newSyllabus: Syllabus) => {
    setSyllabus(newSyllabus);
  };

  const updateDailyMission = (updates: Partial<DailyMission>) => {
    setDailyMission(prev => ({ ...prev, ...updates }));
  };

  const setJiraiyaMood = (mood: JiraiyaMood, customText?: string) => {
    setJiraiyaMoodState(mood);
    setJiraiyaTextOverride(customText || null);
  };

  const startTraining = () => {
    setIsTrainingActive(true);
    setIsFocusMode(true);
    setJiraiyaMood('MISSION', "Focus mode activated. Make every second of this training count!");
    if (trainingSeconds <= 0) {
      setTrainingSeconds(dailyMission.requiredSeconds || 3600);
    }
  };

  const pauseTraining = () => {
    setIsTrainingActive(false);
  };

  const finishTraining = () => {
    setIsTrainingActive(false);
    setIsFocusMode(false);
    const elapsed = Math.max(0, dailyMission.requiredSeconds - trainingSeconds);
    setDailyMission(prev => ({ ...prev, completedSeconds: elapsed }));
    setJiraiyaMood('SUCCESS', "Great effort on the training ground! Now submit your completion screenshots for verification.");
  };

  // Timer tick effect when active (counts down)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrainingActive) {
      interval = setInterval(() => {
        // Increment squad study time if joined
        setSquad(currentSquad => {
          if (!currentSquad || !currentSquad.joined) return currentSquad;
          const updatedMembers = currentSquad.members.map(m => {
            if (m.isMe) {
              return { ...m, studyTimeSeconds: m.studyTimeSeconds + 1 };
            }
            return m;
          });
          
          const meMember = updatedMembers.find(m => m.isMe);
          if (!meMember) return { ...currentSquad, members: updatedMembers };

          const newOrder = [...currentSquad.leaderboardOrder];
          let myIdx = newOrder.indexOf(meMember.id);
          if (myIdx > 0) {
            const aboveId = newOrder[myIdx - 1];
            const aboveMember = updatedMembers.find(m => m.id === aboveId);
            if (aboveMember && meMember.studyTimeSeconds > aboveMember.studyTimeSeconds) {
              newOrder[myIdx - 1] = meMember.id;
              newOrder[myIdx] = aboveId;
              if (myIdx - 1 === 0) {
                setLeaderOvertaken(true);
              } else {
                setRankOvertaken(aboveMember.name);
              }
            }
          }

          return {
            ...currentSquad,
            members: updatedMembers,
            leaderboardOrder: newOrder
          };
        });

        setTrainingSeconds(prev => {
          if (prev <= 1) {
            setIsTrainingActive(false);
            setIsFocusMode(false);
            setDailyMission(m => ({
              ...m,
              completedSeconds: m.requiredSeconds,
              isCompleted: true
            }));
            setJiraiyaMood('SUCCESS', "MISSION COMPLETE! TIME TARGET REACHED. Submit screenshots for verification.");
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTrainingActive]);

  const addProofScreenshots = (urls: string[]) => {
    setProofScreenshots(prev => [...prev, ...urls]);
  };

  const removeProofScreenshot = (index: number) => {
    setProofScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const reorderProofScreenshots = (newOrder: string[]) => {
    setProofScreenshots(newOrder);
  };

  const addSubject = async (name: string): Promise<{ success: boolean; subject?: any; error?: string }> => {
    if (!name || !name.trim()) return { success: false, error: 'Subject name is required.' };
    try {
      const res = await fetch('/api/syllabus/tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_SUBJECT', title: name.trim() }),
      });
      const data = await res.json();
      if (data.success && data.subject) {
        await refreshSyllabus();
        return { success: true, subject: data.subject };
      }
      return { success: false, error: data.error || 'Failed to create subject.' };
    } catch (e: any) {
      console.error('Error adding subject:', e);
      return { success: false, error: e.message || 'Error adding subject.' };
    }
  };

  const saveSubjectTopics = async (
    subjectId: string,
    topicsOrCourses: (string | any)[],
    replaceExisting: boolean = false
  ): Promise<{ success: boolean; subject?: any; error?: string }> => {
    if (!subjectId) return { success: false, error: 'Subject ID is required.' };
    try {
      // Detect whether topicsOrCourses is an array of Courses or Topics
      const isCourseStructure = topicsOrCourses.length > 0 && typeof topicsOrCourses[0] === 'object' && ('todoItems' in topicsOrCourses[0] || 'topics' in topicsOrCourses[0]);

      const payload: any = {
        action: 'BATCH_SAVE_TOPICS',
        subjectId,
        replaceExisting,
      };

      if (isCourseStructure) {
        payload.courses = topicsOrCourses;
      } else {
        payload.topics = topicsOrCourses;
      }

      const res = await fetch('/api/syllabus/tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await refreshSyllabus();
        return { success: true, subject: data.subject };
      }
      return { success: false, error: data.error || 'Failed to save topics.' };
    } catch (e: any) {
      console.error('Error saving subject topics:', e);
      return { success: false, error: e.message || 'Error saving subject topics.' };
    }
  };

  const deleteSubject = async (subjectId: string): Promise<boolean> => {
    if (!subjectId) return false;
    try {
      const res = await fetch(`/api/syllabus/tree?subjectId=${encodeURIComponent(subjectId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        // Immediate clean refresh from database
        await refreshSyllabus();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error deleting subject:', e);
      return false;
    }
  };

  const addTopic = async (subjectId: string, title: string, courseId?: string): Promise<boolean> => {
    if (!subjectId || !title || !title.trim()) return false;
    try {
      const res = await fetch('/api/syllabus/tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_TOPIC',
          subjectId,
          courseId,
          title: title.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshSyllabus();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error adding topic:', e);
      return false;
    }
  };

  const deleteTopic = async (topicId: string): Promise<boolean> => {
    if (!topicId) return false;
    try {
      const res = await fetch(`/api/syllabus/tree?topicId=${encodeURIComponent(topicId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        // Immediate clean refresh from database
        await refreshSyllabus();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error deleting topic:', e);
      return false;
    }
  };

  const importTopics = async (subjectId: string, pageNum: number) => {
    const subject = syllabus.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const sName = subject.title;
    const defaultTopics = pageNum === 1
      ? [`Introduction to ${sName}`, `Setting up local environment for ${sName}`, `${sName} basic syntax and variables`]
      : pageNum === 2
      ? [`${sName} conditional checks (if/else)`, `Iteration & Loop blocks in ${sName}`, `Error handling and try-catch structures`]
      : [`${sName} Functions & Closure execution`, `Performance tuning & benchmarking in ${sName}`, `Integrating ${sName} with database drivers`];

    for (const title of defaultTopics) {
      await addTopic(subjectId, title);
    }
  };

  const generateDailyPlan = (subjectIds: string[], availableMinutes: number) => {
    if (subjectIds.length === 0 || availableMinutes <= 0) return;

    const selectedSubjects = syllabus.subjects.filter(sub => subjectIds.includes(sub.id));
    const allIncompleteTopics: any[] = [];
    
    selectedSubjects.forEach(sub => {
      (sub.courses || sub.chapters || []).forEach(chap => {
        (chap.todoItems || chap.topics || []).forEach((topic: any) => {
          if (!topic.completed && topic.status !== 'COMPLETED') {
            const targetM = topic.targetMinutes || topic.estimatedMinutes || 20;
            allIncompleteTopics.push({
              todoItemId: topic.id,
              topicId: topic.id,
              courseId: chap.id,
              chapterId: chap.id,
              subjectId: sub.id,
              title: topic.title,
              normalizedTitle: topic.normalizedTitle || topic.title,
              subjectName: sub.title,
              completed: false,
              requiredMinutes: targetM,
              difficulty: topic.difficulty || 'MEDIUM',
              estimatedMinMinutes: topic.estimatedMinMinutes || 15,
              estimatedMaxMinutes: topic.estimatedMaxMinutes || 30,
              targetMinutes: targetM,
              actualMinutes: topic.actualMinutes || 0,
              status: 'PLANNED'
            });
          }
        });
      });
    });

    let remainingMinutes = availableMinutes;
    const scheduledTopics: any[] = [];
    
    for (const item of allIncompleteTopics) {
      if (remainingMinutes >= item.requiredMinutes) {
        scheduledTopics.push(item);
        remainingMinutes -= item.requiredMinutes;
      } else if (scheduledTopics.length === 0) {
        // Include at least one topic if available time is smaller than first topic's target
        scheduledTopics.push(item);
        break;
      } else {
        break;
      }
    }

    const subjectName = selectedSubjects.map(s => s.title).join(' + ') || 'No Active Quest';

    setDailyMission({
      id: `mis-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subjectId: subjectIds[0] || '',
      subjectName,
      topicIds: scheduledTopics.map(t => t.topicId || t.todoItemId || t.id),
      topicTitles: scheduledTopics.map(t => t.title),
      requiredSeconds: availableMinutes * 60,
      completedSeconds: 0,
      isCompleted: false,
      isVerified: false,
      proofScreenshots: [],
      selectedSubjectIds: subjectIds,
      scheduledTopics: scheduledTopics
    });
  };

  const resetDailyMissionForNextSubject = () => {
    setDailyMission(INITIAL_DAILY_MISSION);
    setProofScreenshots([]);
    setTrainingSeconds(0);
    setIsTrainingActive(false);
    setIsFocusMode(false);
  };

  const completeTopic = async (topicId: string, completed: boolean = true): Promise<boolean> => {
    try {
      const res = await fetch('/api/syllabus/tree', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          status: completed ? 'COMPLETED' : 'NOT_STARTED',
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.chakra !== undefined) {
          setUserProfile(prev => ({ ...prev, chakra: data.chakra }));
        }
        await refreshSyllabus();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error completing topic:', e);
      return false;
    }
  };

  const toggleTopicCompletion = async (subjectId: string, chapterId: string, topicId: string) => {
    let isCurrentlyCompleted = false;
    syllabus.subjects.forEach(s => {
      (s.courses || s.chapters || []).forEach(c => {
        (c.todoItems || c.topics || []).forEach((t: any) => {
          if (t.id === topicId || t.title === topicId) {
            isCurrentlyCompleted = Boolean(t.completed || t.status === 'COMPLETED');
          }
        });
      });
    });

    await completeTopic(topicId, !isCurrentlyCompleted);
  };

  const verifyMission = (): Promise<ProofVerificationResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccessful = proofScreenshots.length > 0;
        if (isSuccessful) {
          // Increment streak
          const newStreak = userProfile.currentStreak + 1;
          const newBestStreak = Math.max(userProfile.bestStreak, newStreak);
          
          let newRank = userProfile.rank;
          if (newStreak >= 31 && userProfile.rank === 'GENIN') {
            newRank = 'CHUNIN';
            setShowRankUpModal('CHUNIN');
          }

          updateUserProfile({
            currentStreak: newStreak,
            bestStreak: newBestStreak,
            rank: newRank,
            totalStudyHours: Number((userProfile.totalStudyHours + (Math.max(0, dailyMission.requiredSeconds - trainingSeconds) / 3600)).toFixed(1))
          });

          setDailyMission(prev => ({
            ...prev,
            isCompleted: true,
            isVerified: true,
            proofScreenshots: proofScreenshots
          }));

          setShowDailyMotivation(true);
          setJiraiyaMood('SUCCESS', "Mission officially Verified! Your Will of Fire grows stronger.");

          resolve({
            verified: true,
            matchedSubject: dailyMission.subjectName,
            matchedTopics: dailyMission.topicTitles,
            confidenceScore: 98.4,
            message: "Proof matched learning portal mission structure perfectly! +1 Day Streak gained.",
            timestamp: new Date().toLocaleTimeString()
          });
        } else {
          resolve({
            verified: false,
            matchedSubject: dailyMission.subjectName,
            matchedTopics: [],
            confidenceScore: 12.0,
            message: "No completion screenshots detected. Please upload at least one screenshot from your learning portal.",
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }, 2500);
    });
  };

  const dismissRankUpModal = () => {
    setShowRankUpModal(null);
  };

  const dismissDailyMotivation = () => {
    setShowDailyMotivation(false);
  };

  const createSquad = (squadName: string) => {
    const code = `ANSK-${Math.floor(1000 + Math.random() * 9000)}`;
    setSquad({
      name: squadName,
      code,
      members: [],
      joined: true,
      leaderboardOrder: []
    });
  };

  const joinSquad = (code: string): { success: boolean; error?: string } => {
    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode.startsWith('ANSK-')) {
      return { success: false, error: 'SQUAD NOT FOUND' };
    }

    if (trimmedCode === 'ANSK-4821') {
      return { success: false, error: 'SQUAD FULL — MAXIMUM 8 MEMBERS' };
    }

    setSquad({
      name: `Squad ${trimmedCode.split('-')[1] || 'Shinobi'}`,
      code: trimmedCode,
      members: [],
      joined: true,
      leaderboardOrder: []
    });

    return { success: true };
  };

  const leaveSquad = () => {
    setSquad(null);
    setLeaderOvertaken(false);
    setRankOvertaken(null);
  };

  const simulateMemberJoin = () => {
    // This is handled in the UI flow by setting simulating states
  };

  const selectShinobiIdentity = (memberId: string, name: string, studyTimeSeconds = 0): { success: boolean; error?: string } => {
    let result: { success: boolean; error?: string } = { success: true };

    setSquad(prev => {
      if (!prev) {
        result = { success: false, error: 'NO ACTIVE SQUAD' };
        return prev;
      }
      if (prev.members.length >= 8 && !prev.members.some(m => m.id === memberId)) {
        result = { success: false, error: 'SQUAD FULL — MAXIMUM 8 MEMBERS' };
        return prev;
      }
      const isTaken = prev.members.some(m => m.name === name && m.id !== memberId);
      if (isTaken) {
        result = { success: false, error: 'IDENTITY ALREADY RESERVED' };
        return prev;
      }

      const existingMember = prev.members.find(m => m.id === memberId);
      let updatedMembers;

      if (existingMember) {
        updatedMembers = prev.members.map(m => 
          m.id === memberId ? { ...m, name } : m
        );
      } else {
        const newMember: SquadMember = {
          id: memberId,
          name,
          studyTimeSeconds,
          isMe: memberId === 'me',
          isCreator: memberId === 'me' && prev.members.length === 0
        };
        updatedMembers = [...prev.members, newMember];
      }

      const sortedMembers = [...updatedMembers].sort((a, b) => b.studyTimeSeconds - a.studyTimeSeconds);
      const leaderboardOrder = sortedMembers.map(m => m.id);

      return {
        ...prev,
        members: updatedMembers,
        leaderboardOrder
      };
    });

    return result;
  };

  return (
    <AppContext.Provider value={{
      introSeen,
      setIntroSeen,
      userProfile,
      updateUserProfile,
      syllabus,
      updateSyllabus,
      dailyMission,
      updateDailyMission,
      rival,
      achievements,
      jiraiyaMood,
      jiraiyaTextOverride,
      setJiraiyaMood,
      isTrainingActive,
      trainingSeconds,
      isFocusMode,
      startTraining,
      pauseTraining,
      finishTraining,
      setTrainingSeconds,
      proofScreenshots,
      addProofScreenshots,
      removeProofScreenshot,
      reorderProofScreenshots,
      verifyMission,
      showRankUpModal,
      dismissRankUpModal,
      showDailyMotivation,
      dismissDailyMotivation,
      showGuideAcademy,
      openGuideAcademy,
      closeGuideAcademy,
      showProfileSetupModal,
      setShowProfileSetupModal,
      saveProfileToBackend,
      toggleTopicCompletion,
      completeTopic,
      addTopic,
      deleteTopic,
      addSubject,
      saveSubjectTopics,
      deleteSubject,
      importTopics,
      generateDailyPlan,
      resetDailyMissionForNextSubject,
      refreshSyllabus,
      timerMode,
      setTimerMode,
      regularHours,
      regularMinutes,
      saveRegularSettings,
      manualHours,
      manualMinutes,
      setManualDuration,
      squad,
      createSquad,
      joinSquad,
      leaveSquad,
      simulateMemberJoin,
      selectShinobiIdentity,
      leaderOvertaken,
      setLeaderOvertaken,
      rankOvertaken,
      setRankOvertaken
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
