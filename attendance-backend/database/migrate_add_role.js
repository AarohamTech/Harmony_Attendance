const db = require('../config/database');

async function migrate() {
  try {
    console.log('Running Database Migration: Add role column to employees table...');
    
    await db.query(`
      ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'Employee';
    `);
    console.log('Added role column (if not exists).');

    await db.query(`
      UPDATE employees
      SET role = 'Employee'
      WHERE role IS NULL OR role = '';
    `);
    console.log('Updated existing employees with role IS NULL to Employee.');

    // Also check if any employee has designation 'Admin' or 'Administrator' or similar, and if so, set their role to 'Admin' as well if appropriate, or check current employees
    const employees = await db.query('SELECT employee_id, employee_code, full_name, designation, role FROM employees');
    console.log('Current employees in DB:', employees.rows);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
