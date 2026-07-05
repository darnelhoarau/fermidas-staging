-- Add quiz support columns to course_lessons
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(20) DEFAULT 'video';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS quiz_id VARCHAR(255);
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS quiz_config JSONB DEFAULT '{}'::jsonb;

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  lesson_id TEXT NOT NULL REFERENCES course_lessons(id),
  quiz_id VARCHAR(255) NOT NULL,
  score INTEGER,
  total INTEGER,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  raw_result JSONB,
  attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_course ON quiz_results(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_lesson ON quiz_results(lesson_id);
