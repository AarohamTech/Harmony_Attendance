require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const errorMiddleware = require('./middleware/errorMiddleware');
const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const faceRoutes = require('./routes/faceRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const managerRoutes = require('./routes/managerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const attendanceController = require('./controllers/attendanceController');
const employeeController = require('./controllers/employeeController');

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:19006',
  'http://localhost:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Endpoint (Required by prompt)
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    return res.status(200).json({
      success: true,
      message: 'Database connection is working cleanly',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error('Health Check Database Failure:', err);
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: err.message
    });
  }
});

// Alias for root health check
app.get('/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    return res.status(200).json({
      success: true,
      status: 'healthy',
      database: 'connected',
      now: result.rows[0].now
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/notifications', notificationRoutes);

// Additional endpoints matching client requirements
app.post('/api/punch', authMiddleware, attendanceController.punchUnified);
app.post('/punch', authMiddleware, attendanceController.punchUnified);

app.get('/api/dashboard', authMiddleware, attendanceController.getDashboard);
app.get('/api/dashboard/overview', authMiddleware, attendanceController.getDashboard);
app.get('/dashboard/overview', authMiddleware, attendanceController.getDashboard);

app.get('/api/dashboard/charts', authMiddleware, attendanceController.getDashboardCharts);
app.get('/dashboard/charts', authMiddleware, attendanceController.getDashboardCharts);

app.get(['/api/attendance/:employee_id/calendar', '/attendance/:employee_id/calendar'], authMiddleware, attendanceController.getAttendanceCalendar);
app.get(['/api/attendance/:employee_id/date/:date', '/attendance/:employee_id/date/:date'], authMiddleware, attendanceController.getAttendanceByDate);

app.get('/api/auth/me', authMiddleware, (req, res, next) => authRoutes(req, res, next));
app.put('/api/profile/update', authMiddleware, employeeController.updateProfile);
app.put('/profile/update', authMiddleware, employeeController.updateProfile);

// Real Database Report export endpoint
app.get(['/api/reports/export', '/reports/export'], authMiddleware, async (req, res, next) => {
  try {
    const format = req.query.format || 'csv';
    const result = await db.query(`
      SELECT e.employee_code, e.full_name, a.attendance_date, a.attendance_status, a.punch_in, a.punch_out, a.working_hours
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      ORDER BY a.attendance_date DESC
    `);

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report.${format}`);

    let csvContent = 'Employee Code, Full Name, Attendance Date, Status, Punch In, Punch Out, Working Hours\n';
    result.rows.forEach(r => {
      const dateStr = r.attendance_date ? new Date(r.attendance_date).toISOString().slice(0, 10) : '';
      const punchIn = r.punch_in ? new Date(r.punch_in).toLocaleTimeString('en-US', { hour12: false }) : '--:--';
      const punchOut = r.punch_out ? new Date(r.punch_out).toLocaleTimeString('en-US', { hour12: false }) : '--:--';
      csvContent += `"${r.employee_code}","${r.full_name}","${dateStr}","${r.attendance_status || 'Present'}","${punchIn}","${punchOut}","${r.working_hours || '00h 00m'}"\n`;
    });

    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
});

// Global Error Handler Middleware
app.use(errorMiddleware);

// Start Server with Automatic EADDRINUSE Port Recovery
const startServer = (portToUse) => {
  const server = app.listen(portToUse, () => {
    console.log(`===================================================`);
    console.log(`  Attendance Express Backend Server running on Port ${portToUse}`);
    console.log(`  Health check: http://localhost:${portToUse}/api/health`);
    console.log(`  Database: Supabase PostgreSQL`);
    console.log(`===================================================`);
  });

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portToUse} is currently in use. Checking if existing backend is healthy...`);
      try {
        const http = require('http');
        const req = http.get(`http://localhost:${portToUse}/api/health`, (res) => {
          if (res.statusCode === 200) {
            console.log(`===================================================`);
            console.log(`  Harmony AI Attendance Backend is ALREADY RUNNING on Port ${portToUse}`);
            console.log(`  Health check: http://localhost:${portToUse}/api/health (HTTP 200)`);
            console.log(`===================================================`);
            process.exit(0);
          } else {
            console.error(`Port ${portToUse} is in use but health check returned status ${res.statusCode}. Exiting.`);
            process.exit(1);
          }
        });
        req.on('error', () => {
          console.error(`Port ${portToUse} is in use by an unresponsive process. Exiting.`);
          process.exit(1);
        });
      } catch (checkErr) {
        console.error(`Port ${portToUse} is currently in use. Exiting.`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
    }
  });
};

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

startServer(PORT);

module.exports = app;
