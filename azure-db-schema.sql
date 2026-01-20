-- ============================================================================
-- AZURE POSTGRESQL MIGRATION SCRIPT
-- Legacy Work Order System - Complete Database Schema
-- ============================================================================
--
-- This script creates the complete database schema for the Legacy Work Order
-- System to be deployed on Azure Database for PostgreSQL.
--
-- Execute this script on your Azure PostgreSQL database after creation.
--
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: form_submissions
-- ============================================================================
-- Main table storing all work order form submissions

CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_po_number text UNIQUE NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- General Info (Required)
  date date,
  technician text,

  -- Work Order Fields
  customer text,
  site_name text,
  site_address text,
  type_of_service text,
  contact_name text,
  contact_phone text,
  contact_email text,
  next_inspection_due date,

  -- Equipment Details (JSON objects)
  equipment_generator jsonb DEFAULT '{}'::jsonb,
  equipment_engine jsonb DEFAULT '{}'::jsonb,
  equipment_ats1 jsonb DEFAULT '{}'::jsonb,
  equipment_ats2 jsonb DEFAULT '{}'::jsonb,

  -- Maintenance Info
  date_last_oil_change date,
  battery_date date,
  battery_type text,
  battery_charger_volts numeric,
  exercise_day text,
  with_load text,
  exercise_time time,
  exercise_interval text,
  load_bank_test text,
  transfer_test text,
  full_caps text,
  fuel_type text,
  fuel_added numeric,
  fuel_percentage numeric,

  -- Service Interval Checkboxes
  service_coolant_flush_due boolean DEFAULT false,
  service_batteries_due boolean DEFAULT false,
  service_belts_due boolean DEFAULT false,
  service_hoses_due boolean DEFAULT false,

  -- Load Bank Test Section
  oil_type text,
  oil_cap text,
  oil_psi text,
  oil_filter_pn text,
  oil_filter_status text,
  fuel_filter_pn text,
  fuel_filter_status text,
  coolant_filter_pn text,
  coolant_filter_status text,
  air_filter_pn text,
  air_filter_status text,

  -- System Checks
  coolant_level_field1 text,
  coolant_level_field2 text,
  coolant_level_field3 text,
  hoses_belts_cooling_fins text,
  hoses_belts_cooling_fins_text text,
  block_heater_status text,
  block_heater_status_text text,
  ignition_system_status text,
  ignition_system_status_text text,
  governor_system text,
  governor_system_text text,
  fuel_system_day_tank text,
  fuel_system_day_tank_text text,
  fuel_line text,
  fuel_line_text text,
  check_all_systems_for_leaks text,
  check_all_systems_for_leaks_text text,
  exhaust_system text,
  exhaust_system_text text,
  charging_starting_system text,
  charging_starting_system_text text,

  -- Electrical Readings
  electrical_an text,
  electrical_ab text,
  electrical_bn text,
  electrical_bc text,
  electrical_cn text,
  electrical_ca text,
  frequency text,
  voltage_a text,
  voltage_b text,
  voltage_c text,

  -- Additional Checks
  instruments_lamps_wiring text,
  instruments_lamps_wiring_text text,
  generator_controls_safeties text,
  generator_controls_safeties_text text,
  enclosure_condition text,
  enclosure_condition_text text,
  ats_control_battery text,
  ats_control_battery_text text,
  ats_contactor text,
  ats_contactor_text text,
  transfer_time text,
  transfer_time_text text,
  re_transfer_time text,
  re_transfer_time_text text,
  cooldown text,
  cooldown_text text,
  fill_caps text,
  unit_in_auto_breakers_on text,
  unit_in_auto_breakers_on_text text,
  recommend_generator_be_replaced text,
  recommend_generator_be_replaced_text text,

  -- Dynamic Tables (JSON arrays)
  battery_health_readings jsonb DEFAULT '[]'::jsonb,
  recommended_parts jsonb DEFAULT '[]'::jsonb,
  parts_supplies_used jsonb DEFAULT '[]'::jsonb,
  time_on_job jsonb DEFAULT '[]'::jsonb,
  additional_ats jsonb DEFAULT '[]'::jsonb,
  load_bank_entries jsonb DEFAULT '[]'::jsonb,

  -- Additional Charges
  trip_charge numeric DEFAULT 0,
  environmental_fee numeric DEFAULT 0,
  consumables numeric DEFAULT 0,

  -- Work Performed
  work_performed text,

  -- Load Bank Report Fields
  load_bank_customer text,
  load_bank_site text,
  load_bank_site_name text,
  load_bank_site_address text,
  load_bank_ambient_air_temp text,
  load_bank_make text,
  load_bank_model text,
  load_bank_sn text,
  load_bank_resistive_load text,
  load_bank_reactive_load text,
  load_bank_additional_comments text,

  -- Authentication and Workflow Fields
  submitted_by_email text,
  is_first_submission boolean DEFAULT true,
  is_rejected boolean DEFAULT false,
  is_forwarded boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  is_draft boolean DEFAULT false,
  rejection_note text,
  forwarded_to_email text,
  workflow_timestamp timestamptz,

  -- Metadata
  http_post_sent boolean DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TABLE: workflow_history
-- ============================================================================
-- Table to track all workflow actions for auditing and history display

CREATE TABLE IF NOT EXISTS workflow_history (
  id bigserial PRIMARY KEY,
  form_id text NOT NULL,
  action text NOT NULL,
  actor_email text NOT NULL,
  note text,
  forwarded_to_email text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Create indexes for performance optimization

CREATE INDEX IF NOT EXISTS idx_form_submissions_job_po_number
  ON form_submissions(job_po_number);

CREATE INDEX IF NOT EXISTS idx_form_submissions_status
  ON form_submissions(status);

CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at
  ON form_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_form_submissions_customer
  ON form_submissions(customer);

CREATE INDEX IF NOT EXISTS idx_form_submissions_site_name
  ON form_submissions(site_name);

CREATE INDEX IF NOT EXISTS idx_workflow_history_form_id ON workflow_history(form_id);

CREATE INDEX IF NOT EXISTS idx_workflow_history_created_at ON workflow_history(created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to automatically update updated_at column on row update
DROP TRIGGER IF EXISTS update_form_submissions_updated_at ON form_submissions;

CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Note: Adjust these based on your Azure PostgreSQL user setup

-- Grant permissions to the application user (replace 'app_user' with your actual user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON form_submissions TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after executing the script to verify everything is set up correctly

-- Check table exists
-- SELECT * FROM information_schema.tables WHERE table_name = 'form_submissions';

-- Check all columns
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'form_submissions'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'form_submissions';

-- Check triggers
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE event_object_table = 'form_submissions';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Your database schema is now ready for the Legacy Work Order System
-- Next steps:
--   1. Export data from Supabase (if migrating existing data)
--   2. Import data into Azure PostgreSQL
--   3. Update application connection string
--   4. Test application connectivity
-- ============================================================================
