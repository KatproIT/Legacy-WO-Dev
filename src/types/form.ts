export interface EquipmentDetails {
  make?: string;
  model?: string;
  serial?: string;
  spec?: string;
  kw?: string;
  genAmp?: string;
  phase?: string;
  voltage?: string;
  ats1Amp?: string;
  ats2Amp?: string;
  dom?: string;
  hours?: string;
}

export interface BatteryReading {
  id: string;
  battery: number;
  batteryDate?: string;
  batteryType?: string;
  batteryChargerVolts?: string;
  voltage: string;
  ccaRating: string;
  ccaTested: string;
  testedPercent: string;
  passFail: string;
}

export interface RecommendedPart {
  id: string;
  qty: string;
  partNo: string;
  description: string;
}

export interface PartsSupply {
  id: string;
  qty: string;
  partNo: string;
  description: string;
  cost: string;
  from: string;
}

export interface TimeEntry {
  id: string;
  activity: string;
  date: string;
  rate: string;
  startTime: string;
  endTime: string;
}

export interface AdditionalATS {
  id: string;
  name: string;
  make?: string;
  model?: string;
  serial?: string;
  spec?: string;
  phase?: string;
  voltage?: string;
  amp?: string;
}

export interface LoadBankEntry {
  id: string;
  time?: string;
  kw?: string;
  hertz?: string;
  ab?: string;
  bc?: string;
  ca?: string;
  an?: string;
  bn?: string;
  cn?: string;
  amps_a?: string;
  amps_b?: string;
  amps_c?: string;
  oil_pressure?: string;
  water_temp?: string;
  batt_charger_voltage?: string;
}

export interface FormSubmission {
  id?: string;
  // status can be 'draft' while editing, or 'submitted' after workflow submission
  status?: 'draft' | 'submitted';
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;

  date?: string;
  job_po_number: string;
  technician?: string;

  customer?: string;
  site_name?: string;
  site_address?: string;
  type_of_service?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  next_inspection_due?: string;

  service_coolant_flush_due?: boolean;
  service_batteries_due?: boolean;
  service_belts_due?: boolean;
  service_hoses_due?: boolean;

  equipment_generator?: EquipmentDetails;
  equipment_engine?: EquipmentDetails;
  equipment_ats1?: EquipmentDetails;
  equipment_ats2?: EquipmentDetails;

  date_last_oil_change?: string;
  battery_date?: string;
  battery_type?: string;
  battery_charger_volts?: number;
  exercise_day?: string;
  with_load?: string;
  exercise_time?: string;
  exercise_interval?: string;
  load_bank_test?: string;
  transfer_test?: string;
  full_caps?: string;
  fuel_type?: string;
  fuel_added?: number;
  fuel_percentage?: number;

  oil_type?: string;
  oil_cap?: string;
  oil_psi?: string;
  oil_filter_pn?: string;
  oil_filter_status?: string;
  fuel_filter_pn?: string;
  fuel_filter_status?: string;
  coolant_filter_pn?: string;
  coolant_filter_status?: string;
  air_filter_pn?: string;
  air_filter_status?: string;

  coolant_level_field1?: string;
  coolant_level_field2?: string;
  coolant_level_field3?: string;
  hoses_belts_cooling_fins?: string;
  hoses_belts_cooling_fins_text?: string;
  block_heater_status?: string;
  block_heater_status_text?: string;
  ignition_system_status?: string;
  ignition_system_status_text?: string;
  governor_system?: string;
  governor_system_text?: string;
  fuel_system_day_tank?: string;
  fuel_system_day_tank_text?: string;
  fuel_line?: string;
  fuel_line_text?: string;
  check_all_systems_for_leaks?: string;
  check_all_systems_for_leaks_text?: string;
  exhaust_system?: string;
  exhaust_system_text?: string;
  charging_starting_system?: string;
  charging_starting_system_text?: string;

  electrical_an?: string;
  electrical_ab?: string;
  electrical_bn?: string;
  electrical_bc?: string;
  electrical_cn?: string;
  electrical_ca?: string;
  frequency?: string;
  voltage_a?: string;
  voltage_b?: string;
  voltage_c?: string;

  instruments_lamps_wiring?: string;
  instruments_lamps_wiring_text?: string;
  generator_controls_safeties?: string;
  generator_controls_safeties_text?: string;
  enclosure_condition?: string;
  enclosure_condition_text?: string;
  ats_control_battery?: string;
  ats_control_battery_text?: string;
  ats_contactor?: string;
  ats_contactor_text?: string;
  transfer_time?: string;
  transfer_time_text?: string;
  re_transfer_time?: string;
  re_transfer_time_text?: string;
  cooldown?: string;
  cooldown_text?: string;
  fill_caps?: string;
  unit_in_auto_breakers_on?: string;
  unit_in_auto_breakers_on_text?: string;
  recommend_generator_be_replaced?: string;
  recommend_generator_be_replaced_text?: string;

  battery_health_readings?: BatteryReading[];
  recommended_parts?: RecommendedPart[];
  parts_supplies_used?: PartsSupply[];
  time_on_job?: TimeEntry[];

  trip_charge?: number;
  environmental_fee?: number;
  consumables?: number;

  work_performed?: string;

  http_post_sent?: boolean;

  additional_ats?: AdditionalATS[];
  load_bank_entries?: LoadBankEntry[];
  load_bank_customer?: string;
  load_bank_site_name?: string;
  load_bank_site_address?: string;
  load_bank_site?: string;
  load_bank_resistive_load?: string;
  load_bank_reactive_load?: string;
  load_bank_ambient_air_temp?: string;
  load_bank_make?: string;
  load_bank_model?: string;
  load_bank_sn?: string;
  load_bank_additional_comments?: string;
}
