#include <iostream>
#include "SQLiteDB.h"
#include "HttpClient.h"
#include "ProcessMonitor.h"
#include "AppMonitor.h"

int main() {
	//LoginDB& sqlite = LoginDB::GetInstance();
	//ProcessMonitor& processMonitor = ProcessMonitor::GetInstance();
	//processMonitor.MonitorProcessUsage();
	//HttpClient& httpClient = HttpClient::GetInstance();
	//json res = httpClient.SendRequestRegister("fddc30166af63066fe7493420350928356aec2042ac906af5bd89e2f45a247e3");
	//if (res.is_null()) {
	//	std::cout << "Registration failed." << std::endl;
	//	return -1;
	//}

	//TokenDB& tokenDB = TokenDB::GetInstance();
	//
	//if (!tokenDB.addToken(res["agentToken"], res["agentId"])) {
	//	DEBUG_LOG("Failed to store token in database.");
	//}
	//DEBUG_LOG("Response: %s", res.dump().c_str());

	AppMonitor& appMonitor = AppMonitor::GetInstance();
	appMonitor.MonitorApp();
}