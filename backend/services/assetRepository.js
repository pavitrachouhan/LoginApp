const pool = require("../config/db");

const findAll = async ({ limit = 10, offset = 0, sortBy = 'id', order = 'ASC', type } = {}) => {
  const allowedSort = ['id', 'asset_name', 'asset_type', 'status', 'created_at'];
  if (!allowedSort.includes(sortBy)) sortBy = 'id';
  order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let query = `
    SELECT a.*, e.name as allocated_to
    FROM assets a
    LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.returned_at IS NULL
    LEFT JOIN employees e ON aa.employee_id = e.id
  `;
  const params = [];

  if (type) {
    query += " WHERE a.asset_type = $1";
    params.push(type);
  }

  query += ` ORDER BY ${sortBy} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query("SELECT * FROM assets WHERE id = $1", [id]);
  return result.rows[0];
};

const create = async (assetData) => {
  const { asset_name, asset_type, asset_code } = assetData;
  const result = await pool.query(
    "INSERT INTO assets (asset_name, asset_type, asset_code) VALUES ($1, $2, $3) RETURNING *",
    [asset_name, asset_type, asset_code]
  );
  return result.rows[0];
};

const allocateAsset = async (assetId, employeeId, notes) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("UPDATE assets SET status = 'allocated' WHERE id = $1", [assetId]);
    const result = await client.query(
      "INSERT INTO asset_allocations (asset_id, employee_id, notes) VALUES ($1, $2, $3) RETURNING *",
      [assetId, employeeId, notes]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const returnAsset = async (assetId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("UPDATE assets SET status = 'available' WHERE id = $1", [assetId]);
    const result = await client.query(
      "UPDATE asset_allocations SET returned_at = NOW() WHERE asset_id = $1 AND returned_at IS NULL RETURNING *",
      [assetId]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { findAll, findById, create, allocateAsset, returnAsset };