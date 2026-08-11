const db = require('../config/database');
const faceService = require('./faceService');
const notificationService = require('./notificationService');

class AttendanceService {
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return 0;
    }
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // Distance in meters
  }

  formatDuration(startIso, endIso) {
    if (!startIso || !endIso) return '00h 00m';
    const start = new Date(startIso);
    const end = new Date(endIso);
    const diffMs = Math.max(0, end - start);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  }

  async processPunchIn(employeeId, latitude, longitude, faceImage, lateReason) {
    // 1. Verify Employee
    const empRes = await db.query(
      `SELECT e.*, o.latitude AS office_lat, o.longitude AS office_lon, o.allowed_radius, o.office_name
       FROM employees e
       LEFT JOIN office_locations o ON e.office_id = o.office_id
       WHERE e.employee_id = $1`,
      [employeeId]
    );

    if (empRes.rows.length === 0) {
      throw new Error('Employee account not found in database.');
    }
    const emp = empRes.rows[0];

    // 2. Face Verification
    const faceCheck = await faceService.verifyFace(employeeId, faceImage);
    if (!faceCheck.verified) {
      throw new Error(faceCheck.message || 'Face biometric verification failed. Please align your face.');
    }

    // 3. GPS Geofence Verification
    const officeLat = emp.office_lat || 12.9716;
    const officeLon = emp.office_lon || 77.5946;
    const allowedRadius = emp.allowed_radius || 100;
    const locationName = emp.office_name || 'Head Office, Silicon Tower';

    const empLat = latitude != null ? Number(latitude) : officeLat;
    const empLon = longitude != null ? Number(longitude) : officeLon;

    const distance = this.calculateDistance(empLat, empLon, officeLat, officeLon);

    if (distance > allowedRadius) {
      throw new Error(`Outside allowed office radius. Current distance: ${distance}m (Allowed: ${allowedRadius}m)`);
    }

    // 4. Check Date, Weekly Off, Holiday
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[now.getDay()];

    const holidayRes = await db.query('SELECT * FROM holidays WHERE holiday_date = $1', [todayStr]);
    const isHoliday = holidayRes.rows.length > 0;
    const isWeeklyOff = emp.weekly_off && currentDayName.toLowerCase() === emp.weekly_off.toLowerCase();

    // 5. Check Duplicate Punch In
    const existingRes = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeId, todayStr]
    );

    if (existingRes.rows.length > 0 && existingRes.rows[0].punch_in) {
      throw new Error('Duplicate punch in: You have already punched in for today.');
    }

    // 6. Time & Shift Evaluation (Shift: 09:00 - 18:00, Grace: 09:15)
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const graceMinutes = 9 * 60 + 15; // 09:15 AM

    let attendanceStatus = 'Present';
    if (isWeeklyOff) {
      attendanceStatus = 'Weekly Off';
    } else if (isHoliday) {
      attendanceStatus = 'Holiday';
    } else if (currentMinutes > graceMinutes) {
      attendanceStatus = 'Late';
      if (!lateReason && !existingRes.rows[0]?.late_reason) {
        // We will mark as Late and prompt for reason if needed
      }
    }

    // 7. Save or Update Record
    let record;
    if (existingRes.rows.length > 0) {
      const updateRes = await db.query(
        `UPDATE attendance
         SET punch_in = NOW(),
             latitude = $1,
             longitude = $2,
             location_name = $3,
             distance_from_office = $4,
             attendance_status = $5,
             late_reason = COALESCE($6, late_reason),
             remarks = 'DB verified punch in'
         WHERE attendance_id = $7
         RETURNING *`,
        [empLat, empLon, locationName, distance, attendanceStatus, lateReason || null, existingRes.rows[0].attendance_id]
      );
      record = updateRes.rows[0];
    } else {
      const insertRes = await db.query(
        `INSERT INTO attendance
         (employee_id, attendance_date, attendance_day, punch_in, latitude, longitude, location_name, distance_from_office, attendance_status, late_reason, remarks)
         VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, 'DB verified punch in')
         RETURNING *`,
        [employeeId, todayStr, currentDayName, empLat, empLon, locationName, distance, attendanceStatus, lateReason || null]
      );
      record = insertRes.rows[0];
    }

    // Create Notification
    const notifTitle = attendanceStatus === 'Late' ? 'Late Attendance Recorded' : 'Attendance Marked Successfully';
    const notifMsg = `Punch in recorded at ${now.toLocaleTimeString()} on ${todayStr}. Status: ${attendanceStatus}`;
    await notificationService.createNotification(employeeId, notifTitle, notifMsg, 'ATTENDANCE');

    return record;
  }

  async processPunchOut(employeeId, latitude, longitude, faceImage, earlyExitReason) {
    // 1. Verify Employee
    const empRes = await db.query(
      `SELECT e.*, o.latitude AS office_lat, o.longitude AS office_lon, o.allowed_radius, o.office_name
       FROM employees e
       LEFT JOIN office_locations o ON e.office_id = o.office_id
       WHERE e.employee_id = $1`,
      [employeeId]
    );

    if (empRes.rows.length === 0) {
      throw new Error('Employee account not found in database.');
    }
    const emp = empRes.rows[0];

    // 2. Face Verification
    const faceCheck = await faceService.verifyFace(employeeId, faceImage);
    if (!faceCheck.verified) {
      throw new Error(faceCheck.message || 'Face biometric verification failed.');
    }

    // 3. GPS Verification
    const officeLat = emp.office_lat || 12.9716;
    const officeLon = emp.office_lon || 77.5946;
    const allowedRadius = emp.allowed_radius || 100;

    const empLat = latitude != null ? Number(latitude) : officeLat;
    const empLon = longitude != null ? Number(longitude) : officeLon;

    const distance = this.calculateDistance(empLat, empLon, officeLat, officeLon);
    if (distance > allowedRadius) {
      throw new Error(`Outside allowed office radius. Current distance: ${distance}m (Allowed: ${allowedRadius}m)`);
    }

    // 4. Check Punch In Record Exists
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const attRes = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeId, todayStr]
    );

    if (attRes.rows.length === 0 || !attRes.rows[0].punch_in) {
      throw new Error('Missing punch in: You must punch in before punching out.');
    }

    const att = attRes.rows[0];
    if (att.punch_out) {
      throw new Error('Duplicate punch out: You have already punched out for today.');
    }

    // 5. Early Exit Check (Shift End: 18:00 / 06:00 PM)
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const shiftEndMinutes = 18 * 60; // 06:00 PM

    if (currentMinutes < shiftEndMinutes && !earlyExitReason && !att.early_exit_reason) {
      // Require early exit reason if punching out before 6 PM
    }

    // 6. Calculate Working Hours
    const workingHoursStr = this.formatDuration(att.punch_in, now.toISOString());

    // 7. Update Attendance
    const updateRes = await db.query(
      `UPDATE attendance
       SET punch_out = NOW(),
           working_hours = $1,
           early_exit_reason = COALESCE($2, early_exit_reason),
           remarks = 'DB verified punch out completed'
       WHERE attendance_id = $3
       RETURNING *`,
      [workingHoursStr, earlyExitReason || null, att.attendance_id]
    );

    const updatedRecord = updateRes.rows[0];

    // Notification
    await notificationService.createNotification(
      employeeId,
      'Punch Out Recorded Successfully',
      `Punched out at ${now.toLocaleTimeString()}. Total working hours: ${workingHoursStr}`,
      'ATTENDANCE'
    );

    return updatedRecord;
  }

  async getTodayAttendance(employeeId) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const result = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeId, todayStr]
    );
    return result.rows[0] || null;
  }

  async getAttendanceHistory(employeeId) {
    const result = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 ORDER BY attendance_date DESC LIMIT 30',
      [employeeId]
    );
    return result.rows;
  }

  async getAttendanceByDate(employeeId, dateStr) {
    const result = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeId, dateStr]
    );
    return result.rows[0] || null;
  }

  async getMonthlyAttendance(employeeId, monthStr) {
    // monthStr format 'YYYY-MM'
    const startDate = `${monthStr}-01`;
    const result = await db.query(
      `SELECT * FROM attendance
       WHERE employee_id = $1
         AND attendance_date >= $2::date
         AND attendance_date < ($2::date + INTERVAL '1 month')
       ORDER BY attendance_date ASC`,
      [employeeId, startDate]
    );

    const records = result.rows;
    const summary = {
      present: records.filter(r => r.attendance_status === 'Present').length,
      late: records.filter(r => r.attendance_status === 'Late').length,
      absent: records.filter(r => r.attendance_status === 'Absent').length,
      weeklyOff: records.filter(r => r.attendance_status === 'Weekly Off').length,
      holiday: records.filter(r => r.attendance_status === 'Holiday').length,
      totalRecords: records.length,
    };

    return { records, summary };
  }
}

module.exports = new AttendanceService();
