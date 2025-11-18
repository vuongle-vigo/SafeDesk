const express = require('express');
const router = express.Router();

const powerUsageController = require('./power-usage.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');


router.post('/power-usage', agentMiddleware, powerUsageController.addPowerUsage);
router.get('/:agentId/power-usage', agentMiddleware, powerUsageController.getPowerUsageByAgentId);
router.get('/:agentId/power-usage/:timeStart/:timeEnd', agentMiddleware, powerUsageController.getPowerUsageByTimeRange);
module.exports = router;