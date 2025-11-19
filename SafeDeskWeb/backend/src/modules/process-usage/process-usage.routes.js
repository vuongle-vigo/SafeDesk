const express = require('express');
const router = express.Router();

const processUsageController  = require('./process-usage.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/process-usage', agentMiddleware, processUsageController.addProcessUsage);
router.get('/:agentId/process-usage', authMiddleware, processUsageController.getProcessUsageByAgentId);
router.get('/:agentId/process-usage/:timeStart/:timeEnd', authMiddleware, processUsageController.getProcessUsageByTimeRange);

module.exports = router;