const db = require('../../config/db');

// Chrome stores timestamps as microseconds since 1601-01-01 (Windows filetime / WebKit epoch)
// Offset between Unix epoch (1970-01-01) and Windows epoch (1601-01-01) in microseconds
const WEBKIT_EPOCH_OFFSET = 11644473600000000;

function unixMsToWebkit(unixMs) {
    return (unixMs * 1000) + WEBKIT_EPOCH_OFFSET;
}

function webkitToUnixMs(webkit) {
    return Math.floor((webkit - WEBKIT_EPOCH_OFFSET) / 1000);
}

function escapeString(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

async function addSingleBrowserHistory(agentId, url, title, visit_count, typed_count, last_visit_time, hidden, browser_name) {
    const insertResult = await db.query(
        'INSERT INTO browser_history (agent_id, url, title, visit_count, typed_count, last_visit_time, hidden, browser_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [agentId, url, title, visit_count, typed_count, last_visit_time, hidden, browser_name]
    );
    return insertResult;
}

async function getBrowserHistory(options = {}) {
    const {
        agentId,
        q = null,
        browser = null,
        dateFrom = null,
        dateTo = null,
        hideSystem = false,
        limit = 50,
        cursor = null
    } = options;

    if (!agentId) {
        throw new Error('agentId is required for getBrowserHistory');
    }

    const parsedLimit = Math.min(Math.max(parseInt(String(limit || 50), 10) || 50, 1), 200);

    const conditions = [];

    conditions.push(`agent_id = ${escapeString(agentId)}`);

    if (q && q.trim()) {
        const searchPattern = `%${q.trim()}%`;
        conditions.push(`(url LIKE ${escapeString(searchPattern)} OR title LIKE ${escapeString(searchPattern)})`);
    }

    if (browser) {
        conditions.push(`browser_name = ${escapeString(browser)}`);
    }

    if (dateFrom !== null && Number.isFinite(dateFrom)) {
        const webkitFrom = unixMsToWebkit(dateFrom);
        conditions.push(`last_visit_time >= ${webkitFrom}`);
    }
    if (dateTo !== null && Number.isFinite(dateTo)) {
        const webkitTo = unixMsToWebkit(dateTo);
        conditions.push(`last_visit_time <= ${webkitTo}`);
    }

    if (hideSystem) {
        conditions.push("url NOT LIKE 'chrome://%'");
        conditions.push("url NOT LIKE 'edge://%'");
        conditions.push("url NOT LIKE 'about:%'");
        conditions.push("url NOT LIKE 'file://%'");
    }

    if (cursor && cursor.lastVisitTime && cursor.lastId) {
        const cursorTimeWebkit = unixMsToWebkit(cursor.lastVisitTime);
        const cursorId = parseInt(cursor.lastId, 10);
        if (Number.isFinite(cursorTimeWebkit) && Number.isFinite(cursorId)) {
            conditions.push(`(last_visit_time < ${cursorTimeWebkit} OR (last_visit_time = ${cursorTimeWebkit} AND id < ${cursorId}))`);
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
        SELECT id, agent_id, url, title, visit_count, typed_count, last_visit_time, hidden, browser_name, created_at
        FROM browser_history
        ${whereClause}
        ORDER BY last_visit_time DESC, id DESC
        LIMIT ${parsedLimit}
    `;

    try {
        const rows = await db.query(sql);
        return rows;
    } catch (err) {
        console.error('getBrowserHistory query failed', { sql: sql.trim(), err: err && err.message ? err.message : err });
        throw err;
    }
}

async function countBrowserHistory(options = {}) {
    const {
        agentId,
        q = null,
        browser = null,
        dateFrom = null,
        dateTo = null,
        hideSystem = false
    } = options;

    if (!agentId) {
        throw new Error('agentId is required for countBrowserHistory');
    }

    const conditions = [];

    conditions.push(`agent_id = ${escapeString(agentId)}`);

    if (q && q.trim()) {
        const searchPattern = `%${q.trim()}%`;
        conditions.push(`(url LIKE ${escapeString(searchPattern)} OR title LIKE ${escapeString(searchPattern)})`);
    }

    if (browser) {
        conditions.push(`browser_name = ${escapeString(browser)}`);
    }

    if (dateFrom !== null && Number.isFinite(dateFrom)) {
        const webkitFrom = unixMsToWebkit(dateFrom);
        conditions.push(`last_visit_time >= ${webkitFrom}`);
    }
    if (dateTo !== null && Number.isFinite(dateTo)) {
        const webkitTo = unixMsToWebkit(dateTo);
        conditions.push(`last_visit_time <= ${webkitTo}`);
    }

    if (hideSystem) {
        conditions.push("url NOT LIKE 'chrome://%'");
        conditions.push("url NOT LIKE 'edge://%'");
        conditions.push("url NOT LIKE 'about:%'");
        conditions.push("url NOT LIKE 'file://%'");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) as total FROM browser_history ${whereClause}`;

    try {
        const rows = await db.query(sql);
        const total = Array.isArray(rows) && rows[0] ? Number(rows[0].total || rows[0]['COUNT(*)'] || 0) : 0;
        return total;
    } catch (err) {
        console.error('countBrowserHistory query failed', { sql: sql.trim(), err: err && err.message ? err.message : err });
        throw err;
    }
}

module.exports = { addSingleBrowserHistory, getBrowserHistory, countBrowserHistory };
