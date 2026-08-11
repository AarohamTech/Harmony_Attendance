const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:Harmony9757Harmony@db.hgtwhgnschadrwhtimne.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const tables = ['employees', 'attendance_requests', 'attendance_days', 'punch_records'];
  for (const t of tables) {
    const cols = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}'`
    );
    console.log(`=== Table: ${t} ===`);
    console.log(cols.rows);
  }
  await client.end();
}

check();
