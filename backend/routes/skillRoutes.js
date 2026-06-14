const express = require("express");
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { skill_name } = req.body;
    const result = await pool.query(
      "INSERT INTO skills (skill_name) VALUES ($1) RETURNING *",
      [skill_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Skill already exists." });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_name } = req.body;
    const result = await pool.query(
      "UPDATE skills SET skill_name = $1 WHERE id = $2 RETURNING *",
      [skill_name, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Skill not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM skills WHERE id = $1", [id]);
    res.json({ message: "Skill deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
