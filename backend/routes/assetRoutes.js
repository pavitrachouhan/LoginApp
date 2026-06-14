const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, assetController.getAssets);
router.post("/", authenticateToken, assetController.createAsset);
router.post("/allocate", authenticateToken, assetController.allocateAsset);
router.post("/return/:assetId", authenticateToken, assetController.returnAsset);

module.exports = router;