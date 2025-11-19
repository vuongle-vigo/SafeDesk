#include "SafeDeskTray.h"
#include "Common.h"
#include <sddl.h>
#include "ProcessMonitor.h"
#include "BrowserHistory.h"
#include <thread>

#pragma comment(lib, "advapi32.lib")

#define PRORCESS_LABLE L"PROCESS"
#define APPDATA_LABEL L"APPDATA"

SafeDeskTray::SafeDeskTray() {
	m_hPipe = NULL;
}

SafeDeskTray::~SafeDeskTray() {
	if (m_hPipe) {
		CloseHandle(m_hPipe);
		LogToFile("Pipe closed successfully.");
		m_hPipe = NULL;
	}
}

SafeDeskTray& SafeDeskTray::GetInstance() {
	static SafeDeskTray instance;
	return instance;
}

void SafeDeskTray::ThreadCreateProcess() {
	ProcessMonitor& processMonitor = ProcessMonitor::GetInstance();
	while (1) {
		std::wstring wszTrayPath = GetCurrentDir() + PROCESS_TRAY_NAME;
		LogToFile("Starting SafeDeskTray process from path: " + std::string(wszTrayPath.begin(), wszTrayPath.end()));
		if (processMonitor.CheckProcessIsRunning(PROCESS_TRAY_NAME)) {
			std::this_thread::sleep_for(std::chrono::seconds(5));
			continue;
		}

		if (!StartProcessInUserSession(wszTrayPath)) {
			LogToFile("Failed to start SafeDeskTray process.");
		}
		std::this_thread::sleep_for(std::chrono::seconds(5));
	}
}

bool SafeDeskTray::InitPipeServer() {
    std::thread threadCreateProcess(&SafeDeskTray::ThreadCreateProcess, this);
	BrowserHistory& browserHistory = BrowserHistory::GetInstance();
    SECURITY_ATTRIBUTES sa;
    sa.nLength = sizeof(SECURITY_ATTRIBUTES);
    sa.bInheritHandle = FALSE;

    PSECURITY_DESCRIPTOR pSD = NULL;
    const char* sddl = "D:(A;;GA;;;WD)";
    if (!ConvertStringSecurityDescriptorToSecurityDescriptorA(
        sddl, SDDL_REVISION_1, &pSD, NULL))
    {
        LogToFile("Failed to create security descriptor: " +
            std::to_string(GetLastError()));
        return false;
    }
    sa.lpSecurityDescriptor = pSD;

    while (true) {

        LogToFile("Creating pipe for new client...");

        m_hPipe = CreateNamedPipeW(
            TRAY_PIPE_NAME,
            PIPE_ACCESS_DUPLEX,
            PIPE_TYPE_MESSAGE | PIPE_READMODE_MESSAGE | PIPE_WAIT,
            1,
            MAX_MESSAGE_SIZE,
            MAX_MESSAGE_SIZE,
            0,
            &sa
        );

        if (m_hPipe == INVALID_HANDLE_VALUE) {
            LogToFile("CreateNamedPipeW failed: " + std::to_string(GetLastError()));
            Sleep(1000);
            continue;
        }

        LogToFile("Waiting for client...");

        if (!ConnectNamedPipe(m_hPipe, NULL)) {
            if (GetLastError() != ERROR_PIPE_CONNECTED) {
                LogToFile("ConnectNamedPipe failed: " + std::to_string(GetLastError()));
                CloseHandle(m_hPipe);
                m_hPipe = NULL;
                continue;
            }
        }

        LogToFile("Client connected.");

        DWORD bytesRead = 0;
        ProcessMonitor& processMonitor = ProcessMonitor::GetInstance();

        while (true) {

            wchar_t buffer[MAX_MESSAGE_SIZE] = { 0 };

            DWORD availableBytes = 0;
            if (!PeekNamedPipe(m_hPipe, NULL, 0, NULL, &availableBytes, NULL)) {
                LogToFile("PeekNamedPipe failed: " + std::to_string(GetLastError()));
                break;
            }

            if (availableBytes == 0) {
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                continue;
            }

            if (!ReadFile(
                m_hPipe,
                buffer,
                MAX_MESSAGE_SIZE * sizeof(wchar_t),
                &bytesRead,
                NULL))
            {
                DWORD err = GetLastError();
                if (err == ERROR_BROKEN_PIPE)
                    LogToFile("Client disconnected.");
                else
                    LogToFile("ReadFile failed: " + std::to_string(err));
                break;
            }

            if (bytesRead == 0) {
                LogToFile("Client disconnected.");
                break;
            }

            std::wstring message(buffer, bytesRead / sizeof(wchar_t));
            LogToFile("Received message: " + std::string(message.begin(), message.end()));

            size_t sep1 = message.find(L'|');
            if (sep1 != std::wstring::npos) {

                std::wstring data1 = message.substr(0, sep1);
                if (data1 == PRORCESS_LABLE) {

                    size_t sep2 = message.find(L'|', sep1 + 1);
                    if (sep2 != std::wstring::npos) {
                        std::wstring data2 = message.substr(sep1 + 1, sep2 - sep1 - 1);
                        std::wstring data3 = message.substr(sep2 + 1);

						std::string sProcessPath = std::string(data3.begin(), data3.end());

                        processMonitor.SetInfoProcess(
                            ToLowercase(CleanProcessPath(sProcessPath)),
                            data2
                        );
                    }
				}
                else if (data1 == APPDATA_LABEL) {
                    // just get from sep 1, don't have sep2
                    std::wstring data2 = message.substr(sep1 + 1);
					browserHistory.SetAppDataPath(data2);
					LogToFile("Set AppData path to: " + std::string(data2.begin(), data2.end()));
                }
            }
        }

        DisconnectNamedPipe(m_hPipe);
        CloseHandle(m_hPipe);
        m_hPipe = NULL;

        LogToFile("Ready for next client.");
    }

    threadCreateProcess.detach();
    return true;
}


bool SafeDeskTray::SendMessageToTray(const std::wstring& wszMessage) {
	if (m_hPipe == NULL) {
		LogToFile("Pipe not initialized.");
		return false;
	}

	DWORD bytesWritten = 0;
	if (!WriteFile(m_hPipe, wszMessage.c_str(), wszMessage.size() * sizeof(wchar_t), &bytesWritten, NULL)) {
		LogToFile("WriteFile failed: " + std::to_string(GetLastError()));
		return false;
	}
	return true;
}