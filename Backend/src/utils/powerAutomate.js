const fetch = require('node-fetch');

const PA_SUBMIT = process.env.POWER_AUTOMATE_URL;
const PA_REJECT = process.env.REJECT_URL;
const PA_FORWARD = process.env.FORWARD_URL;

/**
 * Sends a notification to Power Automate when a form is submitted.
 */
async function sendPowerAutomateRequest(dataRow) {
  if (!PA_SUBMIT) {
    console.error("POWER_AUTOMATE_URL is not set");
    return false;
  }

  // Build payload safely
  const payload = {
    date: dataRow.data?.date || dataRow.date || null,
    jobNumber: dataRow.job_po_number || dataRow.data?.job_po_number || null,
    technician: dataRow.technician || dataRow.data?.technician || null,
    editLink: `${process.env.FRONTEND_ORIGIN}/form/${dataRow.job_po_number}`
  };

  try {
    const res = await fetch(PA_SUBMIT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Power Automate error:", text);
      return false;
    }

    return true;

  } catch (err) {
    console.error("Power Automate fetch failed:", err.message);
    return false;
  }
}

module.exports = { sendPowerAutomateRequest };
