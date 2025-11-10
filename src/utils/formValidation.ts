import { FormSubmission, LoadBankEntry } from '../types/form';

export const getInputClass = (value: any, hasValidationErrors: boolean, readOnly: boolean): string => {
  if (!hasValidationErrors || readOnly) return 'form-input';
  return !value || value === '' ? 'form-input-error' : 'form-input';
};

export const getSelectClass = (value: any, hasValidationErrors: boolean, readOnly: boolean): string => {
  return getInputClass(value, hasValidationErrors, readOnly);
};

export const isLoadBankRequired = (formData: FormSubmission): boolean => {
  return formData.load_bank_test !== '' && formData.load_bank_test !== 'N/A';
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
