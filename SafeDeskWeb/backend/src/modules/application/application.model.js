const { query } = require('../../config/db');

async function deleteApplicationsByAgentId(agentId) {
    return await query(
        'DELETE FROM installed_apps WHERE agent_id = ?',
        [agentId]
    );
}

async function addApplication(agentId, applicationData) {
    if (applicationData.length === 0) return;

    await deleteApplicationsByAgentId(agentId);

    const values = [];
    const params = [];

    for (const app of applicationData) {
        values.push("(?, ?, ?, ?, ?, ?, ?, ?, ?)");
        params.push(
            agentId,
            app.app_name,
            app.version,
            app.publisher,
            app.install_location,
            app.icon_base64,
            app.uninstall_string,
            app.quiet_uninstall_string,
            app.icon_path,
        );
    }

    const sql = `
        INSERT INTO installed_apps 
        (agent_id, app_name, version, publisher, install_location, 
         icon_base64, uninstall_string, quiet_uninstall_string, icon_path)
        VALUES ${values.join(", ")}
    `;

    return await query(sql, params);
};


async function findApplicationsByAgentId(agentId) {
    const result = await query(
        `SELECT * FROM installed_apps WHERE agent_id = ?`,
        [agentId]
    );
    return result;
}

module.exports = { addApplication, findApplicationsByAgentId, deleteApplicationsByAgentId };