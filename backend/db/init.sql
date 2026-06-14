-- Employee Management System schema

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  skill_name VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(50),
  designation VARCHAR(150),
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  date_of_joining DATE,
  profile_photo VARCHAR(500),
  resume VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_skills (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(employee_id, skill_id)
);

CREATE TABLE IF NOT EXISTS employee_documents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  asset_name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  asset_code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_allocations (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  allocated_by INTEGER REFERENCES users(id),
  allocated_at TIMESTAMP DEFAULT NOW(),
  returned_at TIMESTAMP,
  notes TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_allocations_active_asset ON asset_allocations(asset_id) WHERE returned_at IS NULL;

CREATE TABLE IF NOT EXISTS leave_types (
  id SERIAL PRIMARY KEY,
  type_name VARCHAR(100) UNIQUE NOT NULL,
  default_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_leave_balances (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id INTEGER REFERENCES leave_types(id) ON DELETE CASCADE,
  total_balance INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id)
);

CREATE TABLE IF NOT EXISTS leave_applications (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id INTEGER REFERENCES leave_types(id),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days NUMERIC NOT NULL,
  reason TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  manager_id INTEGER REFERENCES users(id),
  manager_comment TEXT,
  manager_decision_date TIMESTAMP,
  hr_id INTEGER REFERENCES users(id),
  hr_comment TEXT,
  hr_decision_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_approval_history (
  id SERIAL PRIMARY KEY,
  leave_application_id INTEGER REFERENCES leave_applications(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  actor_id INTEGER REFERENCES users(id),
  role VARCHAR(50),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  read_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO leave_types (type_name, default_balance)
VALUES
  ('Casual', 12),
  ('Sick', 8),
  ('Earned', 15)
ON CONFLICT (type_name) DO NOTHING;

CREATE VIEW IF NOT EXISTS v_asset_report AS
SELECT
  a.id,
  a.asset_name,
  a.asset_type,
  a.asset_code,
  a.status,
  e.name AS allocated_to,
  aa.allocated_at,
  aa.returned_at,
  aa.notes
FROM assets a
LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.returned_at IS NULL
LEFT JOIN employees e ON aa.employee_id = e.id;

CREATE OR REPLACE FUNCTION sp_get_department_analytics()
RETURNS TABLE(department_name VARCHAR, employee_count INT, active_asset_count INT, active_leave_count INT)
LANGUAGE SQL AS $$
SELECT d.department_name,
  COUNT(DISTINCT e.id) AS employee_count,
  COUNT(DISTINCT aa.asset_id) FILTER (WHERE aa.returned_at IS NULL) AS active_asset_count,
  COUNT(DISTINCT la.id) FILTER (WHERE la.status IN ('PENDING','MANAGER_APPROVED','HR_APPROVED')) AS active_leave_count
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
LEFT JOIN asset_allocations aa ON aa.employee_id = e.id AND aa.returned_at IS NULL
LEFT JOIN leave_applications la ON la.employee_id = e.id
GROUP BY d.department_name;
$$;

CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_employee ON employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_status ON leave_applications(status);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON employee_leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
