const { query } = require('../../config/db');

async function getAppPoliciesByAgentId(agentId) {
    const result = await query(
        `SELECT p.*
            FROM app_policies p
            JOIN installed_apps a ON a.id = p.installed_app_id
            WHERE a.agent_id = ?;
            `,
        [agentId]
    );
    return result;
}

async function getAppPoliciesFromAgent(agentId) {
    const result = await query(
        `SELECT p.*, a.install_location
            FROM app_policies p
            JOIN installed_apps a ON a.id = p.installed_app_id
            WHERE a.agent_id = ?;
        `,
        [agentId]
    );
    return result;
}

async function updateAppPoliciesByAppId(installed_app_id, is_blocked, limit_enabled, limit_minutes, action_on_limit, warn_interval) {
    const sql = `
        INSERT INTO app_policies 
            (installed_app_id, is_blocked, limit_enabled, limit_minutes, 
             action_on_limit, warn_interval, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            is_blocked = VALUES(is_blocked),
            limit_enabled = VALUES(limit_enabled),
            limit_minutes = VALUES(limit_minutes),
            action_on_limit = VALUES(action_on_limit),
            warn_interval = VALUES(warn_interval),
            updated_at = NOW()
    `;
    const params = [
        installed_app_id, is_blocked, limit_enabled, limit_minutes, action_on_limit, warn_interval
    ];

    const result = await query(sql, params);
    return result;
}



module.exports = { getAppPoliciesByAgentId, updateAppPoliciesByAppId, getAppPoliciesFromAgent };