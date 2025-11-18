const agentService = require('./agent.service');

async function register(req, res) {
    try {
        const installerToken = req.headers['x-installer-token'];
        const hardwareInfo = req.body.hardwareInfo;

        if (!installerToken) {
            return res.status(400).json({ error: 'Installer token is required' });
        }

        const data = await agentService.registerAgent(installerToken, hardwareInfo);

        return res.json({
            message: 'Agent registered successfully',
            agentId: data.agentId,
            agentToken: data.agentToken
        });
        
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

async function getAllAgents(req, res) {
    const userId = req.user.user_id;
    try {
        const agents = await agentService.getAllAgents(userId);
        return res.json({
            agents: agents
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }   
}

async function getAgentStatus(req, res) {
    const userId = req.user.user_id;
    try {
        const agents_status = await agentService.getAgentsStatus(userId);
        return res.json({
            agentsStatus: agents_status
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}





async function addProcessUsage(req, res){
    try {
        const agentId = req.headers['x-agent-id'];
        const agentToken = req.headers['x-agent-token'];
        const processUsageData = req.body;
        if (!agentId || !agentToken) {
            return res.status(401).json({ error: 'Agent authentication required' });
        }

        if (!processUsageData) {
            return res.status(400).json({ error: 'Process usage data is required' });
        }
        
        const data = await agentService.addProcessUsage(agentId, processUsageData);
        return res.json({
            message: 'Process usage data sent successfully',
            serverResponse: data.serverResponse
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = { register, getAllAgents, addProcessUsage, getAgentStatus };