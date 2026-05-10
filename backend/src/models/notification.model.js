const db = require("../db/connection");

const createNotification = async (
  userId,
  appointmentId,
  title,
  message
) => {
  const query = `
    INSERT INTO notifications (
      user_id,
      appointment_id,
      title,
      message
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [userId, appointmentId, title, message];

  const result = await db.query(query, values);
  return result.rows[0];
};

const getNotificationsByUserId = async (userId) => {
  const query = `
    SELECT *
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
};

const markNotificationAsRead = async (notificationId, userId) => {
  const query = `
    UPDATE notifications
    SET is_read = true
    WHERE notification_id = $1
    AND user_id = $2
    RETURNING *
  `;

  const result = await db.query(query, [notificationId, userId]);
  return result.rows[0];
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markNotificationAsRead
};