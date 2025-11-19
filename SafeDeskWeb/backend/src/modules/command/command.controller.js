const commandService = require('./command.service');

async function pollCommands(req, res) {
    try {
        const agentId = req.headers['x-agent-id'];
        const results = await commandService.pollCommands(agentId);
        return res.json({
            commands: results || []
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }   
}

async function createCommand(req, res) {
    try {
        const agentId = req.params.agentId;
        const { commandType, commandParams } = req.body;
        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }
        if (!commandType) {
            return res.status(400).json({ error: 'Command type is required' });
        }
        const data = await commandService.addCommand(agentId, commandType, commandParams);
        return res.json({
            message: 'Command added successfully',
            commandId: data?.commandId || null
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

async function updateCommandStatus(req, res) {
    try {
        const commandId = req.params.commandId;
        const { status, result } = req.body;
        if (!commandId) {
            return res.status(400).json({ error: 'Command ID is required' });
        }
        const data = await commandService.updateCommandStatus(commandId, status, result);
        return res.json({
            message: 'Command status updated successfully',
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = { pollCommands, createCommand, updateCommandStatus };