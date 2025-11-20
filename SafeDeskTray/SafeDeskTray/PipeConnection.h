#pragma once
#include <windows.h>
#include <string>

#define PIPE_NAME L"\\\\.\\pipe\\SafeDeskTrayPipe"

#define PRORCESS_LABLE L"PROCESS"
#define APPDATA_LABLE L"APPDATA"
#define CAPTURESCREEN_LABEL L"CAPTURESCREEN"

class PipeConnection {
public:
	PipeConnection();
	~PipeConnection();
	static PipeConnection& GetInstance();
	bool InitPipe();
	bool SendMessageToServer(const std::wstring& message);

private:
	HANDLE hPipe;
};
