# Database Migration Instructions

## Run this SQL migration in your Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `add_yet_to_start_status.sql`
4. Click "Run" to execute the migration

This migration:
- Adds 'yet-to-start' status to the tasks table constraint
- Ensures start_date column exists
- Creates an index for better performance

After running the migration, your app will support:
- **Yet to Start** list for tasks with future start dates
- Automatic movement to "In Progress" when start date arrives
- Proper data persistence for all statuses
