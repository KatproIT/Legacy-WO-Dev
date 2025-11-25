/*
  # Add Draft Functionality to Form Submissions

  1. Changes
    - Add `is_draft` column to track draft status
    - Draft forms can have duplicate job/po numbers
    - Technicians can save multiple drafts
  
  2. Notes
    - Drafts are filtered by submitted_by_email
    - is_draft defaults to false for regular submissions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'is_draft'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN is_draft boolean DEFAULT false;
  END IF;
END $$;

-- Add index for faster draft queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_drafts 
  ON form_submissions(submitted_by_email, is_draft) 
  WHERE is_draft = true;