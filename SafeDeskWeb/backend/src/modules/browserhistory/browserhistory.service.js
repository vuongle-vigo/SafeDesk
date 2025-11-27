const agentModel = require('../agent/agent.model');
const browserHistoryModel = require('./browserhistory.model');

async function addBrowserHistory(agentId, browserHistoryData) {
    try {
        await agentModel.findAgentById(agentId);
    } catch {
        throw new Error('Invalid agent ID');
    }   

    for (const entry of browserHistoryData) {
        await browserHistoryModel.addSingleBrowserHistory(
            agentId,
            entry.url,
            entry.title,
            entry.visit_count,
            entry.typed_count,
            entry.last_visit_time,
            entry.hidden,
            entry.browser_name
        );
    }

    return { ServerResponse: "Success" };
};

async function getBrowserHistory(agentId, options = {}) {
    const {
        q = null,
        browser = null,
        dateFrom = null, // epoch ms
        dateTo = null,   // epoch ms
        hideSystem = true,
        limit = 50,
        cursor = null
    } = options;
    console.log('getBrowserHistory called with options:', options);
    // validate agent exists
    try {
        await agentModel.findAgentById(agentId);
    } catch {
        throw new Error('Invalid agent ID');
    }

    const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    // Fetch one extra to detect next page
    const fetchLimit = parsedLimit + 1;

    // Decode cursor if provided (expects base64 JSON: { lastVisitTime, lastId })
    let cursorObj = null;
    if (cursor) {
        try {
            const decoded = Buffer.from(cursor, 'base64').toString('utf8');
            cursorObj = JSON.parse(decoded);
        } catch (err) {
            // ignore invalid cursor - treat as no cursor
            cursorObj = null;
        }
    }

    // Build query options for model - model should implement filtering, ordering by last_visit_time DESC, id DESC
    const queryOptions = {
        agentId,
        q,
        browser,
        dateFrom,
        dateTo,
        hideSystem,
        limit: fetchLimit,
        cursor: cursorObj // model should use (lastVisitTime, lastId) tuple for keyset pagination
    };

    // Expect model to return rows sorted by last_visit_time desc
    const rows = await browserHistoryModel.getBrowserHistory(queryOptions);
    const hasMore = rows.length > parsedLimit;
    const items = hasMore ? rows.slice(0, parsedLimit) : rows;

    let nextCursor = null;
    if (hasMore && items.length > 0) {
        const last = items[items.length - 1];
        const next = {
            lastVisitTime: Number(last.last_visit_time), // epoch ms
            lastId: last.id
        };
        nextCursor = Buffer.from(JSON.stringify(next)).toString('base64');
    }

    // Optional: try to get total count when no cursor provided (may be expensive)
    let total;
    try {
        if (!cursor) {
            total = await browserHistoryModel.countBrowserHistory({
                agentId,
                q,
                browser,
                dateFrom,
                dateTo,
                hideSystem
            });
        }
    } catch (err) {
        total = undefined;
    }

    return {
        items,
        nextCursor,
        total
    };
}

module.exports = { addBrowserHistory, getBrowserHistory };