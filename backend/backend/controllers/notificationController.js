const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const employeeId = req.query.employee_id ? parseInt(req.query.employee_id, 10) : req.user.employee_id;
      const notifications = await notificationService.getUserNotifications(employeeId);
      return res.status(200).json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const notificationId = parseInt(req.params.id, 10);

      const updated = await notificationService.markRead(notificationId, employeeId);
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const employeeId = req.query.employee_id ? parseInt(req.query.employee_id, 10) : req.user.employee_id;
      await notificationService.markAllRead(employeeId);
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
