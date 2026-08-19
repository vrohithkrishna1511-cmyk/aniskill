export type CharacterId = 
  | 'naruto'
  | 'jiraiya' 
  | 'nine-tails' 
  | 'sasuke' 
  | 'rock-lee' 
  | 'kakashi' 
  | 'tobirama'
  | 'minato'
  | 'itachi'
  | 'obito'
  | 'madara'
  | 'hashirama'
  | 'sakura';

export type CharacterState = 
  | 'hero'
  | 'idle' 
  | 'welcome' 
  | 'teaching' 
  | 'mission' 
  | 'warning' 
  | 'success' 
  | 'comeback' 
  | 'rank-up' 
  | 'awakening' 
  | 'challenge' 
  | 'training' 
  | 'hokage';

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  title: string;
  quote: string;
  themeColor: string; // Tailwind color class or hex
  glowColor: string;  // Hex for drop-shadow or box-shadow
  avatarPath: string;
  fullBodyPath: string;
  stateImagePaths?: Partial<Record<CharacterState, string>>;
}

export const CHARACTER_REGISTRY: Record<CharacterId, CharacterConfig> = {
  naruto: {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    title: 'Future Hokage & Training Protagonist',
    quote: 'I never go back on my word... That is my ninja way!',
    themeColor: 'from-orange-500 to-amber-500',
    glowColor: '#FF6B00',
    avatarPath: '/characters/naruto/avatar.png',
    fullBodyPath: '/characters/naruto/hero.png',
    stateImagePaths: {
      hero: '/characters/naruto/hero.png',
      idle: '/characters/naruto/idle.png',
      training: '/characters/naruto/training.png',
      success: '/characters/naruto/success.png',
      awakening: '/characters/naruto/awakening.png',
      welcome: '/characters/naruto/welcome.png',
      challenge: '/characters/naruto/challenge.png',
      hokage: '/characters/naruto/hokage.png',
    },
  },
  jiraiya: {
    id: 'jiraiya',
    name: 'Jiraiya',
    title: 'Toad Sage & Legendary Mentor',
    quote: 'A real ninja is one who perseveres no matter what gets thrown at them.',
    themeColor: 'from-red-600 to-amber-600',
    glowColor: '#FF4500',
    avatarPath: '/characters/jiraiya-master.png',
    fullBodyPath: '/characters/jiraiya-master.png',
    stateImagePaths: {
      hero: '/characters/jiraiya-master.png',
      teaching: '/characters/jiraiya-master.png',
      mission: '/characters/jiraiya-master.png',
      warning: '/characters/jiraiya-master.png',
      success: '/characters/jiraiya-master.png',
      comeback: '/characters/jiraiya-master.png',
    },
  },
  'nine-tails': {
    id: 'nine-tails',
    name: 'Kurama',
    title: 'The Nine-Tails Spirit',
    quote: 'Lend me your chakra... and conquer every obstacle!',
    themeColor: 'from-red-700 to-orange-600',
    glowColor: '#FF2E54',
    avatarPath: '/characters/nine-tails/avatar.png',
    fullBodyPath: '/characters/nine-tails/hero.png',
    stateImagePaths: {
      hero: '/characters/nine-tails/hero.png',
      awakening: '/characters/nine-tails/awakening.png',
    },
  },
  sasuke: {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    title: 'Eternal Training Rival',
    quote: 'Are you gonna keep lagging behind, or will you step up?',
    themeColor: 'from-indigo-600 to-cyan-500',
    glowColor: '#6366F1',
    avatarPath: '/characters/sasuke/avatar.png',
    fullBodyPath: '/characters/sasuke/hero.png',
    stateImagePaths: {
      hero: '/characters/sasuke/hero.png',
      challenge: '/characters/sasuke/challenge.png',
    },
  },
  'rock-lee': {
    id: 'rock-lee',
    name: 'Rock Lee',
    title: 'Master of Youth & Discipline',
    quote: 'A dropouts hard work can surpass a genius with effort!',
    themeColor: 'from-emerald-500 to-teal-400',
    glowColor: '#10B981',
    avatarPath: '/characters/rock-lee/avatar.png',
    fullBodyPath: '/characters/rock-lee/hero.png',
    stateImagePaths: {
      hero: '/characters/rock-lee/hero.png',
      welcome: '/characters/rock-lee/welcome.png',
    },
  },
  kakashi: {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    title: 'Copy Ninja & Chief Evaluator',
    quote: 'In the ninja world, those who break the rules are scum... but those who abandon training are worse.',
    themeColor: 'from-blue-600 to-slate-400',
    glowColor: '#3B82F6',
    avatarPath: '/characters/kakashi/avatar.png',
    fullBodyPath: '/characters/kakashi/hero.png',
  },
  tobirama: {
    id: 'tobirama',
    name: 'Tobirama Senju',
    title: 'Second Hokage & Master of Focus',
    quote: 'Focus your mind like still water before unleashing your jutsu.',
    themeColor: 'from-cyan-600 to-blue-800',
    glowColor: '#06B6D4',
    avatarPath: '/characters/tobirama/avatar.png',
    fullBodyPath: '/characters/tobirama/hero.png',
  },
  minato: {
    id: 'minato',
    name: 'Minato Namikaze',
    title: 'Yellow Flash of the Leaf',
    quote: 'True speed comes from decisive action and unwavering focus.',
    themeColor: 'from-amber-400 to-yellow-500',
    glowColor: '#F59E0B',
    avatarPath: '/characters/minato/avatar.png',
    fullBodyPath: '/characters/minato/hero.png',
  },
  itachi: {
    id: 'itachi',
    name: 'Itachi Uchiha',
    title: 'Master of Illusion & Vision',
    quote: 'People live their lives bound by what they accept as correct.',
    themeColor: 'from-purple-900 to-red-800',
    glowColor: '#7C3AED',
    avatarPath: '/characters/itachi/avatar.png',
    fullBodyPath: '/characters/itachi/hero.png',
  },
  obito: {
    id: 'obito',
    name: 'Obito Uchiha',
    title: 'Masked Shinobi of Determination',
    quote: 'Those who abandon their comrades are worse than scum.',
    themeColor: 'from-orange-800 to-zinc-900',
    glowColor: '#EA580C',
    avatarPath: '/characters/obito/avatar.png',
    fullBodyPath: '/characters/obito/hero.png',
  },
  madara: {
    id: 'madara',
    name: 'Madara Uchiha',
    title: 'Legendary Ghost of the Uchiha',
    quote: 'Wake up to reality! Nothing ever goes as planned in this accursed world.',
    themeColor: 'from-red-950 to-indigo-950',
    glowColor: '#DC2626',
    avatarPath: '/characters/madara/avatar.png',
    fullBodyPath: '/characters/madara/hero.png',
  },
  hashirama: {
    id: 'hashirama',
    name: 'Hashirama Senju',
    title: 'First Hokage & God of Shinobi',
    quote: 'No matter what happens, I will protect our village and our Ninja Way.',
    themeColor: 'from-emerald-700 to-amber-700',
    glowColor: '#059669',
    avatarPath: '/characters/hashirama/avatar.png',
    fullBodyPath: '/characters/hashirama/hero.png',
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Haruno',
    title: 'Medical Ninja of Inner Strength',
    quote: 'I have to keep moving forward... I won\'t let anyone stand in front of me again!',
    themeColor: 'from-pink-500 to-rose-600',
    glowColor: '#EC4899',
    avatarPath: '/characters/sakura/avatar.png',
    fullBodyPath: '/characters/sakura/hero.png',
  },
};

export interface NinjaRank {
  id: string;
  name: string;
  japanese: string;
  symbol: string;
  requiredStreak: number;
  requiredSyllabusPercent: number;
  description: string;
  badgeGradient: string;
}

export const NINJA_RANKS: NinjaRank[] = [
  {
    id: 'student',
    name: 'Academy Student',
    japanese: '忍者学校生',
    symbol: '📜',
    requiredStreak: 0,
    requiredSyllabusPercent: 0,
    description: 'Beginning your journey. Learning basic chakra control and discipline.',
    badgeGradient: 'from-zinc-600 to-zinc-800',
  },
  {
    id: 'genin',
    name: 'Genin',
    japanese: '下忍',
    symbol: '🍃',
    requiredStreak: 3,
    requiredSyllabusPercent: 15,
    description: 'Junior Ninja. Assigned to your first real daily missions.',
    badgeGradient: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'chunin',
    name: 'Chūnin',
    japanese: '中忍',
    symbol: '🗡️',
    requiredStreak: 31,
    requiredSyllabusPercent: 40,
    description: 'Journeyman Ninja. Capable of leading training squads and tactical study.',
    badgeGradient: 'from-blue-600 to-indigo-800',
  },
  {
    id: 'jonin',
    name: 'Jōnin',
    japanese: '上忍',
    symbol: '⚡',
    requiredStreak: 60,
    requiredSyllabusPercent: 70,
    description: 'Elite Ninja. Mastered advanced topics and unyielding study consistency.',
    badgeGradient: 'from-purple-600 to-violet-900',
  },
  {
    id: 'anbu',
    name: 'ANBU Black Ops',
    japanese: '暗部',
    symbol: '🎭',
    requiredStreak: 120,
    requiredSyllabusPercent: 85,
    description: 'Special forces of learning. Operates in deep focus without distraction.',
    badgeGradient: 'from-red-600 to-rose-950',
  },
  {
    id: 'hokage',
    name: 'Hokage',
    japanese: '火影',
    symbol: '🔥',
    requiredStreak: 180,
    requiredSyllabusPercent: 100,
    description: 'Supreme Leader of the Village. Your consistency has become legendary.',
    badgeGradient: 'from-amber-400 via-orange-500 to-red-600',
  },
];
