const crypto = require('crypto');
const installerModel = require('./installer.model');

exports.generateInstallerToken = async (userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expireAt = new Date(Date.now() + 15 * 60 * 1000); 
    await installerModel.generateInstallerToken(
        userId,
        token,
        expireAt
    );

    return { installerToken: token, expiresAt: expireAt };
}