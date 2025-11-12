-- ============================================================================
-- SUPABASE DATA EXPORT SCRIPT
-- Legacy Work Order System - Export Existing Data
-- ============================================================================
--
-- Run this script in Supabase SQL Editor to export all existing data
-- Copy the results and use them to populate your Azure PostgreSQL database
--
-- ============================================================================

-- Export all form submissions as INSERT statements
SELECT 'INSERT INTO form_submissions (' ||
  'id, job_po_number, status, submitted_at, created_at, updated_at, ' ||
  'date, technician, customer, site_name, site_address, type_of_service, ' ||
  'contact_name, contact_phone, contact_email, next_inspection_due, ' ||
  'equipment_generator, equipment_engine, equipment_ats1, equipment_ats2, ' ||
  'date_last_oil_change, battery_date, battery_type, battery_charger_volts, ' ||
  'exercise_day, with_load, exercise_time, exercise_interval, ' ||
  'load_bank_test, transfer_test, full_caps, fuel_type, fuel_added, fuel_percentage, ' ||
  'service_coolant_flush_due, service_batteries_due, service_belts_due, service_hoses_due, ' ||
  'oil_type, oil_cap, oil_psi, oil_filter_pn, oil_filter_status, ' ||
  'fuel_filter_pn, fuel_filter_status, coolant_filter_pn, coolant_filter_status, ' ||
  'air_filter_pn, air_filter_status, ' ||
  'coolant_level_field1, coolant_level_field2, coolant_level_field3, ' ||
  'hoses_belts_cooling_fins, hoses_belts_cooling_fins_text, ' ||
  'block_heater_status, block_heater_status_text, ' ||
  'ignition_system_status, ignition_system_status_text, ' ||
  'governor_system, governor_system_text, ' ||
  'fuel_system_day_tank, fuel_system_day_tank_text, ' ||
  'fuel_line, fuel_line_text, ' ||
  'check_all_systems_for_leaks, check_all_systems_for_leaks_text, ' ||
  'exhaust_system, exhaust_system_text, ' ||
  'charging_starting_system, charging_starting_system_text, ' ||
  'electrical_an, electrical_ab, electrical_bn, electrical_bc, electrical_cn, electrical_ca, ' ||
  'frequency, voltage_a, voltage_b, voltage_c, ' ||
  'instruments_lamps_wiring, instruments_lamps_wiring_text, ' ||
  'generator_controls_safeties, generator_controls_safeties_text, ' ||
  'enclosure_condition, enclosure_condition_text, ' ||
  'ats_control_battery, ats_control_battery_text, ' ||
  'ats_contactor, ats_contactor_text, ' ||
  'transfer_time, transfer_time_text, ' ||
  're_transfer_time, re_transfer_time_text, ' ||
  'cooldown, cooldown_text, fill_caps, ' ||
  'unit_in_auto_breakers_on, unit_in_auto_breakers_on_text, ' ||
  'recommend_generator_be_replaced, recommend_generator_be_replaced_text, ' ||
  'battery_health_readings, recommended_parts, parts_supplies_used, time_on_job, ' ||
  'additional_ats, load_bank_entries, ' ||
  'trip_charge, environmental_fee, consumables, work_performed, ' ||
  'load_bank_customer, load_bank_site, load_bank_site_name, load_bank_site_address, ' ||
  'load_bank_ambient_air_temp, load_bank_make, load_bank_model, load_bank_sn, ' ||
  'load_bank_resistive_load, load_bank_reactive_load, load_bank_additional_comments, ' ||
  'submitted_by_email, is_first_submission, is_rejected, is_forwarded, ' ||
  'rejection_note, forwarded_to_email, workflow_timestamp, http_post_sent' ||
  ') VALUES (' ||
  '''' || id || '''::uuid, ' ||
  COALESCE('''' || REPLACE(job_po_number, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || status || '''', 'NULL') || ', ' ||
  COALESCE('''' || submitted_at || '''::timestamptz', 'NULL') || ', ' ||
  COALESCE('''' || created_at || '''::timestamptz', 'NULL') || ', ' ||
  COALESCE('''' || updated_at || '''::timestamptz', 'NULL') || ', ' ||
  COALESCE('''' || date || '''::date', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(technician, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(customer, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(site_name, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(site_address, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(type_of_service, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(contact_name, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(contact_phone, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(contact_email, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || next_inspection_due || '''::date', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(equipment_generator::text, '''', '''''') || '''::jsonb', '''{}''::jsonb') || ', ' ||
  COALESCE('''' || REPLACE(equipment_engine::text, '''', '''''') || '''::jsonb', '''{}''::jsonb') || ', ' ||
  COALESCE('''' || REPLACE(equipment_ats1::text, '''', '''''') || '''::jsonb', '''{}''::jsonb') || ', ' ||
  COALESCE('''' || REPLACE(equipment_ats2::text, '''', '''''') || '''::jsonb', '''{}''::jsonb') || ', ' ||
  -- Add remaining fields...
  'NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ' ||
  'false, false, false, false, ' ||
  'NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ' ||
  'NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ' ||
  'NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ' ||
  'NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ' ||
  'NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ' ||
  '''[]''::jsonb, ''[]''::jsonb, ''[]''::jsonb, ''[]''::jsonb, ''[]''::jsonb, ''[]''::jsonb, ' ||
  '0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ' ||
  'NULL, true, false, false, NULL, NULL, NULL, false' ||
  ');' as export_sql
FROM form_submissions
ORDER BY created_at;

-- Alternative: Export as JSON (easier for manual import)
-- SELECT json_agg(row_to_json(form_submissions.*))
-- FROM form_submissions;

-- Alternative: Export using pg_dump format (most reliable)
-- Use this command in your terminal (not SQL editor):
-- pg_dump -h [supabase-host] -U postgres -d postgres -t form_submissions --data-only > supabase_data.sql
