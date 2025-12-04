const dailyPoliciesService = require('./daily-policies.service');

async function getDailyPoliciesFromAgent(req, res) {
    try {
        const agentId = req.headers['x-agent-id'];
        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }
        const dailyPolicies = await dailyPoliciesService.getDailyPoliciesFromAgent(agentId);
        return res.json(dailyPolicies);
    }
    catch (error) {
        console.error('Failed to get daily policies from agent:', error);
        return res.status(400).json({ error: error.message });
    }   
}

async function getDailyPoliciesByAgentId(req, res) {
    try {    
        const agentId = req.params.agentId;
        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }

        const dailyPolicies = await dailyPoliciesService.getDailyPoliciesByAgentId(agentId);
        return res.json(dailyPolicies);
    }
    catch (error) {
        console.error('Failed to get daily policies:', error);
        return res.status(400).json({ error: error.message });
    }
}

async function updateDailyPolicies(req, res) {
    try {
        const agentId = req.params.agentId;
        const policyId = req.params.policyId;
        const { enabled, allowed_hours, limit_daily_minutes } = req.body;
        if (!agentId || !policyId) {
            return res.status(400).json({ error: 'Agent ID and Policy ID are required' });
        }

        const dailyPolicies = await dailyPoliciesService.updateDailyPolicies(agentId, policyId, enabled, allowed_hours, limit_daily_minutes);
        return res.json({
            message: 'Daily policy updated successfully',
            dailyPolicies: dailyPolicies
        });
    }
    catch (error) {
        console.error('Failed to update daily policies:', error);
        return res.status(400).json({ error: error.message });
    }   
}

async function updateDailyPolicyActions(req, res) {
    try {
        const agentId = req.params.agentId;
        console.log('body', req.body);
        const { warn_on_exceed, shutdown_on_exceed } = req.body;
        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }
        const dailyPolicies = await dailyPoliciesService.updateDailyPolicyActions(agentId, warn_on_exceed, shutdown_on_exceed);
        return res.json({
            message: 'Daily policy actions updated successfully',
            dailyPolicies: dailyPolicies
        });
    }
    catch (error) {
        console.error('Failed to update daily policy actions:', error);
        return res.status(400).json({ error: error.message });
    }       
}

module.exports = { getDailyPoliciesByAgentId, updateDailyPolicies, updateDailyPolicyActions, getDailyPoliciesFromAgent };