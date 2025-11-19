const applicationModel = require('./application.model');
const agentModel = require('../agent/agent.model');

async function addApplication(agentId, applicationData) {
    if (await agentModel.findAgentById(agentId) == null) {
        throw new Error('Invalid agent ID');
    }

    const result = await applicationModel.addApplication(agentId, applicationData);
    return result;  
}

async function getApplicationsByAgentId(agentId) {
    const applications = await applicationModel.findApplicationsByAgentId(agentId);
    return applications;
}

async function getApplicationsUsageByTimeRange(agentId, timeStart, timeEnd) {
    const applicationsUsage = await applicationModel.findApplicationsUsageByTimeRange(agentId, timeStart, timeEnd);
    return applicationsUsage;
}

async function setApplicationLimit(agentId, appId, dailyLimitMinutes) {
    if (await agentModel.findAgentById(agentId) == null) {
        throw new Error('Invalid agent ID');
    }

    const result = await applicationModel.updateApplicationLimit(appId, dailyLimitMinutes);
    return result;
}

async function updateApplicationStatus(agentId, appId, status) {
    if (await agentModel.findAgentById(agentId) == null) {
        throw new Error('Invalid agent ID');
    }

    const result = await applicationModel.updateApplicationStatus(appId, status);
    return result;
}

module.exports = { addApplication, getApplicationsByAgentId, getApplicationsUsageByTimeRange, 
    setApplicationLimit, updateApplicationStatus };