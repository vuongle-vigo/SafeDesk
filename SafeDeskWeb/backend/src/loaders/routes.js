const authRoutes = require('../modules/auth/auth.routes');
const agentRoutes = require('../modules/agent/agent.routes');
const installerRoutes = require('../modules/installer/installer.routes');
const powerUsageRoutes = require('../modules/power-usage/power-usage.routes');
const applicationRoutes = require('../modules/application/application.routes');
const processUsageRoutes = require('../modules/process-usage/process-usage.routes');
const commandRoutes = require('../modules/command/command.routes');
const capturescreenRoutes = require('../modules/capturescreen/capturescreen.routes');
const authMiddleware = require('../middlewares/auth.middleware');
const agentMiddleware = require('../middlewares/agent.middleware');

module.exports = function routesLoader(app) {
    app.use('/api/auth', authRoutes);
    app.use('/api/agents', agentRoutes);
    app.use('/api/installer', authMiddleware, installerRoutes);
    app.use('/api/agents', powerUsageRoutes);
    app.use('/api/agents', applicationRoutes);
    app.use('/api/agents', processUsageRoutes);
    app.use('/api/agents', commandRoutes);
    app.use('/api/agents', capturescreenRoutes);
    
    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to SafeDesk API' });
    });
};