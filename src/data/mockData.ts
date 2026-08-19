import { RankInfo, RankType, UserProfile, Syllabus, DailyMission, Rival, Achievement, JiraiyaMood } from '../types';

export const RANKS_DATA: Record<RankType, RankInfo> = {
  NINJA_STUDENT: {
    id: 'NINJA_STUDENT',
    name: 'Ninja Student',
    jpName: '忍者生',
    minStreakRequired: 0,
    requiredDaysTotal: 0,
    color: '#94A3B8',
    quote: 'The journey of a thousand miles begins with a single step into the Academy.'
  },
  GENIN: {
    id: 'GENIN',
    name: 'Genin',
    jpName: '下忍',
    minStreakRequired: 7,
    requiredDaysTotal: 7,
    color: '#10B981',
    quote: 'You have mastered basic chakra control. Maintain daily discipline.'
  },
  CHUNIN: {
    id: 'CHUNIN',
    name: 'Chūnin',
    jpName: '中忍',
    minStreakRequired: 31,
    requiredDaysTotal: 31,
    color: '#00F0FF',
    quote: 'Tactical endurance unlocked. 31 days of unwavering perseverance.'
  },
  JONIN: {
    id: 'JONIN',
    name: 'Jōnin',
    jpName: '上忍',
    minStreakRequired: 60,
    requiredDaysTotal: 60,
    color: '#FF6B00',
    quote: 'Mastery of high-level syllabus jutsu. Leading by example.'
  },
  ANBU_BLACK_OPS: {
    id: 'ANBU_BLACK_OPS',
    name: 'ANBU Black Ops',
    jpName: '暗部',
    minStreakRequired: 120,
    requiredDaysTotal: 120,
    color: '#9D4EDD',
    quote: 'Silent execution in the shadows. Flawless syllabus completion.'
  },
  HOKAGE: {
    id: 'HOKAGE',
    name: 'Hokage',
    jpName: '火影',
    minStreakRequired: 180,
    requiredDaysTotal: 180,
    color: '#FFD700',
    quote: 'Will of Fire personified. You stand at the pinnacle of knowledge.'
  }
};

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  ninjaIdentity: '',
  rank: 'NINJA_STUDENT',
  nickname: '',
  currentStreak: 0,
  bestStreak: 0,
  totalStudyHours: 0,
  dailyTimeCommitmentMinutes: 0,
  schedule: {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0
  },
  hasInterruptedStreak: false,
  lastActiveDate: '',
  avatarUrl: '',
  soundEnabled: true,
  motionEnabled: true
};

export const INITIAL_SYLLABUS: Syllabus = {
  id: '',
  title: '',
  lastUpdated: '',
  subjects: []
};

export const INITIAL_DAILY_MISSION: DailyMission = {
  id: '',
  date: '',
  subjectId: '',
  subjectName: '',
  topicIds: [],
  topicTitles: [],
  requiredSeconds: 0,
  completedSeconds: 0,
  isCompleted: false,
  isVerified: false,
  proofScreenshots: []
};

export const RIVAL_DATA: Rival = {
  id: 'riv-sasuke',
  name: 'Uchiha Sasuke',
  animeTitle: 'The Avenger',
  avatar: '/images/sasuke_avatar.png',
  rank: 'NINJA_STUDENT',
  nickname: '',
  streak: 0,
  totalHours: 0,
  syllabusCompletionPercent: 0,
  activeTopic: '',
  isUserAhead: false,
  leadHours: 0
};

export const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: 'ach-1',
    title: 'First Scroll Opened',
    description: 'Upload your first syllabus and start training.',
    iconName: 'Scroll',
    unlocked: false,
    category: 'SPECIAL',
    badgeGlow: '#10B981'
  },
  {
    id: 'ach-2',
    title: 'Genin Ascension',
    description: 'Maintain a 7-day uninterrupted study streak.',
    iconName: 'Zap',
    unlocked: false,
    category: 'STREAK',
    badgeGlow: '#10B981'
  },
  {
    id: 'ach-3',
    title: 'Chūnin Exam Trial',
    description: 'Maintain a 31-day uninterrupted study streak.',
    iconName: 'ShieldAlert',
    unlocked: false,
    category: 'STREAK',
    badgeGlow: '#00F0FF'
  },
  {
    id: 'ach-4',
    title: '100 Hours of Chakra',
    description: 'Log 100 verified study hours on the training ground.',
    iconName: 'Clock',
    unlocked: false,
    category: 'TIME',
    badgeGlow: '#FF6B00'
  },
  {
    id: 'ach-5',
    title: 'Syllabus Conqueror',
    description: 'Complete 50% of your total uploaded syllabus topics.',
    iconName: 'Award',
    unlocked: false,
    category: 'SYLLABUS',
    badgeGlow: '#9D4EDD'
  },
  {
    id: 'ach-6',
    title: 'Rival Overtake',
    description: 'Surpass your rival Sasuke in total syllabus completion.',
    iconName: 'Swords',
    unlocked: false,
    category: 'SPECIAL',
    badgeGlow: '#FFD700'
  }
];

export const JIRAIYA_DIALOGUES: Record<JiraiyaMood, string[]> = {
  IDLE: [
    "A ninja's true strength lies not in talent, but in the unyielding determination to complete their scroll.",
    "Small daily steps stack up into legendary power. Stay focused kid!"
  ],
  WELCOME: [
    "Welcome back to the training ground, kid! Show me the scroll you are carrying today.",
    "Ah! Ready to forge your knowledge into an unbreakable blade? Let's check your syllabus!"
  ],
  GUIDANCE: [
    "Remember: You don't have to finish the whole library today. You just have to keep moving!",
    "When the syllabus feels overwhelming, focus on just one single topic. Master it, then move forward."
  ],
  MISSION: [
    "You've committed 1 hour today. Give it your absolute focus and leave no regrets!",
    "Today's mission is right in front of you. Show me what a ninja can achieve in 60 minutes!"
  ],
  WARNING: [
    "Careful now! Slacking off will let your rival sprint ahead. Get back into position!",
    "Your training ground is waiting. Don't let your Will of Fire extinguish!"
  ],
  SUCCESS: [
    "Splendid work! You've completed today's training proof. Take pride in today's gains and return tomorrow!",
    "Mission Verified! That is the disciplined focus of a future Hokage. Keep pushing!"
  ],
  COMEBACK: [
    "You strayed from the path, but you came back. That takes true courage. Now pick up your scrolls and continue!",
    "One missed day doesn't define a shinobi. Welcome back to the training ground!"
  ]
};
