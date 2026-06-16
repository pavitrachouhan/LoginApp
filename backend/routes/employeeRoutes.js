const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { authenticateToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createEmployeeSchema,
  updateEmployeeSchema,
} = require("../validators/employeeValidator");
const employeeController = require("../controllers/employeeController");

// Vercel-safe upload directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "/tmp/uploads/employees";

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },

  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "")
      .toLowerCase();

    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

const uploadFields = upload.fields([
  { name: "profile_photo", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);

// Create Employee
router.post(
  "/",
  authenticateToken,
  uploadFields,
  validateRequest(createEmployeeSchema),
  employeeController.createEmployee
);

// Get All Employees
router.get(
  "/",
  authenticateToken,
  employeeController.listEmployees
);

// Get Employee By ID
router.get(
  "/:id",
  authenticateToken,
  employeeController.getEmployee
);

// Update Employee
router.put(
  "/:id",
  authenticateToken,
  uploadFields,
  validateRequest(updateEmployeeSchema),
  employeeController.updateEmployee
);

// Delete Employee
router.delete(
  "/:id",
  authenticateToken,
  employeeController.deleteEmployee
);

module.exports = router;