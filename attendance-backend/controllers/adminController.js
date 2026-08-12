const db = require('../config/database');
const bcrypt = require('bcrypt');

class AdminController {
  // 1. Dashboard Overview Stats
  async getDashboardStats(req, res, next) {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);

      const [totalEmpRes, presentRes, lateRes, leaveRes, pendingReqRes, activePunchesRes] = await Promise.all([
        db.query("SELECT COUNT(*) FROM employees WHERE status = 'Active'"),
        db.query("SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND attendance_status IN ('Present', 'Late')", [todayStr]),
        db.query("SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND attendance_status = 'Late'", [todayStr]),
        db.query("SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND attendance_status = 'On Leave'", [todayStr]),
        db.query("SELECT COUNT(*) FROM attendance_requests WHERE status = 'Pending'", []),
        db.query("SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND punch_in IS NOT NULL AND punch_out IS NULL", [todayStr])
      ]);

      const totalEmployees = parseInt(totalEmpRes.rows[0].count, 10) || 0;
      const presentToday = parseInt(presentRes.rows[0].count, 10) || 0;
      const lateToday = parseInt(lateRes.rows[0].count, 10) || 0;
      const onLeaveToday = parseInt(leaveRes.rows[0].count, 10) || 0;
      const absentToday = Math.max(0, totalEmployees - (presentToday + onLeaveToday));
      const pendingLeaveRequests = parseInt(pendingReqRes.rows[0].count, 10) || 0;
      const currentlyPunchedIn = parseInt(activePunchesRes.rows[0].count, 10) || 0;

      return res.status(200).json({
        success: true,
        stats: {
          totalEmployees,
          presentToday,
          absentToday,
          lateToday,
          onLeaveToday,
          pendingLeaveRequests,
          currentlyPunchedIn
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. Dashboard Analytics Charts
  async getDashboardCharts(req, res, next) {
    try {
      const today = new Date();
      const labels = [];
      const present = [];
      const absent = [];
      const late = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(dayLabel);

        const [pRes, lRes, totRes] = await Promise.all([
          db.query("SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND attendance_status IN ('Present', 'Late')", [dateStr]),
          db.query("SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND attendance_status = 'Late'", [dateStr]),
          db.query("SELECT COUNT(*) FROM employees WHERE status = 'Active'")
        ]);

        const pCount = parseInt(pRes.rows[0].count, 10) || 0;
        const lCount = parseInt(lRes.rows[0].count, 10) || 0;
        const total = parseInt(totRes.rows[0].count, 10) || 1;

        present.push(pCount);
        late.push(lCount);
        absent.push(Math.max(0, total - pCount));
      }

      const leaveStatsRes = await db.query(`
        SELECT status, COUNT(*) AS count
        FROM attendance_requests
        GROUP BY status
      `);

      const leaveStatistics = {
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0
      };

      leaveStatsRes.rows.forEach(row => {
        const key = row.status ? row.status.toLowerCase() : 'pending';
        if (leaveStatistics[key] !== undefined) {
          leaveStatistics[key] = parseInt(row.count, 10);
        }
      });

      return res.status(200).json({
        success: true,
        attendance_trend: {
          labels,
          present,
          absent,
          late
        },
        leave_statistics: leaveStatistics
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. Employee Management Endpoints
  async getEmployees(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '100', 10);
      const offset = (page - 1) * limit;
      const search = req.query.search ? `%${req.query.search.trim()}%` : null;
      const department = req.query.department;
      const status = req.query.status;

      let whereConditions = [];
      let queryParams = [];

      if (search) {
        queryParams.push(search);
        whereConditions.push(`(e.full_name ILIKE $${queryParams.length} OR e.employee_code ILIKE $${queryParams.length} OR e.email ILIKE $${queryParams.length})`);
      }
      if (department) {
        queryParams.push(department);
        whereConditions.push(`e.department = $${queryParams.length}`);
      }
      if (status) {
        queryParams.push(status);
        whereConditions.push(`e.status = $${queryParams.length}`);
      }

      const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const countSql = `SELECT COUNT(*) FROM employees e ${whereSql}`;
      const countRes = await db.query(countSql, queryParams);
      const total = parseInt(countRes.rows[0].count, 10);

      queryParams.push(limit, offset);
      const selectSql = `
        SELECT e.employee_id, e.employee_code, e.full_name, e.email, e.phone, e.department, e.designation, e.role, e.profile_photo, e.status, e.created_at, e.shift_start, e.shift_end, e.weekly_off, o.office_name
        FROM employees e
        LEFT JOIN office_locations o ON e.office_id = o.office_id
        ${whereSql}
        ORDER BY e.employee_id DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `;

      const result = await db.query(selectSql, queryParams);

      return res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const { id } = req.params;
      const empRes = await db.query(`
        SELECT e.employee_id, e.employee_code, e.full_name, e.email, e.phone, e.department, e.designation, e.role, e.profile_photo, e.office_id, e.shift_start, e.shift_end, e.grace_time, e.weekly_off, e.status, e.created_at, o.office_name, o.address AS office_address
        FROM employees e
        LEFT JOIN office_locations o ON e.office_id = o.office_id
        WHERE e.employee_id = $1
      `, [id]);

      if (empRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const emp = empRes.rows[0];

      // Fetch attendance history, punch history, leave history
      const [attRes, reqRes] = await Promise.all([
        db.query(`
          SELECT * FROM attendance
          WHERE employee_id = $1
          ORDER BY attendance_date DESC LIMIT 30
        `, [id]),
        db.query(`
          SELECT * FROM attendance_requests
          WHERE employee_id = $1
          ORDER BY created_at DESC LIMIT 30
        `, [id])
      ]);

      return res.status(200).json({
        success: true,
        employee: emp,
        attendance_history: attRes.rows,
        leave_history: reqRes.rows
      });
    } catch (err) {
      next(err);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const {
        employee_code,
        full_name,
        email,
        phone,
        department,
        designation,
        role,
        password,
        office_id,
        shift_start,
        shift_end,
        weekly_off,
        status
      } = req.body;

      if (!employee_code || !full_name || !email) {
        return res.status(400).json({ success: false, message: 'Employee Code, Full Name and Email are required.' });
      }

      // Check duplicates
      const dupCheck = await db.query(
        'SELECT employee_id FROM employees WHERE employee_code = $1 OR email = $2',
        [employee_code.trim(), email.trim()]
      );

      if (dupCheck.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Employee Code or Email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password || '123456', 10);
      const targetRole = role || 'Employee';

      const insertRes = await db.query(`
        INSERT INTO employees
        (employee_code, full_name, email, phone, password, department, designation, role, office_id, shift_start, shift_end, grace_time, weekly_off, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, '09:15:00', $12, $13)
        RETURNING employee_id, employee_code, full_name, email, phone, department, designation, role, status, created_at
      `, [
        employee_code.trim(),
        full_name.trim(),
        email.trim(),
        phone || null,
        hashedPassword,
        department || 'Engineering',
        designation || 'Employee',
        targetRole,
        office_id || null,
        shift_start || '09:00:00',
        shift_end || '18:00:00',
        weekly_off || 'Sunday',
        status || 'Active'
      ]);

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: insertRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const {
        full_name,
        email,
        phone,
        department,
        designation,
        role,
        office_id,
        shift_start,
        shift_end,
        weekly_off,
        status,
        password
      } = req.body;

      if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        await db.query('UPDATE employees SET password = $1 WHERE employee_id = $2', [hashedPassword, id]);
      }

      const params = [
        full_name || null,
        email || null,
        phone || null,
        department || null,
        designation || null,
        role || null,
        office_id || null,
        shift_start || null,
        shift_end || null,
        weekly_off || null,
        status || null,
        id
      ];

      const updateRes = await db.query(`
        UPDATE employees
        SET full_name = COALESCE($1, full_name),
            email = COALESCE($2, email),
            phone = COALESCE($3, phone),
            department = COALESCE($4, department),
            designation = COALESCE($5, designation),
            role = COALESCE($6, role),
            office_id = COALESCE($7, office_id),
            shift_start = COALESCE($8, shift_start),
            shift_end = COALESCE($9, shift_end),
            weekly_off = COALESCE($10, weekly_off),
            status = COALESCE($11, status)
        WHERE employee_id = $12
        RETURNING employee_id, employee_code, full_name, email, phone, department, designation, role, status, created_at
      `, params);

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: updateRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleEmployeeStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updateRes = await db.query(
        'UPDATE employees SET status = $1 WHERE employee_id = $2 RETURNING employee_id, status',
        [status, id]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      return res.status(200).json({
        success: true,
        message: `Employee status changed to ${status}`,
        data: updateRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM employees WHERE employee_id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // 4. Attendance Records Endpoint
  async getAttendanceRecords(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '50', 10);
      const offset = (page - 1) * limit;

      const { date, start_date, end_date, employee_id, department, status, search } = req.query;

      let whereConditions = [];
      let queryParams = [];

      if (date) {
        queryParams.push(date);
        whereConditions.push(`a.attendance_date = $${queryParams.length}`);
      } else if (start_date && end_date) {
        queryParams.push(start_date, end_date);
        whereConditions.push(`a.attendance_date BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);
      }

      if (employee_id) {
        queryParams.push(employee_id);
        whereConditions.push(`a.employee_id = $${queryParams.length}`);
      }

      if (department) {
        queryParams.push(department);
        whereConditions.push(`e.department = $${queryParams.length}`);
      }

      if (status) {
        queryParams.push(status);
        whereConditions.push(`a.attendance_status ILIKE $${queryParams.length}`);
      }

      if (search) {
        queryParams.push(`%${search.trim()}%`);
        whereConditions.push(`(e.full_name ILIKE $${queryParams.length} OR e.employee_code ILIKE $${queryParams.length})`);
      }

      const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const countSql = `
        SELECT COUNT(*)
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        ${whereSql}
      `;
      const countRes = await db.query(countSql, queryParams);
      const total = parseInt(countRes.rows[0].count, 10);

      queryParams.push(limit, offset);
      const selectSql = `
        SELECT a.*, e.employee_code, e.full_name, e.department, e.designation, e.role
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        ${whereSql}
        ORDER BY a.attendance_date DESC, a.attendance_id DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `;

      const result = await db.query(selectSql, queryParams);

      return res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // 5. Punch Records Endpoint
  async getPunchRecords(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '50', 10);
      const offset = (page - 1) * limit;
      const { search, date } = req.query;

      let whereConditions = ["(a.punch_in IS NOT NULL OR a.punch_out IS NOT NULL)"];
      let queryParams = [];

      if (date) {
        queryParams.push(date);
        whereConditions.push(`a.attendance_date = $${queryParams.length}`);
      }

      if (search) {
        queryParams.push(`%${search.trim()}%`);
        whereConditions.push(`(e.full_name ILIKE $${queryParams.length} OR e.employee_code ILIKE $${queryParams.length})`);
      }

      const whereSql = `WHERE ${whereConditions.join(' AND ')}`;

      const countSql = `
        SELECT COUNT(*)
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        ${whereSql}
      `;
      const countRes = await db.query(countSql, queryParams);
      const total = parseInt(countRes.rows[0].count, 10);

      queryParams.push(limit, offset);
      const selectSql = `
        SELECT a.attendance_id, a.employee_id, a.attendance_date, a.punch_in, a.punch_out, a.latitude, a.longitude, a.location_name, a.attendance_status, e.employee_code, e.full_name, e.department, e.role
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        ${whereSql}
        ORDER BY a.attendance_date DESC, a.attendance_id DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `;

      const result = await db.query(selectSql, queryParams);

      return res.status(200).json({
        success: true,
        data: result.rows,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      next(err);
    }
  }

  // 6. Leave Requests & Missed Punch Requests Endpoint
  async getLeaveRequests(req, res, next) {
    try {
      const { status, type } = req.query;
      let querySql = `
        SELECT r.*, e.full_name AS employee_name, e.employee_code, e.department, e.designation, e.role
        FROM attendance_requests r
        JOIN employees e ON r.employee_id = e.employee_id
      `;
      let conditions = [];
      let params = [];

      if (type) {
        params.push(type);
        conditions.push(`r.request_type ILIKE $${params.length}`);
      }

      if (status) {
        params.push(status);
        conditions.push(`r.status ILIKE $${params.length}`);
      }

      if (conditions.length > 0) {
        querySql += ` WHERE ${conditions.join(' AND ')}`;
      }

      querySql += ` ORDER BY r.created_at DESC`;

      const result = await db.query(querySql, params);

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }

  async processRequestAction(req, res, next) {
    try {
      const { id } = req.params;
      const { action, manager_remark, remarks } = req.body;
      const finalAction = (action || 'Approved').trim();
      const finalRemark = (remarks || manager_remark || '').trim();

      const updateRes = await db.query(`
        UPDATE attendance_requests
        SET status = $1, manager_remark = $2
        WHERE request_id = $3
        RETURNING *
      `, [finalAction, finalRemark, id]);

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      const reqRecord = updateRes.rows[0];

      // If approved, update attendance record
      if (finalAction === 'Approved') {
        const dateStr = reqRecord.request_date.toISOString ? reqRecord.request_date.toISOString().slice(0, 10) : String(reqRecord.request_date).slice(0, 10);
        await db.query(`
          INSERT INTO attendance (employee_id, attendance_date, attendance_day, attendance_status, remarks)
          VALUES ($1, $2, 'Approved Day', 'Present', $3)
          ON CONFLICT (employee_id, attendance_date)
          DO UPDATE SET attendance_status = 'Present', remarks = EXCLUDED.remarks
        `, [reqRecord.employee_id, dateStr, `Approved request: ${reqRecord.request_type}`]);
      }

      // Create notification
      await db.query(`
        INSERT INTO notifications (employee_id, title, message, notification_type)
        VALUES ($1, $2, $3, 'SYSTEM')
      `, [
        reqRecord.employee_id,
        `Request ${finalAction}`,
        `Your request (${reqRecord.request_type}) for ${reqRecord.request_date} was ${finalAction.toLowerCase()}.${finalRemark ? ' Note: ' + finalRemark : ''}`
      ]);

      return res.status(200).json({
        success: true,
        message: `Request ${finalAction.toLowerCase()} successfully`,
        data: reqRecord
      });
    } catch (err) {
      next(err);
    }
  }

  // 7. Departments Endpoints
  async getDepartments(req, res, next) {
    try {
      const result = await db.query(`
        SELECT d.*, COUNT(e.employee_id) AS employee_count, m.full_name AS manager_name
        FROM departments d
        LEFT JOIN employees e ON d.department_name = e.department
        LEFT JOIN employees m ON d.manager_id = m.employee_id
        GROUP BY d.department_id, m.full_name
        ORDER BY d.department_name ASC
      `);

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }

  async createDepartment(req, res, next) {
    try {
      const { department_name, description, manager_id } = req.body;
      if (!department_name) {
        return res.status(400).json({ success: false, message: 'Department name is required.' });
      }

      const insertRes = await db.query(`
        INSERT INTO departments (department_name, description, manager_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [department_name.trim(), description || null, manager_id || null]);

      return res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: insertRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  async updateDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const { department_name, description, manager_id } = req.body;

      const updateRes = await db.query(`
        UPDATE departments
        SET department_name = COALESCE($1, department_name),
            description = COALESCE($2, description),
            manager_id = COALESCE($3, manager_id)
        WHERE department_id = $4
        RETURNING *
      `, [department_name || null, description || null, manager_id || null, id]);

      return res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: updateRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteDepartment(req, res, next) {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM departments WHERE department_id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // 8. Office Locations Endpoints
  async getOffices(req, res, next) {
    try {
      const result = await db.query('SELECT * FROM office_locations ORDER BY office_id ASC');
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }

  async createOffice(req, res, next) {
    try {
      const { office_name, address, latitude, longitude, allowed_radius } = req.body;
      if (!office_name || !latitude || !longitude) {
        return res.status(400).json({ success: false, message: 'Office name, latitude, and longitude are required.' });
      }

      const result = await db.query(`
        INSERT INTO office_locations (office_name, address, latitude, longitude, allowed_radius)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [office_name.trim(), address || '', parseFloat(latitude), parseFloat(longitude), parseInt(allowed_radius || '200', 10)]);

      return res.status(201).json({
        success: true,
        message: 'Office location added successfully',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  async updateOffice(req, res, next) {
    try {
      const { id } = req.params;
      const { office_name, address, latitude, longitude, allowed_radius } = req.body;

      const result = await db.query(`
        UPDATE office_locations
        SET office_name = COALESCE($1, office_name),
            address = COALESCE($2, address),
            latitude = COALESCE($3, latitude),
            longitude = COALESCE($4, longitude),
            allowed_radius = COALESCE($5, allowed_radius)
        WHERE office_id = $6
        RETURNING *
      `, [office_name || null, address || null, latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null, allowed_radius ? parseInt(allowed_radius, 10) : null, id]);

      return res.status(200).json({
        success: true,
        message: 'Office location updated successfully',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteOffice(req, res, next) {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM office_locations WHERE office_id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Office location deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // 9. Admin Users Management
  async getAdminUsers(req, res, next) {
    try {
      const result = await db.query(`
        SELECT employee_id, employee_code, full_name, email, phone, department, designation, role, status, created_at
        FROM employees
        WHERE role IN ('Admin', 'HR', 'Manager')
        ORDER BY employee_id DESC
      `);

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }

  // 10. Reports Data Endpoint
  async getReportData(req, res, next) {
    try {
      const { report_type, start_date, end_date, department, employee_id } = req.query;
      let querySql = '';
      let queryParams = [];

      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const endDate = end_date || new Date().toISOString().slice(0, 10);

      queryParams.push(startDate, endDate);

      querySql = `
        SELECT a.attendance_id, a.attendance_date, a.attendance_day, a.punch_in, a.punch_out, a.working_hours, a.attendance_status, a.late_reason, a.location_name,
               e.employee_code, e.full_name, e.department, e.designation, e.role
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        WHERE a.attendance_date BETWEEN $1 AND $2
      `;

      if (department) {
        queryParams.push(department);
        querySql += ` AND e.department = $${queryParams.length}`;
      }

      if (employee_id) {
        queryParams.push(employee_id);
        querySql += ` AND e.employee_id = $${queryParams.length}`;
      }

      if (report_type === 'late') {
        querySql += ` AND a.attendance_status = 'Late'`;
      } else if (report_type === 'leave') {
        querySql += ` AND a.attendance_status = 'On Leave'`;
      }

      querySql += ` ORDER BY a.attendance_date DESC, e.full_name ASC`;

      const result = await db.query(querySql, queryParams);

      return res.status(200).json({
        success: true,
        report_type: report_type || 'daily',
        range: { start_date: startDate, end_date: endDate },
        total_records: result.rows.length,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }

  // 11. Company Settings Endpoint
  async getSettings(req, res, next) {
    try {
      const result = await db.query('SELECT * FROM company_settings LIMIT 1');
      const settings = result.rows[0] || {
        company_name: 'Harmony AI Attendance',
        shift_start: '09:00:00',
        shift_end: '18:00:00',
        grace_period_mins: 15,
        weekly_off: 'Sunday',
        leave_policy_days: 24
      };

      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const { company_name, shift_start, shift_end, grace_period_mins, weekly_off, leave_policy_days } = req.body;

      const result = await db.query(`
        UPDATE company_settings
        SET company_name = COALESCE($1, company_name),
            shift_start = COALESCE($2, shift_start),
            shift_end = COALESCE($3, shift_end),
            grace_period_mins = COALESCE($4, grace_period_mins),
            weekly_off = COALESCE($5, weekly_off),
            leave_policy_days = COALESCE($6, leave_policy_days),
            updated_at = NOW()
        WHERE setting_id = (SELECT setting_id FROM company_settings LIMIT 1)
        RETURNING *
      `, [company_name || null, shift_start || null, shift_end || null, grace_period_mins ? parseInt(grace_period_mins, 10) : null, weekly_off || null, leave_policy_days ? parseInt(leave_policy_days, 10) : null]);

      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
