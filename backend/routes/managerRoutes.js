const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { authMiddleware, requireManager } = require('../middleware/authMiddleware');

router.get('/requests', authMiddleware, requireManager, managerController.getPendingRequests);
router.post('/requests/:id/action', authMiddleware, requireManager, managerController.processAction);
router.post('/requests/:id', authMiddleware, requireManager, managerController.processAction);
router.patch('/requests/:id', authMiddleware, requireManager, managerController.processAction);

module.exports = router;
