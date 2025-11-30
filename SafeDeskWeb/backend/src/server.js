const env = require('./config/env');
const { initDB } = require('./config/db');
const createApp = require('./app');
const express = require('express');
const path = require('path');

initDB();
const app = createApp();

// Serve screenshots folder as public static files so frontend can fetch /data/screenshots/...
app.use('/data/screenshots', express.static(path.join(__dirname, 'data', 'screenshots')));

// Optional: also expose /screenshots if some code uses that path directly
app.use('/screenshots', express.static(path.join(__dirname, 'data', 'screenshots')));

app.use('/installer-files', express.static(path.join(__dirname, 'installer-files')));

app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${env.PORT}`);
});