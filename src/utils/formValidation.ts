import { FormSubmission, LoadBankEntry } from '../types/form';

export const getInputClass = (value: any, hasValidationErrors: boolean, readOnly: boolean): string => {
  if (!hasValidationErrors || readOnly) return 'form-input';
  return !value || value === '' ? 'form-input-error' : 'form-input';
};

export const getSelectClass = (value: any, hasValidationErrors: boolean, readOnly: boolean): string => {
  return getInputClass(value, hasValidationErrors, readOnly);
};

export const isLoadBankRequired = (formData: FormSubmission): boolean => {
  const services = (formData.type_of_service || '').split(',').map(s => s.trim()).filter(Boolean);
  return services.includes('LOAD BANK');
};

export const validateServiceReport = (formData: FormSubmission): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const isLoadBankChecked = isLoadBankRequired(formData);

  if (!formData.job_po_number) errors.push('JOB/PO # is required');
  if (!formData.date) errors.push('Date is required');
  if (!formData.technician) errors.push('Technician is required');
  if (!formData.customer) errors.push('Customer is required');
  if (!formData.site_name) errors.push('Site Name is required');
  if (!formData.site_address) errors.push('Site Address is required');
  if (!formData.type_of_service) errors.push('Type of Service is required');
  if (!formData.contact_name) errors.push('Contact Name is required');
  if (!formData.next_inspection_due) errors.push('Next Inspection Due is required');

  if (isLoadBankChecked) {
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  if (!formData.equipment_generator?.make) errors.push('Generator Make is required');
  if (!formData.equipment_generator?.model) errors.push('Generator Model is required');
  if (!formData.equipment_generator?.serial) errors.push('Generator Serial is required');
  if (!formData.equipment_generator?.spec) errors.push('Generator Spec is required');
  if (!formData.equipment_generator?.kw) errors.push('Generator KW is required');
  if (!formData.equipment_generator?.genAmp) errors.push('Generator Amp is required');
  if (!formData.equipment_generator?.phase) errors.push('Generator Phase is required');
  if (!formData.equipment_generator?.voltage) errors.push('Generator Voltage is required');
  if (!formData.equipment_generator?.hours) errors.push('Generator Hours is required');

  if (!formData.equipment_engine?.make) errors.push('Engine Make is required');
  if (!formData.equipment_engine?.model) errors.push('Engine Model is required');
  if (!formData.equipment_engine?.serial) errors.push('Engine Serial is required');
  if (!formData.equipment_engine?.spec) errors.push('Engine Spec is required');

  if (!formData.equipment_ats1?.make) errors.push('ATS 1 Make is required');
  if (!formData.equipment_ats1?.model) errors.push('ATS 1 Model is required');
  if (!formData.equipment_ats1?.serial) errors.push('ATS 1 Serial is required');
  if (!formData.equipment_ats1?.spec) errors.push('ATS 1 Spec is required');
  if (!formData.equipment_ats1?.phase) errors.push('ATS 1 Phase is required');
  if (!formData.equipment_ats1?.voltage) errors.push('ATS 1 Voltage is required');
  if (!formData.equipment_ats1?.ats1Amp) errors.push('ATS 1 Amp is required');

  if (!formData.exercise_day) errors.push('Exercise Day is required');
  if (!formData.with_load) errors.push('With Load is required');
  if (!formData.exercise_interval) errors.push('Exercise Interval is required');
  if (!formData.load_bank_test) errors.push('Load Bank Test is required');
  if (!formData.transfer_test) errors.push('Transfer Test is required');

  if (!formData.fuel_type) errors.push('Fuel Type is required');
  if (!formData.full_caps) errors.push('Full Caps is required');
  if (formData.fuel_percentage === undefined || formData.fuel_percentage === null) errors.push('Fuel Percentage is required');

  if (!formData.oil_type) errors.push('Oil Type is required');
  if (!formData.oil_cap) errors.push('Oil Cap is required');
  if (!formData.date_last_oil_change) errors.push('Date Last Oil Change is required');
  if (!formData.oil_psi) errors.push('Oil PSI is required');

  if (!formData.oil_filter_pn) errors.push('Oil Filter P/N is required');
  if (!formData.oil_filter_status) errors.push('Oil Filter Status is required');
  if (!formData.fuel_filter_pn) errors.push('Fuel Filter P/N is required');
  if (!formData.fuel_filter_status) errors.push('Fuel Filter Status is required');
  if (!formData.coolant_filter_pn) errors.push('Coolant Filter P/N is required');
  if (!formData.coolant_filter_status) errors.push('Coolant Filter Status is required');
  if (!formData.air_filter_pn) errors.push('Air Filter P/N is required');
  if (!formData.air_filter_status) errors.push('Air Filter Status is required');

  if (!formData.coolant_level_field1) errors.push('Coolant Level field is required');
  if (!formData.coolant_level_field2) errors.push('Coolant Level Temperature is required');
  if (!formData.coolant_level_field3) errors.push('Coolant Level Status is required');

  const systemCheckFields = [
    'hoses_belts_cooling_fins',
    'block_heater_status',
    'ignition_system_status',
    'governor_system',
    'fuel_system_day_tank',
    'fuel_line',
    'check_all_systems_for_leaks',
    'exhaust_system',
    'charging_starting_system',
    'instruments_lamps_wiring',
    'generator_controls_safeties',
    'enclosure_condition',
    'ats_control_battery',
    'ats_contactor',
    'unit_in_auto_breakers_on',
    'recommend_generator_be_replaced'
  ];

  systemCheckFields.forEach((field) => {
    if (!(formData as any)[field]) {
      errors.push(`System check field is required`);
    }
  });

  const timeFields = [
    { field: 'transfer_time', label: 'Transfer Time' },
    { field: 're_transfer_time', label: 'Re-Transfer Time' },
    { field: 'cooldown', label: 'Cooldown' }
  ];

  timeFields.forEach(({ field, label }) => {
    const value = (formData as any)[field];
    if (!value || value === '') {
      errors.push(`${label} is required`);
    }
  });

  if (!formData.electrical_ab) errors.push('Electrical A-B is required');
  if (!formData.electrical_bc) errors.push('Electrical B-C is required');
  if (!formData.electrical_ca) errors.push('Electrical A-C is required');
  if (!formData.electrical_an) errors.push('Electrical A-N is required');
  if (!formData.electrical_bn) errors.push('Electrical B-N is required');
  if (!formData.electrical_cn) errors.push('Electrical C-N is required');
  if (!formData.frequency) errors.push('Frequency is required');
  if (!formData.voltage_a) errors.push('Current A is required');
  if (!formData.voltage_b) errors.push('Current B is required');
  if (!formData.voltage_c) errors.push('Current C is required');

  if (!formData.fill_caps) errors.push('OIL/Coolant Fill capacity is required');

  if (!formData.battery_health_readings || formData.battery_health_readings.length === 0) {
    errors.push('At least one Battery Health Reading is required');
  }

  if (!formData.work_performed) errors.push('Work Performed is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLoadBankReport = (formData: FormSubmission): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isLoadBankRequired(formData)) {
    return { isValid: true, errors: [] };
  }

  if (!formData.load_bank_customer) errors.push('CUSTOMER is required');
  if (!formData.load_bank_resistive_load) errors.push('RESISTIVE LOAD is required');
  if (!formData.load_bank_site_name) errors.push('SITE NAME is required');
  if (!formData.load_bank_reactive_load) errors.push('BUILDING LOAD is required');
  if (!formData.load_bank_site_address) errors.push('SITE ADDRESS is required');
  if (!formData.load_bank_ambient_air_temp) errors.push('AMBIENT AIR TEMP is required');
  if (!formData.load_bank_make) errors.push('MAKE is required');
  if (!formData.load_bank_model) errors.push('MODEL is required');
  if (!formData.load_bank_sn) errors.push('S/N is required');

  const entries = formData.load_bank_entries || [];
  if (entries.length === 0) {
    errors.push('At least one Load Bank Test Entry is required');
  } else {
    const hasCompleteEntry = entries.some((entry: LoadBankEntry) => {
      return entry.time && entry.kw && entry.hertz &&
             entry.ab && entry.bc && entry.ca &&
             entry.an && entry.bn && entry.cn &&
             entry.amps_a && entry.amps_b && entry.amps_c &&
             entry.oil_pressure && entry.water_temp && entry.batt_charger_voltage;
    });

    if (!hasCompleteEntry) {
      errors.push('At least one complete Load Bank Test Entry is required (all fields filled)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
