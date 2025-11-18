const express = require('express');
const router = express.Router();

const powerUsageController = require('./power-usage.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/power-usage', agentMiddleware, powerUsageController.addPowerUsage);
router.get('/:agentId/power-usage', authMiddleware, powerUsageController.getPowerUsageByAgentId);
router.get('/:agentId/power-usage/:timeStart/:timeEnd', authMiddleware, powerUsageController.getPowerUsageByTimeRange);

module.exports = router;