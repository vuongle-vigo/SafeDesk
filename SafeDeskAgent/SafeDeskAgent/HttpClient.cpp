
//#define CPPHTTPLIB_OPENSSL_SUPPORT
#include "HttpClient.h"
#include "nlohmann/json.hpp"
#include "Config.h"
#include "ComputerInfo.h"
#include "SQLiteDB.h"

#define MINE_BEGIN			"----------------------------2896059025745124%08d\r\n"\
							"Content-Disposition: form-data; name=\"file\"; filename=\"%s\"\r\n"\
							"Content-Type: application/x-msdos-program\r\n\r\n"
#define MINE_END			"\r\n----------------------------2896059025745124%08d--\r\n"
#define MINE_CONTENT_TYPE	"multipart/form-data; boundary=--------------------------2896059025745124%08d"

HttpClient::HttpClient()
{
	TokenDB& tokenDB = TokenDB::GetInstance();
	std::string token, agentId;
	token = tokenDB.getAgentToken();
	agentId = tokenDB.getAgentId();
	DEBUG_LOG("HttpClient: Agent Token: %s", token.c_str());
	m_headers = {
		{"x-agent-token", token},
		{"x-agent-id", agentId}
	};
}

HttpClient::~HttpClient() {}

HttpClient& HttpClient::GetInstance() {
	static HttpClient instance;
	return instance;
}

json HttpClient::SendRequestRegister(LPCSTR pszInstallerToken) {
	Config& cfg = Config::GetInstance();
	ComputerInfo comInfo = ComputerInfo::GetInstance();
	Client client(cfg.GetHost(), cfg.GetPort());
	Headers headers = {
		{ "x-installer-token", pszInstallerToken }
	};

	json jsBody;
	json hardwareInfo;
	hardwareInfo["guid"] = comInfo.GetMachineGUID();
	hardwareInfo["os"] = comInfo.GetWindowsVersion();
	hardwareInfo["hostname"] = comInfo.GetDesktopName();
	jsBody["hardwareInfo"] = hardwareInfo;

	std::string szBody = jsBody.dump();
	auto response = client.Post(API_REGISTER, headers, szBody, "application/json");
	if (response && response->status == 200)
	{
		auto res = json::parse(response->body);
		return res;
	}
	else
	{
		//auto res = json::parse(response->body);
		return json();
		//Log->Error("Request failed with error: %d", -1);
	}
}

bool HttpClient::SendRequestGetPolling() {
	Config& cfg = Config::GetInstance();

	Client client(cfg.GetHost(), cfg.GetPort());

	auto response = client.Get("/api/polling", m_headers);

	if (response && response->status == 200) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
		return false;
	}

	return true;
}

bool HttpClient::PushPowerUsage(json data) {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	auto response = m_client.Post("/api/kid/add-power-usage", m_headers, data.dump(), "application/json");
	if (response && response->status == 201) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
		return false;
	}
	return true;
}

bool HttpClient::PushProcessUsage(json data) {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	auto response = m_client.Post("/api/kid/add-process-usage", m_headers, data.dump(), "application/json");
	if (response && response->status == 201) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
		return false;
	}
	return true;
}

bool HttpClient::PostApplication(json data) {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	auto response = m_client.Post(API_APPLICATION_POST, m_headers, data.dump(), "application/json");
	if (response && response->status == 201) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->body << std::endl;
		return false;
	}
	return true;
}

json HttpClient::SendRequestGetConfig() {
	Config& cfg = Config::GetInstance();
	json result;
	Client m_client(cfg.GetHost(), cfg.GetPort());
	Headers headers = {
		{ "Authorization", "Bearer "  }
	};
	auto response = m_client.Get("/api/kid/get-config", headers);
	if (response && response->status == 200) {
		try {
			result = json::parse(response->body)[0];
		}
		catch (const json::parse_error& e) {
			std::cerr << "JSON parse error: " << e.what() << std::endl;
			return json();
		}
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
		return json();
	}
	return result;
}

bool HttpClient::SendRequestUpdateOnline() {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	Headers headers = {
		{ "Authorization", "Bearer "  }
	};
	auto response = m_client.Post("/api/kid/update-status", m_headers, { "" }, "application/json");
	if (response && response->status == 201) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
		return false;
	}

	return true;
}

bool HttpClient::SendRequestUninstall() {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	Headers headers = {
		{ "Authorization", "Bearer "  }
	};
	auto response = m_client.Post("/api/kid/uninstall", m_headers, { "" }, "application/json");
	if (response && response->status == 201) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
		return false;
	}

	return true;
}