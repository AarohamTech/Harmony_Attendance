const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// 1. Dashboard
router.get('/dashboard/stats', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getDashboardStats);
router.get('/dashboard/charts', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getDashboardCharts);

// 2. Employees
router.get('/employees', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getEmployees);
router.get('/employees/:id', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getEmployeeById);
router.post('/employees', authMiddleware, requireRole('Admin', 'HR'), adminController.createEmployee);
router.put('/employees/:id', authMiddleware, requireRole('Admin', 'HR'), adminController.updateEmployee);
router.patch('/employees/:id/status', authMiddleware, requireRole('Admin', 'HR'), adminController.toggleEmployeeStatus);
router.delete('/employees/:id', authMiddleware, requireRole('Admin'), adminController.deleteEmployee);

// 3. Attendance Records & Punch History
router.get('/attendance', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getAttendanceRecords);
router.get('/punch-records', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getPunchRecords);

// 4. Requests (Leave & Missed Punch)
router.get('/requests', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getLeaveRequests);
router.get('/leave-requests', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getLeaveRequests);
router.post('/requests/:id/action', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.processRequestAction);
router.post('/leave-requests/:id/action', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.processRequestAction);

// 5. Departments
router.get('/departments', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getDepartments);
router.post('/departments', authMiddleware, requireRole('Admin', 'HR'), adminController.createDepartment);
router.put('/departments/:id', authMiddleware, requireRole('Admin', 'HR'), adminController.updateDepartment);
router.delete('/departments/:id', authMiddleware, requireRole('Admin'), adminController.deleteDepartment);

// 6. Office Locations
router.get('/offices', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getOffices);
router.post('/offices', authMiddleware, requireRole('Admin'), adminController.createOffice);
router.put('/offices/:id', authMiddleware, requireRole('Admin'), adminController.updateOffice);
router.delete('/offices/:id', authMiddleware, requireRole('Admin'), adminController.deleteOffice);

// 7. Admin Users
router.get('/admin-users', authMiddleware, requireRole('Admin', 'HR'), adminController.getAdminUsers);
router.post('/admin-users', authMiddleware, requireRole('Admin'), adminController.createEmployee);

// 8. Reports
router.get('/reports/data', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getReportData);

// 9. Company Settings
router.get('/settings', authMiddleware, requireRole('Admin', 'HR'), adminController.getSettings);
router.put('/settings', authMiddleware, requireRole('Admin'), adminController.updateSettings);

// 10. Holidays
router.get('/holidays', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getHolidays);
router.post('/holidays', authMiddleware, requireRole('Admin', 'HR'), adminController.createHoliday);
router.put('/holidays/:id', authMiddleware, requireRole('Admin', 'HR'), adminController.updateHoliday);
router.delete('/holidays/:id', authMiddleware, requireRole('Admin'), adminController.deleteHoliday);

// 11. Managers
router.get('/managers', authMiddleware, requireRole('Admin', 'HR', 'Manager'), adminController.getManagers);
router.post('/managers', authMiddleware, requireRole('Admin', 'HR'), adminController.createManager);
router.put('/managers/:id', authMiddleware, requireRole('Admin', 'HR'), adminController.updateManager);
router.delete('/managers/:id', authMiddleware, requireRole('Admin'), adminController.deleteManager);

// 12. Notifications
router.post('/notifications', authMiddleware, requireRole('Admin', 'HR'), adminController.sendNotification);

module.exports = router;
