const express = require("express");
const router = express.Router();

const authRoutes = require("../authRoutes");
const departmentRoutes = require("../departmentRoutes");
const skillRoutes = require("../skillRoutes");
const employeeRoutes = require("../employeeRoutes");
const employeeSkillRoutes = require("../employeeSkillRoutes");
const leaveRoutes = require("../leaveRoutes");
const assetRoutes = require("../assetRoutes");
const notificationRoutes = require("../notificationRoutes");
const auditRoutes = require("../auditRoutes");
const reportRoutes = require("../reportRoutes");
const dashboardRoutes = require("../dashboardRoutes");
const healthRoutes = require("../healthRoutes");

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/skills", skillRoutes);
router.use("/employees", employeeRoutes);
router.use("/employee-skills", employeeSkillRoutes);
router.use("/leaves", leaveRoutes);
router.use("/assets", assetRoutes);
router.use("/notifications", notificationRoutes);
router.use("/audits", auditRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/health", healthRoutes);

module.exports = router;
