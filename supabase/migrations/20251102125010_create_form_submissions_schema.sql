/*
  # Form Submissions Database Schema
  
  1. New Tables
    - `form_submissions`
      - `id` (uuid, primary key) - unique identifier for each submission
      - `slug` (text, unique) - URL-friendly identifier for edit links
      - `status` (text) - draft or submitted
      - `submitted_at` (timestamptz) - when form was first submitted
      - `created_at` (timestamptz) - when draft was created
      - `updated_at` (timestamptz) - last update time
      
      General Info Fields:
      - `date` (date, required)
      - `job_po_number` (text, required)
      - `technician` (text, required)
      
      Work Order Fields:
      - `customer` (text, required)
      - `site_name` (text, required)
      - `site_address` (text, required)
      - `type_of_service` (text)
      - `contact_name` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `next_inspection_due` (date)
      
      Equipment Details (JSON):
      - `equipment_generator` (jsonb)
      - `equipment_engine` (jsonb)
      - `equipment_ats1` (jsonb)
      - `equipment_ats2` (jsonb)
      
      Maintenance Info:
      - `date_last_oil_change` (date)
      - `battery_date` (date)
      - `battery_type` (text)
      - `battery_charger_volts` (numeric)
      - `exercise_day` (text)
      - `with_load` (text)
      - `exercise_time` (time)
      - `exercise_interval` (text)
      - `load_bank_test` (text)
      - `transfer_test` (text)
      - `full_caps` (text)
      - `fuel_type` (text)
      - `fuel_added` (numeric)
      - `fuel_percentage` (numeric)
      
      Load Bank Test Section:
      - `oil_type` (text)
      - `oil_cap` (text)
      - `oil_psi` (text)
      - `oil_filter_pn` (text)
      - `oil_filter_status` (text)
      - `fuel_filter_pn` (text)
      - `fuel_filter_status` (text)
      - `coolant_filter_pn` (text)
      - `coolant_filter_status` (text)
      - `air_filter_pn` (text)
      - `air_filter_status` (text)
      
      System Checks:
      - `coolant_level_field1` (text)
      - `coolant_level_field2` (text)
      - `coolant_level_field3` (text)
      - `hoses_belts_cooling_fins` (text)
      - `block_heater_status` (text)
      - `ignition_system_status` (text)
      - `governor_system` (text)
      - `fuel_system_day_tank` (text)
      - `fuel_line` (text)
      - `check_all_systems_for_leaks` (text)
      - `exhaust_system` (text)
      - `charging_starting_system` (text)
      
      Electrical Readings:
      - `electrical_an` (text)
      - `electrical_ab` (text)
      - `electrical_bn` (text)
      - `electrical_bc` (text)
      - `electrical_cn` (text)
      - `electrical_ca` (text)
      - `frequency` (text)
      - `voltage_a` (text)
      - `voltage_b` (text)
      - `voltage_c` (text)
      
      Additional Checks:
      - `instruments_lamps_wiring` (text)
      - `generator_controls_safeties` (text)
      - `enclosure_condition` (text)
      - `ats_control_battery` (text)
      - `ats_contactor` (text)
      - `transfer_time` (text)
      - `re_transfer_time` (text)
      - `cooldown` (text)
      - `fill_caps` (text)
      - `unit_in_auto_breakers_on` (text)
      - `recommend_generator_be_replaced` (text)
      
      Dynamic Tables (JSON):
      - `battery_health_readings` (jsonb) - array of battery readings
      - `recommended_parts` (jsonb) - array of recommended parts
      - `parts_supplies_used` (jsonb) - array of parts used
      - `time_on_job` (jsonb) - array of work log entries
      
      Additional Charges:
      - `trip_charge` (numeric)
      - `environmental_fee` (numeric)
      - `consumables` (numeric)
      
      Work Performed:
      - `work_performed` (text)
      
      Metadata:
      - `http_post_sent` (boolean) - track if initial POST was sent
      
  2. Security
    - Enable RLS on `form_submissions` table
    - Add policy for public read access (anyone with link can view)
    - Add policy for public insert/update (anyone can create/edit drafts)
*/

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- General Info (Required)
  date date,
  job_po_number text,
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
  block_heater_status text,
  ignition_system_status text,
  governor_system text,
  fuel_system_day_tank text,
  fuel_line text,
  check_all_systems_for_leaks text,
  exhaust_system text,
  charging_starting_system text,
  
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
  generator_controls_safeties text,
  enclosure_condition text,
  ats_control_battery text,
  ats_contactor text,
  transfer_time text,
  re_transfer_time text,
  cooldown text,
  fill_caps text,
  unit_in_auto_breakers_on text,
  recommend_generator_be_replaced text,
  
  -- Dynamic Tables (JSON arrays)
  battery_health_readings jsonb DEFAULT '[]'::jsonb,
  recommended_parts jsonb DEFAULT '[]'::jsonb,
  parts_supplies_used jsonb DEFAULT '[]'::jsonb,
  time_on_job jsonb DEFAULT '[]'::jsonb,
  
  -- Additional Charges
  trip_charge numeric DEFAULT 0,
  environmental_fee numeric DEFAULT 0,
  consumables numeric DEFAULT 0,
  
  -- Work Performed
  work_performed text,
  
  -- Metadata
  http_post_sent boolean DEFAULT false
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_slug ON form_submissions(slug);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read form submissions (public access via link)
CREATE POLICY "Anyone can view form submissions"
  ON form_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Anyone can insert form submissions
CREATE POLICY "Anyone can create form submissions"
  ON form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Anyone can update form submissions
CREATE POLICY "Anyone can update form submissions"
  ON form_submissions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
