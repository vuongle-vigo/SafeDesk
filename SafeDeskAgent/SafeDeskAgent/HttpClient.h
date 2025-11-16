#pragma once
#include "httplib/httplib.h"
#include <Windows.h>
#include <string>
#include "nlohmann/json.hpp"

using json = nlohmann::json;
using namespace httplib;

#define API_REGISTER				"/api/agent/register"
#define API_APPLICATION_POST		"/api/agent/applications"

class HttpClient {
public:
	HttpClient();
	~HttpClient();
	static HttpClient& GetInstance();
	json SendRequestRegister(LPCSTR pszInstallerToken);
	bool SendRequestGetToken(LPCSTR pszUserName, LPCSTR pszPassword);
	bool SendRequestGetPolling();
	json SendRequestGetConfig();
	bool SendRequestUninstall();
	bool PushPowerUsage(json data);
	bool PushProcessUsage(json data);
	bool PostApplication(json data);
	bool SendRequestUpdateOnline();

private:
	Headers m_headers;
};
