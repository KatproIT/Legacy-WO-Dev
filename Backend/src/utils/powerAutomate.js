const fetch = require('node-fetch');

const PA_SUBMIT = process.env.POWER_AUTOMATE_URL;
const PA_REJECT = process.env.REJECT_URL;
const PA_FORWARD = process.env.FORWARD_URL;

/**
 * Calculates if the form should be escalated based on:
 * 1. Any dropdown has "see notes"
 * 2. Any battery reading has "Fail"
 * 3. Any service interval checkbox is checked
 */
function calculateEscalation(formData) {
  const data = formData.data || formData;

  // Check if any dropdown has "see notes"
  const dropdownFields = [
    'oil_filter_status', 'fuel_filter_status', 'coolant_filter_status', 'air_filter_status',
    'hoses_belts_cooling_fins', 'block_heater_status', 'ignition_system_status',
    'governor_system', 'fuel_system_day_tank', 'fuel_line', 'check_all_systems_for_leaks',
    'exhaust_system', 'charging_starting_system', 'instruments_lamps_wiring',
    'generator_controls_safeties', 'enclosure_condition', 'ats_control_battery',
    'ats_contactor', 'transfer_time', 're_transfer_time', 'cooldown',
    'unit_in_auto_breakers_on', 'recommend_generator_be_replaced'
  ];

  const hasSeeNotes = dropdownFields.some(field => {
    const value = data[field];
    return value && value.toLowerCase().includes('see notes');
  });

  // Check if any battery reading has "Fail"
  const batteryReadings = data.battery_health_readings || [];
  const hasBatteryFail = batteryReadings.some(reading => {
    return reading.passFail && reading.passFail.toLowerCase() === 'fail';
  });

  // Check if any service interval checkbox is checked
  const hasServiceIntervalDue = !!(
    data.service_coolant_flush_due ||
    data.service_batteries_due ||
    data.service_belts_due ||
    data.service_hoses_due
  );

  return hasSeeNotes || hasBatteryFail || hasServiceIntervalDue;
}

/**
 * Sends a notification to Power Automate when a form is submitted.
 */
async function sendPowerAutomateRequest(dataRow) {
  if (!PA_SUBMIT) {
    console.error("POWER_AUTOMATE_URL is not set");
    return false;
  }

  // Calculate escalation flag
  const escalation = calculateEscalation(dataRow);

  // Build payload safely
  const payload = {
    date: dataRow.data?.date || dataRow.date || null,
    jobNumber: dataRow.job_po_number || dataRow.data?.job_po_number || null,
    technician: dataRow.technician || dataRow.data?.technician || null,
    technicianEmail: dataRow.submitted_by_email || dataRow.data?.submitted_by_email || null,
    customer: dataRow.customer || dataRow.data?.customer || null,
    siteName: dataRow.site_name || dataRow.data?.site_name || null,
    formUniqueId: dataRow.id || null,
    editLink: `${process.env.FRONTEND_ORIGIN}/form/${dataRow.id}/${dataRow.job_po_number}`,
    escalation: escalation
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
 * status can be "rejected" or "resubmitted" or "approved"
 */
async function sendRejectNotification(formData, note, status = 'rejected', escalation = false) {
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
    siteName: formData.site_name || formData.data?.site_name || null,
    rejectionNote: note,
    status: status,
    escalation: escalation
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
    siteName: formData.site_name || formData.data?.site_name || null,
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

module.exports = { sendPowerAutomateRequest, sendRejectNotification, sendForwardNotification, calculateEscalation };
