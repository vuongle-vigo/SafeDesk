const agentService = require('./agent.service');

async function register(req, res) {
    try {
        console.log('Agent registration request received');
        const installerToken = req.headers['x-installer-token'];
        const hardwareInfo = req.body.hardwareInfo;
        console.log('Registering agent with hardware info:', hardwareInfo);
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

async function uninstall(req, res) {
    const agentId = req.headers['x-agent-id'];
    try {
        await agentService.uninstallAgent(agentId);
        return res.json({
            message: 'Uninstall command sent to agent successfully'
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

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

async function getAgentOnlineStatus(req, res) {
    const agentId = req.params.agentId;
    try {
        const status = await agentService.checkAgentOnlineStatus(agentId);
        return res.json({   
            agentId: agentId,
            status: status
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}


module.exports = { register, uninstall,getAllAgents, getAgentStatus, getAgentOnlineStatus };