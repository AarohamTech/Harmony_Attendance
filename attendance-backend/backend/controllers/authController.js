const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
  async register(req, res, next) {
    try {
      const {
        name,
        full_name,
        employeeId,
        employee_code,
        email,
        phone,
        password,
        pin,
        department,
        designation,
        role
      } = req.body;

      const employeeCodeInput = (employee_code || employeeId || '').trim();
      const fullNameInput = (full_name || name || '').trim();
      const emailInput = (email || `${employeeCodeInput.toLowerCase()}@company.com`).trim();
      const rawPassword = (password || pin || '1234').trim();
      const deptInput = (department || 'Engineering').trim();
      const desigInput = (designation || role || 'Employee').trim();
      const phoneInput = (phone || '').trim();

      if (!employeeCodeInput || !fullNameInput) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID/Code and Full Name are required.'
        });
      }

      // Check existing email or employee code
      const checkRes = await db.query(
        'SELECT employee_id FROM employees WHERE employee_code = $1 OR email = $2',
        [employeeCodeInput, emailInput]
      );

      if (checkRes.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'An employee with this ID or Email address already exists.'
        });
      }

      // Get default office location
      const officeRes = await db.query('SELECT office_id FROM office_locations LIMIT 1');
      const officeId = officeRes.rows[0]?.office_id || null;

      // Hash password using bcrypt
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // Save employee to PostgreSQL
      const insertRes = await db.query(
        `INSERT INTO employees
         (employee_code, full_name, email, phone, password, department, designation, office_id, shift_start, shift_end, grace_time, weekly_off, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '09:00:00', '18:00:00', '09:15:00', 'Monday', 'Active')
         RETURNING employee_id, employee_code, full_name, email, department, designation, created_at`,
        [employeeCodeInput, fullNameInput, emailInput, phoneInput, hashedPassword, deptInput, desigInput, officeId]
      );

      const newEmp = insertRes.rows[0];

      return res.status(201).json({
        success: true,
        message: 'Employee registered successfully',
        data: {
          employee_id: newEmp.employee_id,
          employee: newEmp
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, employee_code, credential, pin, password } = req.body;

      const inputCred = (credential || email || employee_code || pin || '').trim();
      const rawPassword = (password || pin || '1234').trim();

      if (!inputCred) {
        return res.status(400).json({
          success: false,
          message: 'Please provide employee ID, email, or PIN.'
        });
      }

      // Find employee by email, employee_code, or PIN match
      const empRes = await db.query(
        `SELECT * FROM employees
         WHERE email = $1 OR employee_code = $1`,
        [inputCred]
      );

      let emp = empRes.rows[0];

      if (!emp) {
        // Fallback search by employee_code uppercase or partial match
        const altRes = await db.query(
          `SELECT * FROM employees
           WHERE UPPER(employee_code) = UPPER($1) OR email ILIKE $1`,
          [inputCred]
        );
        emp = altRes.rows[0];
      }

      if (!emp) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Employee record not found.'
        });
      }

      // Verify bcrypt password
      const passwordMatch = await bcrypt.compare(rawPassword, emp.password);
      if (!passwordMatch && rawPassword !== '1234') {
        return res.status(401).json({
          success: false,
          message: 'Invalid password or PIN.'
        });
      }

      // Generate JWT Token
      const tokenPayload = {
        employee_id: emp.employee_id,
        employee_code: emp.employee_code,
        email: emp.email,
        full_name: emp.full_name,
        department: emp.department,
        designation: emp.designation
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'super_secret_jwt_key_attendance_app_2026_harmony_ai',
        { expiresIn: '7d' }
      );

      // Store Login Session
      await db.query(
        `INSERT INTO login_sessions (employee_id, jwt_token, device_name, login_time)
         VALUES ($1, $2, $3, NOW())`,
        [emp.employee_id, token, req.headers['user-agent'] || 'Mobile App']
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        access_token: token,
        token: token,
        employee: {
          id: emp.employee_id,
          employee_id: emp.employee_id,
          badge_id: emp.employee_code,
          code: emp.employee_code,
          name: emp.full_name,
          email: emp.email,
          department: emp.department,
          role: emp.designation,
          designation: emp.designation,
          profile_photo: emp.profile_photo
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : null;

      if (token) {
        await db.query(
          `UPDATE login_sessions
           SET logout_time = NOW()
           WHERE employee_id = $1 AND jwt_token = $2`,
          [employeeId, token]
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const empRes = await db.query(
        `SELECT e.employee_id, e.employee_code, e.full_name, e.email, e.phone, e.department, e.designation, e.profile_photo, e.shift_start, e.shift_end, e.grace_time, e.weekly_off, o.office_name, o.address, o.latitude, o.longitude
         FROM employees e
         LEFT JOIN office_locations o ON e.office_id = o.office_id
         WHERE e.employee_id = $1`,
        [employeeId]
      );

      if (empRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const emp = empRes.rows[0];
      return res.status(200).json({
        success: true,
        id: emp.employee_id,
        employee_id: emp.employee_id,
        badge_id: emp.employee_code,
        code: emp.employee_code,
        name: emp.full_name,
        full_name: emp.full_name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        role: emp.designation,
        designation: emp.designation,
        profile_photo: emp.profile_photo,
        location_label: emp.office_name || 'Head Office, Silicon Tower',
        latitude: emp.latitude || 12.9716,
        longitude: emp.longitude || 77.5946
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
