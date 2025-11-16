const API_BASE = "https://nice-mud-0c7aa8500.3.azurestaticapps.net";

export async function getForms() {
  const res = await fetch(`${API_BASE}/forms`);
  if (!res.ok) throw new Error("Failed to fetch forms");
  return await res.json();
}

export async function createForm(form: { job_number: string; data: any }) {
  const res = await fetch(`${API_BASE}/forms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error("Failed to create form");
  return await res.text();
}
