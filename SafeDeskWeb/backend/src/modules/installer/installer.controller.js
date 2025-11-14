const installerService = require('./installer.service');


exports.generateInstallerToken = async (req, res) => {
    try {
        const userId = req.user?.user_id;
            
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = await installerService.generateInstallerToken(userId);
        res.json(data);
    } catch (error) {
        console.error('Error generating installer token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};