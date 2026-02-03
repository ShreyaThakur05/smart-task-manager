# Database Migration Instructions

## Adding list_id Column to Tasks Table

To fix the custom list functionality, you need to run the migration to add a `list_id` column to the tasks table.

### Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Go to the SQL Editor

2. **Run the Migration**
   - Copy the contents of `add_list_id_to_tasks.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Changes**
   - Go to Table Editor > tasks table
   - Confirm the `list_id` column has been added
   - The column should be nullable and reference the `lists` table

### What This Migration Does:

- Adds `list_id` column to track which custom list a task belongs to
- For default lists (backlog, in-progress, review, done), `list_id` remains NULL
- For custom lists, `list_id` references the custom list ID
- Adds database index for better performance
- Updates Row Level Security policies

### After Migration:

- Custom lists will start empty (no tasks)
- Tasks can be dragged between default lists and custom lists
- Tasks created in custom lists will stay in those lists
- Existing tasks will remain in default lists (list_id = NULL)