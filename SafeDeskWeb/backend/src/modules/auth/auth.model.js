const { query } = require('../../config/db');

exports.findByEmail = async (email) => {
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    return result.rows[0];
}
