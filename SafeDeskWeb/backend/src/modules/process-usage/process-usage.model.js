const db = require('../../config/db');

async function addSingleProcessUsage(agentId, processTitle, processPath, dateRecorded, startTime, timeUsage) {
    if (timeUsage == 0 || !processTitle || !processPath) {
        return;
    }
     
    const insertResult = await db.query(
        `INSERT INTO process_usage (agent_id, process_title, process_path, date_recorded, start_time, time_usage) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            process_path = VALUES(process_path),
            time_usage = VALUES(time_usage)`,
        [agentId, processTitle, processPath, dateRecorded, startTime, timeUsage]
    );
    return insertResult;
}

module.exports = {
    addSingleProcessUsage
};