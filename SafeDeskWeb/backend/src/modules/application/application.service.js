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

module.exports = { addApplication, getApplicationsByAgentId };