-- ============================================================================
-- AZURE DATABASE MIGRATION - ADD WORKFLOW COLUMNS
-- ============================================================================
--
-- This migration adds the missing workflow columns to the form_submissions
-- table in your Azure PostgreSQL database.
--
-- Run this script on your Azure PostgreSQL database to fix the workflow error.
--
-- ============================================================================

ALTER TABLE form_submissions
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;
ALTER TABLE form_submissions
ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT false;
ALTER TABLE form_submissions
ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'form_submissions' AND column_name IN ('is_approved', 'is_draft', 'data')
ORDER BY column_name;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- The following columns have been added to your form_submissions table:
--   - is_approved: boolean (for tracking approval status)
--   - is_draft: boolean (for tracking draft status)
--   - data: jsonb (for storing complete form data)
--
-- Your workflow submit, reject, forward, and approve endpoints should now work.
-- ============================================================================
