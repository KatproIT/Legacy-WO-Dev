/*
  # Add Approval Workflow Field

  1. Changes
    - Add `is_approved` boolean field to `form_submissions` table
      - Tracks whether a form has been approved by PM/Admin
      - Defaults to false
      - Forms can be approved, rejected, and resubmitted in a loop
  
  2. Notes
    - No restrictions on editing approved forms
    - Forms can cycle through approved/rejected/resubmitted states
    - Used to display approval status in FormPage UI
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN is_approved boolean DEFAULT false;
  END IF;
END $$;