/*
  # Add DELETE policy for form submissions

  1. Security Changes
    - Add policy to allow anyone (anon and authenticated) to delete form submissions
    - This enables the admin dashboard delete functionality
*/

CREATE POLICY "Anyone can delete form submissions"
  ON form_submissions
  FOR DELETE
  TO anon, authenticated
  USING (true);
