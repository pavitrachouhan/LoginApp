const express = require("express");
const { getDashboardStats } = require("../controllers/reportController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getDashboardStats);

module.exports = router;
