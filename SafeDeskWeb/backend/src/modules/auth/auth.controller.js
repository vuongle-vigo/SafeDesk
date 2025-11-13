const authService = require('./auth.service');

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