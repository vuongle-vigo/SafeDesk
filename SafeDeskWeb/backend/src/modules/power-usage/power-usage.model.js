const db = require('../../config/db');

async function addSinglePowerUsage(agentId, date, hour, usage_minutes) {
    console.log('Adding power usage:', agentId, date, hour, usage_minutes);
    if (usage_minutes == 0) {
        return;
    }
    
    const checkExisting = await db.query(
        'SELECT * FROM power_usage WHERE agent_id = ? AND date = ? AND hour = ?',
        [agentId, date, hour]
    );

    if (checkExisting.length > 0) {
        const updateResult = await db.query(
            'UPDATE power_usage SET usage_minutes = ? WHERE agent_id = ? AND date = ? AND hour = ?',
            [usage_minutes, agentId, date, hour]
        );
        return updateResult;
    } else {
        const insertResult = await db.query(
            'INSERT INTO power_usage (agent_id, date, hour, usage_minutes) VALUES (?, ?, ?, ?)',
            [agentId, date, hour, usage_minutes]
        );
        return insertResult;
    }
}

async function findPowerUsageByAgentId(agentId) {
    const result = await db.query(
        'SELECT date, hour, usage_minutes FROM power_usage WHERE agent_id = ? ORDER BY date, hour',
        [agentId]
    );
    return result;
}

async function findPowerUsageByTimeRange(agentId, startDate, endDate) {
    const result = await db.query(
        'SELECT date, hour, usage_minutes FROM power_usage WHERE agent_id = ? AND date BETWEEN ? AND ? ORDER BY date, hour',
        [agentId, startDate, endDate]
    );
    return result;
}

module.exports = {
    addSinglePowerUsage,
    findPowerUsageByAgentId,
    findPowerUsageByTimeRange
};