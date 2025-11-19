const express = require('express');
const router = express.Router();

const applicationController = require('./application.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/applications', agentMiddleware, applicationController.addApplication);
router.get('/:agentId/applications', authMiddleware, applicationController.getApplicationsByAgentId);
router.get('/:agentId/applications/:timeStart/:timeEnd', authMiddleware, applicationController.getApplicationsUsageByTimeRange);
router.get('/:agentId/applications-top/:timeStart/:timeEnd', authMiddleware, applicationController.getTopApplicationsByTimeRange);
router.put('/:agentId/applications-limit', authMiddleware, applicationController.setApplicationLimit);
router.put('/:agentId/applications-status', authMiddleware, applicationController.updateApplicationStatus);

module.exports = router;