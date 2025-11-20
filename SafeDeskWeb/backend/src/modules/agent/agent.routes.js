const express = require('express');
const router = express.Router();
const agentController = require('./agent.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/register', agentController.register);
router.get('/', authMiddleware, agentController.getAllAgents);
router.get('/status', authMiddleware, agentController.getAgentStatus);
router.get('/:agentId/status', authMiddleware, agentController.getAgentOnlineStatus);

module.exports = router;