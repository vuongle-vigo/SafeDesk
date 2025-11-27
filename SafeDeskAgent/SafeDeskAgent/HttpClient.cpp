
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

json HttpClient::GetCommandsPolling() {
	Config& cfg = Config::GetInstance();
	Client client(cfg.GetHost(), cfg.GetPort());
	auto response = client.Get(API_COMMANDS_POLLING, m_headers);
	if (response == nullptr) {
		std::cerr << "No response from server." << std::endl;
		return json();
	}

	if (response && response->status == 200) {
		try {
			auto res = json::parse(response->body);
			return res;
		}
		catch (const json::parse_error& e) {
			std::cerr << "JSON parse error: " << e.what() << std::endl;
			return json();
		}
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
	}

	return json();
}

json HttpClient::GetAppPolicies() {
	Config& cfg = Config::GetInstance();
	Client client(cfg.GetHost(), cfg.GetPort());
	auto response = client.Get(API_APP_POLICIES_GET, m_headers);
	if (response == nullptr) {
		std::cerr << "No response from server." << std::endl;
		return json();
	}

	if (response && response->status == 200) {
		try {
			auto res = json::parse(response->body);
			return res;
		}
		catch (const json::parse_error& e) {
			std::cerr << "JSON parse error: " << e.what() << std::endl;
			return json();
		}
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
	}

	return json();
}

json HttpClient::GetDailyPolicies() {
	Config& cfg = Config::GetInstance();
	Client client(cfg.GetHost(), cfg.GetPort());
	auto response = client.Get(API_DAILY_POLICIES_GET, m_headers);
	if (response == nullptr) {
		std::cerr << "No response from server." << std::endl;
		return json();
	}
	if (response && response->status == 200) {
		try {
			auto res = json::parse(response->body);
			return res;
		}
		catch (const json::parse_error& e) {
			std::cerr << "JSON parse error: " << e.what() << std::endl;
			return json();
		}
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
	}
	return json();
}

bool HttpClient::PostPowerUsage(json data) {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	auto response = m_client.Post(API_POWER_USAGE_POST, m_headers, data.dump(), "application/json");
	if (response == nullptr) {
		std::cerr << "No response from server." << std::endl;
		return false;
	}

	if (response && response->status == 200) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->body << std::endl;
		return false;
	}

	return true;
}

bool HttpClient::PostProcessUsage(json data) {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	auto response = m_client.Post(API_PROCESS_USAGE_POST, m_headers, data.dump(), "application/json");
	if (response == nullptr) {
		std::cerr << "No response from server." << std::endl;
		return false;
	}

	if (response && response->status == 200) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->body << std::endl;
		return false;
	}
	return true;
}
#include <fstream>

bool HttpClient::PostFileScreenshot(const std::string& sFilePath, int command_id) {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());

	// Read file to buffer (binary)
	std::ifstream file(sFilePath, std::ios::binary);
	if (!file.is_open()) {
		std::cerr << "Failed to open file: " << sFilePath << std::endl;
		return false;
	}

	std::vector<char> fileContent((std::istreambuf_iterator<char>(file)),
		std::istreambuf_iterator<char>());
	file.close();

	// Create boundary
	std::string boundary = "----SafedeskBoundary" + std::to_string(rand());

	// Build multipart body
	std::string body;
	body.reserve(fileContent.size() + 512);

	body += "--" + boundary + "\r\n";
	body += "Content-Disposition: form-data; name=\"file\"; filename=\"screen.jpg\"\r\n";
	body += "Content-Type: image/jpeg\r\n\r\n";
	body.append(fileContent.begin(), fileContent.end());
	body += "\r\n--" + boundary + "--\r\n";

	// Headers
	Headers headers = m_headers;
	headers.insert({ "x-command-id", std::to_string(command_id)});
	headers.emplace("Content-Type", "multipart/form-data; boundary=" + boundary);

	// Send request
	auto response = m_client.Post(API_SCREENSHOT_POST, headers, body, "multipart/form-data");

	if (!response) {
		std::cerr << "No response from server." << std::endl;
		return false;
	}

	if (response->status == 200) {
		std::cout << "Response: " << response->body << std::endl;
		return true;
	}

	std::cerr << "Request failed: " << response->status << " - " << response->body << std::endl;
	return false;
}


bool HttpClient::PostApplication(json data) {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	auto response = m_client.Post(API_APPLICATION_POST, m_headers, data.dump(), "application/json");
	if (response == nullptr) {
		std::cerr << "No response from server." << std::endl;
		return false;
	}

	if (response && response->status == 200) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->body << std::endl;
		return false;
	}
	return true;
}

bool HttpClient::PostBrowserHistory(json data) {
	Config& cfg = Config::GetInstance();
	Client m_client(cfg.GetHost(), cfg.GetPort());
	auto response = m_client.Post(API_BROWSER_HISTORY_POST, m_headers, data.dump(), "application/json");
	if (response == nullptr) {
		std::cerr << "No response from server." << std::endl;
		return false;
	}
	if (response && response->status == 200) {
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
	if (response && response->status == 200) {
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
	if (response && response->status == 200) {
		std::cout << "Response: " << response->body << std::endl;
	}
	else {
		std::cerr << "Request failed: " << response->status << std::endl;
		return false;
	}

	return true;
}