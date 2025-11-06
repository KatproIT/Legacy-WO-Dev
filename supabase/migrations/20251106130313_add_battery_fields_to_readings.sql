/*
  # Update Battery Health Readings Schema

  1. Changes
    - Add battery metadata fields to battery_health_readings JSONB structure
    - Fields added: batteryDate, batteryType, batteryChargerVolts
    - These fields will be stored within each battery reading object
    - Remove battery_date, battery_type, and battery_charger_volts from form_submissions table
    
  2. Notes
    - Battery metadata is now per-battery instead of per-form
    - Each battery reading can have its own date, type, and charger voltage
    - This change makes the battery readings more flexible and accurate
*/

-- Remove old battery fields from form_submissions table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'battery_date'
  ) THEN
    ALTER TABLE form_submissions DROP COLUMN battery_date;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'battery_type'
  ) THEN
    ALTER TABLE form_submissions DROP COLUMN battery_type;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'battery_charger_volts'
  ) THEN
    ALTER TABLE form_submissions DROP COLUMN battery_charger_volts;
  END IF;
END $$;
