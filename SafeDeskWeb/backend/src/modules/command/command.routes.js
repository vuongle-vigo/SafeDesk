const express = require('express');
const router = express.Router();

const commandController = require('./command.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/commands/poll', agentMiddleware, commandController.pollCommands);
