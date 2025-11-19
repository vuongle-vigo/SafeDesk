const processUsageModel = require('./process-usage.model');
const agentModel = require('../agent/agent.model');

async function addProcessUsage(agentId, processUsageData) {
    if (await agentModel.findAgentById(agentId) == null) {
        throw new Error('Invalid agent ID');
    }

    for (const entry of processUsageData) {
        if (entry.time_usage == 0 || !entry.process_title || !entry.process_path) {
            continue;
        }

        const process_location = entry.process_path.substring(0, entry.process_path.lastIndexOf('\\')) || '';
        await processUsageModel.addSingleProcessUsage(agentId, entry.process_title, entry.process_path, process_location, entry.date_recorded, entry.start_time, entry.time_usage);
    }

    return {ServerResponse: "Success"};
}

async function getProcessUsageByAgentId(agentId) {
    const processUsage = await processUsageModel.findProcessUsageByAgentId(agentId);
    return processUsage;
}

async function getProcessUsageByTimeRange(agentId, timeStart, timeEnd) {
    const processUsage = await processUsageModel.findProcessUsageByTimeRange(agentId, timeStart, timeEnd);
    return processUsage;
}

module.exports = {
    addProcessUsage,
    getProcessUsageByAgentId,
    getProcessUsageByTimeRange
};