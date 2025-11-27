const express = require('express');
const router = express.Router();

const browserHistoryController = require('./browserhistory.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const agentMiddleware = require('../../middlewares/agent.middleware');

router.get('/:agentId/history', authMiddleware, browserHistoryController.getBrowserHistory);
router.post('/browser-history', agentMiddleware, browserHistoryController.addBrowserHistory);

module.exports = router;