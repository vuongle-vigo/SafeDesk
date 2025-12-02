#include "Config.h"
#include "Common.h"
#include <chrono>
#include <ctime>

#define _CRT_SECURE_NO_WARNINGS

Config::Config() {
    //m_szServerHost = "10.15.4.3";
	m_szServerHost = "14.225.205.37";
    m_serverPort = 8889;
}

Config::~Config() {

}

Config& Config::GetInstance() {
    static Config instance;
    return instance;
}

std::wstring Config::GetWorkDir() {
    return m_wszWorkdir;
}

void Config::SetWorkDir(std::wstring workDir) {
	m_wszWorkdir = workDir;
}


std::string Config::GetHost() {
    return m_szServerHost;
}

int Config::GetPort() {
    return m_serverPort;
}