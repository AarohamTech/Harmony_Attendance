const { spawn, execSync } = require('child_process');
const path = require('path');

const BACKEND_PORT = 8000;
const FRONTEND_PORT = 8081;

function freePort(port) {
  try {
    if (process.platform === 'win32') {
      execSync(`powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
    } else {
      execSync(`npx kill-port ${port}`, { stdio: 'ignore' });
    }
  } catch (e) {
    // Ignore errors if port is not in use
  }
}

console.log('====================================================================');
console.log('  Starting Harmony AI Attendance Unified Application Server');
console.log('====================================================================');
console.log(`[INIT] Freeing potential lingering ports (${BACKEND_PORT}, ${FRONTEND_PORT})...`);

freePort(BACKEND_PORT);
freePort(FRONTEND_PORT);

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'attendance-backend');
const appDir = path.join(rootDir, 'attendance-frontend');

setTimeout(() => {
  console.log(`[INIT] Starting Backend Server (Express/Supabase) on internal port ${BACKEND_PORT}...`);

  const backendProcess = spawn('node', ['server.js'], {
    cwd: backendDir,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(BACKEND_PORT) },
  });

  backendProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => console.log(`\x1b[36m[BACKEND]\x1b[0m ${line}`));
  });

  backendProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (!line.includes('DeprecationWarning')) {
        console.error(`\x1b[31m[BACKEND ERROR]\x1b[0m ${line}`);
      }
    });
  });

  backendProcess.on('exit', (code) => {
    console.log(`\x1b[31m[BACKEND PROCESS EXITED]\x1b[0m Code: ${code}`);
  });

  console.log(`[INIT] Starting Frontend Server (Expo Web & Reverse Proxy) on http://localhost:${FRONTEND_PORT}...`);

  const frontendProcess = spawn('npx', ['expo', 'start', '--port', String(FRONTEND_PORT), '--web'], {
    cwd: appDir,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, CI: '1', EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://harmony-attendance-backend.vercel.app' },
  });

  frontendProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      console.log(`\x1b[32m[FRONTEND]\x1b[0m ${line}`);
    });
  });

  frontendProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (!line.includes('DeprecationWarning')) {
        console.error(`\x1b[33m[FRONTEND WARN]\x1b[0m ${line}`);
      }
    });
  });

  frontendProcess.on('exit', (code) => {
    console.log(`\x1b[31m[FRONTEND PROCESS EXITED]\x1b[0m Code: ${code}`);
  });

  setTimeout(() => {
    console.log('\n====================================================================');
    console.log('  🎉 HARMONY AI ATTENDANCE SYSTEM IS READY!');
    console.log('--------------------------------------------------------------------');
    console.log(`  👉 Main Web Application URL: \x1b[1m\x1b[32mhttp://localhost:${FRONTEND_PORT}\x1b[0m`);
    console.log(`  👉 Unified API Base URL:     \x1b[1mhttp://localhost:${BACKEND_PORT}/api\x1b[0m`);
    console.log(`  👉 API Health Check:        \x1b[1mhttp://localhost:${BACKEND_PORT}/api/health\x1b[0m`);
    console.log('====================================================================\n');
  }, 4000);

  function cleanup() {
    console.log('\n[SHUTDOWN] Stopping all Harmony AI Attendance services...');
    try {
      backendProcess.kill();
    } catch (e) {}
    try {
      frontendProcess.kill();
    } catch (e) {}
    freePort(BACKEND_PORT);
    freePort(FRONTEND_PORT);
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}, 1000);
