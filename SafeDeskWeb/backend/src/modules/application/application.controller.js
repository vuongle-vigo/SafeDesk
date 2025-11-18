const applicationService = require('../application/application.service');

async function getApplicationsByAgentId(req, res) {
    const agentId = req.params.agentId;
    try {
        const applications = await applicationService.getApplicationsByAgentId(agentId);
        return res.json({
            applications: applications
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function addApplication(req, res) {
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

        const data = await applicationService.addApplication(agentId, applicationData);

        return res.json({
            message: 'Application data sent successfully',
            serverResponse: data.serverResponse
        });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


module.exports = { getApplicationsByAgentId, addApplication };