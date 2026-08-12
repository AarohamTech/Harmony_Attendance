const http = require('http');

// Helper for HTTP requests
function httpRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 8000,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = { raw: rawData };
          }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING ROLE-BASED AUTHENTICATION & AUTHORIZATION TESTS');
  console.log('====================================================\n');

  const db = require('./config/database');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Start backend server on port 8000 if not running
    const app = require('./server');
    
    // Wait 1 sec for server setup
    await new Promise((r) => setTimeout(r, 1000));

    // TEST 1: Employee Login
    console.log('--- TEST 1: Employee Login ---');
    let empLoginRes = await httpRequest('/api/auth/login', 'POST', {
      credential: 'EMP102',
      password: '123',
    });
    if (!empLoginRes.body.token && !empLoginRes.body.access_token) {
      empLoginRes = await httpRequest('/api/auth/login', 'POST', {
        credential: 'EMP102',
        password: '1234',
      });
    }

    const empToken = empLoginRes.body.token || empLoginRes.body.access_token;
    const empRole = empLoginRes.body.employee?.role;

    assert(empLoginRes.status === 200 && !!empToken, 'Employee login returned 200 & JWT token');
    assert(empRole === 'Employee', `Employee role in response is 'Employee' (got: '${empRole}')`);

    // TEST 2: Admin Login
    console.log('\n--- TEST 2: Admin Login ---');
    let adminLoginRes = await httpRequest('/api/auth/login', 'POST', {
      credential: 'EMP101',
      password: '1234',
    });
    if (!adminLoginRes.body.token && !adminLoginRes.body.access_token) {
      adminLoginRes = await httpRequest('/api/auth/login', 'POST', {
        credential: 'EMP101',
        password: '123',
      });
    }

    const adminToken = adminLoginRes.body.token || adminLoginRes.body.access_token;
    const adminRole = adminLoginRes.body.employee?.role;

    assert(adminLoginRes.status === 200 && !!adminToken, 'Admin login returned 200 & JWT token');
    assert(adminRole === 'Admin', `Admin role in response is 'Admin' (got: '${adminRole}')`);

    // TEST 3: Employee calls Admin API → 403 Forbidden
    console.log('\n--- TEST 3: Employee calls Admin API ---');
    const empAdminApiRes = await httpRequest('/api/admin/employees', 'GET', null, {
      Authorization: `Bearer ${empToken}`,
    });

    assert(empAdminApiRes.status === 403, `Employee calling /api/admin/employees returned 403 Forbidden (got: ${empAdminApiRes.status})`);
    assert(empAdminApiRes.body.success === false, 'Response body success is false');

    // TEST 4: Unauthenticated user calls Admin API → 401 Unauthorized
    console.log('\n--- TEST 4: Unauthenticated user calls Admin API ---');
    const unauthRes = await httpRequest('/api/admin/employees', 'GET');
    assert(unauthRes.status === 401, `Unauthenticated call returned 401 Unauthorized (got: ${unauthRes.status})`);

    // TEST 5 & 6: Registration Security & Attempt to send role=Admin
    console.log('\n--- TEST 5 & 6: Registration Security & Role Forcing ---');
    const testCode = `TEST_REG_${Date.now()}`;
    const regRes = await httpRequest('/api/auth/register', 'POST', {
      employee_code: testCode,
      full_name: 'Test Security User',
      email: `${testCode.toLowerCase()}@test.com`,
      password: 'password123',
      pin: 'password123',
      role: 'Admin', // Malicious input trying to force Admin role
    });

    assert(regRes.status === 201, `Public registration returned 201 Created (got: ${regRes.status})`);
    assert(
      regRes.body.data?.employee?.role === 'Employee',
      `Registration response role is forced to 'Employee' (got: '${regRes.body.data?.employee?.role}')`
    );

    const dbCheck = await db.query('SELECT employee_id, role FROM employees WHERE employee_code = $1', [testCode]);
    assert(dbCheck.rows[0]?.role === 'Employee', `PostgreSQL database record role is forced to 'Employee' (got: '${dbCheck.rows[0]?.role}')`);

    // TEST 7: Admin changes Employee role → role updated successfully
    console.log('\n--- TEST 7: Admin changes Employee role ---');
    const targetEmpId = dbCheck.rows[0]?.employee_id;
    if (targetEmpId && adminToken) {
      const updateRoleRes = await httpRequest(`/api/admin/employees/${targetEmpId}`, 'PUT', { role: 'Manager' }, {
        Authorization: `Bearer ${adminToken}`,
      });

      assert(updateRoleRes.status === 200, `Admin update employee API returned 200 (got: ${updateRoleRes.status})`);
      
      const dbCheckUpdated = await db.query('SELECT role FROM employees WHERE employee_id = $1', [targetEmpId]);
      assert(dbCheckUpdated.rows[0]?.role === 'Manager', `PostgreSQL role updated successfully to 'Manager' (got: '${dbCheckUpdated.rows[0]?.role}')`);

      // Clean up test employee
      await db.query('DELETE FROM employees WHERE employee_code = $1', [testCode]);
    } else {
      console.error('Skipping test 7 due to missing test employee');
    }

    // TEST 8: Logout
    console.log('\n--- TEST 8: Logout ---');
    const logoutRes = await httpRequest('/api/auth/logout', 'POST', null, {
      Authorization: `Bearer ${empToken}`,
    });
    assert(logoutRes.status === 200, `Logout API returned 200 (got: ${logoutRes.status})`);

    // TEST 9: Authenticated /api/auth/me check
    console.log('\n--- TEST 9: Refresh / me API verification ---');
    const meRes = await httpRequest('/api/auth/me', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(meRes.status === 200 && meRes.body.role === 'Admin', `/api/auth/me returned correct user state with role = 'Admin' (got: '${meRes.body.role}')`);

    // TEST 10: Expired / Invalid JWT
    console.log('\n--- TEST 10: Expired / Invalid JWT ---');
    const invalidJwtRes = await httpRequest('/api/admin/employees', 'GET', null, {
      Authorization: 'Bearer invalid_jwt_token_abcdef',
    });
    assert(invalidJwtRes.status === 401, `Invalid JWT returned 401 Unauthorized (got: ${invalidJwtRes.status})`);

    console.log('\n====================================================');
    console.log(`  TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
