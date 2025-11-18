#include "PipeConnection.h"
#include "ProcessMonitor.h"
#include <thread>
#include <string>
#include <iostream>

#define PRORCESS_LABLE L"PROCESS"

void ThreadProcessMonitor() {
	PipeConnection& pipeConnection = PipeConnection::GetInstance();
	while (1) {
		std::string processPath = GetActiveWindowProcessPath();
		if (processPath == "") {
			std::this_thread::sleep_for(std::chrono::seconds(3));
			continue;
		}

		std::wstring windowTitle = GetActiveWindowTitle();
		if (!processPath.empty() && !windowTitle.empty()) {
			std::wstring message = std::wstring(PRORCESS_LABLE) + L"|" + windowTitle + L"|" + std::wstring(processPath.begin(), processPath.end()) + L"\0";
			if (!pipeConnection.SendMessageToServer(message)) {
				std::cerr << "Failed to send message to server." << std::endl;
			}
			else {
				std::cout << "Message sent successfully." << std::endl;
			}
		}

		std::this_thread::sleep_for(std::chrono::seconds(3)); // Sleep for 1 second
	}
}

int main() {
	// Initialize the pipe connection
	PipeConnection& pipeConnection = PipeConnection::GetInstance();
	std::thread monitorThread(ThreadProcessMonitor);
	if (pipeConnection.InitPipe()) {
		// Pipe initialized successfully
		
	}

	return 0;
}