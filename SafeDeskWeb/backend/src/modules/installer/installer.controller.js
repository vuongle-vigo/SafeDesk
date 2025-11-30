const installerService = require('./installer.service');
const fs = require('fs/promises');

exports.generateInstallerToken = async (req, res) => {
    try {
        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { installerfilePath, expiresAt } = await installerService.generateInstallerToken(userId);

        res.download(installerfilePath, 'installer.bat', async (err) => {
            if (err) {
                console.error("Download error:", err);
                return;
            }

            try {
                await fs.unlink(installerfilePath);
            } catch (e) {
                console.error('Cannot delete temp file:', e);
            }
        });

    } catch (error) {
        console.error('Error generating installer token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
