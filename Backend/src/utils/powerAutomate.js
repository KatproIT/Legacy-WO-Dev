const fetch = require('node-fetch');

const PA_SUBMIT = process.env.POWER_AUTOMATE_URL;
const PA_REJECT = process.env.REJECT_URL;
const PA_FORWARD = process.env.FORWARD_URL;

async function sendPowerAutomateRequest(dataRow) {
  if (!PA_SUBMIT) throw new Error('POWER_AUTOMATE_URL not configured');

  const payload = {
    date: (dataRow.data && dataRow.data.date) || dataRow.date,
    jobNumber: dataRow.job_po_number || (dataRow.data && dataRow.data.job_po_number),
    technician: dataRow.technician || (dataRow.data && dataRow.data.technician),
    editLink: `${process.env.FRONTEND_ORIGIN || ''}/form/${dataRow.job_po_number || (dataRow.data && dataRow.data.job_po_number)}`
  };

  const res = await fetch(PA_SUBMIT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Power Automate error: ${res.status} ${text}`);
  }
  return true;
}

module.exports = { sendPowerAutomateRequest };
