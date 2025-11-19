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

async function getApplicationsUsageByTimeRange(req, res) {
    const agentId = req.params.agentId;
    const timeStart = req.params.timeStart;
    const timeEnd = req.params.timeEnd;
    try {
        const applicationsUsage = await applicationService.getApplicationsUsageByTimeRange(agentId, timeStart, timeEnd);
        return res.json({
            applicationsUsage: applicationsUsage
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }   
}

async function getTopApplicationsByTimeRange(req, res) {
    const agentId = req.params.agentId;
    const timeStart = req.params.timeStart;
    const timeEnd = req.params.timeEnd;

    try {
        let applicationsUsage = await applicationService.getApplicationsUsageByTimeRange(
            agentId, timeStart, timeEnd
        );

        // remove null total_usage
        applicationsUsage = applicationsUsage.filter(app => app.total_usage != null);

        const topApplications = applicationsUsage
            .sort((a, b) => b.total_usage - a.total_usage)
            .slice(0, 5);

        return res.json({ topApplications });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function setApplicationLimit(req, res) {
    const agentId = req.params.agentId;
    const { appId, limitMinutes } = req.body;

    try {
        const result = await applicationService.setApplicationLimit(agentId, appId, limitMinutes);
        return res.json({
            message: 'Application limit set successfully',
            result: result
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function updateApplicationStatus(req, res) {
    const agentId = req.params.agentId;
    const { appId, status } = req.body;
    try {
        const result = await applicationService.updateApplicationStatus(agentId, appId, status);
        return res.json({
            message: 'Application status updated successfully',
            result: result
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = { getApplicationsByAgentId, addApplication, getApplicationsUsageByTimeRange, getTopApplicationsByTimeRange, setApplicationLimit, updateApplicationStatus  };