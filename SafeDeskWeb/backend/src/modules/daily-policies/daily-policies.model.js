const { query } = require('../../config/db');

async function getDailyPoliciesFromAgent(agentId) {
    const result = await query(`SELECT * FROM daily_usage_policies WHERE agent_id = ? AND enabled = 1;`, [agentId]);
    return result;
}

async function getDailyPoliciesByAgentId(agentId) {
    const result = await query(`SELECT * FROM daily_usage_policies WHERE agent_id = ?;`, [agentId]);
    return result;
}

async function updateDailyPolicies(agentId, policyId, enabled, allowed_hours) {
    const sql = `UPDATE daily_usage_policies 
                 SET enabled = ?, allowed_hours = ?, updated_at = NOW()
                 WHERE agent_id = ? AND id = ?`;
    const params = [enabled, JSON.stringify(allowed_hours), agentId, policyId];
    const result = await query(sql, params);
    return result;
}

async function updateDailyPolicyActions(agentId, warn_on_exceed, shutdown_on_exceed) {
    const sql = `UPDATE daily_usage_policies 
                 SET warn_on_exceed = ?, shutdown_on_exceed = ?, updated_at = NOW()
                    WHERE agent_id = ?`;
    const params = [warn_on_exceed, shutdown_on_exceed, agentId];
    const result = await query(sql, params);
    return result;
}

module.exports = { getDailyPoliciesFromAgent, getDailyPoliciesByAgentId, updateDailyPolicies, updateDailyPolicyActions };