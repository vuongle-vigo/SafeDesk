const { query } = require('../../config/db');

module.exports = async function agentMiddleware(req, res, next) {
    try {
        const agentToken = req.headers['x-agent-token'];
        const agentId = req.headers['x-agent-id'];

        if (!agentToken || !agentId) {
            return res.status(401).json({ error: 'Agent token and ID are required' });
        }

        const { rows } = await query(
            `SELECT * FROM agents WHERE agent_id = ? AND agent_token = ?`,
            [agentId, agentToken]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid agent token or ID' });
        }

        req.agent = rows[0];
        query(
                `UPDATE agents SET last_activity = NOW(), status = 'online'
                WHERE agent_id = ?`,
                [agentId]
            ).catch(() => {});
        next();
    } catch (error) {
        console.error('Error in agent middleware:', error);
        return res.status(500).json({ error: 'Server error in agentAuth' });
    }
};