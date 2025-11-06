/*
  # Add Authentication and Workflow Fields

  1. Changes
    - Add new fields to form_submissions table:
      - submitted_by_email (text) - Email of the user who created/last edited the form
      - is_first_submission (boolean) - Track if form has been sent to SharePoint
      - is_rejected (boolean) - Track if form has been rejected by PM
      - is_forwarded (boolean) - Track if form has been forwarded by PM
      - rejection_note (text) - Note from PM when rejecting
      - forwarded_to_email (text) - Email of technician form was forwarded to
      - workflow_timestamp (timestamptz) - Timestamp of last workflow action

  2. Notes
    - is_first_submission defaults to true (first save will send to SharePoint)
    - is_rejected and is_forwarded default to false
    - All new fields are optional except is_first_submission
*/

-- Add authentication and workflow tracking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'submitted_by_email'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN submitted_by_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'is_first_submission'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN is_first_submission boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'is_rejected'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN is_rejected boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'is_forwarded'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN is_forwarded boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'rejection_note'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN rejection_note text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'forwarded_to_email'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN forwarded_to_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'workflow_timestamp'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN workflow_timestamp timestamptz;
  END IF;
END $$;
