#include "PipeConnection.h"
#include "ProcessMonitor.h"
#include <thread>
#include <string>
#include <iostream>
#include <shlobj.h>

std::wstring GetLocalAppDataPath()
{
	PWSTR rawPath = nullptr;
	std::wstring result;

	HRESULT hr = SHGetKnownFolderPath(FOLDERID_LocalAppData, 0, NULL, &rawPath);

	if (SUCCEEDED(hr) && rawPath != nullptr) {
		result = rawPath;
		CoTaskMemFree(rawPath);
	}

	return result;
}

void ThreadProcessMonitor() {
	std::wstring appDataPath = GetLocalAppDataPath();
	PipeConnection& pipeConnection = PipeConnection::GetInstance();
	while (1) {
		std::string processPath = GetActiveWindowProcessPath();
		std::wstring windowTitle = GetActiveWindowTitle();
		//std::cout << "Process path: " << processPath << std::endl;
		if (!processPath.empty() && !windowTitle.empty()) {
			std::wstring message = std::wstring(PRORCESS_LABLE) + L"|" + windowTitle + L"|" + std::wstring(processPath.begin(), processPath.end()) + L"\0";
			if (!pipeConnection.SendMessageToServer(message)) {
				std::cerr << "Failed to send message to server." << std::endl;
			}
			else {
				std::wcout << L"Message sent successfully." << message << std::endl;
			}
		}

		std::wstring appDataMessage = std::wstring(APPDATA_LABLE) + L"|" + appDataPath + L"\0";
		pipeConnection.SendMessageToServer(appDataMessage);
		std::this_thread::sleep_for(std::chrono::seconds(3)); // Sleep for 1 second
	}
}
#include "CaptureScreen.h"
int main() {
	// Initialize the pipe connection
	PipeConnection& pipeConnection = PipeConnection::GetInstance();
	std::thread monitorThread(ThreadProcessMonitor);
	if (pipeConnection.InitPipe()) {
		// Pipe initialized successfully
		// You can add additional logic here if needed
		
	}
	else {
		// Handle pipe initialization failure
		// For example, you could log an error or show a message box
	}

	return 0;
}