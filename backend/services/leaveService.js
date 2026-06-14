const pool = require("../config/db");
const auditService = require("./auditService");
const notificationService = require("./notificationService");

const parseNumber = (value) => {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const resolveEmployeeId = async (user, requestedEmployeeId) => {
  const employeeId = parseNumber(requestedEmployeeId);

  if (user.role === "employee") {
    const result = await pool.query("SELECT id FROM employees WHERE email = $1", [user.username]);
    if (!result.rowCount) {
      throw new Error("No employee profile found for the current user.");
    }
    return result.rows[0].id;
  }

  if (employeeId) {
    return employeeId;
  }

  const fallback = await pool.query("SELECT id FROM employees WHERE email = $1", [user.username]);
  if (fallback.rowCount) {
    return fallback.rows[0].id;
  }

  throw new Error("employee_id is required for this operation.");
};

const ensureLeaveBalances = async (employeeId) => {
  const leaveTypes = await pool.query("SELECT id, default_balance FROM leave_types");

  for (const row of leaveTypes.rows) {
    await pool.query(
      `INSERT INTO employee_leave_balances (employee_id, leave_type_id, total_balance, used_days)
       VALUES ($1, $2, $3, 0)
       ON CONFLICT (employee_id, leave_type_id) DO NOTHING`,
      [employeeId, row.id, row.default_balance]
    );
  }
};

const getLeaveTypes = async () => {
  const result = await pool.query("SELECT * FROM leave_types ORDER BY id");
  return result.rows;
};

const getLeaveBalance = async (employeeId, user) => {
  const resolvedId = await resolveEmployeeId(user, employeeId);
  await ensureLeaveBalances(resolvedId);
  const result = await pool.query(
    `SELECT b.*, lt.type_name, (b.total_balance - b.used_days) AS available_days
     FROM employee_leave_balances b
     JOIN leave_types lt ON b.leave_type_id = lt.id
     WHERE b.employee_id = $1
     ORDER BY lt.type_name`,
    [resolvedId]
  );
  return result.rows;
};

const getLeaveRequests = async (user) => {
  let query = `
    SELECT la.*, e.name AS employee_name, e.email AS employee_email, lt.type_name,
      d.department_name, um.username AS manager_username, uh.username AS hr_username
    FROM leave_applications la
    JOIN employees e ON la.employee_id = e.id
    JOIN leave_types lt ON la.leave_type_id = lt.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN users um ON la.manager_id = um.id
    LEFT JOIN users uh ON la.hr_id = uh.id
  `;

  const params = [];
  if (user.role === "employee") {
    const employee = await pool.query("SELECT id FROM employees WHERE email = $1", [user.username]);
    if (!employee.rowCount) {
      throw new Error("No employee record found for the current user.");
    }
    query += "WHERE la.employee_id = $1 ";
    params.push(employee.rows[0].id);
  } else if (user.role === "manager") {
    query += "WHERE la.status = 'PENDING' ";
  } else if (user.role === "hr") {
    query += "WHERE la.status = 'MANAGER_APPROVED' ";
  }

  query += "ORDER BY la.created_at DESC";
  const result = await pool.query(query, params);
  return result.rows;
};

const getLeaveById = async (leaveId, user) => {
  const result = await pool.query(
    `SELECT la.*, e.name AS employee_name, e.email AS employee_email, lt.type_name,
      d.department_name, um.username AS manager_username, uh.username AS hr_username
     FROM leave_applications la
     JOIN employees e ON la.employee_id = e.id
     JOIN leave_types lt ON la.leave_type_id = lt.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN users um ON la.manager_id = um.id
     LEFT JOIN users uh ON la.hr_id = uh.id
     WHERE la.id = $1`,
    [leaveId]
  );

  if (!result.rowCount) {
    throw new Error("Leave application not found.");
  }

  const leave = result.rows[0];
  if (user.role === "employee") {
    const employee = await pool.query("SELECT id FROM employees WHERE email = $1", [user.username]);
    if (!employee.rowCount || employee.rows[0].id !== leave.employee_id) {
      throw new Error("Access denied to this leave application.");
    }
  }

  return leave;
};

const getApprovalHistory = async (leaveId, user) => {
  const leave = await getLeaveById(leaveId, user);
  const result = await pool.query(
    `SELECT h.*, u.username AS actor_name
     FROM leave_approval_history h
     LEFT JOIN users u ON h.actor_id = u.id
     WHERE h.leave_application_id = $1
     ORDER BY h.created_at DESC`,
    [leaveId]
  );
  return result.rows;
};

const applyLeave = async (leaveData, user) => {
  const employeeId = await resolveEmployeeId(user, leaveData.employee_id);
  const leaveTypeId = parseNumber(leaveData.leave_type_id);
  const totalDays = parseNumber(leaveData.total_days);

  if (!leaveTypeId || !leaveData.from_date || !leaveData.to_date || !totalDays) {
    throw new Error("leave_type_id, from_date, to_date, and total_days are required.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const leaveType = await client.query("SELECT * FROM leave_types WHERE id = $1", [leaveTypeId]);
    if (!leaveType.rowCount) {
      throw new Error("Leave type not found.");
    }

    await ensureLeaveBalances(employeeId);
    const balance = await client.query(
      "SELECT * FROM employee_leave_balances WHERE employee_id = $1 AND leave_type_id = $2 FOR UPDATE",
      [employeeId, leaveTypeId]
    );
    if (!balance.rowCount) {
      throw new Error("Leave balance not configured for this employee.");
    }

    const available = balance.rows[0].total_balance - balance.rows[0].used_days;
    if (totalDays > available) {
      throw new Error("Leave request exceeds available balance.");
    }

    const result = await client.query(
      `INSERT INTO leave_applications
        (employee_id, leave_type_id, from_date, to_date, total_days, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [employeeId, leaveTypeId, leaveData.from_date, leaveData.to_date, totalDays, leaveData.reason || null]
    );

    const application = result.rows[0];
    await auditService.logChange("leave_applications", application.id, "INSERT", null, application, user.userId);
    await notificationService.createNotification(user.userId, `Leave application submitted for ${leaveData.from_date} to ${leaveData.to_date}`);

    await client.query("COMMIT");
    return application;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const processManagerReview = async (leaveId, reviewData, user) => {
  const { action, comment } = reviewData;
  if (!["APPROVE", "REJECT"].includes(action)) {
    throw new Error("Manager action must be APPROVE or REJECT.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const leaveResult = await client.query("SELECT * FROM leave_applications WHERE id = $1 FOR UPDATE", [leaveId]);
    if (!leaveResult.rowCount) {
      throw new Error("Leave application not found.");
    }

    const leave = leaveResult.rows[0];
    if (leave.status !== "PENDING") {
      throw new Error("Only pending leave requests can be reviewed by a manager.");
    }

    const newStatus = action === "APPROVE" ? "MANAGER_APPROVED" : "MANAGER_REJECTED";
    const updated = await client.query(
      `UPDATE leave_applications SET status = $1, manager_id = $2, manager_comment = $3, manager_decision_date = NOW(), updated_at = NOW() WHERE id = $4 RETURNING *`,
      [newStatus, user.userId, comment || null, leaveId]
    );

    await client.query(
      `INSERT INTO leave_approval_history (leave_application_id, action, actor_id, role, comment) VALUES ($1, $2, $3, $4, $5)`,
      [leaveId, newStatus, user.userId, user.role, comment || null]
    );
    await auditService.logChange("leave_applications", leaveId, "UPDATE", leave, updated.rows[0], user.userId);
    await notificationService.createNotification(user.userId, `Manager ${action.toLowerCase()}ed leave request ${leaveId}`);

    await client.query("COMMIT");
    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const processHRReview = async (leaveId, reviewData, user) => {
  const { action, comment } = reviewData;
  if (!["APPROVE", "REJECT"].includes(action)) {
    throw new Error("HR action must be APPROVE or REJECT.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const leaveResult = await client.query("SELECT * FROM leave_applications WHERE id = $1 FOR UPDATE", [leaveId]);
    if (!leaveResult.rowCount) {
      throw new Error("Leave application not found.");
    }

    const leave = leaveResult.rows[0];
    if (leave.status !== "MANAGER_APPROVED") {
      throw new Error("Only manager-approved leave requests can be reviewed by HR.");
    }

    const newStatus = action === "APPROVE" ? "HR_APPROVED" : "HR_REJECTED";
    const updated = await client.query(
      `UPDATE leave_applications SET status = $1, hr_id = $2, hr_comment = $3, hr_decision_date = NOW(), updated_at = NOW() WHERE id = $4 RETURNING *`,
      [newStatus, user.userId, comment || null, leaveId]
    );

    if (newStatus === "HR_APPROVED") {
      await client.query(
        `UPDATE employee_leave_balances
         SET used_days = used_days + $1, updated_at = NOW()
         WHERE employee_id = $2 AND leave_type_id = $3`,
        [leave.total_days, leave.employee_id, leave.leave_type_id]
      );
    }

    await client.query(
      `INSERT INTO leave_approval_history (leave_application_id, action, actor_id, role, comment) VALUES ($1, $2, $3, $4, $5)`,
      [leaveId, newStatus, user.userId, user.role, comment || null]
    );
    await auditService.logChange("leave_applications", leaveId, "UPDATE", leave, updated.rows[0], user.userId);
    await notificationService.createNotification(user.userId, `HR ${action.toLowerCase()}ed leave request ${leaveId}`);

    await client.query("COMMIT");
    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getLeaveAnalytics = async () => {
  const stats = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM leave_applications
     GROUP BY status
     ORDER BY count DESC`
  );

  const monthly = await pool.query(
    `SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS total_leaves
     FROM leave_applications
     GROUP BY month
     ORDER BY month DESC
     LIMIT 6`
  );

  const typeBreakdown = await pool.query(
    `SELECT lt.type_name, COUNT(*) AS count
     FROM leave_applications la
     JOIN leave_types lt ON la.leave_type_id = lt.id
     GROUP BY lt.type_name
     ORDER BY count DESC`
  );

  return {
    statusCounts: stats.rows,
    monthlyApplications: monthly.rows,
    typeBreakdown: typeBreakdown.rows,
  };
};

module.exports = {
  getLeaveTypes,
  applyLeave,
  getLeaveRequests,
  getLeaveById,
  getApprovalHistory,
  getLeaveBalance,
  processManagerReview,
  processHRReview,
  getLeaveAnalytics,
};
