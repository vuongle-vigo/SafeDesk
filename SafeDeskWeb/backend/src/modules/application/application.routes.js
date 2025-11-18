const express = require('express');
const router = express.Router();

const applicationController = require('./application.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/applications', agentMiddleware, applicationController.addApplication);
router.get('/:agentId/applications', authMiddleware, applicationController.getApplicationsByAgentId);

module.exports = router;