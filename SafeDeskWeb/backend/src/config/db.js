const mysql = require('mysql2/promise');
const env = require('./env');

let pool;

async function connectDB() {
    try {
        pool = mysql.createPool({
            host: env.DB_HOST,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            dateStrings: true,
        });

        const conn = await pool.getConnection();
        console.log('Connected to the database.');
        conn.release();
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
}

async function query(sql, params) {
    if (!pool) {
        throw new Error('Database not connected');
    }
    
    const [rows] = await pool.execute(sql, params);
    return rows; 
}

async function initInstallerTokenTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS installer_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(128) NOT NULL UNIQUE,
            user_id INT NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            expire_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            used_at DATETIME DEFAULT NULL
        );
    `);
}

async function initAgentTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS agents (
            agent_id VARCHAR(64) NOT NULL,
            user_id INT NOT NULL,
            installer_token_id INT NOT NULL,
            agent_token VARCHAR(128) NOT NULL,

            hostname VARCHAR(255) DEFAULT NULL,
            guid VARCHAR(64) DEFAULT NULL,
            os VARCHAR(128) DEFAULT NULL,

            status ENUM('online','offline') DEFAULT 'offline',
            last_activity DATETIME DEFAULT NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            PRIMARY KEY (agent_id),
            KEY idx_user_id (user_id),
            KEY idx_agent_token (agent_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
}


async function initDB() {
    await connectDB();
    await initInstallerTokenTable().catch((err) => {
        console.error('Error initializing installer_tokens table:', err);
    });
    await initAgentTable().catch((err) => {
        console.error('Error initializing agent table:', err);
    });
}


module.exports = {
    initDB,
    query,
    pool: () => pool,
};