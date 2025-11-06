/*
  # Add Service Interval Checkboxes

  1. Changes
    - Add service interval due checkbox fields to form_submissions table:
      - `service_coolant_flush_due` (boolean) - Coolant Flush due checkbox
      - `service_batteries_due` (boolean) - Batteries due checkbox
      - `service_belts_due` (boolean) - Belts due checkbox
      - `service_hoses_due` (boolean) - Hoses due checkbox
    
  2. Notes
    - All fields are optional and default to false
    - These replace the warning emoji display with interactive checkboxes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'service_coolant_flush_due'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN service_coolant_flush_due boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'service_batteries_due'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN service_batteries_due boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'service_belts_due'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN service_belts_due boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'service_hoses_due'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN service_hoses_due boolean DEFAULT false;
  END IF;
END $$;