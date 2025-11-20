const express = require('express');
const router = express.Router();

const appPoliciesController = require('./app-policies.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/:agentId/app-policies', authMiddleware, appPoliciesController.getAppPoliciesByAgentId);
router.put('/:agentId/app-policies', authMiddleware, appPoliciesController.updateAppPoliciesByAppId);

module.exports = router;