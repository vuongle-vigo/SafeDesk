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

async function findApplicationsUsageByTimeRange(agentId, timeStart, timeEnd) {
    const sql = `SELECT
            ia.id AS app_id,
            ia.app_name,
            ia.version,
            ia.publisher,
            ia.install_location,
            ia.icon_base64,
            ia.daily_limit_minutes,
            SUM(pu.time_usage) AS total_usage
        FROM installed_apps ia
        LEFT JOIN process_usage pu
            ON ia.agent_id = pu.agent_id
            AND pu.process_location = ia.install_location
            AND pu.date_recorded BETWEEN ? AND ?
        WHERE ia.agent_id = ?
        GROUP BY
            ia.id, ia.app_name, ia.version, ia.publisher, ia.install_location
        ORDER BY total_usage DESC;`;
    const result = await query(sql, [timeStart, timeEnd, agentId]);
    return result;
}

async function updateApplicationLimit(appId, limitMinutes) {
    const result = await query(
        `UPDATE installed_apps
         SET daily_limit_minutes = ?
         WHERE id = ?`,
        [limitMinutes, appId]
    );
    return result;
}

async function updateApplicationStatus(appId, status) {
    const result = await query(
        `UPDATE installed_apps
            SET status = ?
            WHERE id = ?`,
        [status, appId]
    );
    return result;
}

module.exports = { addApplication, findApplicationsByAgentId, deleteApplicationsByAgentId, findApplicationsUsageByTimeRange, updateApplicationLimit, updateApplicationStatus  };