const { query } = require('../../config/db');

async function generateInstallerToken(userId, token, expireAt) {
    const result = await query(
        'INSERT INTO installer_tokens (token, user_id, expire_at) VALUES (?, ?, ?)',
        [token, userId, expireAt]
    );
    return result;
}

async function findInstallerToken(token) {
    const result = await query(
        'SELECT * FROM installer_tokens WHERE token = ? AND expire_at > NOW()',
        [token]
    );
    return result[0];
}

async function markTokenUsed(tokenId) {
    const result = await query(
        'UPDATE installer_tokens SET used = 1, used_at = NOW() WHERE id = ?',
        [tokenId]
    );
    return result;
}

module.exports = { generateInstallerToken, findInstallerToken, markTokenUsed };