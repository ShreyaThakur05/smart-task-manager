-- Add 'yet-to-start' to the status constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('yet-to-start', 'backlog', 'in-progress', 'review', 'done'));

-- Add start_date column if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

-- Create index for better performance on start_date queries
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
