const db = require('../../config/db');

async function addSingleProcessUsage(agentId, processTitle, processPath, processLocation, dateRecorded, startTime, timeUsage) {
    if (timeUsage < 1 || !processTitle || !processPath) {
        return;
    }
     
    const insertResult = await db.query(
        `INSERT INTO process_usage (agent_id, process_title, process_path, process_location, date_recorded, start_time, time_usage) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            process_path = VALUES(process_path),
            process_location = VALUES(process_location),
            time_usage = VALUES(time_usage)`,
        [agentId, processTitle, processPath, processLocation, dateRecorded, startTime, timeUsage]
    );
    return insertResult;
}

async function findProcessUsageByAgentId(agentId) {
    const result = await db.query(
        'SELECT * FROM process_usage WHERE agent_id = ? ORDER BY date_recorded DESC, start_time DESC',
        [agentId]
    );
    return result;
}

async function findProcessUsageByTimeRange(agentId, timeStart, timeEnd) {
    const sql = `
        SELECT 
            pu.*,
            ia.app_name,
            ia.version,
            ia.publisher,
            ia.install_location,
            ia.icon_base64
        FROM process_usage pu
        LEFT JOIN installed_apps ia
            ON pu.agent_id = ia.agent_id
            AND pu.process_location = ia.install_location
        WHERE pu.agent_id = ?
          AND pu.date_recorded BETWEEN ? AND ?
        ORDER BY pu.date_recorded ASC, pu.start_time ASC
    `;
    const result = await db.query(sql, [agentId, timeStart, timeEnd]);
    return result;
}
    
module.exports = {
    addSingleProcessUsage,
    findProcessUsageByAgentId,
    findProcessUsageByTimeRange
};