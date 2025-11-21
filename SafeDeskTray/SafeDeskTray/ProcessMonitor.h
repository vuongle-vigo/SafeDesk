#pragma once

#include <string>
#include <windows.h>

std::string GetActiveWindowProcessPath(DWORD* processID);
std::wstring GetActiveWindowTitle();