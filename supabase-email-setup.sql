-- Supabase Email Template Configuration
-- Run this in Supabase SQL Editor to set up welcome email

-- 1. Enable email templates in Supabase Auth settings
-- Go to Authentication > Email Templates in Supabase Dashboard

-- 2. Create custom welcome email template
-- Replace the default "Confirm signup" template with this HTML content:

/*
Subject: Welcome to Smart Tasks! 🎉

HTML Content: Copy the entire content from WelcomeEmailTemplate.html

Variables available:
- {{ .SiteURL }} - Your app URL
- {{ .Email }} - User's email
- {{ .Token }} - Confirmation token (if needed)
- {{ .TokenHash }} - Token hash (if needed)
*/

-- 3. Configure SMTP settings (optional for custom domain)
-- In Supabase Dashboard > Settings > Auth
-- Add your SMTP provider details if you want custom sender domain

-- 4. Test the email template
-- Create a test user signup to verify email delivery

-- Note: Supabase automatically sends welcome emails on user signup
-- The template will be used for all new user confirmations