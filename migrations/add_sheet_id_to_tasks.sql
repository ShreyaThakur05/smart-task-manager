-- Add sheet_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sheet_id TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_sheet_id ON tasks(sheet_id);
