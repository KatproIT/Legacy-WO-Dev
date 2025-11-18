// src/utils/powerAutomate.js
const fetch = require('node-fetch');

const PA_SUBMIT = process.env.POWER_AUTOMATE_URL;
const PA_REJECT = process.env.REJECT_URL;
const PA_FORWARD = process.env.FORWARD_URL;

async function sendPowerAutomateRequest(data) {
  if (!PA_SUBMIT) throw new Error('POWER_AUTOMATE_URL not configured');
  const payload = {
    date: data.data.date,
    jobNumber: data.job_po_number || data.data.job_po_number,
    technician: data.technician || data.data.technician,
    editLink: `${process.env.FRONTEND_ORIGIN || ''}/form/${data.job_po_number || data.data.job_po_number}`
  };
  const response = await fetch(PA_SUBMIT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PA failed: ${response.status} ${text}`);
  }
  return true;
}

module.exports = { sendPowerAutomateRequest };
