const authRoutes = require('../modules/auth/auth.routes');

module.exports = function routesLoader(app) {
    app.use('/auth', authRoutes);

    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to SafeDesk API' });
    });
};