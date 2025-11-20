const service = require('./capturescreen.service');
const commandService = require('../command/command.service');

module.exports = {
    addCaptureScreen: async (req, res) => {
        try {
            const agentId = req.agentId || req.headers['x-agent-id'];
            const commandId = req.headers['x-command-id'];
            console.log("Received addCaptureScreen request for agentId:", agentId, "commandId:", commandId);
            const file = req.file;
            
            if (!commandId) {
                return res.status(400).json({ error: "Command ID is required" });
            }

            if (!file) {
                await commandService.updateCommandStatus(commandId, 'failed');
                return res.status(400).json({ error: "No file uploaded" });
            }
            
            const result = await service.saveCaptureScreenFile(agentId, file);
            await commandService.updateCommandStatus(commandId, 'success');
            return res.json({
                success: true,
                file_path: result.file_path,
                timestamp: result.timestamp
            });
        } catch (error) {
            console.error("Error in addCaptureScreen:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    getCaptureScreensByAgentId: async (req, res) => {
        try {
            const { agentId } = req.params;
            const data = await service.getScreensByAgentId(agentId);
            return res.json({ success: true, data });
        } catch (error) {
            console.error("Error in getCaptureScreensByAgentId:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    getCaptureScreensByTimeRange: async (req, res) => {
        try {
            const { agentId, timeStart, timeEnd } = req.params;

            const data = await service.getScreensByTimeRange(agentId, timeStart, timeEnd);

            return res.json({ success: true, data });
        } catch (error) {
            console.error("Error in getCaptureScreensByTimeRange:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    deleteCaptureScreenById: async (req, res) => {
        try {
            console.log("Received deleteCaptureScreenById request with params:", req.params);
            const { captureId, agentId } = req.params;
            await service.deleteCaptureScreenById(captureId, agentId);
            return res.json({ success: true, message: `Screenshot with ID ${captureId} deleted.` });
        } catch (error) {
            console.error("Error in deleteCaptureScreenById:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};
