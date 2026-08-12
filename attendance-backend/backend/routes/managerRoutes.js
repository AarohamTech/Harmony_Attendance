const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/requests', authMiddleware, managerController.getPendingRequests);
router.post('/requests/:id/action', authMiddleware, managerController.processAction);

module.exports = router;
