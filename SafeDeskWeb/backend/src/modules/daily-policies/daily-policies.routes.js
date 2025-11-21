const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middlewares/auth.middleware');
const agentMiddleware = require('../../middlewares/agent.middleware');
const dailyPoliciesController = require('./daily-policies.controller');

router.get('/daily-policies', agentMiddleware, dailyPoliciesController.getDailyPoliciesFromAgent);
router.get('/:agentId/daily-policies', authMiddleware, dailyPoliciesController.getDailyPoliciesByAgentId);
router.put('/:agentId/daily-policies/actions', authMiddleware, dailyPoliciesController.updateDailyPolicyActions);
router.put('/:agentId/daily-policies/:policyId', authMiddleware, dailyPoliciesController.updateDailyPolicies);

module.exports = router;