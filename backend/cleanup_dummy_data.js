const db = require('./config/database');

async function cleanupDummyData() {
  console.log('--- Cleaning Up Dummy / Test Data in Supabase Database ---');

  // 1. Delete test QA employees
  const delTestEmps = await db.query(`
    DELETE FROM employees
    WHERE employee_code LIKE 'EMP_TEST_%' OR email LIKE 'test_%@company.com'
    RETURNING employee_id, employee_code, full_name
  `);
  console.log('Deleted Test QA Employees:', delTestEmps.rows);

  // 2. Delete fake string face registrations (e.g. "[0.1, 0.2, ...]" or length < 100)
  const delFakeFaces = await db.query(`
    DELETE FROM face_registrations
    WHERE embedding LIKE '[0.1%' OR length(embedding) < 100
    RETURNING face_id, employee_id
  `);
  console.log('Deleted Dummy Face Registrations:', delFakeFaces.rows);

  // 3. Delete orphan attendance records where employee_id no longer exists
  const delOrphanAtt = await db.query(`
    DELETE FROM attendance
    WHERE employee_id NOT IN (SELECT employee_id FROM employees)
    RETURNING attendance_id, employee_id
  `);
  console.log('Deleted Orphan Attendance Records:', delOrphanAtt.rows);

  // 4. Delete orphan requests
  const delOrphanReq = await db.query(`
    DELETE FROM attendance_requests
    WHERE employee_id NOT IN (SELECT employee_id FROM employees)
    RETURNING request_id, employee_id
  `);
  console.log('Deleted Orphan Attendance Requests:', delOrphanReq.rows);

  // 5. Delete orphan notifications
  const delOrphanNotif = await db.query(`
    DELETE FROM notifications
    WHERE employee_id NOT IN (SELECT employee_id FROM employees)
    RETURNING notification_id, employee_id
  `);
  console.log('Deleted Orphan Notifications:', delOrphanNotif.rows);

  // 6. Verify remaining active employees
  const remainingEmps = await db.query(`SELECT employee_id, employee_code, full_name, email, department, designation FROM employees ORDER BY employee_id`);
  console.log('=== REMAINING REAL EMPLOYEES IN DB ===');
  console.table(remainingEmps.rows);

  // 7. Verify remaining face registrations
  const remainingFaces = await db.query(`SELECT face_id, employee_id, registered_on, length(embedding) as emb_length FROM face_registrations`);
  console.log('=== REMAINING FACE REGISTRATIONS IN DB ===');
  console.table(remainingFaces.rows);

  process.exit(0);
}

cleanupDummyData().catch(err => {
  console.error('Cleanup Error:', err);
  process.exit(1);
});
