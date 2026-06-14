const cron = require("node-cron");
const pool = require("../config/db");
const logger = require("../utils/logger");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASSWORD || "password",
  },
});

const sendLeaveReminderEmails = async () => {
  try {
    const result = await pool.query(
      `SELECT u.username, u.role, u.email, la.id, la.from_date, la.to_date, la.total_days
       FROM leave_applications la
       JOIN employees e ON la.employee_id = e.id
       JOIN users u ON u.id = la.employee_id
       WHERE la.status = 'PENDING' AND la.from_date <= NOW() + INTERVAL '3 days'`
    );

    if (!result.rows.length) {
      logger.info("Leave reminder job found no pending applications.");
      return;
    }

    for (const row of result.rows) {
      const mailOptions = {
        from: process.env.SMTP_FROM || "hrms@example.com",
        to: row.email || process.env.NOTIFICATION_EMAIL,
        subject: `Leave reminder for request ${row.id}`,
        text: `Reminder: Leave request ${row.id} for ${row.username} is starting on ${row.from_date}.`,
      };
      await transporter.sendMail(mailOptions);
      logger.info(`Leave reminder email queued for leave ${row.id}`);
    }
  } catch (error) {
    logger.error("Leave reminder job failed:", error);
  }
};

cron.schedule("0 7 * * *", () => {
  logger.info("Running daily leave reminder job.");
  sendLeaveReminderEmails();
});
