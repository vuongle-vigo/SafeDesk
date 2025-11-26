#pragma once
#include <windows.h>
#include "sqlite3/sqlite3.h"
#include "nlohmann/json.hpp"

#define BROWSER_HISTORY_PATH L"C:\\Users\\levuong\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\History"
#define TEMP_BROWSER_HISTORY_NAME L"TempHistory"

using json = nlohmann::json;

struct BrowserItem {
    std::string url;
    std::string title;
    int visit_count;
    int typed_count;
    int64_t last_visit_time;
    int hidden;
};


class BrowserHistory {
public:
	BrowserHistory();
	~BrowserHistory();
	static BrowserHistory& GetInstance();
	void SetAppDataPath(std::wstring wszAppDataPath);
    std::vector<BrowserItem> GetEdgeHistory();
    void MonitorBrowserHistory();
private:
	std::wstring m_wszAppDataPath;
    sqlite3* db;
};

