const express = require('express');
const router = express.Router();

const captureScreenController = require('./capturescreen.controller');
const agentMiddleware = require('../../middlewares/agent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const multer = require('multer');
const upload = multer({ dest: 'data/screenshots/tmp' });

router.post(
    '/capture-screen',
    agentMiddleware,
    upload.single('file'),
    captureScreenController.addCaptureScreen
);

router.get('/:agentId/capture-screen', authMiddleware, captureScreenController.getCaptureScreensByAgentId);
router.get('/:agentId/capture-screen/:timeStart/:timeEnd', authMiddleware, captureScreenController.getCaptureScreensByTimeRange);
router.delete('/:agentId/capture-screen/:captureId', authMiddleware, captureScreenController.deleteCaptureScreenById);

module.exports = router;