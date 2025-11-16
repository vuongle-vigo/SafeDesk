const { query } = require('../../config/db');

exports.addApplication = async (agentId, applicationData) => {
    if (applicationData.length === 0) return;

    const values = [];
    const params = [];

    for (const app of applicationData) {
        values.push("(?, ?, ?, ?, ?, ?, ?, ?)");
        params.push(
            agentId,
            app.app_name,
            app.version,
            app.publisher,
            app.install_location,
            app.exe_path,
            app.uninstall_string,
            app.quiet_uninstall_string
        );
    }

    const sql = `
        INSERT INTO installed_apps 
        (agent_id, app_name, version, publisher, install_location, 
         exe_path, uninstall_string, quiet_uninstall_string)
        VALUES ${values.join(", ")}
    `;

    return await query(sql, params);
};
