# Database Migration Instructions

## Run these SQL migrations in your Supabase SQL Editor

### Migration 1: Add 'yet-to-start' status
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `add_yet_to_start_status.sql`
4. Click "Run" to execute

### Migration 2: Add sheet_id to lists
1. In the same SQL Editor
2. Copy and paste the contents of `add_sheet_id_to_lists.sql`
3. Click "Run" to execute

### Migration 3: Add sheet_id to tasks ⚠️ REQUIRED
1. In the same SQL Editor
2. Copy and paste the contents of `add_sheet_id_to_tasks.sql`
3. Click "Run" to execute

## What these migrations do:

**Migration 1:**
- Adds 'yet-to-start' status to the tasks table constraint
- Ensures start_date column exists
- Creates an index for better performance

**Migration 2:**
- Adds sheet_id column to lists table
- Creates index for better query performance
- Enables proper sheet-list relationships

**Migration 3:**
- Adds sheet_id column to tasks table
- Creates index for better query performance
- Enables tasks to persist per sheet

## After running migrations:

✅ **Yet to Start** list for tasks with future start dates
✅ Automatic movement to "In Progress" when start date arrives
✅ Custom lists persist per sheet
✅ Tasks persist per sheet
✅ Sheet renaming works properly
✅ All data persists correctly after refresh
