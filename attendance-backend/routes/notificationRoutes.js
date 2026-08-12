const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, notificationController.getNotifications);
router.patch('/:id/read', authMiddleware, notificationController.markRead);
router.put('/:id/read', authMiddleware, notificationController.markRead);
router.put('/read-all', authMiddleware, notificationController.markAllRead);
router.patch('/read-all', authMiddleware, notificationController.markAllRead);

module.exports = router;
