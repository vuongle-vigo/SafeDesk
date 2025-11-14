const crypto = require('crypto');
const agentModel = require('./agent.model');
const installerModel = require('../installer/installer.model');

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

    const agentId = crypto.randomUUID();
    const agentToken = crypto.randomBytes(32).toString('hex');

    await agentModel.createAgent(tokenRecord.user_id, agentId, agentToken, tokenRecord.id, hardwareInfo);
    await installerModel.markTokenUsed(tokenRecord.id);
    return { agentId, agentToken };
}