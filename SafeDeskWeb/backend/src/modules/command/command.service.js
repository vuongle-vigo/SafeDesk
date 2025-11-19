const commandModel = require('./command.model');

async function pollCommands(agentId) {
    try {
        const commands = await commandModel.findCommandsPending(agentId);
        return commands;
    } catch (error) {
        throw error;
    }
}

async function addCommand(agentId, commandType, commandParams) {
    try {
        const command = await commandModel.addCommand(agentId, commandType, commandParams);
        return command;
    } catch (error) {
        throw error;
    }   
}

async function updateCommandStatus(commandId, status) {
    try {
        const result = await commandModel.updateCommandStatus(commandId, status);
        return result;
    } catch (error) {
        throw error;
    }   
}

module.exports = { pollCommands, addCommand, updateCommandStatus };