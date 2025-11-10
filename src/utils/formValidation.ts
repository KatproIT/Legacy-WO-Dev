export const getInputClass = (value: any, hasValidationErrors: boolean, readOnly: boolean): string => {
  if (!hasValidationErrors || readOnly) return 'form-input';
  return !value || value === '' ? 'form-input-error' : 'form-input';
};

export const getSelectClass = (value: any, hasValidationErrors: boolean, readOnly: boolean): string => {
  return getInputClass(value, hasValidationErrors, readOnly);
};
