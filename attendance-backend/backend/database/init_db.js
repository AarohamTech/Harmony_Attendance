const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Harmony9757Harmony@db.hgtwhgnschadrwhtimne.supabase.co:5432/postgres';

async function initDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('Schema created/updated successfully.');

    // 1. Ensure Default Office Location
    const officeCheck = await client.query('SELECT office_id FROM office_locations LIMIT 1');
    let officeId;
    if (officeCheck.rows.length === 0) {
      const officeRes = await client.query(`
        INSERT INTO office_locations (office_name, address, latitude, longitude, allowed_radius)
        VALUES ('Head Office, Silicon Tower', 'Silicon Tower, Tech Park', 12.9716, 77.5946, 100)
        RETURNING office_id
      `);
      officeId = officeRes.rows[0].office_id;
      console.log('Inserted default office location ID:', officeId);
    } else {
      officeId = officeCheck.rows[0].office_id;
    }

    // 2. Ensure Seed Employees
    const hashedPassword = await bcrypt.hash('1234', 10);
    const demoEmployees = [
      { code: 'EMP101', name: 'Alice Smith', email: 'alice@company.com', dept: 'Management', role: 'Admin', phone: '+1-555-0101' },
      { code: 'EMP102', name: 'Bob Jones', email: 'bob@company.com', dept: 'Engineering', role: 'Developer', phone: '+1-555-0102' },
      { code: 'EMP103', name: 'Charlie Brown', email: 'charlie@company.com', dept: 'HR', role: 'Specialist', phone: '+1-555-0103' },
      { code: 'EMP104', name: 'Diana Prince', email: 'diana@company.com', dept: 'Operations', role: 'Lead', phone: '+1-555-0104' },
      { code: 'EMP-88210', name: 'Alexander Bennett', email: 'a.bennett@harmony.ai', dept: 'Engineering', role: 'Senior Developer', phone: '+1 (555) 012-3456' },
    ];

    for (const emp of demoEmployees) {
      const empCheck = await client.query('SELECT employee_id FROM employees WHERE email = $1 OR employee_code = $2', [emp.email, emp.code]);
      let empId;
      if (empCheck.rows.length === 0) {
        const empRes = await client.query(`
          INSERT INTO employees (employee_code, full_name, email, phone, password, department, designation, office_id, shift_start, shift_end, grace_time, weekly_off, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '09:00:00', '18:00:00', '09:15:00', 'Monday', 'Active')
          RETURNING employee_id
        `, [emp.code, emp.name, emp.email, emp.phone, hashedPassword, emp.dept, emp.role, officeId]);
        empId = empRes.rows[0].employee_id;
        console.log(`Created employee ${emp.name} (ID: ${empId})`);
      } else {
        empId = empCheck.rows[0].employee_id;
      }

      // Add demo manager for admin/manager role
      if (emp.role === 'Admin' || emp.role === 'Lead') {
        await client.query(`
          INSERT INTO managers (employee_id, manager_name, email, phone)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (employee_id) DO NOTHING
        `, [empId, emp.name, emp.email, emp.phone]);
      }
    }

    console.log('Database initialization complete!');
  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    await client.end();
  }
}

initDatabase();
