const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");
const apiV1Routes = require("./routes/v1");
const errorHandler = require("./routes/errorMiddleware");
const logger = require("./utils/logger");
require("./jobs/leaveReminderJob");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/api/v1/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database Connected",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database Connection Failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.use("/api/v1", apiV1Routes);
app.use("/api/v2", apiV1Routes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global Error Handler - should be last
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;