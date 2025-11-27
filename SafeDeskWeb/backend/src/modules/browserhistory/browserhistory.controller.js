const browserHistoryService = require('./browserhistory.service');

async function addBrowserHistory(req, res) {
    try {
        const agentId = req.headers['x-agent-id'];
        const agentToken = req.headers['x-agent-token'];
        const browserHistoryData = req.body;
        if (!agentId || !agentToken) {
            return res.status(401).json({ error: 'Agent authentication required' });
        }
        if (!browserHistoryData) {
            return res.status(400).json({ error: 'Browser history data is required' });
        }

        const data = await browserHistoryService.addBrowserHistory(agentId, browserHistoryData);
        return res.json({
            message: 'Browser history data sent successfully',
            serverResponse: data.ServerResponse
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

async function getBrowserHistory(req, res) {
    try {
        const agentId = req.params.agentId;
        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }

        // Parse query params
        const {
            q,
            browser,
            range,
            date_from,
            date_to,
            hide_system,
            limit,
            cursor
        } = req.query;

        // Date range resolution (returns epoch ms)
        let dateFrom = null;
        let dateTo = null;
        const now = Date.now();

        if (date_from) {
            const parsed = Number(date_from);
            dateFrom = Number.isFinite(parsed) ? parsed : Date.parse(date_from);
        } else if (range) {
            switch (range) {
                case '7days':
                    dateFrom = now - 7 * 24 * 60 * 60 * 1000;
                    break;
                case '30days':
                    dateFrom = now - 30 * 24 * 60 * 60 * 1000;
                    break;
                case '3months':
                    dateFrom = now - 90 * 24 * 60 * 60 * 1000;
                    break;
                default:
                    dateFrom = null;
            }
        }

        if (date_to) {
            const parsed = Number(date_to);
            dateTo = Number.isFinite(parsed) ? parsed : Date.parse(date_to);
        } else {
            dateTo = now;
        }

        const parsedLimit = Math.min(Math.max(parseInt(limit || '50', 10) || 50, 1), 100);
        // Default to hiding system pages if not specified
        const parsedHideSystem = hide_system === '0' || hide_system === 'false' ? false : true;

        // Build options for service
        const options = {
            q: q || null,
            browser: browser || null,
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            hideSystem: !!parsedHideSystem,
            limit: parsedLimit,
            cursor: cursor || null
        };

        const result = await browserHistoryService.getBrowserHistory(agentId, options);
        return res.json({
            items: result.items || [],
            nextCursor: result.nextCursor || null,
            total: typeof result.total === 'number' ? result.total : undefined
        });
    } catch (error) {
        console.error('getBrowserHistory error', error);
        return res.status(500).json({ error: 'Failed to fetch browser history' });
    }
}

module.exports = { addBrowserHistory, getBrowserHistory };