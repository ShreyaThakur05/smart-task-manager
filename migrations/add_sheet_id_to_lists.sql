-- Add sheet_id column to lists table
ALTER TABLE lists ADD COLUMN IF NOT EXISTS sheet_id UUID;

-- Add foreign key constraint to sheets table (if you have a sheets table)
-- If you don't have a sheets table, skip this line
-- ALTER TABLE lists ADD CONSTRAINT fk_lists_sheet FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lists_sheet_id ON lists(sheet_id);
