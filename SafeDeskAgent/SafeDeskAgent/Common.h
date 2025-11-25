#pragma once
#include <string>
#include <iostream>
#include <vector>
#include <Windows.h>
#include <gdiplus.h>
#include <cstdio>

#pragma comment(lib, "Gdiplus.lib")
#pragma comment(lib, "Crypt32.lib")

#define LOG_FILE L"SafeDeskAgent.log"

#ifdef _DEBUG
#define PRINT_API_ERR(API_NAME) \
	std::cout << API_NAME << ": " << GetLastError() << std::endl;
#else
#define PRINT_API_ERR(API_NAME) 
#endif

#ifdef _DEBUG
#define DEBUG_LOG(fmt, ...) \
    std::printf(fmt, __VA_ARGS__); \
    std::printf("\n");
#else
#define DEBUG_LOG(fmt, ...)
#endif

extern ULONG_PTR gdiplusToken;

std::string GetCurrentDate();
std::string GetCurrentTimeHour();
std::string GetCurrentTimeMinute();
int GetWeekDay();
int ConvertStringToInt(const std::string& str);
std::wstring DosPathToNtPath(const std::wstring& dosPath);
std::wstring GetCurrentDir();
std::wstring GetCurrentProcessPath();
std::string WstringToString(const std::wstring& wstr);
std::wstring StringToWstring(const std::string& str);
std::wstring RemoveQuotesW(const std::wstring& input);
std::string RemoveQuotes(const std::string& input);
std::wstring ToLowercaseW(const std::wstring& input);
std::string ToLowercase(const std::string& input);
std::string RemoveTrailingSplash(const std::string& input);
std::string GetProcessDir(const std::string& processPath);
std::string GetProcessName(const std::string& processPath);
void LogToFile(const std::string& message, const std::wstring& filePath = LOG_FILE);
bool StartProcessInUserSession(const std::wstring& applicationPath);
bool DeleteOwnService(const wchar_t* serviceName);
void UninstallSelfProtectDriver(const std::wstring& serviceName);
void SelfDelete();
void InitGDIPlus();
void ShutdownGDIPlus();
std::string Base64Encode(const BYTE* data, DWORD length);
std::vector<BYTE> IconToPngBytes(HICON hIcon);
std::string ExtractIconBase64(const std::wstring& exePath);
std::string CleanProcessPath(const std::string& processPath);
std::wstring GetLocalAppDataPath();
bool ShutdownPC();
bool EnableShutdownPrivilege();