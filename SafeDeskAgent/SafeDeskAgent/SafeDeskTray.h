#pragma once
#include <Windows.h>
#include <string>

#define PROCESS_TRAY_NAME L"SafeDeskTray.exe"
#define TRAY_PIPE_NAME L"\\\\.\\pipe\\SafeDeskTrayPipe"

#define MAX_MESSAGE_SIZE 1024

class SafeDeskTray {
public:
	SafeDeskTray();
	~SafeDeskTray();
	static SafeDeskTray& GetInstance();
	bool InitPipeServer();
	bool MessageHandle();
	bool SendMessageToTray(const std::wstring& wszMessage);
private:
	HANDLE m_hPipe;
};