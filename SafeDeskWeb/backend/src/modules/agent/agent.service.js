const crypto = require('crypto');
const agentModel = require('./agent.model');
const installerModel = require('../installer/installer.model');
const applicationModel = require('../application/application.model');
const powerUsageModel = require('../power-usage/power-usage.model');
const processUsageModel = require('../process-usage/process-usage.model');
const { ServerResponse } = require('http');

exports.registerAgent = async (installerToken, hardwareInfo) => {
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

exports.addApplication = async (agentId, applicationData) => {
    if (await agentModel.findAgentById(agentId) == null) {
        throw new Error('Invalid agent ID');
    }

    const result = await applicationModel.addApplication(agentId, applicationData);
    return result;  
}

exports.addPowerUsage = async (agentId, powerUsageData) => {
    if (await agentModel.findAgentById(agentId) == null) {
        throw new Error('Invalid agent ID');
    }
    
    for (const entry of powerUsageData) {
        await powerUsageModel.addSinglePowerUsage(agentId, entry.date, entry.hour, entry.usage_minutes);
    }

    return {ServerResponse: "Success"};
}

exports.addProcessUsage = async (agentId, processUsageData) => {
    if (await agentModel.findAgentById(agentId) == null) {
        throw new Error('Invalid agent ID');
    }

    for (const entry of processUsageData) {
        await processUsageModel.addSingleProcessUsage(agentId, entry.process_title, entry.process_path, entry.date_recorded, entry.start_time, entry.time_usage);
    }

    return {ServerResponse: "Success"};
}