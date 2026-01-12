/*
  # Add Public View Policy for Submitted Forms

  1. Changes
    - Add public read policy for form_submissions table
    - Allow anonymous users to view only submitted (non-draft) forms
    - Enables public /view URLs without authentication
    
  2. Security
    - Only submitted forms are viewable (is_draft = false)
    - No write access for anonymous users
    - Existing authenticated policies remain unchanged
*/

-- Add policy to allow public viewing of submitted forms
CREATE POLICY "Anyone can view submitted forms"
  ON form_submissions
  FOR SELECT
  TO anon
  USING (is_draft = false);