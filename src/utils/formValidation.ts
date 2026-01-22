import { FormSubmission, LoadBankEntry } from '../types/form';

export const getInputClass = (fieldPath: string, value: any, fieldErrors: Set<string>, readOnly: boolean): string => {
  if (readOnly) return 'form-input';
  return fieldErrors.has(fieldPath) ? 'form-input-error' : 'form-input';
};

export const isJobNumberValid = (jobNumber: string): boolean => {
  if (!jobNumber || !jobNumber.trim()) return false;

  const parts = jobNumber.split('-');
  if (parts.length !== 3) return false;

  const middleValue = parts[1];
  return middleValue === '23' || middleValue === '29' || middleValue === '42' || middleValue === '67';
};

export const getSelectClass = (fieldPath: string, value: any, fieldErrors: Set<string>, readOnly: boolean): string => {
  return getInputClass(fieldPath, value, fieldErrors, readOnly);
};

export const isLoadBankRequired = (formData: FormSubmission): boolean => {
  const services = (formData.type_of_service || '').split(',').map(s => s.trim()).filter(Boolean);
  return services.includes('LOAD BANK');
};

export const validateServiceReport = (formData: FormSubmission): { isValid: boolean; errors: string[]; fieldErrors: Set<string> } => {
  const errors: string[] = [];
  const fieldErrors = new Set<string>();
  const isLoadBankChecked = isLoadBankRequired(formData);

  if (!formData.job_po_number) {
    errors.push('JOB/PO # is required');
    fieldErrors.add('job_po_number');
  }
  if (!formData.date) {
    errors.push('Date is required');
    fieldErrors.add('date');
  }
  if (!formData.technician) {
    errors.push('Technician is required');
    fieldErrors.add('technician');
  }
  if (!formData.customer) {
    errors.push('Customer is required');
    fieldErrors.add('customer');
  }
  if (!formData.site_name) {
    errors.push('Site Name is required');
    fieldErrors.add('site_name');
  }
  if (!formData.site_address) {
    errors.push('Site Address is required');
    fieldErrors.add('site_address');
  }
  if (!formData.type_of_service) {
    errors.push('Type of Service is required');
    fieldErrors.add('type_of_service');
  }
  if (!formData.contact_name) {
    errors.push('Contact Name is required');
    fieldErrors.add('contact_name');
  }
  if (!formData.next_inspection_due) {
    errors.push('Next Inspection Due is required');
    fieldErrors.add('next_inspection_due');
  }

  if (isLoadBankChecked) {
    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }

  if (!formData.equipment_generator?.make) {
    errors.push('Generator Make is required');
    fieldErrors.add('equipment_generator.make');
  }
  if (!formData.equipment_generator?.model) {
    errors.push('Generator Model is required');
    fieldErrors.add('equipment_generator.model');
  }
  if (!formData.equipment_generator?.serial) {
    errors.push('Generator Serial is required');
    fieldErrors.add('equipment_generator.serial');
  }
  if (!formData.equipment_generator?.spec) {
    errors.push('Generator Spec is required');
    fieldErrors.add('equipment_generator.spec');
  }
  if (!formData.equipment_generator?.kw) {
    errors.push('Generator KW is required');
    fieldErrors.add('equipment_generator.kw');
  }
  if (!formData.equipment_generator?.genAmp) {
    errors.push('Generator Amp is required');
    fieldErrors.add('equipment_generator.genAmp');
  }
  if (!formData.equipment_generator?.phase) {
    errors.push('Generator Phase is required');
    fieldErrors.add('equipment_generator.phase');
  }
  if (!formData.equipment_generator?.voltage) {
    errors.push('Generator Voltage is required');
    fieldErrors.add('equipment_generator.voltage');
  }
  if (!formData.equipment_generator?.hours) {
    errors.push('Generator Hours is required');
    fieldErrors.add('equipment_generator.hours');
  }

  if (!formData.equipment_engine?.make) {
    errors.push('Engine Make is required');
    fieldErrors.add('equipment_engine.make');
  }
  if (!formData.equipment_engine?.model) {
    errors.push('Engine Model is required');
    fieldErrors.add('equipment_engine.model');
  }
  if (!formData.equipment_engine?.serial) {
    errors.push('Engine Serial is required');
    fieldErrors.add('equipment_engine.serial');
  }
  if (!formData.equipment_engine?.spec) {
    errors.push('Engine Spec is required');
    fieldErrors.add('equipment_engine.spec');
  }

  if (!formData.equipment_ats1?.make) {
    errors.push('ATS 1 Make is required');
    fieldErrors.add('equipment_ats1.make');
  }
  if (!formData.equipment_ats1?.model) {
    errors.push('ATS 1 Model is required');
    fieldErrors.add('equipment_ats1.model');
  }
  if (!formData.equipment_ats1?.serial) {
    errors.push('ATS 1 Serial is required');
    fieldErrors.add('equipment_ats1.serial');
  }
  if (!formData.equipment_ats1?.spec) {
    errors.push('ATS 1 Spec is required');
    fieldErrors.add('equipment_ats1.spec');
  }
  if (!formData.equipment_ats1?.phase) {
    errors.push('ATS 1 Phase is required');
    fieldErrors.add('equipment_ats1.phase');
  }
  if (!formData.equipment_ats1?.voltage) {
    errors.push('ATS 1 Voltage is required');
    fieldErrors.add('equipment_ats1.voltage');
  }
  if (!formData.equipment_ats1?.ats1Amp) {
    errors.push('ATS 1 Amp is required');
    fieldErrors.add('equipment_ats1.ats1Amp');
  }

  if (!formData.exercise_day) {
    errors.push('Exercise Day is required');
    fieldErrors.add('exercise_day');
  }

  if (formData.exercise_day !== 'SITEBOSS') {
    if (!formData.with_load) {
      errors.push('With Load is required');
      fieldErrors.add('with_load');
    }
    if (!formData.exercise_interval) {
      errors.push('Exercise Interval is required');
      fieldErrors.add('exercise_interval');
    }
    if (!formData.load_bank_test) {
      errors.push('Load Bank Test is required');
      fieldErrors.add('load_bank_test');
    }
    if (!formData.transfer_test) {
      errors.push('Transfer Test is required');
      fieldErrors.add('transfer_test');
    }
  }

  if (!formData.fuel_type) {
    errors.push('Fuel Type is required');
    fieldErrors.add('fuel_type');
  }
  if (!formData.full_caps) {
    errors.push('Full Caps is required');
    fieldErrors.add('full_caps');
  }
  if (formData.fuel_percentage === undefined || formData.fuel_percentage === null) {
    errors.push('Fuel Percentage is required');
    fieldErrors.add('fuel_percentage');
  }

  if (!formData.oil_type) {
    errors.push('Oil Type is required');
    fieldErrors.add('oil_type');
  }
  if (!formData.oil_cap) {
    errors.push('Oil Cap is required');
    fieldErrors.add('oil_cap');
  }
  if (!formData.date_last_oil_change) {
    errors.push('Date Last Oil Change is required');
    fieldErrors.add('date_last_oil_change');
  }
  if (!formData.oil_psi) {
    errors.push('Oil PSI is required');
    fieldErrors.add('oil_psi');
  }

  if (!formData.oil_filter_pn) {
    errors.push('Oil Filter P/N is required');
    fieldErrors.add('oil_filter_pn');
  }
  if (!formData.oil_filter_status) {
    errors.push('Oil Filter Status is required');
    fieldErrors.add('oil_filter_status');
  }
  if (!formData.fuel_filter_pn) {
    errors.push('Fuel Filter P/N is required');
    fieldErrors.add('fuel_filter_pn');
  }
  if (!formData.fuel_filter_status) {
    errors.push('Fuel Filter Status is required');
    fieldErrors.add('fuel_filter_status');
  }
  if (!formData.coolant_filter_pn) {
    errors.push('Coolant Filter P/N is required');
    fieldErrors.add('coolant_filter_pn');
  }
  if (!formData.coolant_filter_status) {
    errors.push('Coolant Filter Status is required');
    fieldErrors.add('coolant_filter_status');
  }
  if (!formData.air_filter_pn) {
    errors.push('Air Filter P/N is required');
    fieldErrors.add('air_filter_pn');
  }
  if (!formData.air_filter_status) {
    errors.push('Air Filter Status is required');
    fieldErrors.add('air_filter_status');
  }

  if (!formData.coolant_level_field1) {
    errors.push('Coolant Level field is required');
    fieldErrors.add('coolant_level_field1');
  }
  if (!formData.coolant_level_field2) {
    errors.push('Coolant Level Temperature is required');
    fieldErrors.add('coolant_level_field2');
  }
  if (!formData.coolant_level_field3) {
    errors.push('Coolant Level Status is required');
    fieldErrors.add('coolant_level_field3');
  }

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
      fieldErrors.add(field);
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
      fieldErrors.add(field);
    }
  });

  if (!formData.electrical_ab) {
    errors.push('Electrical A-B is required');
    fieldErrors.add('electrical_ab');
  }
  if (!formData.electrical_bc) {
    errors.push('Electrical B-C is required');
    fieldErrors.add('electrical_bc');
  }
  if (!formData.electrical_ca) {
    errors.push('Electrical A-C is required');
    fieldErrors.add('electrical_ca');
  }
  if (!formData.electrical_an) {
    errors.push('Electrical A-N is required');
    fieldErrors.add('electrical_an');
  }
  if (!formData.electrical_bn) {
    errors.push('Electrical B-N is required');
    fieldErrors.add('electrical_bn');
  }
  if (!formData.electrical_cn) {
    errors.push('Electrical C-N is required');
    fieldErrors.add('electrical_cn');
  }
  if (!formData.frequency) {
    errors.push('Frequency is required');
    fieldErrors.add('frequency');
  }
  if (!formData.voltage_a) {
    errors.push('Current A is required');
    fieldErrors.add('voltage_a');
  }
  if (!formData.voltage_b) {
    errors.push('Current B is required');
    fieldErrors.add('voltage_b');
  }
  if (!formData.voltage_c) {
    errors.push('Current C is required');
    fieldErrors.add('voltage_c');
  }

  if (!formData.fill_caps) {
    errors.push('OIL/Coolant Fill capacity is required');
    fieldErrors.add('fill_caps');
  }

  if (!formData.battery_health_readings || formData.battery_health_readings.length === 0) {
    errors.push('At least one Battery Health Reading is required');
  }

  if (!formData.work_performed) {
    errors.push('Work Performed is required');
    fieldErrors.add('work_performed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
};

export const validateLoadBankReport = (formData: FormSubmission): { isValid: boolean; errors: string[]; fieldErrors: Set<string> } => {
  const errors: string[] = [];
  const fieldErrors = new Set<string>();

  if (!isLoadBankRequired(formData)) {
    return { isValid: true, errors: [], fieldErrors };
  }

  if (!formData.load_bank_customer) {
    errors.push('CUSTOMER is required');
    fieldErrors.add('load_bank_customer');
  }
  if (!formData.load_bank_resistive_load) {
    errors.push('RESISTIVE LOAD is required');
    fieldErrors.add('load_bank_resistive_load');
  }
  if (!formData.load_bank_site_name) {
    errors.push('SITE NAME is required');
    fieldErrors.add('load_bank_site_name');
  }
  if (!formData.load_bank_reactive_load) {
    errors.push('BUILDING LOAD is required');
    fieldErrors.add('load_bank_reactive_load');
  }
  if (!formData.load_bank_site_address) {
    errors.push('SITE ADDRESS is required');
    fieldErrors.add('load_bank_site_address');
  }
  if (!formData.load_bank_ambient_air_temp) {
    errors.push('AMBIENT AIR TEMP is required');
    fieldErrors.add('load_bank_ambient_air_temp');
  }
  if (!formData.load_bank_make) {
    errors.push('MAKE is required');
    fieldErrors.add('load_bank_make');
  }
  if (!formData.load_bank_model) {
    errors.push('MODEL is required');
    fieldErrors.add('load_bank_model');
  }
  if (!formData.load_bank_sn) {
    errors.push('S/N is required');
    fieldErrors.add('load_bank_sn');
  }

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
    errors,
    fieldErrors
  };
};
