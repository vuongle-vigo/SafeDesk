#ifndef PROCESS_MONITOR_HPP
#define PROCESS_MONITOR_HPP

#include <Windows.h>
#include <psapi.h> 
#include <tlhelp32.h>
#include <string>
#include <vector>
#include "Common.h"

class ProcessMonitor {
public:
	ProcessMonitor();
	~ProcessMonitor();
	static ProcessMonitor& GetInstance();
	std::string GetActiveWindowProcessPath();
	std::wstring GetActiveWindowTitle();
	void MonitorProcessUsage();
	bool CheckBlockApp(std::string& sProcessPath);
	void ListRunningProcesses();
	BOOL StopProcess(const std::wstring sProcessName);
	std::string GetProcessPath(DWORD dwProcessId);
	bool SetInfoProcess(const std::string& sProcessPath, const std::wstring& wsProcessTitle);
	bool CheckProcessIsRunning(std::wstring wsProcessName);
private:
	typedef struct _ProcessInfo {
		std::string m_sProcessPath;
		std::wstring m_wsProcessTitle;
		std::wstring m_wsCurrentWindowTitle;
		std::string m_sCurrentProcessPath;
		double m_fTimeUsage;
	} ProcessInfo, * PProcessInfo;

	ProcessInfo m_processInfo;
	double m_fTimeDelayQuery = 6000; // 60 seconds
};

#endif