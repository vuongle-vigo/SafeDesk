const { query } = require('../../config/db');

async function deleteApplicationsByAgentId(agentId) {
    return await query(
        'DELETE FROM installed_apps WHERE agent_id = ?',
        [agentId]
    );
}

async function addApplication(agentId, applicationData) {
    const existing = await query(
        "SELECT * FROM installed_apps WHERE agent_id = ?",
        [agentId]
    );

    const existingMap = new Map();
    for (const app of existing) {
        const key = app.app_name + "::" + app.install_location;
        existingMap.set(key, app);
    }

    const toInsert = [];
    const toUpdate = [];
    const seen = new Set();

    for (const app of applicationData) {
        const key = app.app_name + "::" + app.install_location;
        seen.add(key);

        const old = existingMap.get(key);
        if (!old) {
            toInsert.push(app);
            continue;
        }

        if (
            old.version !== app.version ||
            old.publisher !== app.publisher ||
            old.install_location !== app.install_location ||
            old.icon_base64 !== app.icon_base64 ||
            old.uninstall_string !== app.uninstall_string ||
            old.quiet_uninstall_string !== app.quiet_uninstall_string ||
            old.icon_path !== app.icon_path
        ) {
            toUpdate.push({ old, app });
        }
    }

    const toDelete = [];
    for (const [key, app] of existingMap.entries()) {
        if (!seen.has(key)) toDelete.push(app.id);
    }

    if (toDelete.length > 0) {
        await query(
            `DELETE FROM installed_apps WHERE id IN (${toDelete.map(() => '?').join(',')})`,
            toDelete
        );
    }

    if (toInsert.length > 0) {
        const vals = [];
        const params = [];
        for (const app of toInsert) {
            vals.push("(?, ?, ?, ?, ?, ?, ?, ?, ?)");
            params.push(
                agentId,
                app.app_name,
                app.version,
                app.publisher,
                app.install_location,
                app.icon_base64,
                app.uninstall_string,
                app.quiet_uninstall_string,
                app.icon_path
            );
        }
        await query(
            `INSERT INTO installed_apps 
            (agent_id, app_name, version, publisher, install_location, 
             icon_base64, uninstall_string, quiet_uninstall_string, icon_path)
            VALUES ${vals.join(",")}`,
            params
        );
    }

    for (const { old, app } of toUpdate) {
        await query(
            `UPDATE installed_apps 
             SET version = ?, publisher = ?, install_location = ?, icon_base64 = ?, 
                 uninstall_string = ?, quiet_uninstall_string = ?, icon_path = ?
             WHERE id = ?`,
            [
                app.version,
                app.publisher,
                app.install_location,
                app.icon_base64,
                app.uninstall_string,
                app.quiet_uninstall_string,
                app.icon_path,
                old.id
            ]
        );
    }
}



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
    // console.log("Time Range Query Params:", timeStart, timeEnd, agentId);   
    // console.log("Applications Usage Result:", result);
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

async function checkHasApp(agentId, appId) {
    const result = await query(
        `SELECT COUNT(*) AS count
         FROM installed_apps
         WHERE agent_id = ? AND id = ?`,
        [agentId, appId]
    );
    return result[0].count > 0;
}


module.exports = { addApplication, findApplicationsByAgentId, deleteApplicationsByAgentId, 
    findApplicationsUsageByTimeRange, updateApplicationLimit, updateApplicationStatus, checkHasApp };