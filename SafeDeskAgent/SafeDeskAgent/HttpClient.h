#pragma once
#include "httplib/httplib.h"
#include <Windows.h>
#include <string>
#include "nlohmann/json.hpp"

using json = nlohmann::json;
using namespace httplib;

#define API_REGISTER				"/api/agents/register"
#define API_APPLICATION_POST		"/api/agents/applications"
#define API_POWER_USAGE_POST		"/api/agents/power-usage"
#define API_PROCESS_USAGE_POST		"/api/agents/process-usage"
#define API_COMMANDS_POLLING		"/api/agents/commands-polling"
class HttpClient {
public:
	HttpClient();
	~HttpClient();
	static HttpClient& GetInstance();
	json GetCommandsPolling();
	json SendRequestRegister(LPCSTR pszInstallerToken);
	bool SendRequestGetToken(LPCSTR pszUserName, LPCSTR pszPassword);
	bool SendRequestGetPolling();
	json SendRequestGetConfig();
	bool SendRequestUninstall();
	bool PostPowerUsage(json data);
	bool PostProcessUsage(json data);
	bool PostApplication(json data);
	bool SendRequestUpdateOnline();

private:
	Headers m_headers;
};
