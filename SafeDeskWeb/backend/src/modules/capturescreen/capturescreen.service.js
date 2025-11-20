const fs = require('fs');
const path = require('path');
const model = require('./capturescreen.model');

module.exports = {
    saveCaptureScreenFile: async (agentId, uploadedFile) => {
        if (!uploadedFile) {
            throw new Error("No file uploaded");
        }

        const timestamp = Math.floor(Date.now() / 1000);

        // Directory to save images
        const saveDir = path.join(__dirname, '../../data/screenshots', agentId);
        console.log("Save directory:", saveDir);
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        const newFileName = `${timestamp}.jpg`;
        const finalPath = path.join(saveDir, newFileName);

        // Move file from multer's temporary folder to the main folder
        fs.renameSync(uploadedFile.path, finalPath);

        // Save path to database
        const relativePath = `/screenshots/${agentId}/${newFileName}`;
        await model.insertCaptureScreen(agentId, relativePath, timestamp);

        return {
            file_path: relativePath,
            timestamp
        };
    },

    getScreensByAgentId: async (agentId) => {
        return await model.getByAgentId(agentId);
    },

    getScreensByTimeRange: async (agentId, timeStart, timeEnd) => {
        return await model.getByTimeRange(agentId, timeStart, timeEnd);
    },

    deleteCaptureScreenById: async (screenId, agentId) => {
        return await model.deleteById(screenId, agentId);
    }
};
