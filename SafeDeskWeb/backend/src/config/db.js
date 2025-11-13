const mysql = require('mysql2');
const env = require('./env');

const connection = mysql.createConnection(
    {
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        dateStrings: true,
    }
);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }

    console.log('Connected to the database.');
});

module.exports = { connection };