const db = require('../config/database');

class NotificationService {
  async createNotification(employeeId, title, message, notificationType = 'SYSTEM') {
    const query = `
      INSERT INTO notifications (employee_id, title, message, notification_type, is_read, created_at)
      VALUES ($1, $2, $3, $4, FALSE, NOW())
      RETURNING *
    `;
    const result = await db.query(query, [employeeId, title, message, notificationType]);
    return result.rows[0];
  }

  async getUserNotifications(employeeId) {
    const query = `
      SELECT notification_id AS id, title, message AS body, notification_type AS type, is_read, created_at
      FROM notifications
      WHERE employee_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [employeeId]);
    return result.rows.map(row => ({
      ...row,
      unread: row.is_read ? 0 : 1
    }));
  }

  async markAllRead(employeeId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE employee_id = $1
    `;
    await db.query(query, [employeeId]);
    return { success: true };
  }

  async markRead(notificationId, employeeId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE notification_id = $1 AND employee_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [notificationId, employeeId]);
    return result.rows[0];
  }
}

module.exports = new NotificationService();
