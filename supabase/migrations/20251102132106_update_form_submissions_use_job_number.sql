/*
  # Update form_submissions to use job_po_number as unique identifier
  
  1. Changes
    - Remove slug column (no longer needed)
    - Make job_po_number unique and required
    - Update index to use job_po_number instead of slug
    
  2. Notes
    - Forms will be accessed via job number instead of random slug
    - Shorter, more meaningful URLs
    - Job numbers must be unique across all submissions
*/

-- Drop existing slug index
DROP INDEX IF EXISTS idx_form_submissions_slug;

-- Remove slug column
ALTER TABLE form_submissions DROP COLUMN IF EXISTS slug;

-- Make job_po_number unique and NOT NULL (with conditional check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'form_submissions_job_po_number_key'
  ) THEN
    ALTER TABLE form_submissions 
    ADD CONSTRAINT form_submissions_job_po_number_key UNIQUE (job_po_number);
  END IF;
END $$;

-- Update job_po_number to be NOT NULL if it isn't already
DO $$
BEGIN
  ALTER TABLE form_submissions ALTER COLUMN job_po_number SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create index on job_po_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_job_po_number ON form_submissions(job_po_number);
