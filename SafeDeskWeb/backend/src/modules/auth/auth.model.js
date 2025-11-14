const { query } = require('../../config/db');

async function findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = (?)', [email]);
    return result[0];
}

async function createUser(email, hashedPassword) {
    const result = await query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
    );
    return { id: result.insertId, email };
}

module.exports = { createUser, findByEmail };