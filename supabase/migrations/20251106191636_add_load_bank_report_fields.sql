/*
  # Add Load Bank Report Fields

  1. Changes
    - Add new fields to form_submissions table for Load Bank Report:
      - load_bank_site_name (text) - Site name for load bank test
      - load_bank_site_address (text) - Site address for load bank test
      - load_bank_ambient_air_temp (text) - Ambient air temperature reading
      - load_bank_make (text) - Equipment make
      - load_bank_model (text) - Equipment model
      - load_bank_sn (text) - Equipment serial number

  2. Notes
    - All new fields are optional (nullable)
    - These fields complement the existing load_bank_customer and load_bank_site fields
*/

-- Add new load bank report fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'load_bank_site_name'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN load_bank_site_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'load_bank_site_address'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN load_bank_site_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'load_bank_ambient_air_temp'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN load_bank_ambient_air_temp text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'load_bank_make'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN load_bank_make text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'load_bank_model'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN load_bank_model text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'load_bank_sn'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN load_bank_sn text;
  END IF;
END $$;
