const appPoliciesService = require('./app-policies.service');

async function getAppPoliciesByAgentId(req, res) {
    try {    
        const agentId = req.params.agentId;
        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }

        const appPolicies = await appPoliciesService.getAppPoliciesByAgentId(agentId);
        return res.json(appPolicies);
    } catch (error) {
        console.error('Failed to get app policies:', error);
        return res.status(400).json({ error: error.message });
    }
}

async function updateAppPoliciesByAppId(req, res) {
    try {
        const agentId = req.params.agentId;
        const {
            installed_app_id,
            is_blocked,
            limit_enabled,
            limit_minutes,
            action_on_limit,
            warn_interval
        } = req.body;

        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }

        const requiredFields = {
            installed_app_id,
            is_blocked,
            limit_enabled,
            limit_minutes,
            action_on_limit,
            warn_interval
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                console.error(`Missing field: ${key}`);
                return res.status(400).json({ error: `Missing field: ${key}` });
            }
        }

        const result = await appPoliciesService.updateAppPoliciesByAppId(
            agentId,
            installed_app_id,
            is_blocked,
            limit_enabled,
            limit_minutes,
            action_on_limit,
            warn_interval
        );

        return res.json({
            message: 'App policies updated successfully',
            updatedPolicies: result
        });

    } catch (error) {
        console.error('Failed to update app policies:', error);
        return res.status(500).json({ error: error.message });
    }
}


module.exports = { getAppPoliciesByAgentId, updateAppPoliciesByAppId };