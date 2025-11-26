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
    technicianEmail: dataRow.submitted_by_email || dataRow.data?.submitted_by_email || null,
    customer: dataRow.customer || dataRow.data?.customer || null,
    formUniqueId: dataRow.id || null,
    editLink: `${process.env.FRONTEND_ORIGIN}/form/${dataRow.id}/${dataRow.job_po_number}`
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

/**
 * Sends a reject notification to Power Automate.
 */
async function sendRejectNotification(formData, note) {
  if (!PA_REJECT) {
    console.error("REJECT_URL is not set");
    return false;
  }

  const payload = {
    formUniqueId: formData.id || null,
    jobNumber: formData.job_po_number || formData.data?.job_po_number || null,
    technician: formData.technician || formData.data?.technician || null,
    technicianEmail: formData.submitted_by_email || formData.data?.submitted_by_email || null,
    customer: formData.customer || formData.data?.customer || null,
    rejectionNote: note
  };

  try {
    const res = await fetch(PA_REJECT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Power Automate reject error:", text);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Power Automate reject failed:", err.message);
    return false;
  }
}

/**
 * Sends a forward notification to Power Automate.
 */
async function sendForwardNotification(formData, toEmail) {
  if (!PA_FORWARD) {
    console.error("FORWARD_URL is not set");
    return false;
  }

  const payload = {
    formUniqueId: formData.id || null,
    jobNumber: formData.job_po_number || formData.data?.job_po_number || null,
    technician: formData.technician || formData.data?.technician || null,
    technicianEmail: formData.submitted_by_email || formData.data?.submitted_by_email || null,
    customer: formData.customer || formData.data?.customer || null,
    forwardedTo: toEmail
  };

  try {
    const res = await fetch(PA_FORWARD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Power Automate forward error:", text);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Power Automate forward failed:", err.message);
    return false;
  }
}

module.exports = { sendPowerAutomateRequest, sendRejectNotification, sendForwardNotification };
