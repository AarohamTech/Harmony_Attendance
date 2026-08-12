const express = require('express');
const router = express.Router();
const faceController = require('../controllers/faceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authMiddleware, faceController.registerFace);
router.post('/verify', authMiddleware, faceController.verifyFace);
router.get('/', authMiddleware, faceController.getFace);

module.exports = router;
