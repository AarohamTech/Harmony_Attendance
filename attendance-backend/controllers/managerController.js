const db = require('../config/database');
const notificationService = require('../services/notificationService');

class ManagerController {
  async getPendingRequests(req, res, next) {
    try {
      const result = await db.query(`
        SELECT r.*, e.full_name AS employee_name, e.employee_code, e.department, e.designation
        FROM attendance_requests r
        JOIN employees e ON r.employee_id = e.employee_id
        ORDER BY r.created_at DESC
      `);

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }

  async processAction(req, res, next) {
    const client = await db.pool.connect();
    try {
      const requestId = parseInt(req.params.id, 10);
      const managerId = req.user.employee_id;
      const { action, remarks, manager_remark } = req.body;

      const finalAction = (action || 'Approved').trim();
      const finalRemark = (remarks || manager_remark || '').trim();

      if (!['Approved', 'Rejected'].includes(finalAction)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be "Approved" or "Rejected".'
        });
      }

      await client.query('BEGIN');

      // Fetch request details
      const reqRes = await client.query(
        'SELECT * FROM attendance_requests WHERE request_id = $1 FOR UPDATE',
        [requestId]
      );

      if (reqRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Attendance request not found.'
        });
      }

      const attReq = reqRes.rows[0];

      // Update attendance request status
      const updateReq = await client.query(
        `UPDATE attendance_requests
         SET status = $1, manager_remark = $2
         WHERE request_id = $3
         RETURNING *`,
        [finalAction, finalRemark, requestId]
      );

      // Check manager record
      const mgrRes = await client.query('SELECT manager_id FROM managers WHERE employee_id = $1 LIMIT 1', [managerId]);
      const mgrRecordId = mgrRes.rows[0]?.manager_id || null;

      // Log manager action
      if (mgrRecordId) {
        await client.query(
          `INSERT INTO manager_actions (request_id, manager_id, action, remarks, action_date)
           VALUES ($1, $2, $3, $4, NOW())`,
          [requestId, mgrRecordId, finalAction, finalRemark]
        );
      }

      // If approved, update attendance record
      if (finalAction === 'Approved') {
        const dateStr = attReq.request_date.toISOString ? attReq.request_date.toISOString().slice(0, 10) : String(attReq.request_date).slice(0, 10);
        await client.query(
          `UPDATE attendance
           SET attendance_status = 'Present',
               remarks = $1
           WHERE employee_id = $2 AND attendance_date = $3`,
          [`Request approved: ${attReq.request_type}`, attReq.employee_id, dateStr]
        );
      }

      await client.query('COMMIT');

      // Create Notification for Employee
      const notifTitle = `Attendance Request ${finalAction}`;
      const notifMessage = finalAction === 'Approved'
        ? `Your request (${attReq.request_type}) for ${attReq.request_date} has been approved.`
        : `Your request (${attReq.request_type}) was rejected. Manager remark: ${finalRemark || 'N/A'}`;

      await notificationService.createNotification(
        attReq.employee_id,
        notifTitle,
        notifMessage,
        'APPROVAL'
      );

      return res.status(200).json({
        success: true,
        message: `Request successfully ${finalAction.toLowerCase()}`,
        data: updateReq.rows[0]
      });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
}

module.exports = new ManagerController();
