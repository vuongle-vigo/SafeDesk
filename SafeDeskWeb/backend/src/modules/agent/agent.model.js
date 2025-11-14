const { query } = require('../../config/db');

async function createAgent(userId, agentId, agentToken, installerTokenId, hardwareInfo) {
    const result = await query(
        'INSERT INTO agents (agent_id, user_id, agent_token, installer_token_id, guid, os, hostname) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [agentId, userId, agentToken, installerTokenId, hardwareInfo.guid, hardwareInfo.os, hardwareInfo.hostname]
    );
    return result;
}

async function findAgentByInstallerToken(installerTokenId) {
    const result = await query(
        'SELECT * FROM agents WHERE installer_token_id = ?',
        [installerTokenId]
    );
    return result[0];
}

module.exports = { createAgent, findAgentByInstallerToken };