#pragma once
#include <windows.h>
#include <string>

#define PIPE_NAME L"\\\\.\\pipe\\SafeDeskTrayPipe"

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
