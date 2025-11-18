const powerUsageModel = require('./power-usage.model');
const agentModel = require('../agent/agent.model');

async function addPowerUsage(agentId, powerUsageData) {
    if (await agentModel.findAgentById(agentId) == null) {
        throw new Error('Invalid agent ID');
    }
    
    for (const entry of powerUsageData) {
        await powerUsageModel.addSinglePowerUsage(agentId, entry.date, entry.hour, entry.usage_minutes);
    }

    return {ServerResponse: "Success"};
}

async function getPowerUsageByAgentId(agentId) {
    const powerUsage = await powerUsageModel.findPowerUsageByAgentId(agentId);
    return powerUsage;
}

async function getPowerUsageByTimeRange(agentId, startDate, endDate) {
    const powerUsage = await powerUsageModel.findPowerUsageByTimeRange(agentId, startDate, endDate);
    return powerUsage;
}

module.exports = { addPowerUsage, getPowerUsageByAgentId, getPowerUsageByTimeRange };