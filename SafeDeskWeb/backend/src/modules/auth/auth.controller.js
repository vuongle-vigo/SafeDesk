const authService = require('./auth.service');

exports.register = async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        const { email, password } = req.body;
        const data = await authService.register(email, password);
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        const data = await authService.login(email, password);
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};