#include <iostream>
#include "SQLiteDB.h"
#include "ProcessMonitor.h"

int main() {
	LoginDB& sqlite = LoginDB::GetInstance();
	ProcessMonitor& processMonitor = ProcessMonitor::GetInstance();
	processMonitor.MonitorProcessUsage();
}