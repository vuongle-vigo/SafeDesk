const dailyPoliciesModel = require('./daily-policies.model');

async function getDailyPoliciesFromAgent(agentId) {
    const dailyPolicies = await dailyPoliciesModel.getDailyPoliciesFromAgent(agentId);
    return dailyPolicies;
}

async function getDailyPoliciesByAgentId(agentId) {
    const dailyPolicies = await dailyPoliciesModel.getDailyPoliciesByAgentId(agentId);
    return dailyPolicies;
}

async function updateDailyPolicies(agentId, policyId, enabled, allowed_hours) {
    const result = await dailyPoliciesModel.updateDailyPolicies(agentId, policyId, enabled, allowed_hours);
    return result;
}

async function updateDailyPolicyActions(agentId, warn_on_exceed, shutdown_on_exceed) {
    const result = await dailyPoliciesModel.updateDailyPolicyActions(agentId, warn_on_exceed, shutdown_on_exceed);
    return result;
}

module.exports = { getDailyPoliciesByAgentId, updateDailyPolicies, updateDailyPolicyActions, getDailyPoliciesFromAgent };