const express = require('express');
const router = express.Router();
const installerController = require('./installer.controller');

router.post('/generate-token', installerController.generateInstallerToken);

module.exports = router;