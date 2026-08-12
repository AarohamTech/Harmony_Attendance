const db = require('../config/database');
const faceService = require('./faceService');
const notificationService = require('./notificationService');

// Timezone helpers for Asia/Kolkata business rules
function getISTDateStr(dateObj = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(dateObj);
}

function getISTDayName(dateObj = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long'
  });
  return formatter.format(dateObj);
}

function getISTMinutes(dateObj = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(dateObj);
  let hrs = 0, mins = 0;
  for (const part of parts) {
    if (part.type === 'hour') hrs = parseInt(part.value, 10) % 24;
    if (part.type === 'minute') mins = parseInt(part.value, 10);
  }
  return hrs * 60 + mins;
}

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

    // 2. GPS Geofence Verification (Disabled for current version per requirement 13)
    const officeLat = Number(emp.office_lat || 16.740572);
    const officeLon = Number(emp.office_lon || 74.246919);
    const locationName = emp.office_name || 'Padalkar Colony';

    let empLat = officeLat;
    let empLon = officeLon;
    let distance = 0;

    if (latitude != null && !isNaN(Number(latitude)) && longitude != null && !isNaN(Number(longitude))) {
      empLat = Number(latitude);
      empLon = Number(longitude);
      distance = this.calculateDistance(empLat, empLon, officeLat, officeLon);
    }
    console.log('=== LOCATION ENFORCEMENT DISABLED (Requirement 13) ===');

    // 3. Face Verification
    const faceCheck = await faceService.verifyFace(employeeId, faceImage);
    if (!faceCheck.verified) {
      throw new Error(faceCheck.message || 'Face biometric verification failed. Please align your face.');
    }

    // 4. Check Date & Holiday (Asia/Kolkata timezone) - Weekly Off restriction removed! Every day is allowed.
    const now = new Date();
    const todayStr = getISTDateStr(now);
    const currentDayName = getISTDayName(now);

    const holidayRes = await db.query('SELECT * FROM holidays WHERE holiday_date = $1', [todayStr]);
    if (holidayRes.rows.length > 0) {
      throw new Error(`Today is a company holiday (${holidayRes.rows[0].holiday_name}). Punch in is not permitted.`);
    }

    // 5. Check Duplicate Punch In
    const existingRes = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeId, todayStr]
    );

    if (existingRes.rows.length > 0 && existingRes.rows[0].punch_in) {
      throw new Error('You have already punched in today.');
    }

    // 6. Time & Shift Evaluation (Shift: 09:00 - 18:00, Grace: 09:15 AM)
    const currentMinutes = getISTMinutes(now);
    const graceMinutes = 9 * 60 + 15; // 09:15 AM IST

    let attendanceStatus = 'Present';
    if (currentMinutes > graceMinutes) {
      attendanceStatus = 'Late';
      if (!lateReason && (!existingRes.rows[0] || !existingRes.rows[0].late_reason)) {
        throw new Error('Late attendance requires a reason when punching in after 09:15 AM.');
      }
    }

    // 7. Save or Update Record with REAL Employee GPS Coordinates
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
    const notifMsg = `Punch in recorded at ${now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} on ${todayStr}. Status: ${attendanceStatus}`;
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

    // 2. GPS Geofence Verification (Disabled for current version per requirement 13)
    const officeLat = Number(emp.office_lat || 16.740572);
    const officeLon = Number(emp.office_lon || 74.246919);
    const locationName = emp.office_name || 'Padalkar Colony';

    let empLat = officeLat;
    let empLon = officeLon;
    let distance = 0;

    if (latitude != null && !isNaN(Number(latitude)) && longitude != null && !isNaN(Number(longitude))) {
      empLat = Number(latitude);
      empLon = Number(longitude);
      distance = this.calculateDistance(empLat, empLon, officeLat, officeLon);
    }
    console.log('=== LOCATION ENFORCEMENT DISABLED (PUNCH OUT) ===');

    // 3. Face Verification
    const faceCheck = await faceService.verifyFace(employeeId, faceImage);
    if (!faceCheck.verified) {
      throw new Error(faceCheck.message || 'Face biometric verification failed.');
    }

    // 4. Check Punch In Record Exists (Asia/Kolkata timezone)
    const now = new Date();
    const todayStr = getISTDateStr(now);

    const attRes = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeId, todayStr]
    );

    if (attRes.rows.length === 0 || !attRes.rows[0].punch_in) {
      throw new Error('You must punch in before punching out.');
    }

    const att = attRes.rows[0];
    if (att.punch_out) {
      throw new Error('You have already punched out today.');
    }

    // 5. Early Exit Check (Shift End: 18:00 / 06:00 PM IST)
    const currentMinutes = getISTMinutes(now);
    const shiftEndMinutes = 18 * 60; // 06:00 PM IST

    if (currentMinutes < shiftEndMinutes && !earlyExitReason && !att.early_exit_reason) {
      throw new Error('Early exit requires a reason when punching out before 06:00 PM.');
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
      `Punched out at ${now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}. Total working hours: ${workingHoursStr}`,
      'ATTENDANCE'
    );

    return updatedRecord;
  }

  async getTodayAttendance(employeeId) {
    const todayStr = getISTDateStr(new Date());
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

  async getAttendanceByDate(employeeIdInput, dateStr) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const parts = dateStr.split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayName = dayNames[dateObj.getDay()];

    let empRes;
    if (typeof employeeIdInput === 'number' || (!isNaN(Number(employeeIdInput)) && String(employeeIdInput).trim() !== '')) {
      empRes = await db.query(
        `SELECT e.*, o.office_name FROM employees e LEFT JOIN office_locations o ON e.office_id = o.office_id WHERE e.employee_id = $1`,
        [Number(employeeIdInput)]
      );
    } else {
      empRes = await db.query(
        `SELECT e.*, o.office_name FROM employees e LEFT JOIN office_locations o ON e.office_id = o.office_id WHERE e.employee_code = $1 OR e.employee_id::text = $1`,
        [String(employeeIdInput)]
      );
    }

    if (empRes.rows.length === 0) {
      throw new Error('Employee information not found.');
    }
    const emp = empRes.rows[0];

    const attRes = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [emp.employee_id, dateStr]
    );

    const formatTime = (isoString) => {
      if (!isoString) return null;
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const computeHours = (pIn, pOut) => {
      if (!pIn) return '00h 00m';
      if (!pOut) return 'In Progress';
      const diffMs = Math.max(0, new Date(pOut) - new Date(pIn));
      const mins = Math.floor(diffMs / 60000);
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${String(remMins).padStart(2, '0')}m`;
    };

    const faceRegCheck = await db.query('SELECT face_id FROM face_registrations WHERE employee_id = $1', [emp.employee_id]);
    const isFaceReg = faceRegCheck.rows.length > 0;

    if (attRes.rows.length > 0) {
      const row = attRes.rows[0];
      const pIn = formatTime(row.punch_in);
      const pOut = formatTime(row.punch_out);
      const hrs = pIn && !pOut ? 'In Progress' : (row.working_hours || computeHours(row.punch_in, row.punch_out));
      const status = row.attendance_status || 'Present';

      return {
        date: dateStr,
        day: dayName,
        employee_id: emp.employee_code,
        employee_name: emp.full_name,
        status: status === 'ON TIME' ? 'Present' : status,
        punch_in: pIn || 'Not Punched In',
        punch_out: pOut || 'Not Punched Out',
        working_hours: hrs,
        location: row.location_name || emp.office_name || 'Padalkar Colony',
        face_verified: isFaceReg,
        face_confidence: isFaceReg ? 99.5 : 0,
        remarks: row.remarks || 'DB verified record',
        late_reason: row.late_reason || null,
        early_exit_reason: row.early_exit_reason || null,
      };
    }

    const leaveRes = await db.query(
      `SELECT * FROM attendance_requests WHERE employee_id = $1 AND request_date = $2 AND status = 'Approved'`,
      [emp.employee_id, dateStr]
    );
    if (leaveRes.rows.length > 0) {
      const lRow = leaveRes.rows[0];
      return {
        date: dateStr,
        day: dayName,
        employee_id: emp.employee_code,
        employee_name: emp.full_name,
        status: 'Leave',
        punch_in: 'Not Punched In',
        punch_out: 'Not Punched Out',
        working_hours: '00h 00m',
        location: emp.office_name || 'Padalkar Colony',
        face_verified: false,
        remarks: `Approved Leave: ${lRow.reason || lRow.request_type}`,
      };
    }

    const holRes = await db.query('SELECT * FROM holidays WHERE holiday_date = $1', [dateStr]);
    if (holRes.rows.length > 0) {
      return {
        date: dateStr,
        day: dayName,
        employee_id: emp.employee_code,
        employee_name: emp.full_name,
        status: 'Holiday',
        punch_in: 'Not Punched In',
        punch_out: 'Not Punched Out',
        working_hours: '00h 00m',
        location: emp.office_name || 'Padalkar Colony',
        face_verified: false,
        remarks: `Company Holiday: ${holRes.rows[0].holiday_name}`,
      };
    }

    const todayStr = getISTDateStr(new Date());
    return {
      date: dateStr,
      day: dayName,
      employee_id: emp.employee_code,
      employee_name: emp.full_name,
      status: dateStr <= todayStr ? 'Absent' : 'No Record',
      punch_in: 'Not Punched In',
      punch_out: 'Not Punched Out',
      working_hours: '00h 00m',
      location: emp.office_name || 'Padalkar Colony',
      face_verified: false,
      remarks: dateStr <= todayStr ? 'No attendance record for this date.' : 'Future date',
    };
  }

  async getAttendanceCalendar(employeeIdInput, monthInput, yearInput) {
    const now = new Date();
    let year = parseInt(yearInput, 10);
    let month = parseInt(monthInput, 10);

    if (monthInput && typeof monthInput === 'string' && monthInput.includes('-')) {
      const parts = monthInput.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    }

    if (isNaN(year)) year = now.getFullYear();
    if (isNaN(month) || month < 1 || month > 12) month = now.getMonth() + 1;

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const startDate = `${monthStr}-01`;
    const todayStr = getISTDateStr(now);

    let empRes;
    if (typeof employeeIdInput === 'number' || (!isNaN(Number(employeeIdInput)) && String(employeeIdInput).trim() !== '')) {
      empRes = await db.query(
        `SELECT e.*, o.office_name FROM employees e LEFT JOIN office_locations o ON e.office_id = o.office_id WHERE e.employee_id = $1`,
        [Number(employeeIdInput)]
      );
    } else {
      empRes = await db.query(
        `SELECT e.*, o.office_name FROM employees e LEFT JOIN office_locations o ON e.office_id = o.office_id WHERE e.employee_code = $1 OR e.employee_id::text = $1`,
        [String(employeeIdInput)]
      );
    }

    if (empRes.rows.length === 0) {
      throw new Error('Employee information not found.');
    }
    const emp = empRes.rows[0];
    const realEmpId = emp.employee_id;

    const [attRes, reqRes, holRes, faceRegRes] = await Promise.all([
      db.query(
        `SELECT * FROM attendance
         WHERE employee_id = $1
           AND attendance_date >= $2::date
           AND attendance_date < ($2::date + INTERVAL '1 month')
         ORDER BY attendance_date ASC`,
        [realEmpId, startDate]
      ),
      db.query(
        `SELECT * FROM attendance_requests
         WHERE employee_id = $1
           AND status = 'Approved'
           AND request_date >= $2::date
           AND request_date < ($2::date + INTERVAL '1 month')`,
        [realEmpId, startDate]
      ),
      db.query('SELECT holiday_date, holiday_name FROM holidays'),
      db.query('SELECT face_id FROM face_registrations WHERE employee_id = $1', [realEmpId])
    ]);

    const isFaceRegistered = faceRegRes.rows.length > 0;

    const attMap = new Map();
    attRes.rows.forEach(r => {
      const dStr = getISTDateStr(new Date(r.attendance_date));
      attMap.set(dStr, r);
    });

    const leaveMap = new Map();
    reqRes.rows.forEach(r => {
      const dStr = getISTDateStr(new Date(r.request_date));
      leaveMap.set(dStr, r);
    });

    const holMap = new Map();
    holRes.rows.forEach(h => {
      const dStr = getISTDateStr(new Date(h.holiday_date));
      holMap.set(dStr, h.holiday_name);
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const attendance = [];

    const formatTime = (isoString) => {
      if (!isoString) return null;
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const computeHours = (pIn, pOut) => {
      if (!pIn) return '00h 00m';
      if (!pOut) return 'In Progress';
      const diffMs = Math.max(0, new Date(pOut) - new Date(pIn));
      const mins = Math.floor(diffMs / 60000);
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${String(remMins).padStart(2, '0')}m`;
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const dayPad = String(day).padStart(2, '0');
      const dateStr = `${monthStr}-${dayPad}`;
      const parts = dateStr.split('-').map(Number);
      const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayName = dayNames[dObj.getDay()];

      if (attMap.has(dateStr)) {
        const row = attMap.get(dateStr);
        const pIn = formatTime(row.punch_in);
        const pOut = formatTime(row.punch_out);
        const hrs = pIn && !pOut ? 'In Progress' : (row.working_hours || computeHours(row.punch_in, row.punch_out));
        const status = row.attendance_status || 'Present';

        attendance.push({
          date: dateStr,
          day: dayName,
          status: status === 'ON TIME' ? 'Present' : status,
          punch_in: pIn || 'Not Punched In',
          punch_out: pOut || 'Not Punched Out',
          working_hours: hrs,
          location: row.location_name || emp.office_name || 'Padalkar Colony',
          face_verified: isFaceRegistered,
          face_confidence: isFaceRegistered ? 99.5 : 0,
          remarks: row.remarks || 'DB verified attendance record',
          late_reason: row.late_reason || null,
          early_exit_reason: row.early_exit_reason || null,
        });
      } else if (leaveMap.has(dateStr)) {
        const lRow = leaveMap.get(dateStr);
        attendance.push({
          date: dateStr,
          day: dayName,
          status: 'Leave',
          punch_in: 'Not Punched In',
          punch_out: 'Not Punched Out',
          working_hours: '00h 00m',
          location: emp.office_name || 'Padalkar Colony',
          face_verified: false,
          remarks: `Approved Leave: ${lRow.reason || lRow.request_type}`,
        });
      } else if (holMap.has(dateStr)) {
        attendance.push({
          date: dateStr,
          day: dayName,
          status: 'Holiday',
          punch_in: 'Not Punched In',
          punch_out: 'Not Punched Out',
          working_hours: '00h 00m',
          location: emp.office_name || 'Padalkar Colony',
          face_verified: false,
          remarks: `Company Holiday: ${holMap.get(dateStr)}`,
        });
      } else {
        const statusVal = dateStr <= todayStr ? 'Absent' : 'No Record';
        attendance.push({
          date: dateStr,
          day: dayName,
          status: statusVal,
          punch_in: 'Not Punched In',
          punch_out: 'Not Punched Out',
          working_hours: '00h 00m',
          location: emp.office_name || 'Padalkar Colony',
          face_verified: false,
          remarks: dateStr <= todayStr ? 'No attendance record for this date.' : 'Future date',
        });
      }
    }

    return {
      employee_id: emp.employee_code,
      employee_name: emp.full_name,
      month: month,
      year: year,
      attendance: attendance
    };
  }

  async getMonthlyAttendance(employeeId, monthStr) {
    const year = parseInt(monthStr.slice(0, 4), 10);
    const month = parseInt(monthStr.slice(5, 7), 10);
    const cal = await this.getAttendanceCalendar(employeeId, month, year);
    return { records: cal.attendance, summary: { totalRecords: cal.attendance.length } };
  }
}

module.exports = new AttendanceService();

