const { query } = require('../../config/db');

module.exports = {
    insertCaptureScreen: async (agentId, filePath, timestamp) => {
        const sql = `
            INSERT INTO agent_screenshots (agent_id, file_path, created_at)
            VALUES (?, ?, FROM_UNIXTIME(?))
        `;
        const rows = await query(sql, [agentId, filePath, timestamp]);
        return rows;
    },

    getByAgentId: async (agentId) => {
        const sql = `
            SELECT id, agent_id, file_path, created_at 
            FROM agent_screenshots
            WHERE agent_id = ?
            ORDER BY created_at DESC
        `;
        const rows = await query(sql, [agentId]);
        return rows;
    },

    getByTimeRange: async (agentId, timeStart, timeEnd) => {
        const sql = `
            SELECT id, agent_id, file_path, created_at 
            FROM agent_screenshots
            WHERE agent_id = ?
              AND created_at BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?)
            ORDER BY created_at DESC
        `;
        const rows = await query(sql, [agentId, timeStart, timeEnd]);
        return rows;
    },

    deleteById: async (screenId, agentId) => {
        console.log("Deleting capture screen with ID:", screenId);
        const sql = `
            DELETE FROM agent_screenshots
            WHERE id = ? AND agent_id = ?
        `;
        const rows = await query(sql, [screenId, agentId]);
        return rows;
    },
};