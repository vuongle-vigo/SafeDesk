#include "ProcessMonitor.h"
#include "SQLiteDB.h"
#include "Config.h"
#include <thread>
#include "SafeDeskTray.h"
#include "Policies.h"

ProcessMonitor::ProcessMonitor() {
    m_processInfo.m_fTimeUsage = 0.0;
}

ProcessMonitor::~ProcessMonitor() {
}

ProcessMonitor& ProcessMonitor::GetInstance() {
    static ProcessMonitor instance;
    return instance;
}

std::string ProcessMonitor::GetActiveWindowProcessPath() {
    HWND hwnd = GetForegroundWindow();
    if (hwnd == NULL) return "";

    DWORD processID;
    GetWindowThreadProcessId(hwnd, &processID);

    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
    if (hProcess == NULL) return "";

    TCHAR processName[MAX_PATH] = TEXT("<unknown>");

    if (GetModuleFileNameEx(hProcess, NULL, processName, MAX_PATH)) {
#ifdef UNICODE
        std::wstring ws(processName);
        std::string processNameStr(ws.begin(), ws.end());
#else
        std::string processNameStr(processName);
#endif
        CloseHandle(hProcess);
        return processNameStr;
    }

    CloseHandle(hProcess);
    return "";
}

std::wstring ProcessMonitor::GetActiveWindowTitle() {
    HWND hwnd = GetForegroundWindow();
    if (hwnd == NULL) return L"";
    TCHAR windowTitle[MAX_PATH];
    GetWindowText(hwnd, windowTitle, MAX_PATH);
#ifdef UNICODE
    std::wstring ws(windowTitle);
    return ws;
#else
    return std::string(windowTitle);
#endif
}

//void ProcessMonitor::ListRunningProcesses() {
//    HANDLE hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
//    if (hProcessSnap == INVALID_HANDLE_VALUE) {
//        PRINT_API_ERR("CreateToolhelp32Snapshot");
//        return;
//    }
//
//    PROCESSENTRY32 pe32;
//    pe32.dwSize = sizeof(PROCESSENTRY32);
//
//    if (Process32First(hProcessSnap, &pe32)) {
//        do {
//            std::string processPath = this->GetProcessPath(pe32.th32ProcessID);
//            ProcessMonitor::ProcessInfo processInfo;
//#ifdef UNICODE
//            std::wstring ws(pe32.szExeFile);
//            std::string processName(ws.begin(), ws.end());
//#else
//            std::string processName(pe32.szExeFile);      
//#endif
//            processInfo.m_sProcessName = processName;
//            processInfo.m_sProcessPath = processPath;
//
//            this->m_vProcessInfo.push_back(processInfo);
//        } while (Process32Next(hProcessSnap, &pe32));
//    }
//    else {
//        PRINT_API_ERR("Process32First");
//    }
//
//    CloseHandle(hProcessSnap);
//}

std::string ProcessMonitor::GetProcessPath(DWORD dwProcessId) {
    TCHAR processName[MAX_PATH] = TEXT("<unknown>");

    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, dwProcessId);
    if (hProcess) {
        HMODULE hMod;
        DWORD cbNeeded;

        if (EnumProcessModules(hProcess, &hMod, sizeof(hMod), &cbNeeded)) {
            GetModuleFileNameEx(hProcess, hMod, processName, sizeof(processName) / sizeof(TCHAR));
        }

        CloseHandle(hProcess);
    }

#ifdef UNICODE
    std::wstring ws(processName);
    return std::string(ws.begin(), ws.end());
#else
    return std::string(processName);
#endif
}

BOOL ProcessMonitor::KillProcessById(DWORD dwProcessId) {
	HANDLE hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, dwProcessId);
	if (!hProcess) {
		PRINT_API_ERR("OpenProcess");
		return FALSE;
	}
	if (!TerminateProcess(hProcess, 0)) {
		PRINT_API_ERR("TerminateProcess");
		CloseHandle(hProcess);
		return FALSE;
	}
	CloseHandle(hProcess);
	return TRUE;
}

BOOL ProcessMonitor::StopProcess(const std::wstring sProcessName) {
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) {
        PRINT_API_ERR("CreateToolhelp32Snapshot");
        return FALSE;
    }

    PROCESSENTRY32 pe32 = { 0 };
    pe32.dwSize = sizeof(PROCESSENTRY32);

    if (!Process32First(hSnapshot, &pe32)) {
        PRINT_API_ERR("Process32First");
        CloseHandle(hSnapshot);
        return FALSE;
    }

    BOOL result = FALSE;

    do {
        if (_wcsicmp(pe32.szExeFile, sProcessName.c_str()) == 0) {

            HANDLE hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, pe32.th32ProcessID);
            if (!hProcess) {
                PRINT_API_ERR("OpenProcess");
                continue;
            }

            if (!TerminateProcess(hProcess, 0)) {
                PRINT_API_ERR("TerminateProcess");
                CloseHandle(hProcess);
                continue;
            }

            CloseHandle(hProcess);
            result = TRUE;
            break; 
        }

    } while (Process32Next(hSnapshot, &pe32));

    CloseHandle(hSnapshot);
    return result;
}

bool ProcessMonitor::SetInfoProcess(const std::string& sProcessPath, const std::wstring& wsProcessTitle, int processID) {
	LogToFile("Setting process info: Path=" + sProcessPath +
		", Title=" + WstringToString(wsProcessTitle) + ", PID=" + std::to_string(processID));
	std::cout << "Setting process info: Path=" << sProcessPath <<
		", Title=" << WstringToString(wsProcessTitle) << ", PID=" << processID << std::endl;

    m_processInfo.m_sCurrentProcessPath = sProcessPath;
    m_processInfo.m_wsCurrentWindowTitle = wsProcessTitle;
	m_processInfo.m_processID = processID;
    return true;
}

bool ProcessMonitor::CheckBlockApp(std::string& sProcessPath) {
	Policies& policies = Policies::GetInstance();
	std::string sProcessDir = GetProcessDir(sProcessPath);
	if (sProcessDir.empty())
		return false;
	AppPolicy appPolicy = policies.getAppPolicy(sProcessDir);
	LogToFile("Find app policy for process: " + sProcessPath +
		", Install location: " + appPolicy.install_location +
		", is_blocked: " + std::to_string(appPolicy.is_blocked) +
		", action_on_limit: " + appPolicy.action_on_limit
	);

    if (appPolicy.app_id == 0) {
        return false;
    }

	std::string processName = GetProcessName(sProcessPath);
    SafeDeskTray& safeDeskTray = SafeDeskTray::GetInstance();
    if (appPolicy.is_blocked == 1) {
		LogToFile("Blocked App Detected: " + sProcessPath);
        safeDeskTray.SendMessageToTray(NOTI_LABEL + std::wstring(L"|Blocked App Detected, Stop Now: ") + StringToWstring(sProcessPath));
		return KillProcessById(m_processInfo.m_processID);
    }

    if (appPolicy.action_on_limit == "none") {
        return true;
    }
    else if (appPolicy.action_on_limit == "warn") {
        std::string message = "|Warn App Detected: " + sProcessPath;
        /*std::thread([message]() {
            MessageBoxA(
                NULL,
                message.c_str(),
                "App Warning",
                MB_OK | MB_ICONWARNING
            );
            }).detach();*/
        LogToFile(message);
        safeDeskTray.SendMessageToTray(NOTI_LABEL + StringToWstring(message));
        return true; // Warn app found
    }
    else if (appPolicy.action_on_limit == "close") {
        std::string message = "|Warn App Detected: " + sProcessPath + "\nStop app now!!!";
        /*std::thread([message]() {
            MessageBoxA(
                NULL,
                message.c_str(),
                "App Warning",
                MB_OK | MB_ICONWARNING
            );
            }).detach();*/
		LogToFile(message);
        safeDeskTray.SendMessageToTray(NOTI_LABEL + StringToWstring(message));
        return KillProcessById(m_processInfo.m_processID);
    }

    return true; 
}

void ProcessMonitor::MonitorProcessUsage() {
    ProcessUsageDB& processUsageDB = ProcessUsageDB::GetInstance();
    PowerUsageDB& powerUsageDB = PowerUsageDB::GetInstance();
    std::string sTime;
    while (WaitForSingleObject(g_StopEvent, 5 * 1000) != WAIT_OBJECT_0) {
        //std::wstring wsActiveWindowTitle = GetActiveWindowTitle();
		if (CheckBlockApp(m_processInfo.m_sCurrentProcessPath)) {
			//Sleep((int)m_fTimeDelayQuery);
			//continue;
		}

        if (m_processInfo.m_wsProcessTitle != m_processInfo.m_wsCurrentWindowTitle && !m_processInfo.m_wsCurrentWindowTitle.empty()) {
            sTime = GetCurrentTimeHour();
            m_processInfo.m_wsProcessTitle = m_processInfo.m_wsCurrentWindowTitle;
            //m_processInfo.m_sProcessPath = GetActiveWindowProcessPath();
            m_processInfo.m_sProcessPath = m_processInfo.m_sCurrentProcessPath;
            m_processInfo.m_fTimeUsage = 0;
			LogToFile(
				"Active Window Title: " + WstringToString(m_processInfo.m_wsProcessTitle) +
				", Process Path: " + m_processInfo.m_sProcessPath + ", CurrentDate: " + GetCurrentDate() + ", StartTime: " + sTime
			);

            //Insert new database
            if (!processUsageDB.add(
                m_processInfo.m_wsProcessTitle,
                m_processInfo.m_sProcessPath,
                GetCurrentDate(),
                sTime,
                m_processInfo.m_fTimeUsage
            )) {
				//std::cerr << "Failed to add process usage to database." << std::endl;
			}
            else {
                //std::cout << "Added new process usage to database." << std::endl;
            }
        }
        else {
            m_processInfo.m_fTimeUsage += m_fTimeDelayQuery / 60000; // Convert milliseconds to minutes
			LogToFile(
                "Process Path: " + m_processInfo.m_sProcessPath +
                ", Time Usage: " + std::to_string(m_processInfo.m_fTimeUsage) + " minutes"
            );
            //Update database
            if (!processUsageDB.update_lastest(
                m_processInfo.m_wsProcessTitle,
                m_processInfo.m_sProcessPath,
                GetCurrentDate(),
                sTime,
                m_processInfo.m_fTimeUsage
            )) {
				//std::cerr << "Failed to update process usage in database." << std::endl;
            }
            else {
				//std::cout << "Updated process usage in database." << std::endl;
            }
        }

        // Check AppLock.exe app isn't active
        if (m_processInfo.m_sProcessPath.find("LockApp.exe") == std::string::npos) {
            std::string currentDate = GetCurrentDate();
            int currentHour = ConvertStringToInt(GetCurrentTimeHour());
            double usage_minutes = powerUsageDB.QueryByTime(currentDate, currentHour);
            if (usage_minutes != -1) {
                double new_usage_minutes = usage_minutes + m_fTimeDelayQuery / 60000; // Convert milliseconds to minutes
                if (!powerUsageDB.update(currentDate, currentHour, new_usage_minutes)) {
                    //std::cerr << "Failed to update power usage in database." << std::endl;
                }
            }
            else {
                if (!powerUsageDB.add(currentDate, currentHour, m_fTimeDelayQuery / 60000)) {
                    //std::cerr << "Failed to add power usage in database." << std::endl;
                }
            }
        }
    }
}

bool ProcessMonitor::CheckProcessIsRunning(std::wstring wsProcessName) {
	HANDLE hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
	if (hProcessSnap == INVALID_HANDLE_VALUE) {
		PRINT_API_ERR("CreateToolhelp32Snapshot");
		return false;
	}
	PROCESSENTRY32 pe32;
	pe32.dwSize = sizeof(PROCESSENTRY32);
    if (Process32First(hProcessSnap, &pe32)) {
        do {
            if (pe32.szExeFile == wsProcessName) {
                CloseHandle(hProcessSnap);
                return true;
            }
        } while (Process32Next(hProcessSnap, &pe32));
        CloseHandle(hProcessSnap);
    }
    
    return false;
}