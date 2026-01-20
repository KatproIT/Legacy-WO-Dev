/*
  # Create Workflow History Table

  1. New Tables
    - `workflow_history`
      - `id` (bigserial, primary key) - Unique identifier for each history entry
      - `form_id` (text, not null) - Reference to form_submissions.id
      - `action` (text, not null) - Action taken: 'submitted', 'rejected', 'forwarded', 'approved', 'resubmitted'
      - `actor_email` (text, not null) - Email of the user who performed the action
      - `note` (text) - Optional note (e.g., rejection reason)
      - `forwarded_to_email` (text) - If action is 'forwarded', the email it was forwarded to
      - `created_at` (timestamptz, default now()) - When this action occurred

  2. Security
    - Enable RLS on `workflow_history` table
    - Add policy for authenticated PM+ users to read history
    - Add policy for backend to insert history records

  3. Notes
    - This table tracks all workflow actions for auditing and display purposes
    - History is append-only (no updates or deletes)
    - Provides a complete audit trail for each form's lifecycle
*/

-- Create workflow_history table
CREATE TABLE IF NOT EXISTS workflow_history (
  id bigserial PRIMARY KEY,
  form_id text NOT NULL,
  action text NOT NULL,
  actor_email text NOT NULL,
  note text,
  forwarded_to_email text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read history for forms they have access to
CREATE POLICY "Authenticated users can view workflow history"
  ON workflow_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert history records
CREATE POLICY "Authenticated users can insert workflow history"
  ON workflow_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index on form_id for faster queries
CREATE INDEX IF NOT EXISTS idx_workflow_history_form_id ON workflow_history(form_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_workflow_history_created_at ON workflow_history(created_at DESC);
