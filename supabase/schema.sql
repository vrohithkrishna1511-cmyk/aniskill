-- ANISKILL — Supabase PostgreSQL Schema & Row Level Security (RLS) Policies

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- 1. USERS & PROFILES TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  shinobi_name TEXT NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  daily_available_minutes INT DEFAULT 60,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  chakra INT DEFAULT 100,
  rank TEXT DEFAULT 'NINJA_STUDENT',
  last_active_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ==================================================
-- 2. SUBJECTS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT DEFAULT 'BookOpen',
  color TEXT DEFAULT '#FF6B00',
  "order" INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own subjects"
  ON public.subjects FOR ALL
  USING (user_id = auth.uid());

-- ==================================================
-- 3. COURSES TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access courses under their subjects"
  ON public.courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      WHERE s.id = courses.subject_id AND s.user_id = auth.uid()
    )
  );

-- ==================================================
-- 4. TODO ITEMS TABLE (Curriculum Items)
-- ==================================================
CREATE TABLE IF NOT EXISTS public.todo_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  normalized_title TEXT,
  description TEXT,
  "order" INT DEFAULT 0,
  difficulty TEXT DEFAULT 'MEDIUM',
  estimated_minutes INT DEFAULT 20,
  estimated_min_minutes INT DEFAULT 15,
  estimated_max_minutes INT DEFAULT 30,
  target_minutes INT DEFAULT 20,
  actual_minutes INT DEFAULT 0,
  attempt_count INT DEFAULT 0,
  status TEXT DEFAULT 'NOT_STARTED',
  completed_at TIMESTAMP WITH TIME ZONE,
  progress FLOAT DEFAULT 0.0,
  quiz_score FLOAT,
  knowledge_confidence FLOAT DEFAULT 0.0,
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access todo items under their courses"
  ON public.todo_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.subjects s ON s.id = c.subject_id
      WHERE c.id = todo_items.course_id AND s.user_id = auth.uid()
    )
  );

-- ==================================================
-- 5. STUDY SESSIONS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  stopped_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INT DEFAULT 0,
  status TEXT DEFAULT 'IN_PROGRESS',
  items_covered JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their study sessions"
  ON public.study_sessions FOR ALL
  USING (user_id = auth.uid());

-- ==================================================
-- 6. DAILY STUDY RECORDS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.daily_study_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  total_seconds INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  quiz_score FLOAT,
  streak_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_study_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their daily study records"
  ON public.daily_study_records FOR ALL
  USING (user_id = auth.uid());

-- ==================================================
-- 7. QUIZ ATTEMPTS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  attempt_number INT DEFAULT 1,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  score FLOAT NOT NULL,
  confidence FLOAT NOT NULL,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their quiz attempts"
  ON public.quiz_attempts FOR ALL
  USING (user_id = auth.uid());

-- ==================================================
-- 8. EXAMS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_date TEXT NOT NULL,
  plan_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their exam schedules"
  ON public.exams FOR ALL
  USING (user_id = auth.uid());

-- ==================================================
-- 9. SHINOBI REST DAYS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.shinobi_rests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rest_date TEXT NOT NULL,
  reason TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  original_mission_date TEXT,
  postponed_mission_date TEXT
);

ALTER TABLE public.shinobi_rests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their rest days"
  ON public.shinobi_rests FOR ALL
  USING (user_id = auth.uid());

-- ==================================================
-- 10. RIVALRY ROOMS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.rivalry_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code TEXT UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  opponent_id UUID REFERENCES public.profiles(id),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject_name TEXT,
  mode TEXT DEFAULT '1 HOUR',
  status TEXT DEFAULT 'WAITING',
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.rivalry_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room participants can view their rooms"
  ON public.rivalry_rooms FOR SELECT
  USING (creator_id = auth.uid() OR opponent_id = auth.uid() OR status = 'WAITING');

CREATE POLICY "Room creators can update their rooms"
  ON public.rivalry_rooms FOR UPDATE
  USING (creator_id = auth.uid() OR opponent_id = auth.uid());

-- ==================================================
-- 11. RIVALRY SESSIONS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.rivalry_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rivalry_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  stopped_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INT DEFAULT 0,
  status TEXT DEFAULT 'TRAINING',
  assigned_items JSONB DEFAULT '[]'::jsonb,
  completed_items JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.rivalry_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can manage their rivalry session"
  ON public.rivalry_sessions FOR ALL
  USING (user_id = auth.uid());
