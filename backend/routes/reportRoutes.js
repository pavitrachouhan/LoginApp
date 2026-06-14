const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/assets", authenticateToken, reportController.getAssetAllocationReport);
router.get("/stats", authenticateToken, reportController.getDashboardStats);
router.get("/leave-summary", authenticateToken, reportController.getLeaveDashboardStats);
router.get("/employees", authenticateToken, reportController.getEmployeeReport);
router.get("/leaves", authenticateToken, reportController.getLeaveReport);
router.get("/asset-report", authenticateToken, reportController.getAssetReport);
router.get("/department-analytics", authenticateToken, reportController.getDepartmentAnalytics);
router.get("/export/employees", authenticateToken, reportController.exportEmployees);
router.get("/export/leaves", authenticateToken, reportController.exportLeaves);
router.get("/export/assets", authenticateToken, reportController.exportAssets);

module.exports = router;
