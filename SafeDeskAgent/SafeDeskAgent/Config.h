#pragma once
#include <string>
#include <nlohmann/json.hpp>
#include "SQLiteDB.h"

class Config {
public:
    static Config& GetInstance();
    std::wstring GetWorkDir();
    void SetWorkDir(std::wstring workDir);
    std::string GetHost();
    int GetPort();
private:
    std::wstring m_wszWorkdir;
    std::string m_szServerHost;
    int m_serverPort;

    Config();
    ~Config();
    Config(const Config&) = delete;
    Config& operator=(const Config&) = delete;
};
