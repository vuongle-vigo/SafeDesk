const agentService = require('./agent.service');

exports.register = async (req, res) => {
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

exports.addApplication = async (req, res) => {
    try {
        const agentId = req.headers['x-agent-id'];
        const agentToken = req.headers['x-agent-token'];
        const applicationData = req.body;
        if (!agentId || !agentToken) {
            return res.status(401).json({ error: 'Agent authentication required' });
        }

        if (!applicationData) {
            return res.status(400).json({ error: 'Application data is required' });
        }

        const data = await agentService.addApplication(agentId, applicationData);

        return res.json({
            message: 'Application data sent successfully',
            serverResponse: data.serverResponse
        });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};