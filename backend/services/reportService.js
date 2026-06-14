const pool = require("../config/db");

const getAssetAllocationReport = async () => {
  const { rows } = await pool.query("SELECT * FROM v_asset_report ORDER BY asset_name");
  return rows;
};

const getDashboardStats = async () => {
  const [{ rows: empRows }, { rows: assetRows }, { rows: pendingRows }, { rows: deptRows }] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM employees"),
    pool.query("SELECT COUNT(*) FROM assets WHERE status = 'available'"),
    pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'PENDING'"),
    pool.query(
      `SELECT d.department_name, COUNT(e.id) as count
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id
       GROUP BY d.department_name`
    ),
  ]);

  return {
    summary: {
      employees: parseInt(empRows[0].count, 10),
      availableAssets: parseInt(assetRows[0].count, 10),
      pendingLeaves: parseInt(pendingRows[0].count, 10),
    },
    departmentDistribution: deptRows,
  };
};

const getLeaveDashboardStats = async () => {
  const [{ rows: pendingManagerRows }, { rows: pendingHRRows }, { rows: hrApprovedRows }, { rows: rejectedRows }, { rows: typeRows }] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'PENDING'"),
    pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'MANAGER_APPROVED'"),
    pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'HR_APPROVED'"),
    pool.query("SELECT COUNT(*) FROM leave_applications WHERE status IN ('MANAGER_REJECTED', 'HR_REJECTED')"),
    pool.query(
      `SELECT lt.type_name, COUNT(*) AS count
       FROM leave_applications la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       GROUP BY lt.type_name
       ORDER BY count DESC`
    ),
  ]);

  return {
    summary: {
      pendingManager: parseInt(pendingManagerRows[0].count, 10),
      pendingHR: parseInt(pendingHRRows[0].count, 10),
      hrApproved: parseInt(hrApprovedRows[0].count, 10),
      rejected: parseInt(rejectedRows[0].count, 10),
    },
    typeBreakdown: typeRows,
  };
};

const getEmployeeReport = async ({ limit = 50, offset = 0, sortBy = 'id', order = 'DESC' }) => {
  const allowedSort = ['id', 'name', 'email', 'designation', 'created_at'];
  if (!allowedSort.includes(sortBy)) sortBy = 'id';
  order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { rows } = await pool.query(
    `SELECT e.id, e.name, e.email, e.phone, e.designation, d.department_name, e.date_of_joining, e.profile_photo, e.resume, e.created_at,
      COALESCE(jsonb_agg(jsonb_build_object('skill_id', s.id, 'skill_name', s.skill_name)) FILTER (WHERE s.id IS NOT NULL), '[]') AS skills,
      COALESCE(jsonb_agg(jsonb_build_object('document_name', ed.document_name, 'document_path', ed.document_path)) FILTER (WHERE ed.id IS NOT NULL), '[]') AS documents
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN employee_skills es ON e.id = es.employee_id
    LEFT JOIN skills s ON es.skill_id = s.id
    LEFT JOIN employee_documents ed ON e.id = ed.employee_id
    GROUP BY e.id, d.department_name
    ORDER BY ${sortBy} ${order}
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return rows;
};

const getLeaveReport = async ({ limit = 50, offset = 0, sortBy = 'created_at', order = 'DESC' }) => {
  const allowedSort = ['created_at', 'from_date', 'to_date', 'status', 'total_days'];
  if (!allowedSort.includes(sortBy)) sortBy = 'created_at';
  order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { rows } = await pool.query(
    `SELECT la.*, e.name as employee_name, lt.type_name as leave_type, u1.username as manager_name, u2.username as hr_name
    FROM leave_applications la
    JOIN employees e ON la.employee_id = e.id
    JOIN leave_types lt ON la.leave_type_id = lt.id
    LEFT JOIN users u1 ON la.manager_id = u1.id
    LEFT JOIN users u2 ON la.hr_id = u2.id
    ORDER BY ${sortBy} ${order}
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return rows;
};

const getAssetReport = async ({ limit = 50, offset = 0, sortBy = 'asset_name', order = 'ASC' }) => {
  const allowedSort = ['asset_name', 'asset_type', 'status', 'allocated_at', 'returned_at'];
  if (!allowedSort.includes(sortBy)) sortBy = 'asset_name';
  order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const { rows } = await pool.query(
    `SELECT a.id, a.asset_name, a.asset_type, a.asset_code, a.status, e.name as allocated_to, aa.allocated_at, aa.returned_at, aa.notes
     FROM assets a
     LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.returned_at IS NULL
     LEFT JOIN employees e ON aa.employee_id = e.id
     ORDER BY ${sortBy} ${order}
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return rows;
};

const getDepartmentAnalytics = async () => {
  const { rows } = await pool.query(
    `SELECT d.department_name,
      COUNT(DISTINCT e.id) AS employee_count,
      COUNT(DISTINCT aa.asset_id) FILTER (WHERE aa.returned_at IS NULL) AS active_asset_count,
      COUNT(DISTINCT la.id) FILTER (WHERE la.status IN ('PENDING','MANAGER_APPROVED','HR_APPROVED')) AS active_leave_count
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.id
    LEFT JOIN asset_allocations aa ON aa.employee_id = e.id AND aa.returned_at IS NULL
    LEFT JOIN leave_applications la ON la.employee_id = e.id
    GROUP BY d.department_name
    ORDER BY d.department_name`
  );
  return rows;
};

const rowsToCsv = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")];
  rows.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] === null || row[header] === undefined ? "" : String(row[header]);
      return `"${value.replace(/"/g, '""')}"`;
    });
    csv.push(values.join(","));
  });
  return csv.join("\n");
};

const getEmployeeCsv = async () => {
  const rows = await getEmployeeReport({ limit: 1000, offset: 0 });
  return rowsToCsv(rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    designation: r.designation,
    department_name: r.department_name,
    date_of_joining: r.date_of_joining,
    created_at: r.created_at,
  })));
};

const getLeaveCsv = async () => {
  const rows = await getLeaveReport({ limit: 1000, offset: 0 });
  return rowsToCsv(rows.map((r) => ({
    id: r.id,
    employee_name: r.employee_name,
    leave_type: r.leave_type,
    from_date: r.from_date,
    to_date: r.to_date,
    total_days: r.total_days,
    status: r.status,
    manager_name: r.manager_name,
    hr_name: r.hr_name,
    created_at: r.created_at,
  })));
};

const getAssetCsv = async () => {
  const rows = await getAssetReport({ limit: 1000, offset: 0 });
  return rowsToCsv(rows.map((r) => ({
    id: r.id,
    asset_name: r.asset_name,
    asset_type: r.asset_type,
    asset_code: r.asset_code,
    status: r.status,
    allocated_to: r.allocated_to,
    allocated_at: r.allocated_at,
    returned_at: r.returned_at,
  })));
};

module.exports = {
  getAssetAllocationReport,
  getDashboardStats,
  getLeaveDashboardStats,
  getEmployeeReport,
  getLeaveReport,
  getAssetReport,
  getDepartmentAnalytics,
  getEmployeeCsv,
  getLeaveCsv,
  getAssetCsv,
};
