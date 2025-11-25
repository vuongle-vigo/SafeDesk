const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

router.get('/getme', authMiddleware, authController.getMe);

module.exports = router;