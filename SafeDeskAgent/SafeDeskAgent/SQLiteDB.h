#pragma once
#include <string>
#include "sqlite3/sqlite3.h"
#include "nlohmann/json.hpp"
#include "Common.h"

//#define SQLITE_DB_PATH L"C:\\Users\\levuong\\Documents\\GitHub\\SafeDesk\\SafeDeskAgent\\sqlite_db\\safedesk.db"
#define SQLITE_DB_PATH L"sqlite_db\\safedesk.db"

using json = nlohmann::json;

class SQLiteDB {
public:
    SQLiteDB();
    ~SQLiteDB();
    static SQLiteDB& GetInstance();
    bool execute(const std::string& query);
    sqlite3* getDB() const { return db; }

private:
    sqlite3* db;
    std::string dbPath = WstringToString(GetCurrentDir() + SQLITE_DB_PATH);
};

class SQLiteStmt {
public:
    SQLiteStmt(SQLiteDB& db, const std::string& query);
    ~SQLiteStmt();
    bool step();
    sqlite3_stmt* getStmt() const { return stmt; }

private:
    sqlite3_stmt* stmt;
};

class ProcessUsageDB {
public:
    ProcessUsageDB();
    ~ProcessUsageDB();
    static ProcessUsageDB& GetInstance();
    bool add(const std::wstring& process_title, const std::string& process_path, const std::string& date_recorded, const std::string& start_time, double time_usage);
    bool update(int usage_id, const std::wstring& process_title, const std::string& process_path, const std::string& date_recorded, const std::string& start_time, double time_usage);
    bool update_lastest(const std::wstring& process_title, const std::string& process_path, const std::string& date_recorded, const std::string& start_time, double time_usage);
    bool remove(int usage_id);
    json query_all();
    bool delete_data(json data);
    bool update_status(json data);

private:
    SQLiteDB& db;
};

class PowerUsageDB {
public:
    PowerUsageDB();
    ~PowerUsageDB();
    static PowerUsageDB& GetInstance();
    bool add(const std::string& date, int hour, double usage_minute);
    bool update(const std::string& date, int hour, double usage_minute);
    double QueryByTime(const std::string& date, int hour);
    json query_all();
    double query_today();
    bool delete_data(json data);
    bool update_status(json data);
private:
    SQLiteDB& db;
};

class AppDB {
public:
    AppDB();
    ~AppDB();
    static AppDB& GetInstance();
    bool add(const std::string& app_name, const std::string& version, const std::string& publisher, const std::string& install_location, const std::string& exe_path, const std::string& uninstall_string, const std::string& quiet_uninstall_string);
    bool update_status(const std::string& app_name, const std::string& status);
    json query_apps();
    bool delete_all();
private:
    SQLiteDB& db;
};

class TokenDB {
public:
    TokenDB();
    ~TokenDB();
    static TokenDB& GetInstance();
    bool addToken(const std::string& szAgentToken , const std::string& szAgentId);
    std::string getAgentToken();
	std::string getAgentId();
private:
    SQLiteDB& db;
};

class AppPoliciesDB {
public:
    AppPoliciesDB();
    ~AppPoliciesDB();
	static AppPoliciesDB& GetInstance();
	bool addPolicy(const std::string& app_id, const std::string& policy_json);
    bool updatePolicies(
        int app_id,
        const std::string& install_location,
        int is_blocked,
        int limit_enabled,
        int limit_minutes,
        const std::string& action_on_limit,
        int warn_interval
    );
	json getPolicies();
	bool delete_all();
private:    
	SQLiteDB& db;
};

class DailyPoliciesDB {
public:
	DailyPoliciesDB();
	~DailyPoliciesDB();
	static DailyPoliciesDB& GetInstance();
	//bool addPolicy(int day_of_week, const std::string& policy_json);
    bool updatePolicies(const std::string day_of_week, int enabled, const std::string allowed_hours, int limit_daily_minutes, int warn_on_exceed, int shutdown_on_exceed);
	json getPolicies();
	bool delete_all();
private:
	SQLiteDB& db;
};

class BrowserHistoryDB {
public:
	BrowserHistoryDB();
	~BrowserHistoryDB();
	static BrowserHistoryDB& GetInstance();
	bool add(const std::string& browser_name, const std::string& url, const std::string& title, int visit_count, int typed_count, int64_t last_visit_time, int hidden);
	int64_t getLastVisitTime(const std::string& browser_name);
	json query_history(const std::string& browser_name, int64_t since_time);
	bool delete_data(json data);
private:
	SQLiteDB& db;
};