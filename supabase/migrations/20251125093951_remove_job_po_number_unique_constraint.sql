/*
  # Remove Unique Constraint on Job/PO Number

  1. Changes
    - Drop unique constraint on `job_po_number` column
    - Allows duplicate job/po numbers across different forms
    - Forms will be uniquely identified by their UUID (id column)
  
  2. Reason
    - Multiple technicians may have forms with same job/po number
    - URL structure will change to: /form/:uniqueId/:jobNumber
    - The UUID will be the primary identifier for each form
*/

ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_job_po_number_key;

-- Add index for faster lookups by job_po_number (without uniqueness constraint)
CREATE INDEX IF NOT EXISTS idx_form_submissions_job_po_number ON form_submissions(job_po_number);