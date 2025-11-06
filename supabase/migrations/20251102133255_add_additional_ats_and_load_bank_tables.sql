/*
  # Add Additional ATS and Load Bank Report fields
  
  1. New Tables
    - `additional_ats` - For ATS 3-6 equipment details
    - `load_bank_entries` - For load bank test report entries
    
  2. Changes
    - Create additional_ats table with JSONB array for dynamic ATS units
    - Create load_bank_entries table for load bank report data
    - Link both tables to form_submissions
    
  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated access
*/

-- Add JSONB column for additional ATS units (ATS 3-6)
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS additional_ats jsonb DEFAULT '[]'::jsonb;

-- Add JSONB column for load bank report entries
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS load_bank_entries jsonb DEFAULT '[]'::jsonb;

-- Add load bank report metadata fields
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS load_bank_customer text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS load_bank_site text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS load_bank_resistive_load text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS load_bank_reactive_load text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS load_bank_additional_comments text;
