const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authenticateToken, notificationController.getNotifications);
router.put("/:id/read", authenticateToken, notificationController.markAsRead);

module.exports = router;
