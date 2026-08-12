const db = require('../config/database');

class RequestController {
  async createRequest(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const {
        request_type,
        type,
        request_date,
        date,
        target_date,
        requested_time,
        reason,
        title,
        remarks
      } = req.body;

      const rawType = (request_type || type || 'Attendance Correction').trim();
      const typeMap = {
        LEAVE: 'Late Arrival',
        EARLY_EXIT: 'Early Exit',
        MISC: 'Attendance Correction',
        leave: 'Late Arrival',
        early_exit: 'Early Exit',
        correction: 'Attendance Correction'
      };
      const finalType = typeMap[rawType] || rawType;

      const reqDate = request_date || date || target_date || new Date().toISOString().slice(0, 10);
      const reqReason = (title ? `${title} - ${reason || ''}` : reason || 'Attendance adjustment request').trim();

      const insertRes = await db.query(
        `INSERT INTO attendance_requests
         (employee_id, request_type, request_date, requested_time, reason, remarks, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
         RETURNING *`,
        [employeeId, finalType, reqDate, requested_time || null, reqReason, remarks || null]
      );

      const newReq = insertRes.rows[0];

      return res.status(201).json({
        success: true,
        message: 'Attendance request submitted successfully',
        data: newReq,
        id: newReq.request_id,
        created_at: newReq.created_at,
        status: newReq.status
      });
    } catch (err) {
      next(err);
    }
  }

  async listRequests(req, res, next) {
    try {
      const employeeId = req.query.employee_id ? parseInt(req.query.employee_id, 10) : req.user.employee_id;
      const result = await db.query(
        `SELECT request_id AS id, request_id, employee_id, request_type, request_date, requested_time, reason, remarks, status, manager_remark, created_at
         FROM attendance_requests
         WHERE employee_id = $1
         ORDER BY created_at DESC`,
        [employeeId]
      );

      return res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RequestController();
