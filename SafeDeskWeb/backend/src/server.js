const env = require('./config/env');
const { connection } = require('./config/db');
const createApp = require('./app');

const app = createApp();

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});