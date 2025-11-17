const db = require('../../config/db');

async function addSinglePowerUsage(agentId, date, hour, usage_minutes) {
    console.log('Adding power usage:', agentId, date, hour, usage_minutes);
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

module.exports = {
    addSinglePowerUsage
};