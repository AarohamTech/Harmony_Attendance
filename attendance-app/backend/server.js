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

// Enable CORS and JSON parsing
app.use(cors());
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

app.get('/api/auth/me', authMiddleware, (req, res, next) => authRoutes(req, res, next));
app.put('/api/profile/update', authMiddleware, employeeController.updateProfile);
app.put('/profile/update', authMiddleware, employeeController.updateProfile);

// Report export simulation endpoint
app.get(['/api/reports/export', '/reports/export'], authMiddleware, (req, res) => {
  const format = req.query.format || 'csv';
  res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename=attendance_report.${format}`);
  return res.status(200).send(`Employee Code, Full Name, Attendance Date, Status, Punch In, Punch Out\nEMP101, Alice Smith, ${new Date().toISOString().slice(0, 10)}, Present, 09:00:00, 18:00:00\n`);
});

// Global Error Handler Middleware
app.use(errorMiddleware);

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  Attendance Express Backend Server running on Port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`  Database: Supabase PostgreSQL`);
  console.log(`===================================================`);
});

module.exports = app;
