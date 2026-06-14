const pool = require("../config/db");

const logChange = async (tableName, recordId, action, oldValues, newValues, userId) => {
  await pool.query(
    "INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by) VALUES ($1, $2, $3, $4, $5, $6)",
    [tableName, recordId, action, JSON.stringify(oldValues), JSON.stringify(newValues), userId]
  );
};

const getAuditLogs = async ({ table_name, action, limit = 100, offset = 0 } = {}) => {
  const params = [];
  let query = "SELECT * FROM audit_logs";

  const conditions = [];
  if (table_name) {
    params.push(table_name);
    conditions.push(`table_name = $${params.length}`);
  }
  if (action) {
    params.push(action);
    conditions.push(`action = $${params.length}`);
  }

  if (conditions.length) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const { rows } = await pool.query(query, params);
  return rows;
};

module.exports = { logChange, getAuditLogs };