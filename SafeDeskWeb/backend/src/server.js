const env = require('./config/env');
const { initDB } = require('./config/db');
const createApp = require('./app');

initDB();
const app = createApp();

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});