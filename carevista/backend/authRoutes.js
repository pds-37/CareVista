const express = require('express');
const authController = require('./authController');
const { requireAuth } = require('./middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth(), authController.getCurrentUser);

module.exports = router;
