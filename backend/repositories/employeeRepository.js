const pool = require("../config/db");

const buildEmployeeQuery = ({ search, department_id, sortBy = "id", order = "ASC", limit = 20, offset = 0 }) => {
  const allowedSort = ["id", "name", "email", "designation", "created_at"];
  if (!allowedSort.includes(sortBy)) sortBy = "id";
  order = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const params = [];
  let filters = "";

  if (search) {
    params.push(`%${search}%`);
    filters += ` AND (e.name ILIKE $${params.length} OR e.email ILIKE $${params.length} OR e.designation ILIKE $${params.length})`;
  }

  if (department_id) {
    params.push(department_id);
    filters += ` AND e.department_id = $${params.length}`;
  }

  const query = `
    SELECT e.*, d.department_name,
      COALESCE(STRING_AGG(s.skill_name, ', '), '') AS skills
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN employee_skills es ON e.id = es.employee_id
    LEFT JOIN skills s ON es.skill_id = s.id
    WHERE 1=1 ${filters}
    GROUP BY e.id, d.department_name
    ORDER BY ${sortBy} ${order}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  return { query, params: [...params, limit, offset] };
};

const createEmployee = async (employeeData) => {
  const { name, email, phone, designation, department_id, date_of_joining, profile_photo, resume } = employeeData;
  const result = await pool.query(
    `INSERT INTO employees (name, email, phone, designation, department_id, date_of_joining, profile_photo, resume)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, email, phone, designation, department_id || null, date_of_joining || null, profile_photo, resume]
  );
  return result.rows[0];
};

const addEmployeeSkills = async (employeeId, skillIds) => {
  if (!skillIds.length) return;
  const values = skillIds.map((_, index) => `($1, $${index + 2})`).join(", ");
  await pool.query(`INSERT INTO employee_skills (employee_id, skill_id) VALUES ${values}`, [employeeId, ...skillIds]);
};

const addEmployeeDocuments = async (employeeId, documents) => {
  if (!documents.length) return;
  const params = [employeeId];
  const values = documents.map((doc, index) => {
    const paramIndex = index * 2 + 2;
    params.push(doc.document_name, doc.document_path);
    return `($1, $${paramIndex}, $${paramIndex + 1})`;
  }).join(", ");
  await pool.query(`INSERT INTO employee_documents (employee_id, document_name, document_path) VALUES ${values}`, params);
};

const findAll = async (filters) => {
  const { query, params } = buildEmployeeQuery(filters);
  const result = await pool.query(query, params);
  return result.rows;
};

const findById = async (employeeId) => {
  const result = await pool.query(
    `SELECT e.*, d.department_name,
      COALESCE(STRING_AGG(s.skill_name, ', '), '') AS skills
     FROM employees e
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employee_skills es ON e.id = es.employee_id
     LEFT JOIN skills s ON es.skill_id = s.id
     WHERE e.id = $1
     GROUP BY e.id, d.department_name`,
    [employeeId]
  );
  return result.rows[0];
};

const findDocumentsByEmployeeId = async (employeeId) => {
  const result = await pool.query(
    "SELECT id, document_name, document_path, uploaded_at FROM employee_documents WHERE employee_id = $1 ORDER BY uploaded_at DESC",
    [employeeId]
  );
  return result.rows;
};

const updateEmployee = async (employeeId, changes) => {
  const fields = [];
  const values = [];

  Object.entries(changes).forEach(([key, value]) => {
    fields.push(`${key} = $${fields.length + 1}`);
    values.push(value);
  });

  if (!fields.length) {
    const result = await pool.query("SELECT * FROM employees WHERE id = $1", [employeeId]);
    return result.rows[0];
  }

  values.push(employeeId);
  const result = await pool.query(
    `UPDATE employees SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0];
};

const clearEmployeeSkills = async (employeeId) => {
  await pool.query("DELETE FROM employee_skills WHERE employee_id = $1", [employeeId]);
};

const deleteEmployee = async (employeeId) => {
  await pool.query("DELETE FROM employees WHERE id = $1", [employeeId]);
};

const findByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM employees WHERE email = $1", [email]);
  return result.rows[0];
};

module.exports = {
  createEmployee,
  addEmployeeSkills,
  addEmployeeDocuments,
  findAll,
  findById,
  findDocumentsByEmployeeId,
  updateEmployee,
  clearEmployeeSkills,
  deleteEmployee,
  findByEmail,
};
