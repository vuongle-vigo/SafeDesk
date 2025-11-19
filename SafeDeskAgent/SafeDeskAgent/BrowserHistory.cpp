#include "BrowserHistory.h"
#include "Common.h"

BrowserHistory::BrowserHistory() {
	if (!db) {
		if (sqlite3_open(WstringToString(BROWSER_HISTORY_PATH).c_str(), &db) != SQLITE_OK) {
			LogToFile("Can't open database: " + WstringToString(BROWSER_HISTORY_PATH));
			db = nullptr;
		}
	}
}

BrowserHistory::~BrowserHistory() {
	if (db) {
		sqlite3_close(db);
	}
}

BrowserHistory& BrowserHistory::GetInstance() {
	static BrowserHistory instance;
	return instance;
}

void BrowserHistory::SetAppDataPath(std::wstring wszAppDataPath) {
	m_wszAppDataPath = wszAppDataPath;
}

json BrowserHistory::GetEdgeHistory() {
    json historyArray = json::array();

    const char* sql =
        "SELECT frame_url, SUM(visit_count) AS total_visits "
        "FROM visited_links "
        "GROUP BY frame_url "
        "ORDER BY total_visits DESC;";

    sqlite3_stmt* stmt;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) {
        LogToFile("Failed to prepare statement: " + std::string(sqlite3_errmsg(db)));
        return historyArray;
    }

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        const unsigned char* frameUrlText = sqlite3_column_text(stmt, 0);
        int totalVisits = sqlite3_column_int(stmt, 1);

        json item;
        item["frame_url"] = frameUrlText ? reinterpret_cast<const char*>(frameUrlText) : "";
        item["visit_count"] = totalVisits;

        historyArray.push_back(item);
    }

    sqlite3_finalize(stmt);
    return historyArray;
}

