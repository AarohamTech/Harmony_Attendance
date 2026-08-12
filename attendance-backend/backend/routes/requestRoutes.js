const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, requestController.createRequest);
router.get('/', authMiddleware, requestController.listRequests);

module.exports = router;
