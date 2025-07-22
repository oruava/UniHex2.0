-- Create user_data table
CREATE TABLE IF NOT EXISTS user_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  levels TEXT DEFAULT '[]',
  schedule TEXT DEFAULT '[]',
  calendar_events TEXT DEFAULT '[]',
  subject_grades TEXT DEFAULT '[]',
  min_passing_grade DECIMAL DEFAULT 3.96,
  min_exam_grade DECIMAL DEFAULT 3.56,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own data
CREATE POLICY "Users can only access their own data" ON user_data
  FOR ALL USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert their own data" ON user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data" ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own data
CREATE POLICY "Users can delete their own data" ON user_data
  FOR DELETE USING (auth.uid() = user_id);
