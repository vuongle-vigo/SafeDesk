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

exports.getMe = async (req, res) => {
    try {
        const user = req.user; // Assuming user info is attached to req by auth middleware
        console.log('GetMe user:', user);
        res.json({ id: user.user_id, email: user.email, role: user.role });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};