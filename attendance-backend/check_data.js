const db = require('./config/database');

async function checkData() {
  const tables = ['employees', 'face_registrations', 'attendance', 'attendance_requests', 'notifications', 'office_locations', 'managers'];
  for (const t of tables) {
    const res = await db.query(`SELECT * FROM ${t}`);
    console.log(`=== DATA IN ${t} (Count: ${res.rows.length}) ===`);
    console.log(JSON.stringify(res.rows, null, 2));
  }
  process.exit(0);
}

checkData().catch(e => {
  console.error(e);
  process.exit(1);
});
