-- Add list_id column to tasks table to track which custom list a task belongs to
-- For default lists (backlog, in-progress, review, done), list_id will be NULL
-- For custom lists, list_id will reference the custom list ID

ALTER TABLE public.tasks 
ADD COLUMN list_id UUID REFERENCES public.lists(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_tasks_list_id ON public.tasks(list_id);

-- Update RLS policies to include list_id
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Recreate RLS policies
CREATE POLICY "Users can view their own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);