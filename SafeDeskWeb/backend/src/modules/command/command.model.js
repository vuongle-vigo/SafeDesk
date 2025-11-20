const { query } = require('../../config/db');

async function findCommandsPending(agentId) {
    const result = await query(
        'SELECT id, command_type, command_params FROM agent_commands WHERE agent_id = ? AND status = ? ORDER BY created_at ASC',
        [agentId, 'pending']
    );
    return result;
}

async function addCommand(agentId, commandType, commandParams) {
    const result = await query(
        'INSERT INTO agent_commands (agent_id, command_type, command_params, status) VALUES (?, ?, ?, ?)',
        [agentId, commandType, commandParams, 'pending']
    );
    return { id: result.insertId, agentId, commandType, commandParams, status: 'pending' };
}

async function updateCommandStatus(commandId, status) {
    console.log(`Updating command ID ${commandId} to status: ${status}`);
    const result = await query(
        'UPDATE agent_commands SET status = ? WHERE id = ?',
        [status, commandId]
    );
    return result;
}

module.exports = { findCommandsPending, addCommand, updateCommandStatus };