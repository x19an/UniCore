-- schema.sql

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  days TEXT[],
  "creditHours" INTEGER,
  "requiredAttendance" INTEGER,
  "isDeleted" BOOLEAN DEFAULT false,
  "deletedAt" TIMESTAMPTZ
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 2. sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  "isDeleted" BOOLEAN DEFAULT false,
  "deletedAt" TIMESTAMPTZ
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sessions"
  ON sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 3. goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "targetDate" TIMESTAMPTZ,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  "checkIns" JSONB DEFAULT '[]'::jsonb,
  "isDeleted" BOOLEAN DEFAULT false,
  "deletedAt" TIMESTAMPTZ
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals"
  ON goals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 4. todos
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "dueDate" TIMESTAMPTZ,
  tags TEXT[],
  course TEXT,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMPTZ,
  priority TEXT,
  "isDeleted" BOOLEAN DEFAULT false,
  "deletedAt" TIMESTAMPTZ
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own todos"
  ON todos
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 5. activities (Streaks)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  "targetTimeMinutes" INTEGER NOT NULL,
  "completedTimeMinutes" INTEGER NOT NULL,
  "currentStreak" INTEGER NOT NULL,
  "longestStreak" INTEGER NOT NULL,
  category TEXT NOT NULL,
  "lastResetDate" TIMESTAMPTZ,
  "isDeleted" BOOLEAN DEFAULT false,
  "deletedAt" TIMESTAMPTZ
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own activities"
  ON activities
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 6. notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  "courseName" TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  "lectureNumber" INTEGER NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  "isDeleted" BOOLEAN DEFAULT false,
  "deletedAt" TIMESTAMPTZ
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notes"
  ON notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- Storage Bucket for Notes Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes_images', 'notes_images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage.objects
CREATE POLICY "Allow public read access to notes_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'notes_images');

CREATE POLICY "Allow authenticated users to upload to notes_images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'notes_images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own notes_images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'notes_images' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete their own notes_images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'notes_images' AND auth.uid() = owner);
