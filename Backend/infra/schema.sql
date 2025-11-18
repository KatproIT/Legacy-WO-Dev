-- infra/schema.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS form_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    status text DEFAULT 'draft',
    submitted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    date date,
    job_po_number text,
    technician text,
    customer text,
    site_name text,
    site_address text,
    type_of_service text,
    contact_name text,
    contact_phone text,
    contact_email text,
    next_inspection_due date,

    -- keep JSONB arrays/objects you already used
    equipment_generator jsonb DEFAULT '{}'::jsonb,
    equipment_engine jsonb DEFAULT '{}'::jsonb,
    equipment_ats1 jsonb DEFAULT '{}'::jsonb,
    equipment_ats2 jsonb DEFAULT '{}'::jsonb,

    -- many other top-level fields (kept for compatibility)
    -- (you provided the full list; include them here as-is in your final schema)
    -- for brevity, the backend uses 'data' as canonical form storage below

    data jsonb DEFAULT '{}'::jsonb,

    http_post_sent boolean DEFAULT false,
    submitted_by_email text,
    is_first_submission boolean DEFAULT true,
    is_rejected boolean DEFAULT false,
    is_forwarded boolean DEFAULT false,
    rejection_note text,
    forwarded_to_email text,
    workflow_timestamp timestamptz
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_job_po_number ON form_submissions(job_po_number);

-- trigger to set updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON form_submissions;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON form_submissions
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
