const express = require('express');
const router = express.Router();
const agentController = require('./agent.controller');

router.post('/register', agentController.register);

module.exports = router;