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
#define API_SCREENSHOT_POST			"/api/agents/capture-screen"
#define API_UNINSTALL_POST			"/api/agents/uninstall"
#define API_APP_POLICIES_GET		"/api/agents/app-policies"
#define API_DAILY_POLICIES_GET		"/api/agents/daily-policies"
#define API_BROWSER_HISTORY_POST	"/api/agents/browser-history"

class HttpClient {
public:
	HttpClient();
	~HttpClient();
	static HttpClient& GetInstance();
	json GetCommandsPolling();
	json GetAppPolicies();
	json GetDailyPolicies();
	json SendRequestRegister(LPCSTR pszInstallerToken);
	bool SendRequestGetToken(LPCSTR pszUserName, LPCSTR pszPassword);
	bool SendRequestGetPolling();
	json SendRequestGetConfig();
	bool SendRequestUninstall();
	bool PostFileScreenshot(const std::string& sFilePath, int commandId);
	bool PostPowerUsage(json data);
	bool PostProcessUsage(json data);
	bool PostApplication(json data);
	bool PostBrowserHistory(json data);
	bool SendRequestUpdateOnline();

private:
	Headers m_headers;
};
