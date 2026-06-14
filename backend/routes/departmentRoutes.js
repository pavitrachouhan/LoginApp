const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

// Add Department
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { department_name } = req.body;

    const result = await pool.query(
      "INSERT INTO departments (department_name) VALUES ($1) RETURNING *",
      [department_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Department already exists." });
    }
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Departments
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { department_name } = req.body;
    const result = await pool.query(
      "UPDATE departments SET department_name = $1 WHERE id = $2 RETURNING *",
      [department_name, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM departments WHERE id = $1", [id]);
    res.json({ message: "Department deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;