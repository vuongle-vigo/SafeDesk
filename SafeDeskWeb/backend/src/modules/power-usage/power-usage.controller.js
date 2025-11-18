const powerUsageService = require('./power-usage.service');


async function addPowerUsage(req, res) {
    try {
        const agentId = req.headers['x-agent-id'];
        const agentToken = req.headers['x-agent-token'];
        const powerUsageData = req.body;
        if (!agentId || !agentToken) {
            return res.status(401).json({ error: 'Agent authentication required' });
        }

        if (!powerUsageData) {
            return res.status(400).json({ error: 'Power usage data is required' });
        }

        const data = await powerUsageService.addPowerUsage(agentId, powerUsageData);

        return res.json({
            message: 'Power usage data sent successfully',
            serverResponse: data.serverResponse
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

async function getPowerUsageByAgentId(req, res) {
    const agentId = req.params.agentId;
    try {
        const powerUsage = await powerUsageService.getPowerUsageByAgentId(agentId);
        return res.json({
            powerUsage: powerUsage
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function getPowerUsageByTimeRange(req, res) {
    const agentId = req.params.agentId;
    const timeStart = req.params.timeStart;
    const timeEnd = req.params.timeEnd;
    try {
        const powerUsage = await powerUsageService.getPowerUsageByTimeRange(agentId, timeStart, timeEnd);
        return res.json({
            powerUsage: powerUsage
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = { addPowerUsage, getPowerUsageByAgentId, getPowerUsageByTimeRange };