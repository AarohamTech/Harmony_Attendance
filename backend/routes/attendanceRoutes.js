const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/punch-in', authMiddleware, attendanceController.punchIn);
router.post('/punch-out', authMiddleware, attendanceController.punchOut);
router.get('/today', authMiddleware, attendanceController.getTodayAttendance);
router.get('/history', authMiddleware, attendanceController.getAttendanceHistory);
router.get('/calendar', authMiddleware, attendanceController.getAttendanceCalendar);
router.get('/date/:date', authMiddleware, attendanceController.getAttendanceByDate);
router.get('/month', authMiddleware, attendanceController.getMonthlyAttendance);
router.get('/:employee_id/calendar', authMiddleware, attendanceController.getAttendanceCalendar);
router.get('/:employee_id/date/:date', authMiddleware, attendanceController.getAttendanceByDate);

module.exports = router;
