const { query } = require('../../config/db');

async function createAgent(userId, agentId, agentToken, installerTokenId, hardwareInfo) {
    const result = await query(
        'INSERT INTO agents (agent_id, user_id, agent_token, installer_token_id, guid, os, hostname) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [agentId, userId, agentToken, installerTokenId, hardwareInfo.guid, hardwareInfo.os, hardwareInfo.hostname]
    );
    return result;
}

async function findAgentByGuid(guid) {
    const result = await query(
        'SELECT * FROM agents WHERE guid = ?',
        [guid]
    );
    return result[0];
}

async function findAgentByInstallerToken(installerTokenId) {
    const result = await query(
        'SELECT * FROM agents WHERE installer_token_id = ?',
        [installerTokenId]
    );
    return result[0];
}

async function findAgentById(agentId) {
    const result = await query(
        'SELECT * FROM agents WHERE agent_id = ?',
        [agentId]
    );
    return result[0];
}
        
async function findAllAgentsByUserId(userId) {
    const result = await query(
        'SELECT agent_id, guid, os, hostname, last_activity FROM agents WHERE user_id = ?',
        [userId]
    );
    return result;
}

async function findAgentsStatusByUserId(userId) {
    const result = await query(
        `
        SELECT 
            agent_id,
            last_activity,
            CASE 
                WHEN TIMESTAMPDIFF(MINUTE, last_activity, NOW()) <= 2 
                    THEN 'online'
                ELSE CONCAT('last active at ', DATE_FORMAT(last_activity, '%Y-%m-%d %H:%i:%s'))
            END AS status
        FROM agents
        WHERE user_id = ?
        `,
        [userId]
    );

    return result;
}


async function updateAgentLastActivity(agentId) {
    const result = await query(
        'UPDATE agents SET last_activity = NOW() WHERE agent_id = ?',
        [agentId]
    );
    return result;
}

async function findAgentOnlineStatus(agentId) {
    const result = await query(
        `
        SELECT 
            CASE 
                WHEN TIMESTAMPDIFF(MINUTE, last_activity, NOW()) <= 2 
                    THEN 'online'
                ELSE last_activity
            END AS status
        FROM agents
        WHERE agent_id = ?
        LIMIT 1
        `,
        [agentId]
    );

    if (result.length === 0) {
        return null; 
    }

    return result[0].status;
}


module.exports = { createAgent, findAgentByInstallerToken, findAgentById, 
    findAgentByGuid, findAllAgentsByUserId, findAgentsStatusByUserId, updateAgentLastActivity, findAgentOnlineStatus };