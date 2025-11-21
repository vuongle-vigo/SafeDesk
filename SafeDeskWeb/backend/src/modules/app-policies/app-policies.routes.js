const express = require('express');
const router = express.Router();

const appPoliciesController = require('./app-policies.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const agentMiddleware = require('../../middlewares/agent.middleware');

router.get('/:agentId/app-policies', authMiddleware, appPoliciesController.getAppPoliciesByAgentId);
router.put('/:agentId/app-policies', authMiddleware, appPoliciesController.updateAppPoliciesByAppId);
router.get('/app-policies', agentMiddleware, appPoliciesController.getAppPoliciesFromAgent);

module.exports = router;