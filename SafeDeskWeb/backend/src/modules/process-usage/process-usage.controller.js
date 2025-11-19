const processUsageService = require('./process-usage.service');

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
        const data = await processUsageService.addProcessUsage(agentId, processUsageData);
        return res.json({
            message: 'Process usage data sent successfully',
            serverResponse: data.serverResponse
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

async function getProcessUsageByAgentId(req, res) {
    const agentId = req.params.agentId;
    try {
        const processUsage = await processUsageService.getProcessUsageByAgentId(agentId);
        return res.json({
            processUsage: processUsage
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function getProcessUsageByTimeRange(req, res) {
    const agentId = req.params.agentId;
    const timeStart = req.params.timeStart;
    const timeEnd = req.params.timeEnd;
    try {
        const processUsage = await processUsageService.getProcessUsageByTimeRange(agentId, timeStart, timeEnd);
        return res.json({
            processUsage: processUsage
        });
    } catch (error) {
        console.debug("Error in getProcessUsageByTimeRange:", error);
        return res.status(400).json({ error: error.message });
    }
}

module.exports = { addProcessUsage, getProcessUsageByAgentId, getProcessUsageByTimeRange };