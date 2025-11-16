const express = require('express');
const router = express.Router();
const agentController = require('./agent.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');

router.post('/register', agentController.register);
router.post('/applications', agentMiddleware, agentController.addApplication);

module.exports = router;