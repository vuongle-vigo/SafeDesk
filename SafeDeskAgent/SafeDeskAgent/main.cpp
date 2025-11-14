#include <iostream>
#include "SQLiteDB.h"
#include "HttpClient.h"
#include "ProcessMonitor.h"

int main() {
	//LoginDB& sqlite = LoginDB::GetInstance();
	//ProcessMonitor& processMonitor = ProcessMonitor::GetInstance();
	//processMonitor.MonitorProcessUsage();
	HttpClient& httpClient = HttpClient::GetInstance();
	httpClient.SendRequestRegister("dc0c2f2d478bea8f993bc6f654b6a4fd2f9ec5d6dccacdc162d0095fbb4e2443");
}