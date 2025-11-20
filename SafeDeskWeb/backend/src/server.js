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

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});