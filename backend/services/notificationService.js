const pool = require("../config/db");

const createNotification = async (userId, message) => {
  const result = await pool.query(
    "INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *",
    [userId, message]
  );
  return result.rows[0];
};

const getNotifications = async (userId, { limit = 50, offset = 0, unread } = {}) => {
  let query = "SELECT * FROM notifications WHERE user_id = $1";
  const params = [userId];

  if (unread === "true") {
    query += " AND read_flag = FALSE";
  }

  query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3";
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const markAsRead = async (notificationId, userId) => {
  const result = await pool.query(
    "UPDATE notifications SET read_flag = TRUE WHERE id = $1 AND user_id = $2 RETURNING *",
    [notificationId, userId]
  );
  if (!result.rowCount) {
    throw new Error("Notification not found or access denied.");
  }
  return result.rows[0];
};

module.exports = { createNotification, getNotifications, markAsRead };