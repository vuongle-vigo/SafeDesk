const express = require('express');
const router = express.Router();

const commandController = require('./command.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/commands-polling', agentMiddleware, commandController.pollCommands);

// Thêm route để admin/console tạo command cho 1 agent
router.post('/:agentId/commands', authMiddleware, commandController.createCommand);

module.exports = router;
