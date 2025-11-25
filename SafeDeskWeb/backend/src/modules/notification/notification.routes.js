const express = require('express');
const router = express.Router();

const notificationController = require('./notification.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/', authMiddleware, notificationController.getNotifications);
router.post('/mark-read', authMiddleware, notificationController.markAsRead);

module.exports = router;