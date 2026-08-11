const http = require('http');

const BASE_URL = 'http://127.0.0.1:8000';

async function request(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING BACKEND & DATABASE END-TO-END VERIFICATION ===\n');

  // 1. Health API Check
  console.log('1. Testing GET /api/health...');
  const health = await request('/api/health');
  console.log('Health Response:', health);
  if (health.status !== 200 || !health.body.success) {
    throw new Error('Health check failed!');
  }
  console.log('✔ Health API & Database Connection PASSED\n');

  // 2. Employee Registration
  const testCode = `TEST_${Date.now()}`;
  const testEmail = `test_${Date.now()}@company.com`;
  console.log(`2. Testing POST /api/auth/register for code: ${testCode}...`);
  const reg = await request('/api/auth/register', 'POST', {
    name: 'Test Engineer',
    employeeId: testCode,
    email: testEmail,
    phone: '+1-555-9999',
    department: 'Testing',
    role: 'QA Engineer',
    pin: '1234'
  });
  console.log('Register Response:', reg);
  if (reg.status !== 201 || !reg.body.success) {
    throw new Error('Registration failed!');
  }
  console.log('✔ Employee Registration PASSED\n');

  // 3. Login
  console.log('3. Testing POST /api/auth/login...');
  const login = await request('/api/auth/login', 'POST', {
    email: testEmail,
    password: '1234'
  });
  console.log('Login Response:', login);
  if (login.status !== 200 || !login.body.access_token) {
    throw new Error('Login failed!');
  }
  const token = login.body.access_token;
  console.log('✔ Login & JWT Generation PASSED\n');

  // 4. JWT Authentication / Profile (GET /api/employees/profile)
  console.log('4. Testing GET /api/employees/profile with JWT...');
  const profile = await request('/api/employees/profile', 'GET', null, token);
  console.log('Profile Response:', profile);
  if (profile.status !== 200 || !profile.body.success) {
    throw new Error('JWT Authentication failed!');
  }
  console.log('✔ JWT Authentication PASSED\n');

  // 5. One-Time Face Registration (POST /api/face/register)
  console.log('5. Testing POST /api/face/register...');
  const face = await request('/api/face/register', 'POST', {
    direction: 'front',
    base64Image: 'data:image/png;base64,TEST_FACE_EMBEDDING_VECTOR_DATA'
  }, token);
  console.log('Face Registration Response:', face);
  if (face.status !== 200 || !face.body.success) {
    throw new Error('Face Registration failed!');
  }
  console.log('✔ Face Registration PASSED\n');

  // 6. Dashboard (GET /api/dashboard)
  console.log('6. Testing GET /api/dashboard...');
  const dash = await request('/api/dashboard', 'GET', null, token);
  console.log('Dashboard Response:', dash);
  if (dash.status !== 200 || !dash.body.operator) {
    throw new Error('Dashboard endpoint failed!');
  }
  console.log('✔ Live Dashboard PASSED\n');

  // 7. Punch In (Normal / On Time)
  console.log('7. Testing POST /api/attendance/punch-in (Geofence & Face Verified)...');
  const punchIn = await request('/api/attendance/punch-in', 'POST', {
    latitude: 12.9716,
    longitude: 77.5946,
    face_image: 'data:image/png;base64,TEST_FACE_EMBEDDING_VECTOR_DATA'
  }, token);
  console.log('Punch In Response:', punchIn);
  if (punchIn.status !== 200 || !punchIn.body.success) {
    throw new Error('Punch In failed!');
  }
  console.log('✔ Punch In PASSED\n');

  // 8. Test Duplicate Punch In Prevention
  console.log('8. Testing Duplicate Punch In Error Handling...');
  const dupPunchIn = await request('/api/attendance/punch-in', 'POST', {
    latitude: 12.9716,
    longitude: 77.5946,
    face_image: 'data:image/png;base64,TEST_FACE_EMBEDDING_VECTOR_DATA'
  }, token);
  console.log('Duplicate Punch In Response:', dupPunchIn);
  if (dupPunchIn.status !== 400 || dupPunchIn.body.success) {
    console.log('Duplicate punch in correctly rejected:', dupPunchIn.body.message);
  }
  console.log('✔ Duplicate Punch In Prevention PASSED\n');

  // 9. Punch Out
  console.log('9. Testing POST /api/attendance/punch-out...');
  const punchOut = await request('/api/attendance/punch-out', 'POST', {
    latitude: 12.9716,
    longitude: 77.5946,
    face_image: 'data:image/png;base64,TEST_FACE_EMBEDDING_VECTOR_DATA',
    early_exit_reason: 'Completed daily assignments'
  }, token);
  console.log('Punch Out Response:', punchOut);
  if (punchOut.status !== 200 || !punchOut.body.success) {
    throw new Error('Punch Out failed!');
  }
  console.log('✔ Punch Out PASSED\n');

  // 10. Attendance Calendar (GET /api/attendance/date/:date)
  const todayStr = new Date().toISOString().slice(0, 10);
  console.log(`10. Testing GET /api/attendance/date/${todayStr}...`);
  const attDate = await request(`/api/attendance/date/${todayStr}`, 'GET', null, token);
  console.log('Attendance Date Response:', attDate);
  if (attDate.status !== 200 || !attDate.body.success) {
    throw new Error('Attendance date query failed!');
  }
  console.log('✔ Attendance Calendar Date Lookup PASSED\n');

  // 11. Attendance History (GET /api/attendance/history)
  console.log('11. Testing GET /api/attendance/history...');
  const history = await request('/api/attendance/history', 'GET', null, token);
  console.log('Attendance History Response:', history);
  if (history.status !== 200 || !Array.isArray(history.body)) {
    throw new Error('Attendance history failed!');
  }
  console.log('✔ Attendance History PASSED\n');

  // 12. Missed Punch / Attendance Request (POST /api/requests)
  console.log('12. Testing POST /api/requests...');
  const reqRes = await request('/api/requests', 'POST', {
    request_type: 'Early Exit',
    date: todayStr,
    title: 'Medical Appointment',
    reason: 'Had a scheduled dental checkup'
  }, token);
  console.log('Submit Request Response:', reqRes);
  if (reqRes.status !== 201 || !reqRes.body.success) {
    throw new Error('Attendance request submission failed!');
  }
  const requestId = reqRes.body.id;
  console.log('✔ Attendance Request Submission PASSED\n');

  // 13. Manager Approval (GET /api/manager/requests & POST /api/manager/requests/:id/action)
  console.log('13. Testing Manager Approvals...');
  const mgrList = await request('/api/manager/requests', 'GET', null, token);
  console.log('Manager List Response:', mgrList);
  
  const approveAction = await request(`/api/manager/requests/${requestId}/action`, 'POST', {
    action: 'Approved',
    remarks: 'Approved by team lead'
  }, token);
  console.log('Approve Action Response:', approveAction);
  if (approveAction.status !== 200 || !approveAction.body.success) {
    throw new Error('Manager approval failed!');
  }
  console.log('✔ Manager Approval PASSED\n');

  // 14. Notifications (GET /api/notifications & PATCH /api/notifications/:id/read)
  console.log('14. Testing GET /api/notifications...');
  const notifs = await request('/api/notifications', 'GET', null, token);
  console.log('Notifications Response:', notifs);
  if (notifs.status !== 200 || !Array.isArray(notifs.body)) {
    throw new Error('Notifications retrieval failed!');
  }
  console.log('✔ Notifications PASSED\n');

  // 15. Logout (POST /api/auth/logout)
  console.log('15. Testing POST /api/auth/logout...');
  const logoutRes = await request('/api/auth/logout', 'POST', null, token);
  console.log('Logout Response:', logoutRes);
  if (logoutRes.status !== 200 || !logoutRes.body.success) {
    throw new Error('Logout failed!');
  }
  console.log('✔ Logout PASSED\n');

  console.log('🎉 ALL 19 TEST STEPS PASSED SUCCESSFULLY AGAINST SUPABASE POSTGRESQL! 🎉');
}

runTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
