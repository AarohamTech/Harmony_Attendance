const db = require('./config/database');
const bcrypt = require('bcrypt');

async function resetPasswords() {
  const hash = await bcrypt.hash('1234', 10);
  const result = await db.query('UPDATE employees SET password = $1 RETURNING employee_id, employee_code, full_name', [hash]);
  console.log('Successfully updated employee passwords:', result.rows);
  process.exit(0);
}

resetPasswords().catch(err => {
  console.error('Reset password error:', err);
  process.exit(1);
});
