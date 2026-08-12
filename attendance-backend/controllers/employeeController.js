const db = require('../config/database');

class EmployeeController {
  async getProfile(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const empRes = await db.query(
        `SELECT e.employee_id, e.employee_code, e.full_name, e.email, e.phone, e.department, e.designation, e.role, e.profile_photo, e.shift_start, e.shift_end, e.grace_time, e.weekly_off, o.office_name, o.address, o.latitude, o.longitude
         FROM employees e
         LEFT JOIN office_locations o ON e.office_id = o.office_id
         WHERE e.employee_id = $1`,
        [employeeId]
      );

      if (empRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee profile not found.' });
      }

      const emp = empRes.rows[0];

      return res.status(200).json({
        success: true,
        data: {
          id: String(emp.employee_id),
          employee_id: emp.employee_id,
          employee_code: emp.employee_code,
          full_name: emp.full_name,
          name: emp.full_name,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          designation: emp.designation,
          role: emp.role || 'Employee',
          profile_photo: emp.profile_photo,
          office_name: emp.office_name || 'Padalkar Colony',
          location_label: emp.office_name || 'Padalkar Colony',
          latitude: emp.latitude || 16.740572,
          longitude: emp.longitude || 74.246919,
          shift_start: emp.shift_start,
          shift_end: emp.shift_end,
          grace_time: emp.grace_time,
          weekly_off: emp.weekly_off
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const { name, full_name, department, designation, phone, profile_photo } = req.body;

      const newName = (full_name || name)?.trim();
      const newDept = department?.trim();
      const newDesig = designation?.trim();
      const newPhone = phone?.trim();

      // Normal self-profile update DOES NOT allow changing 'role' (app permission level)
      const updateRes = await db.query(
        `UPDATE employees
         SET full_name = COALESCE($1, full_name),
             department = COALESCE($2, department),
             designation = COALESCE($3, designation),
             phone = COALESCE($4, phone),
             profile_photo = COALESCE($5, profile_photo)
         WHERE employee_id = $6
         RETURNING employee_id, employee_code, full_name, email, phone, department, designation, role, profile_photo`,
        [newName || null, newDept || null, newDesig || null, newPhone || null, profile_photo || null, employeeId]
      );

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updateRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  async listEmployees(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const offset = (page - 1) * limit;
      const search = req.query.search ? `%${req.query.search.trim()}%` : null;

      let queryText = `
        SELECT employee_id, employee_code, full_name, email, phone, department, designation, role, status, created_at
        FROM employees
      `;
      const queryParams = [];

      if (search) {
        queryText += ` WHERE full_name ILIKE $1 OR employee_code ILIKE $1 OR email ILIKE $1`;
        queryParams.push(search);
        queryText += ` ORDER BY employee_id DESC LIMIT $2 OFFSET $3`;
        queryParams.push(limit, offset);
      } else {
        queryText += ` ORDER BY employee_id DESC LIMIT $1 OFFSET $2`;
        queryParams.push(limit, offset);
      }

      const result = await db.query(queryText, queryParams);

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EmployeeController();
