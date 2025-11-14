const authRoutes = require('../modules/auth/auth.routes');
const agentRoutes = require('../modules/agent/agent.routes');
const installerRoutes = require('../modules/installer/installer.routes');

const authMiddleware = require('../middlewares/auth.middleware');

module.exports = function routesLoader(app) {
    app.use('/api/auth', authRoutes);
    app.use('/api/agent', agentRoutes);
    app.use('/api/installer', authMiddleware, installerRoutes);

    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to SafeDesk API' });
    });
};