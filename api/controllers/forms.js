import db from "../db.js";
import { buildInsert, buildUpdate } from "../helpers/sqlBuilder.js";

const TABLE = "form_submissions";

const ALLOWED_COLUMNS = [
  "fuel_percentage","submitted_at","created_at","updated_at","date",
  "next_inspection_due","equipment_generator","equipment_engine",
  "equipment_ats1","equipment_ats2","date_last_oil_change","exercise_time",
  "fuel_added","id","battery_health_readings","recommended_parts",
  "parts_supplies_used","time_on_job","trip_charge","environmental_fee",
  "consumables","http_post_sent","additional_ats","load_bank_entries",
  "service_coolant_flush_due","service_batteries_due","service_belts_due",
  "service_hoses_due","is_first_submission","is_rejected","is_forwarded",
  "workflow_timestamp","oil_cap","oil_psi","oil_filter_pn",
  "oil_filter_status","fuel_filter_pn","fuel_filter_status",
  "coolant_filter_pn","coolant_filter_status","air_filter_pn",
  "air_filter_status","coolant_level_field1","coolant_level_field2",
  "coolant_level_field3","hoses_belts_cooling_fins","block_heater_status",
  "ignition_system_status","governor_system","fuel_system_day_tank",
  "fuel_line","check_all_systems_for_leaks","exhaust_system",
  "charging_starting_system","electrical_an","electrical_ab",
  "electrical_bn","electrical_bc","electrical_cn","electrical_ca",
  "frequency","voltage_a","voltage_b","voltage_c",
  "instruments_lamps_wiring","generator_controls_safeties",
  "enclosure_condition","ats_control_battery","ats_contactor",
  "transfer_time","re_transfer_time","cooldown","fill_caps",
  "unit_in_auto_breakers_on","recommend_generator_be_replaced",
  "load_bank_additional_comments","load_bank_sn","submitted_by_email",
  "forwarded_to_email","rejection_note","load_bank_site_name",
  "load_bank_site_address","work_performed","load_bank_ambient_air_temp",
  "hoses_belts_cooling_fins_text","block_heater_status_text",
  "ignition_system_status_text","governor_system_text",
  "fuel_system_day_tank_text","fuel_line_text",
  "check_all_systems_for_leaks_text","exhaust_system_text",
  "charging_starting_system_text","instruments_lamps_wiring_text",
  "generator_controls_safeties_text","enclosure_condition_text","status",
  "ats_control_battery_text","ats_contactor_text","transfer_time_text",
  "re_transfer_time_text","job_po_number","technician","customer",
  "site_name","site_address","type_of_service","contact_name",
  "contact_phone","contact_email","cooldown_text",
  "unit_in_auto_breakers_on_text","recommend_generator_be_replaced_text",
  "load_bank_make","load_bank_model","load_bank_customer","exercise_day",
  "with_load","load_bank_site","exercise_interval","load_bank_test",
  "transfer_test","full_caps","fuel_type","load_bank_resistive_load",
  "load_bank_reactive_load","oil_type"
];

// GET /
export async function getAllForms(req, res) {
  try {
    const { rows } = await db.query(`
      SELECT * FROM ${TABLE} ORDER BY created_at DESC;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getFormByJobNumber(req, res) {
  try {
    const { jobNumber } = req.params;
    const { rows } = await db.query(
      `SELECT * FROM ${TABLE} WHERE job_po_number = $1 ORDER BY created_at DESC LIMIT 1`,
      [jobNumber]
    );
    rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createForm(req, res) {
  try {
    const payload = req.body;
    payload.created_at = new Date().toISOString();

    const { sql, values } = buildInsert(TABLE, ALLOWED_COLUMNS, payload);
    const { rows } = await db.query(sql, values);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateForm(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    payload.updated_at = new Date().toISOString();

    const { sql, values } = buildUpdate(TABLE, ALLOWED_COLUMNS, payload, id);
    const { rows } = await db.query(sql, values);

    rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteForm(req, res) {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query(
      `DELETE FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    rowCount > 0 ? res.json({ success: true }) : res.status(404).json({ error: "Not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
