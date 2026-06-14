const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

const parseSkillIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => Number(item)).filter(Boolean);
  if (typeof value === "string") {
    try {
      return JSON.parse(value).map((item) => Number(item)).filter(Boolean);
    } catch (error) {
      return value.split(",").map((item) => Number(item.trim())).filter(Boolean);
    }
  }
  return [];
};

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { employee_id, skill_ids } = req.body;
    const skills = parseSkillIds(skill_ids);

    if (!employee_id || !skills.length) {
      return res.status(400).json({ message: "Employee ID and skill IDs are required." });
    }

    const values = skills.map((_, index) => `($1, $${index + 2})`).join(", ");
    const query = `INSERT INTO employee_skills (employee_id, skill_id) VALUES ${values} RETURNING *`;
    const result = await pool.query(query, [employee_id, ...skills]);

    res.status(201).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/employee/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT e.id, e.name, e.email, d.department_name,
        COALESCE(STRING_AGG(s.skill_name, ', '), '') AS skills
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE e.id = $1
      GROUP BY e.id, d.department_name
    `, [id]);

    if (!result.rowCount) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/employee/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM employee_skills WHERE employee_id = $1", [id]);
    res.json({ message: "Employee skills removed." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
