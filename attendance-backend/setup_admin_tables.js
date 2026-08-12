const db = require('./config/database');

async function setupTables() {
  try {
    console.log('Setting up missing database tables...');

    // 1. Departments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        department_id SERIAL PRIMARY KEY,
        department_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        manager_id INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Departments table ready.');

    // Seed default departments if empty
    const deptCheck = await db.query('SELECT COUNT(*) FROM departments');
    if (parseInt(deptCheck.rows[0].count, 10) === 0) {
      await db.query(`
        INSERT INTO departments (department_name, description) VALUES
        ('Engineering', 'Software engineering & hardware development'),
        ('Human Resources', 'HR management, payroll & employee welfare'),
        ('Operations', 'Field operations & logistics management'),
        ('Management', 'Executive leadership & strategic planning'),
        ('Finance', 'Accounting & financial planning')
      `);
      console.log('Default departments inserted.');
    }

    // Populate departments table with any unique departments from employees table if missing
    await db.query(`
      INSERT INTO departments (department_name, description)
      SELECT DISTINCT department, 'Department imported from employee records'
      FROM employees
      WHERE department IS NOT NULL AND department != ''
      ON CONFLICT (department_name) DO NOTHING
    `);

    // 2. Company settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        setting_id SERIAL PRIMARY KEY,
        company_name VARCHAR(150) DEFAULT 'Harmony AI Attendance',
        shift_start TIME DEFAULT '09:00:00',
        shift_end TIME DEFAULT '18:00:00',
        grace_period_mins INTEGER DEFAULT 15,
        weekly_off VARCHAR(50) DEFAULT 'Sunday',
        leave_policy_days INTEGER DEFAULT 24,
        allow_remote_punch BOOLEAN DEFAULT true,
        geo_fencing_strict BOOLEAN DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Company settings table ready.');

    // Seed default settings if empty
    const settingsCheck = await db.query('SELECT COUNT(*) FROM company_settings');
    if (parseInt(settingsCheck.rows[0].count, 10) === 0) {
      await db.query(`
        INSERT INTO company_settings (company_name, shift_start, shift_end, grace_period_mins, weekly_off, leave_policy_days)
        VALUES ('Harmony AI Attendance', '09:00:00', '18:00:00', 15, 'Sunday', 24)
      `);
      console.log('Default settings inserted.');
    }

    // Ensure office_locations has at least one default office
    const officeCheck = await db.query('SELECT COUNT(*) FROM office_locations');
    if (parseInt(officeCheck.rows[0].count, 10) === 0) {
      await db.query(`
        INSERT INTO office_locations (office_name, address, latitude, longitude, allowed_radius)
        VALUES ('Padalkar Colony HQ', 'Padalkar Colony, Main Campus', 16.740572, 74.246919, 300)
      `);
      console.log('Default office location inserted.');
    }

    console.log('Database table setup complete successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up tables:', err);
    process.exit(1);
  }
}

setupTables();
