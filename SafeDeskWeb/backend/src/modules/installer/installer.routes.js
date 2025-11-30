const express = require('express');
const router = express.Router();
const installerController = require('./installer.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/generate-token', authMiddleware, installerController.generateInstallerToken);

module.exports = router;