#pragma once
#include <windows.h>
#include "sqlite3/sqlite3.h"
#include "nlohmann/json.hpp"

class BrowserDB {
public:
    BrowserDB(std::string dbPath);
    ~BrowserDB();
    bool execute(const std::string& query);
    sqlite3* getDB() const { return db; }

private:
    sqlite3* db;
    std::string dbPath;
};

class BrowserHistory {
public:
	BrowserHistory();
	~BrowserHistory();
	static BrowserHistory& GetInstance();
	void SetAppDataPath(std::wstring wszAppDataPath);
private:
	std::wstring m_wszAppDataPath;
};

