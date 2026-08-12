const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, employeeController.getProfile);
router.put('/profile', authMiddleware, employeeController.updateProfile);
router.get('/', authMiddleware, employeeController.listEmployees);

module.exports = router;
