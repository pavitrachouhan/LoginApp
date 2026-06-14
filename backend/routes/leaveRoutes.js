const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/types", authenticateToken, leaveController.getLeaveTypes);
router.post("/apply", authenticateToken, authorizeRoles("employee", "manager", "hr", "admin"), leaveController.applyLeave);
router.get("/", authenticateToken, leaveController.listLeaves);
router.get("/analytics", authenticateToken, authorizeRoles("admin", "hr", "manager"), leaveController.getLeaveAnalytics);
router.get("/balances/:employeeId", authenticateToken, leaveController.getLeaveBalance);
router.put("/:id/manager", authenticateToken, authorizeRoles("manager", "admin"), leaveController.managerReview);
router.put("/:id/hr", authenticateToken, authorizeRoles("hr", "admin"), leaveController.hrReview);
router.get("/:id/history", authenticateToken, leaveController.getApprovalHistory);
router.get("/:id", authenticateToken, leaveController.getLeaveById);

module.exports = router;
