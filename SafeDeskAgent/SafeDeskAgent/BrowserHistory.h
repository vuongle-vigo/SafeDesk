#pragma once
#include <windows.h>
#include "sqlite3/sqlite3.h"
#include "nlohmann/json.hpp"

#define BROWSER_HISTORY_PATH L"C:\\Users\\levuong\\AppData\\Local\\Microsoft\\Edge\\User Data\\History"

using json = nlohmann::json;

class BrowserHistory {
public:
	BrowserHistory();
	~BrowserHistory();
	static BrowserHistory& GetInstance();
	void SetAppDataPath(std::wstring wszAppDataPath);
	json GetEdgeHistory();
private:
	std::wstring m_wszAppDataPath;
    sqlite3* db;
};

