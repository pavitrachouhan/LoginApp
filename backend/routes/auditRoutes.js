const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const auditController = require("../controllers/auditController");

const router = express.Router();

router.get("/", authenticateToken, auditController.getAuditLogs);

module.exports = router;
