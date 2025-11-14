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