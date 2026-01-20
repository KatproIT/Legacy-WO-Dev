-- ============================================================================
-- ADD WORKFLOW HISTORY TABLE TO AZURE DATABASE
-- ============================================================================
-- This script adds the workflow_history table to track all form workflow actions
-- Execute this on your Azure PostgreSQL database
-- ============================================================================

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

-- Create index on form_id for faster queries
CREATE INDEX IF NOT EXISTS idx_workflow_history_form_id ON workflow_history(form_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_workflow_history_created_at ON workflow_history(created_at DESC);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the table was created successfully:
-- SELECT * FROM information_schema.tables WHERE table_name = 'workflow_history';
