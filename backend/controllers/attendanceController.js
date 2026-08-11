const attendanceService = require('../services/attendanceService');
const db = require('../config/database');

class AttendanceController {
  async punchIn(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const { latitude, longitude, face_image, base64Image, late_reason } = req.body;

      const record = await attendanceService.processPunchIn(
        employeeId,
        latitude,
        longitude,
        face_image || base64Image,
        late_reason
      );

      return res.status(200).json({
        success: true,
        message: 'Punch in recorded successfully',
        data: record
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Punch in failed.'
      });
    }
  }

  async punchOut(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const { latitude, longitude, face_image, base64Image, early_exit_reason } = req.body;

      const record = await attendanceService.processPunchOut(
        employeeId,
        latitude,
        longitude,
        face_image || base64Image,
        early_exit_reason
      );

      return res.status(200).json({
        success: true,
        message: 'Punch out recorded successfully',
        data: record
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Punch out failed.'
      });
    }
  }

  async punchUnified(req, res, next) {
    try {
      const employeeId = req.user?.employee_id || req.body.employee_id;
      if (!employeeId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { punch_type, latitude, longitude, face_image, base64Image, late_reason, early_exit_reason } = req.body;

      let record;
      if (punch_type === 'in') {
        record = await attendanceService.processPunchIn(employeeId, latitude, longitude, face_image || base64Image, late_reason);
      } else if (punch_type === 'out') {
        record = await attendanceService.processPunchOut(employeeId, latitude, longitude, face_image || base64Image, early_exit_reason);
      } else {
        return res.status(400).json({ success: false, message: 'Invalid punch_type. Must be "in" or "out".' });
      }

      return res.status(200).json({
        success: true,
        message: `Punch ${punch_type} recorded successfully`,
        data: record
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Punch processing failed.'
      });
    }
  }

  async getTodayAttendance(req, res, next) {
    try {
      const employeeId = req.query.employee_id ? parseInt(req.query.employee_id, 10) : req.user.employee_id;
      const record = await attendanceService.getTodayAttendance(employeeId);

      if (!record) {
        return res.status(200).json(null);
      }

      return res.status(200).json(record);
    } catch (err) {
      next(err);
    }
  }

  async getAttendanceByDate(req, res, next) {
    try {
      const employeeId = req.params.employee_id || req.query.employee_id || req.user?.employee_id;
      const { date } = req.params;

      const record = await attendanceService.getAttendanceByDate(employeeId, date);

      return res.status(200).json({
        success: true,
        data: record
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Unable to fetch attendance details for date.'
      });
    }
  }

  async getAttendanceCalendar(req, res, next) {
    try {
      const employeeId = req.params.employee_id || req.query.employee_id || req.user?.employee_id;
      const month = req.query.month;
      const year = req.query.year;

      const calendarData = await attendanceService.getAttendanceCalendar(employeeId, month, year);

      return res.status(200).json(calendarData);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Unable to load attendance calendar data.'
      });
    }
  }

  async getMonthlyAttendance(req, res, next) {
    try {
      const employeeId = req.params.employee_id || req.query.employee_id || req.user?.employee_id;
      const monthStr = req.query.month || new Date().toISOString().slice(0, 7);

      const result = await attendanceService.getMonthlyAttendance(employeeId, monthStr);

      return res.status(200).json({
        success: true,
        message: `Attendance for ${monthStr}`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getAttendanceHistory(req, res, next) {
    try {
      const employeeId = req.query.employee_id ? parseInt(req.query.employee_id, 10) : req.user.employee_id;
      const history = await attendanceService.getAttendanceHistory(employeeId);
      return res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const todayStr = new Date().toISOString().slice(0, 10);

      const [empRes, todayAtt, totalStaffRes, presentRes, lateRes, pendingReqRes, faceRegRes] = await Promise.all([
        db.query(
          `SELECT e.*, o.office_name, o.latitude, o.longitude
           FROM employees e
           LEFT JOIN office_locations o ON e.office_id = o.office_id
           WHERE e.employee_id = $1`,
          [employeeId]
        ),
        attendanceService.getTodayAttendance(employeeId),
        db.query('SELECT COUNT(*) FROM employees WHERE status = \'Active\''),
        db.query('SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND attendance_status IN (\'Present\', \'Late\')', [todayStr]),
        db.query('SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND attendance_status = \'Late\'', [todayStr]),
        db.query('SELECT COUNT(*) FROM attendance_requests WHERE status = \'Pending\''),
        db.query('SELECT face_id FROM face_registrations WHERE employee_id = $1', [employeeId])
      ]);

      const emp = empRes.rows[0];
      const isFaceRegistered = faceRegRes.rows.length > 0;

      const operator = {
        id: String(emp.employee_id),
        operatorId: String(emp.employee_id),
        employeeId: emp.employee_code,
        name: emp.full_name,
        email: emp.email,
        department: emp.department,
        role: emp.designation,
        profilePhoto: emp.profile_photo || null,
        locationLabel: emp.office_name || 'Padalkar Colony',
        latitude: `${emp.latitude || 16.740572}° N`,
        longitude: `${emp.longitude || 74.246919}° E`
      };

      const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        const d = new Date(isoString);
        return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      };

      const attendanceToday = todayAtt
        ? {
            id: `att-${todayAtt.attendance_id}`,
            employeeId: emp.employee_code,
            date: todayAtt.attendance_date,
            dayLabel: todayAtt.attendance_day || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            punchIn: formatTime(todayAtt.punch_in),
            punchOut: formatTime(todayAtt.punch_out),
            status: todayAtt.attendance_status?.toUpperCase() === 'PRESENT' ? 'ON TIME' : (todayAtt.attendance_status?.toUpperCase() || 'ON TIME'),
            primaryLocation: todayAtt.location_name || 'Padalkar Colony',
            remarks: todayAtt.remarks || 'Database verified record',
            totalHours: todayAtt.working_hours || '00h 00m',
            overtime: '+00h 00m',
            geolocation: {
              latitude: `${todayAtt.latitude || 16.740572}° N`,
              longitude: `${todayAtt.longitude || 74.246919}° E`
            },
            faceVerified: isFaceRegistered,
            faceConfidence: isFaceRegistered ? 99.5 : 0
          }
        : {
            id: 'att-today',
            employeeId: emp.employee_code,
            date: todayStr,
            dayLabel: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            punchIn: '--:--',
            punchOut: '--:--',
            status: 'ON TIME',
            primaryLocation: 'Padalkar Colony',
            remarks: 'No punch recorded yet today.',
            totalHours: '00h 00m',
            overtime: '+00h 00m',
            geolocation: { latitude: '16.740572° N', longitude: '74.246919° E' }
          };

      // Calculate dynamic face recognition rate based on registered faces count vs total employees
      const allEmpsCount = parseInt(totalStaffRes.rows[0].count, 10) || 1;
      const allFacesRes = await db.query('SELECT COUNT(DISTINCT employee_id) FROM face_registrations');
      const allFacesCount = parseInt(allFacesRes.rows[0].count, 10) || 0;
      const dynamicFaceRate = Math.min(100, Math.max(0, parseFloat(((allFacesCount / allEmpsCount) * 100).toFixed(1))));

      const kpis = {
        totalEmployees: parseInt(totalStaffRes.rows[0].count, 10) || 0,
        todayPresent: parseInt(presentRes.rows[0].count, 10) || 0,
        lateCount: parseInt(lateRes.rows[0].count, 10) || 0,
        approvalsPending: parseInt(pendingReqRes.rows[0].count, 10) || 0,
        faceSuccessRate: dynamicFaceRate > 0 ? dynamicFaceRate : (isFaceRegistered ? 100.0 : 0.0)
      };

      return res.status(200).json({
        success: true,
        operator,
        attendanceToday,
        kpis
      });
    } catch (err) {
      next(err);
    }
  }

  async getDashboardCharts(req, res, next) {
    try {
      const today = new Date();
      const labels = [];
      const presentCounts = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(dayLabel);

        const countRes = await db.query(
          'SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND attendance_status IN (\'Present\', \'Late\')',
          [dateStr]
        );
        presentCounts.push(parseInt(countRes.rows[0].count, 10) || 0);
      }

      const leaveStatsRes = await db.query(`
        SELECT status, COUNT(*) AS count
        FROM attendance_requests
        GROUP BY status
      `);

      const leaveStats = { pending: 0, approved: 0, rejected: 0 };
      leaveStatsRes.rows.forEach(r => {
        const key = r.status.toLowerCase();
        if (leaveStats[key] !== undefined) {
          leaveStats[key] = parseInt(r.count, 10);
        }
      });

      const totalEmpsRes = await db.query('SELECT COUNT(*) FROM employees WHERE status = \'Active\'');
      const totalEmps = parseInt(totalEmpsRes.rows[0].count, 10) || 1;
      const registeredFacesRes = await db.query('SELECT COUNT(DISTINCT employee_id) FROM face_registrations');
      const registeredFaces = parseInt(registeredFacesRes.rows[0].count, 10) || 0;
      const faceRate = parseFloat(((registeredFaces / totalEmps) * 100).toFixed(1));

      return res.status(200).json({
        success: true,
        attendance_trend: {
          labels,
          present: presentCounts
        },
        leave_statistics: leaveStats,
        face_success_rate: faceRate
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AttendanceController();
