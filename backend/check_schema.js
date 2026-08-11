const db = require('./config/database');

async function checkSchema() {
  const tables = ['employees', 'face_registrations', 'attendance', 'attendance_requests', 'notifications', 'office_locations', 'managers', 'manager_actions', 'login_sessions', 'alembic_version', 'holidays'];
  for (const t of tables) {
    const res = await db.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [t]);
    console.log(`=== TABLE: ${t} ===`);
    console.table(res.rows);
  }
  process.exit(0);
}

checkSchema().catch(e => {
  console.error(e);
  process.exit(1);
});
