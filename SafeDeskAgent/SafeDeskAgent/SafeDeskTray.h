#pragma once
#include <Windows.h>
#include <string>

#define PROCESS_TRAY_NAME L"SafeDeskTray.exe"
#define TRAY_PIPE_NAME L"\\\\.\\pipe\\SafeDeskTrayPipe"

#define MAX_MESSAGE_SIZE 1024

#define PRORCESS_LABLE L"PROCESS"
#define APPDATA_LABEL L"APPDATA"
#define CAPTURESCREEN_LABEL L"CAPTURESCREEN"
#define NOTI_LABEL L"NOTI"

#include <set>

extern std::set<int> command_set;

class SafeDeskTray {
public:
	SafeDeskTray();
	~SafeDeskTray();
	static SafeDeskTray& GetInstance();
	bool InitPipeServer();
	bool KillTrayProcess();
	void ThreadCreateProcess();
	bool MessageHandle();
	bool SendMessageToTray(const std::wstring& wszMessage);
	void SetStartProcess(bool bStart) { m_bStartProcess = bStart; }
private:
	bool m_bStartProcess = true;
	HANDLE m_hPipe;
};