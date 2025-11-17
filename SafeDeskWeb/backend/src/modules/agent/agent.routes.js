const express = require('express');
const router = express.Router();
const agentController = require('./agent.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');

router.post('/register', agentController.register);
router.post('/applications', agentMiddleware, agentController.addApplication);
router.post('/power-usage', agentMiddleware, agentController.addPowerUsage);
router.post('/process-usage', agentMiddleware, agentController.addProcessUsage);

module.exports = router;