const crypto = require('crypto');
const agentModel = require('./agent.model');
const installerModel = require('../installer/installer.model');
const applicationModel = require('../application/application.model');
const powerUsageModel = require('../power-usage/power-usage.model');
const processUsageModel = require('../process-usage/process-usage.model');
const { ServerResponse, get } = require('http');

async function registerAgent(installerToken, hardwareInfo) {
    const tokenRecord = await installerModel.findInstallerToken(installerToken);
    if (!tokenRecord) {
        throw new Error('Invalid installer token');
    }

    if (tokenRecord.used) {
        const existingAgent = await agentModel.findAgentByInstallerToken(tokenRecord.id);
        if (!existingAgent) {
            throw new Error('Installer token has already been used');
        }

        return {
            agentId: existingAgent.agent_id,
            agentToken: existingAgent.agent_token
        };
    }

    const existingAgentByGuid = await agentModel.findAgentByGuid(hardwareInfo.guid);
    if (existingAgentByGuid) {
        return {
            agentId: existingAgentByGuid.agent_id,
            agentToken: existingAgentByGuid.agent_token
        };
    }

    const agentId = crypto.randomUUID();
    const agentToken = crypto.randomBytes(32).toString('hex');

    await agentModel.createAgent(tokenRecord.user_id, agentId, agentToken, tokenRecord.id, hardwareInfo);
    await installerModel.markTokenUsed(tokenRecord.id);
    return { agentId, agentToken };
}

async function getAllAgents(userId) {
    const agents = await agentModel.findAllAgentsByUserId(userId);
    return agents;
}

async function getAgentsStatus(userId) {
    const agents_status = await agentModel.findAgentsStatusByUserId(userId);
    return agents_status;
}



module.exports = { registerAgent, getAllAgents, getAgentsStatus };