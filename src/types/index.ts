export type RankType = 
  | 'NINJA_STUDENT'
  | 'GENIN'
  | 'CHUNIN'
  | 'JONIN'
  | 'ANBU_BLACK_OPS'
  | 'HOKAGE';

export interface RankInfo {
  id: RankType;
  name: string;
  jpName: string;
  minStreakRequired: number;
  requiredDaysTotal: number;
  badgeUrl?: string;
  color: string;
  quote: string;
}

export const SHINOBI_TITLES = [
  { title: 'The Yellow Flash of the Leaf', character: 'Minato Namikaze' },
  { title: 'The Copy Ninja', character: 'Kakashi Hatake' },
  { title: 'Itachi of the Sharingan', character: 'Itachi Uchiha' },
  { title: 'Ghost of the Uchiha', character: 'Madara Uchiha' },
  { title: 'The Noble Green Beast of Konoha', character: 'Might Guy' },
  { title: 'The Toad Sage', character: 'Jiraiya' },
  { title: 'God of Shinobi', character: 'Hashirama Senju' },
  { title: 'The Child of Prophecy', character: 'Naruto Uzumaki' },
  { title: 'Gaara of the Sand', character: 'Gaara' },
  { title: 'The Last Uchiha', character: 'Sasuke Uchiha' },
] as const;

export type NicknameType = 
  | 'The Yellow Flash of the Leaf'
  | 'The Copy Ninja'
  | 'Itachi of the Sharingan'
  | 'Ghost of the Uchiha'
  | 'The Noble Green Beast of Konoha'
  | 'The Toad Sage'
  | 'God of Shinobi'
  | 'The Child of Prophecy'
  | 'Gaara of the Sand'
  | 'The Last Uchiha'
  | 'Select Your Shinobi Title'
  | string;

export interface TodoItem {
  id: string;
  title: string;
  normalizedTitle?: string;
  completed: boolean;
  requiredMinutes: number;
  difficulty?: 'EASY' | 'MODERATE' | 'COMPLEX' | 'MEDIUM' | 'HARD' | 'ADVANCED' | 'VERY_HARD' | 'BASIC' | 'INTERMEDIATE' | 'TOUGH';
  estimatedMinutes?: number;
  estimatedMinMinutes?: number;
  estimatedMaxMinutes?: number;
  targetMinutes?: number;
  actualMinutes?: number;
  attemptCount?: number;
  status?: 'NOT_STARTED' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  completionDate?: string;
}

export type Topic = TodoItem;

export interface Course {
  id: string;
  title: string;
  todoItems: TodoItem[];
  topics: TodoItem[];
}

export type Chapter = Course;

export interface Subject {
  id: string;
  title: string;
  icon: string;
  color: string;
  courses: Course[];
  chapters: Course[];
}

export interface Syllabus {
  id: string;
  title: string;
  subjects: Subject[];
  lastUpdated: string;
}

export interface ScheduledTodoItem {
  id?: string;
  todoItemId?: string;
  topicId?: string;
  courseId?: string;
  chapterId?: string;
  subjectId: string;
  title: string;
  normalizedTitle?: string;
  subjectName: string;
  completed: boolean;
  requiredMinutes: number;
  difficulty?: 'EASY' | 'MODERATE' | 'COMPLEX' | 'MEDIUM' | 'HARD' | 'ADVANCED' | 'VERY_HARD' | 'BASIC' | 'INTERMEDIATE' | 'TOUGH';
  estimatedMinMinutes?: number;
  estimatedMaxMinutes?: number;
  targetMinutes?: number;
  actualMinutes?: number;
  status?: 'NOT_STARTED' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface DailyMission {
  id: string;
  date: string;
  subjectId: string;
  subjectName: string;
  topicIds: string[];
  topicTitles: string[];
  requiredSeconds: number;
  completedSeconds: number;
  isCompleted: boolean;
  isVerified: boolean;
  proofScreenshots: string[];
  selectedSubjectIds?: string[];
  scheduledTopics?: ScheduledTodoItem[];
  scheduledItems?: ScheduledTodoItem[];
}

export interface UserProfile {
  name: string;
  ninjaIdentity: string;
  rank: RankType;
  nickname: NicknameType;
  currentStreak: number;
  bestStreak: number;
  totalStudyHours: number;
  dailyTimeCommitmentMinutes: number;
  schedule: Record<string, number>; // e.g. { 'Mon': 60, 'Tue': 120, ... }
  hasInterruptedStreak: boolean;
  lastActiveDate: string;
  avatarUrl: string;
  soundEnabled: boolean;
  motionEnabled: boolean;
  chakra?: number;
  totalXp?: number;
}

export interface Rival {
  id: string;
  name: string;
  animeTitle: string;
  avatar: string;
  rank: RankType;
  nickname: string;
  streak: number;
  totalHours: number;
  syllabusCompletionPercent: number;
  activeTopic: string;
  isUserAhead: boolean;
  leadHours: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'STREAK' | 'SYLLABUS' | 'TIME' | 'SPECIAL';
  badgeGlow: string;
}

export type JiraiyaMood = 
  | 'IDLE'
  | 'WELCOME'
  | 'GUIDANCE'
  | 'MISSION'
  | 'WARNING'
  | 'SUCCESS'
  | 'COMEBACK';

export interface ProofVerificationResult {
  verified: boolean;
  matchedSubject: string;
  matchedTopics: string[];
  confidenceScore: number;
  message: string;
  timestamp: string;
}

export interface SquadMember {
  id: string;
  name: string;
  studyTimeSeconds: number;
  isMe?: boolean;
  isCreator?: boolean;
}

export interface Squad {
  name: string;
  code: string;
  members: SquadMember[];
  joined: boolean;
  leaderboardOrder: string[]; // member IDs in locked rank order
}

