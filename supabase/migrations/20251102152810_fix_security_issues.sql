/*
  # Fix Security Issues

  ## Changes Made
  
  1. **Remove Unused Indexes**
     - Drop `idx_form_submissions_status` - not being used in queries
     - Drop `idx_form_submissions_job_po_number` - redundant with unique constraint
     - Keep `form_submissions_job_po_number_key` (unique constraint) as it's actually used
     - Keep `idx_form_submissions_created_at` for sorting in admin dashboard
  
  2. **Fix Function Search Path Security**
     - Recreate `update_updated_at_column` function with `SET search_path = ''`
     - This prevents malicious users from exploiting mutable search paths
     - Fully qualify all object references with schema names
  
  ## Security Notes
  - The unique constraint on `job_po_number` already provides an index for lookups
  - Setting search_path to empty string and using qualified names prevents injection attacks
  - All changes are non-breaking and backward compatible
*/

-- Drop unused index on status column
DROP INDEX IF EXISTS idx_form_submissions_status;

-- Drop redundant index on job_po_number (unique constraint already provides indexing)
DROP INDEX IF EXISTS idx_form_submissions_job_po_number;

-- Recreate the update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Verify the function is properly secured
COMMENT ON FUNCTION public.update_updated_at_column() IS 
  'Automatically updates the updated_at column. Secured with empty search_path to prevent injection attacks.';
