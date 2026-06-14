const express = require("express");
const router = express.Router();
const upload = require("multer")({ storage: require("multer").diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = require("path").join(__dirname, "..", "uploads", "employees");
    require("fs").mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${timestamp}-${safeName}`);
  },
}) });
const { authenticateToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createEmployeeSchema, updateEmployeeSchema } = require("../validators/employeeValidator");
const employeeController = require("../controllers/employeeController");

const uploadFields = upload.fields([
  { name: "profile_photo", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);

router.post("/", authenticateToken, uploadFields, validateRequest(createEmployeeSchema), employeeController.createEmployee);
router.get("/", authenticateToken, employeeController.listEmployees);
router.get("/:id", authenticateToken, employeeController.getEmployee);
router.put("/:id", authenticateToken, uploadFields, validateRequest(updateEmployeeSchema), employeeController.updateEmployee);
router.delete("/:id", authenticateToken, employeeController.deleteEmployee);

module.exports = router;
