const appPoliciesModel = require('./app-policies.model');
const applicationModel = require('../application/application.model');

async function getAppPoliciesByAgentId(agentId) {
    const appPolicies = await appPoliciesModel.getAppPoliciesByAgentId(agentId);
    return appPolicies;
}

async function getAppPoliciesFromAgent(agentId) {
    const appPolicies = await appPoliciesModel.getAppPoliciesFromAgent(agentId);
    return appPolicies;
}

async function updateAppPoliciesByAppId(agentId, installed_app_id, is_blocked, limit_enabled, limit_minutes, action_on_limit, warn_interval) {
    if (await applicationModel.checkHasApp(agentId, installed_app_id) == null) {
        throw new Error('Invalid agent ID or app ID');
    }

    const result = await appPoliciesModel.updateAppPoliciesByAppId(installed_app_id, is_blocked, limit_enabled, limit_minutes, action_on_limit, warn_interval);
    return result;
}

module.exports = { getAppPoliciesByAgentId, updateAppPoliciesByAppId, getAppPoliciesFromAgent };