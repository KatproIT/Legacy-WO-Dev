const PM_EMAILS = [
  'chris.green@ontivity.com',
  'chuck.dowding@ontivity.com',
  'ben.barnes@ontivity.com'
];

const TECHNICIAN_EMAILS = [
  'john.brown@ontivity.com',
  'sean.geary@ontivity.com',
  'jason.greer@ontivity.com',
  'larry.gunter@ontivity.com',
  'kasey.lewis@ontivity.com',
  'jared.olson@ontivity.com',
  'jesse.rodriguez@ontivity.com',
  'justin.mcdonald@ontivity.com',
  'blake.martz@ontivity.com',
  'chris.johnson@ontivity.com',
  'peyton.janicki@ontivity.com',
  'aaron.johnson@ontivity.com',
  'austin.holm@ontivity.com',
  'eric.johnson@ontivity.com',
  'tom.dunham@ontivity.com',
  'marc.link@ontivity.com',
  'spencer.whiting@ontivity.com',
  'chuck.dowding@ontivity.com',
  'erick.calloway@ontivity.com',
  'richard.kirkendall@ontivity.com',
  'chase.barnes@ontivity.com',
  'justin.moller@ontivity.com',
  'brody.reynolds@ontivity.com',
  'nick.nys@ontivity.com',
  'bobby.newman@ontivity.com',
  'ben.barnes@ontivity.com',
  'dustin.smith@ontivity.com',
  'taylor.marshall@ontivity.com',
  'chelsi.barnes@ontivity.com'
];

export function isPM(email: string): boolean {
  return PM_EMAILS.includes(email.toLowerCase());
}

export function isTechnician(email: string): boolean {
  return TECHNICIAN_EMAILS.includes(email.toLowerCase());
}

export function isAuthorizedUser(email: string): boolean {
  return isPM(email) || isTechnician(email);
}

export function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  const parts = localPart.split('.');

  const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase() : '';

  return lastName ? `${firstName} ${lastName}` : firstName;
}

export function getAllTechnicians(): Array<{ email: string; name: string }> {
  return TECHNICIAN_EMAILS.map(email => ({
    email,
    name: extractNameFromEmail(email)
  }));
}
