/*
  # Add text input fields for System Checks and Additional Checks
  
  1. New Columns
    - Add text input columns for each system check field
    - Format: [field_name]_text for the input field
    - The existing fields will be used for dropdown status
    
  2. Changes
    - Add text fields for all system checks
    - Add text fields for all additional checks
*/

-- Add text input fields for System Checks
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS hoses_belts_cooling_fins_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS block_heater_status_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS ignition_system_status_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS governor_system_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS fuel_system_day_tank_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS fuel_line_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS check_all_systems_for_leaks_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS exhaust_system_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS charging_starting_system_text text;

-- Add text input fields for Additional Checks
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS instruments_lamps_wiring_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS generator_controls_safeties_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS enclosure_condition_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS ats_control_battery_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS ats_contactor_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS transfer_time_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS re_transfer_time_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS cooldown_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS unit_in_auto_breakers_on_text text;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS recommend_generator_be_replaced_text text;
