export function pickAllowedFields(payload, allowedColumns) {
  const keys = [];
  const values = [];
  for (const k of allowedColumns) {
    if (payload[k] !== undefined) {
      keys.push(k);
      values.push(payload[k]);
    }
  }
  return { keys, values };
}

export function buildInsert(table, allowedColumns, payload) {
  const { keys, values } = pickAllowedFields(payload, allowedColumns);

  const cols = keys.map(c => `"${c}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const sql = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *;`;
  return { sql, values };
}

export function buildUpdate(table, allowedColumns, payload, id) {
  const { keys, values } = pickAllowedFields(payload, allowedColumns);

  const set = keys.map((c, i) => `"${c}" = $${i + 1}`).join(", ");

  const sql = `
    UPDATE ${table}
    SET ${set}, updated_at = NOW()
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;

  return { sql, values: [...values, id] };
}
