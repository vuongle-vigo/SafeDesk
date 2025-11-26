#include "SQLiteDB.h"
#include "Common.h"
#include <iostream>

// SQLiteDB class implementation
SQLiteDB::SQLiteDB() {
    if (sqlite3_open(dbPath.c_str(), &db) != SQLITE_OK) {
		DEBUG_LOG("Failed to open database: %s", dbPath.c_str());
		LogToFile("Can't open database: " + dbPath);
        db = nullptr;
    }
}

SQLiteDB::~SQLiteDB() {
    if (db) {
        sqlite3_close(db);
    }
}

SQLiteDB& SQLiteDB::GetInstance() {
    static SQLiteDB instance;
    return instance;
}

bool SQLiteDB::execute(const std::string& query) {
    char* errMsg = nullptr;
    if (sqlite3_exec(db, query.c_str(), nullptr, nullptr, &errMsg) != SQLITE_OK) {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
        return false;
    }
    return true;
}

// SQLiteStmt class implementation
SQLiteStmt::SQLiteStmt(SQLiteDB& db, const std::string& query) {
    if (sqlite3_prepare_v2(db.getDB(), query.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db.getDB()) << std::endl;
        stmt = nullptr;
    }
}

SQLiteStmt::~SQLiteStmt() {
    if (stmt) {
        sqlite3_finalize(stmt);
    }
}

bool SQLiteStmt::step() {
    return sqlite3_step(stmt) == SQLITE_ROW;
}

// ProcessUsage class implementation
ProcessUsageDB::ProcessUsageDB() : db(SQLiteDB::GetInstance()) {}

ProcessUsageDB::~ProcessUsageDB() {}

ProcessUsageDB& ProcessUsageDB::GetInstance() {
    static ProcessUsageDB instance;
    return instance;
}

bool ProcessUsageDB::add(const std::wstring& process_title, const std::string& process_path, const std::string& date_recorded, const std::string& start_time, double time_usage) {
    const wchar_t* sql = L"INSERT INTO process_usage (process_title, process_path, date_recorded, start_time, time_usage) VALUES (?, ?, ?, ?, ?);";

    sqlite3_stmt* stmt;
    if (sqlite3_prepare16_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_text16(stmt, 1, process_title.c_str(), -1, SQLITE_TRANSIENT); // UTF-16
    sqlite3_bind_text(stmt, 2, process_path.c_str(), -1, SQLITE_TRANSIENT);    // UTF-8
    sqlite3_bind_text(stmt, 3, date_recorded.c_str(), -1, SQLITE_TRANSIENT);   // UTF-8
    sqlite3_bind_text(stmt, 4, start_time.c_str(), -1, SQLITE_TRANSIENT);      // UTF-8
    sqlite3_bind_double(stmt, 5, time_usage);                                     // Double

    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);

    return success;
}

bool ProcessUsageDB::update_lastest(const std::wstring& process_title, const std::string& process_path, const std::string& date_recorded, const std::string& start_time, double time_usage) {
    const wchar_t* sql = L"UPDATE process_usage SET process_title = ?, process_path = ?, date_recorded = ?, start_time = ?, time_usage = ?, upload_status = 0 WHERE usage_id = (SELECT MAX(usage_id) FROM process_usage);";

    sqlite3_stmt* stmt;
    if (sqlite3_prepare16_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_text16(stmt, 1, process_title.c_str(), -1, SQLITE_TRANSIENT); // UTF-16
    sqlite3_bind_text(stmt, 2, process_path.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
    sqlite3_bind_text(stmt, 3, date_recorded.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
    sqlite3_bind_text(stmt, 4, start_time.c_str(), -1, SQLITE_TRANSIENT);   // UTF-8
    sqlite3_bind_double(stmt, 5, time_usage); // float/double

    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);

    return success;
}


bool ProcessUsageDB::remove(int usage_id) {
    std::string query = "DELETE FROM process_usage WHERE usage_id = " + std::to_string(usage_id) + ";";
    return db.execute(query);
}

json ProcessUsageDB::query_all() {
    json result;
    const char* sql = "SELECT * FROM process_usage WHERE upload_status = 0;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return result; // Return empty JSON if query fails
    }

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        int id = sqlite3_column_int(stmt, 0);
        const char* process_title = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        const char* process_path = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        const char* date_recorded = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        const char* start_time = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        double time_usage = sqlite3_column_double(stmt, 5);
        time_usage = round(time_usage * 10) / 10;
        result.push_back({ {"process_title", process_title}, {"process_path", process_path}, {"date_recorded", date_recorded}, {"start_time", start_time}, {"time_usage", time_usage} });
    }

    sqlite3_finalize(stmt);
    return result;
}

bool ProcessUsageDB::delete_data(json data) {
    if (!data.is_array() || data.empty()) {
        return false; // Return false if input JSON is not an array or is empty
    }

    sqlite3_stmt* stmt;
    const char* sql = "DELETE FROM process_usage WHERE process_title = ? AND date_recorded = ? AND start_time = ?;";

    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false; // Return false if query preparation fails
    }

    bool success = true;

    // Iterate through JSON array
    for (const auto& item : data) {
        if (!item.contains("process_title") || !item.contains("date_recorded") || !item.contains("start_time")) {
            success = false; // Mark as failed but continue processing other records
            continue;
        }

        std::string process_title = item["process_title"].get<std::string>();
        std::string date_recorded = item["date_recorded"].get<std::string>();
        std::string start_time = item["start_time"].get<std::string>();

        // Bind parameters
        sqlite3_bind_text(stmt, 1, process_title.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, date_recorded.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 3, start_time.c_str(), -1, SQLITE_STATIC);

        // Execute statement
        if (sqlite3_step(stmt) != SQLITE_DONE) {
            success = false; // Mark as failed but continue processing other records
        }

        // Reset statement for next iteration
        sqlite3_reset(stmt);
    }

    sqlite3_finalize(stmt);
    return success;
}

bool ProcessUsageDB::update_status(json data) {
    if (!data.is_array() || data.empty()) {
        return false; // Return false if input JSON is not an array or is empty
    }

    sqlite3_stmt* stmt;
    const char* sql = "UPDATE process_usage SET upload_status = 1 WHERE process_title = ? AND date_recorded = ? AND start_time = ?;";

    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false; // Return false if query preparation fails
    }

    bool success = true;

    // Iterate through JSON array
    for (const auto& item : data) {
        if (!item.contains("process_title") || !item.contains("date_recorded") || !item.contains("start_time")) {
            success = false; // Mark as failed but continue processing other records
            continue;
        }

        std::string process_title = item["process_title"].get<std::string>();
        std::string date_recorded = item["date_recorded"].get<std::string>();
        std::string start_time = item["start_time"].get<std::string>();

        // Bind parameters
        sqlite3_bind_text(stmt, 1, process_title.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, date_recorded.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 3, start_time.c_str(), -1, SQLITE_STATIC);

        // Execute statement
        if (sqlite3_step(stmt) != SQLITE_DONE) {
            success = false; // Mark as failed but continue processing other records
        }

        // Reset statement for next iteration
        sqlite3_reset(stmt);
    }

    sqlite3_finalize(stmt);
    return success;
}

PowerUsageDB::PowerUsageDB() : db(SQLiteDB::GetInstance()) {}

PowerUsageDB& PowerUsageDB::GetInstance() {
    static PowerUsageDB instance;
    return instance;
}

PowerUsageDB::~PowerUsageDB() {}

bool PowerUsageDB::add(const std::string& date, int hour, double usage_minutes) {
    const char* sql = "INSERT INTO power_usage (date, hour, usage_minutes) VALUES (?, ?, ?);";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "SQL Error: " << sqlite3_errmsg(db.getDB()) << std::endl;
        return false;
    }

    sqlite3_bind_text(stmt, 1, date.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
    sqlite3_bind_int(stmt, 2, hour); // int
    sqlite3_bind_double(stmt, 3, usage_minutes); // float/double

    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    if (!success) {
        std::cerr << "SQL Error: " << sqlite3_errmsg(db.getDB()) << std::endl;
    }
    sqlite3_finalize(stmt);
    return success;
}

bool PowerUsageDB::update(const std::string& date, int hour, double usage_minutes) {
    const char* sql = "UPDATE power_usage SET usage_minutes = ?, upload_status = 0 WHERE date = ? AND hour = ?;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_double(stmt, 1, usage_minutes); // float/double
    sqlite3_bind_text(stmt, 2, date.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
    sqlite3_bind_int(stmt, 3, hour); // int

    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return success;
}

double PowerUsageDB::QueryByTime(const std::string& date, int hour) {
    const char* sql = "SELECT usage_minutes FROM power_usage WHERE date = ? AND hour = ?;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return -1;
    }

    sqlite3_bind_text(stmt, 1, date.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
    sqlite3_bind_int(stmt, 2, hour); // int

    double usage_minutes = -1;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        usage_minutes = sqlite3_column_double(stmt, 0);
        std::cout << "Date: " << date << ", Hour: " << hour << ", Usage Minutes: " << usage_minutes << std::endl;
    }

    sqlite3_finalize(stmt);
    return usage_minutes;
}

json PowerUsageDB::query_all() {
    json result;
    std::string currentDate = GetCurrentDate();
    std::string currentTime = GetCurrentTimeHour();

    const char* sql = "SELECT date, hour, usage_minutes FROM power_usage WHERE upload_status = 0;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return result; // Return empty JSON if query fails
    }

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        std::string date = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
        int hour = sqlite3_column_int(stmt, 1);
        double usage_minutes = sqlite3_column_double(stmt, 2);
        usage_minutes = round(usage_minutes * 10) / 10;
        result.push_back({ {"date", date}, {"hour", hour}, {"usage_minutes", usage_minutes} });
        //if (!(date == currentDate && hour == ConvertStringToInt(currentTime))) {
  //          usage_minutes = round(usage_minutes * 10) / 10;
        //	result.push_back({ {"date", date}, {"hour", hour}, {"usage_minutes", usage_minutes} });
        //}
    }

    sqlite3_finalize(stmt);
    return result;
}

double PowerUsageDB::query_today() {
    std::string currentDate = GetCurrentDate();
    double total_minutes = 0.0;

    const char* sql = "SELECT usage_minutes FROM power_usage WHERE date = ?;";
    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return 0.0; // Return 0.0 if query preparation fails
    }

    // Bind the current date
    sqlite3_bind_text(stmt, 1, currentDate.c_str(), -1, SQLITE_STATIC);

    // Iterate through results
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        double usage_minutes = sqlite3_column_double(stmt, 0);
        total_minutes += usage_minutes;
    }

    sqlite3_finalize(stmt);
    return total_minutes;
}

bool PowerUsageDB::delete_data(json data) {
    if (!data.is_array() || data.empty()) {
        return false; // Return false if input JSON is not an array or is empty
    }

    // Get current date and hour
    std::string currentDate = GetCurrentDate();
    int currentHour = ConvertStringToInt(GetCurrentTimeHour());

    sqlite3_stmt* stmt;
    const char* sql = "DELETE FROM power_usage WHERE date = ? AND hour = ?;";

    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false; // Return false if query preparation fails
    }

    bool success = true;

    // Iterate through JSON array
    for (const auto& item : data) {
        if (!item.contains("date") || !item.contains("hour")) {
            success = false; // Mark as failed but continue processing other records
            continue;
        }

        std::string date = item["date"].get<std::string>();
        int hour = item["hour"].get<int>();

        // Skip records matching current date and hour
        if (date == currentDate && hour == currentHour) {
            continue;
        }

        // Bind parameters
        sqlite3_bind_text(stmt, 1, date.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_int(stmt, 2, hour);

        // Execute statement
        if (sqlite3_step(stmt) != SQLITE_DONE) {
            success = false; // Mark as failed but continue processing other records
        }

        // Reset statement for next iteration
        sqlite3_reset(stmt);
    }

    sqlite3_finalize(stmt);
    return success;
}

bool PowerUsageDB::update_status(json data) {
    if (!data.is_array() || data.empty()) {
        return false; // Return false if input JSON is not an array or is empty
    }

    // Get current date and hour
    std::string currentDate = GetCurrentDate();
    int currentHour = ConvertStringToInt(GetCurrentTimeHour());

    sqlite3_stmt* stmt;
    const char* sql = "UPDATE power_usage SET upload_status = 1 WHERE date = ? AND hour = ?;";

    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false; // Return false if query preparation fails
    }

    bool success = true;

    // Iterate through JSON array
    for (const auto& item : data) {
        if (!item.contains("date") || !item.contains("hour")) {
            success = false; // Mark as failed but continue processing other records
            continue;
        }

        std::string date = item["date"].get<std::string>();
        int hour = item["hour"].get<int>();

        // Skip records matching current date and hour
        if (date == currentDate && hour == currentHour) {
            continue;
        }

        // Bind parameters
        sqlite3_bind_text(stmt, 1, date.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_int(stmt, 2, hour);

        // Execute statement
        if (sqlite3_step(stmt) != SQLITE_DONE) {
            success = false; // Mark as failed but continue processing other records
        }

        // Reset statement for next iteration
        sqlite3_reset(stmt);
    }

    sqlite3_finalize(stmt);
    return success;
}

AppDB::AppDB() : db(SQLiteDB::GetInstance()) {}

AppDB::~AppDB() {}

AppDB& AppDB::GetInstance() {
    static AppDB instance;
    return instance;
}

bool AppDB::add(const std::string& app_name, const std::string& version, const std::string& publisher,
    const std::string& install_location, const std::string& exe_path,
    const std::string& uninstall_string, const std::string& quiet_uninstall_string) {
    std::string currentDate = GetCurrentDate();
    std::string currentTime = GetCurrentTimeHour();
    std::string lastUpdated = currentDate + " " + currentTime;

    const char* checkSql = "SELECT id FROM installed_apps WHERE app_name = ?;";
    sqlite3_stmt* checkStmt;
    bool exists = false;
    if (sqlite3_prepare_v2(db.getDB(), checkSql, -1, &checkStmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(checkStmt, 1, app_name.c_str(), -1, SQLITE_TRANSIENT);
        if (sqlite3_step(checkStmt) == SQLITE_ROW) {
            exists = true;
        }
        sqlite3_finalize(checkStmt);
    }

    if (!exists) {
        const char* insertSql = "INSERT INTO installed_apps (app_name, version, publisher, install_location, "
            "exe_path, uninstall_string, quiet_uninstall_string, status, last_updated) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, 'installed', ?);";
        sqlite3_stmt* insertStmt;
        if (sqlite3_prepare_v2(db.getDB(), insertSql, -1, &insertStmt, nullptr) != SQLITE_OK) {
            return false;
        }

        sqlite3_bind_text(insertStmt, 1, app_name.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(insertStmt, 2, version.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(insertStmt, 3, publisher.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(insertStmt, 4, install_location.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(insertStmt, 5, exe_path.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(insertStmt, 6, uninstall_string.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(insertStmt, 7, quiet_uninstall_string.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(insertStmt, 8, lastUpdated.c_str(), -1, SQLITE_TRANSIENT);

        bool success = (sqlite3_step(insertStmt) == SQLITE_DONE);
        sqlite3_finalize(insertStmt);
        return success;
    }
}

bool AppDB::delete_all() {
    const char* sql = "DELETE FROM installed_apps;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return success;
}

bool AppDB::update_status(const std::string& app_name, const std::string& status) {
    if (app_name.empty() || status.empty()) return false;

    std::string currentDate = GetCurrentDate();
    std::string currentTime = GetCurrentTimeHour();
    std::string lastUpdated = currentDate + " " + currentTime;

    const char* sql = "UPDATE installed_apps SET status = ?, last_updated = ? WHERE app_name = ?;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_text(stmt, 1, status.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, lastUpdated.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, app_name.c_str(), -1, SQLITE_TRANSIENT);

    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return success;
}

json AppDB::query_apps() {
    nlohmann::json jsonArray;

    const char* sql = "SELECT id, app_name, version, publisher, install_location, exe_path, "
        "uninstall_string, quiet_uninstall_string, status, last_updated "
        "FROM installed_apps WHERE install_location IS NOT NULL AND install_location != '';";
    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return jsonArray;
    }

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        nlohmann::json jsonApp;
        jsonApp["id"] = sqlite3_column_int64(stmt, 0);
        jsonApp["app_name"] = sqlite3_column_text(stmt, 1) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1)) : "";
        jsonApp["version"] = sqlite3_column_text(stmt, 2) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2)) : "";
        jsonApp["publisher"] = sqlite3_column_text(stmt, 3) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3)) : "";
        jsonApp["install_location"] = sqlite3_column_text(stmt, 4) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4)) : "";
        jsonApp["exe_path"] = sqlite3_column_text(stmt, 5) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5)) : "";
        jsonApp["uninstall_string"] = sqlite3_column_text(stmt, 6) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6)) : "";
        jsonApp["quiet_uninstall_string"] = sqlite3_column_text(stmt, 7) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7)) : "";
        jsonApp["status"] = sqlite3_column_text(stmt, 8) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8)) : "";
        jsonApp["last_updated"] = sqlite3_column_text(stmt, 9) ?
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 9)) : "";

        jsonArray.push_back(jsonApp);
    }

    sqlite3_finalize(stmt);
    return jsonArray;
}

TokenDB::TokenDB() : db(SQLiteDB::GetInstance()) {}

TokenDB::~TokenDB() {}

TokenDB& TokenDB::GetInstance() {
    static TokenDB instance;
    return instance;
}

bool TokenDB::addToken(const std::string& szAgentToken , const std::string& szAgentId) {
    const char* sql = "INSERT INTO token (agent_token, agent_id) VALUES (?, ?);";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    sqlite3_bind_text(stmt, 1, szAgentToken.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
	sqlite3_bind_text(stmt, 2, szAgentId.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
	return success;
}

std::string TokenDB::getAgentToken() {
    std::string sql = "SELECT agent_token FROM token;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return "";
    }
    std::string token = "";
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        const char* agent_token = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
        token = agent_token ? agent_token : "";
    }
    sqlite3_finalize(stmt);
    return token;
}

std::string TokenDB::getAgentId() {
    std::string sql = "SELECT agent_id FROM token;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return "";
    }

    std::string agentId = "";
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        const char* agent_id = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
        agentId = agent_id ? agent_id : "";
    }

    sqlite3_finalize(stmt);
    return agentId;
}

AppPoliciesDB::AppPoliciesDB() : db(SQLiteDB::GetInstance()) {}

AppPoliciesDB::~AppPoliciesDB() {}

AppPoliciesDB& AppPoliciesDB::GetInstance() {
	static AppPoliciesDB instance;
	return instance;
}

json AppPoliciesDB::getPolicies() {
    json result;
    const char* sql = "SELECT install_location, is_blocked, limit_enabled, limit_minutes, action_on_limit, warn_interval FROM app_policies WHERE limit_enabled = 1 OR is_blocked  = 1";
	sqlite3_stmt* stmt;
	if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
		return result; // Return empty JSON if query fails
	}

	while (sqlite3_step(stmt) == SQLITE_ROW) {
		std::string install_location = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
		int is_blocked = sqlite3_column_int(stmt, 1);
		int limit_enabled = sqlite3_column_int(stmt, 2);
		int limit_minutes = sqlite3_column_int(stmt, 3);
		std::string action_on_limit = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
		int warn_interval = sqlite3_column_int(stmt, 5);
		result.push_back({
			{"install_location", install_location},
			{"is_blocked", is_blocked},
			{"limit_enabled", limit_enabled},
			{"limit_minutes", limit_minutes},
			{"action_on_limit", action_on_limit},
			{"warn_interval", warn_interval}
			});
	}

    return result;
}

bool AppPoliciesDB::delete_all() {
	const char* sql = "DELETE FROM app_policies;";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }
    bool success = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return success;
}

bool AppPoliciesDB::updatePolicies(
    int app_id,
    const std::string& install_location,
    int is_blocked,
    int limit_enabled,
    int limit_minutes,
    const std::string& action_on_limit,
    int warn_interval
) {
    sqlite3* conn = db.getDB();
    sqlite3_stmt* stmt;

    // Check exists
    const char* checkSQL = "SELECT COUNT(*) FROM app_policies WHERE app_id = ?;";
    if (sqlite3_prepare_v2(conn, checkSQL, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_int(stmt, 1, app_id);

    int exists = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        exists = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    // INSERT
    if (exists == 0) {
        const char* insertSQL =
            "INSERT INTO app_policies "
            "(app_id, install_location, is_blocked, limit_enabled, limit_minutes, action_on_limit, warn_interval, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%s','now'));";

        if (sqlite3_prepare_v2(conn, insertSQL, -1, &stmt, nullptr) != SQLITE_OK) {
            return false;
        }

        sqlite3_bind_int(stmt, 1, app_id);
        sqlite3_bind_text(stmt, 2, install_location.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 3, is_blocked);
        sqlite3_bind_int(stmt, 4, limit_enabled);
        sqlite3_bind_int(stmt, 5, limit_minutes);
        sqlite3_bind_text(stmt, 6, action_on_limit.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 7, warn_interval);

        bool ok = (sqlite3_step(stmt) == SQLITE_DONE);
        sqlite3_finalize(stmt);
        return ok;
    }

    // UPDATE
    const char* updateSQL =
        "UPDATE app_policies SET "
        "install_location = ?, "
        "is_blocked = ?, "
        "limit_enabled = ?, "
        "limit_minutes = ?, "
        "action_on_limit = ?, "
        "warn_interval = ?, "
        "updated_at = strftime('%s', 'now') "
        "WHERE app_id = ?;";

    if (sqlite3_prepare_v2(conn, updateSQL, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_text(stmt, 1, install_location.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 2, is_blocked);
    sqlite3_bind_int(stmt, 3, limit_enabled);
    sqlite3_bind_int(stmt, 4, limit_minutes);
    sqlite3_bind_text(stmt, 5, action_on_limit.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 6, warn_interval);
    sqlite3_bind_int(stmt, 7, app_id);

    bool ok = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return ok;
}


DailyPoliciesDB::DailyPoliciesDB() : db(SQLiteDB::GetInstance()) {}

DailyPoliciesDB::~DailyPoliciesDB() {}

DailyPoliciesDB& DailyPoliciesDB::GetInstance() {
	static DailyPoliciesDB instance;
	return instance;
}

bool DailyPoliciesDB::updatePolicies(
    const std::string day_of_week,
    int enabled,
    const std::string allowed_hours,
    int limit_daily_minutes,
    int warn_on_exceed,
    int shutdown_on_exceed
) {
    sqlite3* conn = db.getDB();
    sqlite3_stmt* stmt;

    const char* checkSQL = "SELECT COUNT(*) FROM daily_usage_policies WHERE day_of_week = ?;";
    if (sqlite3_prepare_v2(conn, checkSQL, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_text(stmt, 1, day_of_week.c_str(), -1, SQLITE_TRANSIENT);

    int exists = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        exists = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    if (exists == 0) {
        const char* insertSQL =
            "INSERT INTO daily_usage_policies "
            "(day_of_week, enabled, allowed_hours, daily_limit_minutes, warn_on_exceed, shutdown_on_exceed, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, strftime('%s','now'));";

        if (sqlite3_prepare_v2(conn, insertSQL, -1, &stmt, nullptr) != SQLITE_OK) {
            return false;
        }

        sqlite3_bind_text(stmt, 1, day_of_week.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 2, enabled);
        sqlite3_bind_text(stmt, 3, allowed_hours.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 4, limit_daily_minutes);
        sqlite3_bind_int(stmt, 5, warn_on_exceed);
        sqlite3_bind_int(stmt, 6, shutdown_on_exceed);

        bool ok = (sqlite3_step(stmt) == SQLITE_DONE);
        sqlite3_finalize(stmt);
        return ok;
    }

    const char* updateSQL =
        "UPDATE daily_usage_policies SET "
        "enabled = ?, "
        "allowed_hours = ?, "
		"daily_limit_minutes = ?, "
        "warn_on_exceed = ?, "
        "shutdown_on_exceed = ?, "
        "updated_at = strftime('%s','now') "
        "WHERE day_of_week = ?;";

    if (sqlite3_prepare_v2(conn, updateSQL, -1, &stmt, nullptr) != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_int(stmt, 1, enabled);
    sqlite3_bind_text(stmt, 2, allowed_hours.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 3, warn_on_exceed);
    sqlite3_bind_int(stmt, 4, limit_daily_minutes);
    sqlite3_bind_int(stmt, 5, warn_on_exceed);
    sqlite3_bind_int(stmt, 6, shutdown_on_exceed);

    bool ok = (sqlite3_step(stmt) == SQLITE_DONE);
    sqlite3_finalize(stmt);
    return ok;
}

json DailyPoliciesDB::getPolicies() {
	json result;
	const char* sql = "SELECT day_of_week, enabled, allowed_hours, daily_limit_minutes, warn_on_exceed, shutdown_on_exceed FROM daily_usage_policies";
	sqlite3_stmt* stmt;
	if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
		return result; // Return empty JSON if query fails
	}
	while (sqlite3_step(stmt) == SQLITE_ROW) {
		std::string day_of_week = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
		int enabled = sqlite3_column_int(stmt, 1);
		std::string allowed_hours = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        int daily_limit_minutes = sqlite3_column_int(stmt, 3);
		int warn_on_exceed = sqlite3_column_int(stmt, 4);
		int shutdown_on_exceed = sqlite3_column_int(stmt, 5);
		result.push_back({
			{"day_of_week", day_of_week},
			{"enabled", enabled},
			{"allowed_hours", allowed_hours},
            {"daily_limit_minutes", daily_limit_minutes},
			{"warn_on_exceed", warn_on_exceed},
			{"shutdown_on_exceed", shutdown_on_exceed}
			});
	}
	return result;
}

BrowserHistoryDB::BrowserHistoryDB() : db(SQLiteDB::GetInstance()) {}
BrowserHistoryDB::~BrowserHistoryDB() {}

BrowserHistoryDB& BrowserHistoryDB::GetInstance() {
	static BrowserHistoryDB instance;
	return instance;
}

bool BrowserHistoryDB::add(const std::string& browser_name, const std::string& url, const std::string& title, int visit_count, int typed_count, int64_t last_visit_time, int hidden) {
	const char* sql = "INSERT INTO browser_history (browser_name, url, title, visit_count, typed_count, last_visit_time, hidden) VALUES (?, ?, ?, ?, ?, ?, ?);";
	sqlite3_stmt* stmt;
	if (sqlite3_prepare_v2(db.getDB(), sql, -1, &stmt, nullptr) != SQLITE_OK) {
		std::cout << "SQL Error: " << sqlite3_errmsg(db.getDB()) << std::endl;
		return false;
	}

	sqlite3_bind_text(stmt, 1, browser_name.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
	sqlite3_bind_text(stmt, 2, url.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
	sqlite3_bind_text(stmt, 3, title.c_str(), -1, SQLITE_TRANSIENT); // UTF-8
	sqlite3_bind_int(stmt, 4, visit_count); // int
	sqlite3_bind_int(stmt, 5, typed_count); // int
	sqlite3_bind_int64(stmt, 6, last_visit_time); // int64
	sqlite3_bind_int(stmt, 7, hidden); // int
	bool success = (sqlite3_step(stmt) == SQLITE_DONE);
	sqlite3_finalize(stmt);
	return success;
}

int64_t BrowserHistoryDB::getLastVisitTime(const std::string& browser_name) {
    const char* sql =
        "SELECT COALESCE(MAX(last_visit_time), 0) "
        "FROM browser_history WHERE browser_name = ?;";

    sqlite3* conn = db.getDB();
    if (conn == nullptr) {
        return 0;
    }

    sqlite3_stmt* stmt = nullptr;
    int64_t lastTime = 0;

    int rc = sqlite3_prepare_v2(conn, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return 0;
    }

    rc = sqlite3_bind_text(stmt, 1, browser_name.c_str(), -1, SQLITE_TRANSIENT);
    if (rc != SQLITE_OK) {
        sqlite3_finalize(stmt);
        return 0;
    }

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW) {
        lastTime = sqlite3_column_int64(stmt, 0);
    }

    sqlite3_finalize(stmt);
    return lastTime;
}


