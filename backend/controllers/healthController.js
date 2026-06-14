const pool = require("../config/db");

exports.getHealthStatus = async (req, res, next) => {
  try {
    const dbStatus = await pool.query("SELECT 1");
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus.rowCount === 1 ? "connected" : "disconnected",
    });
  } catch (error) {
    next(error);
  }
};
