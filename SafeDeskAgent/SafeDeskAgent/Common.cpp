#define _CRT_SECURE_NO_WARNINGS

#include "Common.h"
#include <iostream>
#include <cstdio>
#include <chrono>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <ctime>
#include <fstream>
#include <windows.h>
#include <shlobj.h>

using namespace std::chrono;

std::string GetCurrentDate() {
	// Get current time
	auto now = std::chrono::system_clock::now();
	std::time_t now_time = std::chrono::system_clock::to_time_t(now);
	std::tm now_tm;

	// Use localtime_s instead of localtime
	if (localtime_s(&now_tm, &now_time) != 0) {
		std::cerr << "Failed to get local time" << std::endl;
		return "";
	}

	// Format date and time
	std::ostringstream dateStream, timeStream;
	dateStream << std::put_time(&now_tm, "%Y-%m-%d");
	return dateStream.str();
}

int GetWeekDay() {
	time_t t = time(nullptr);
	tm* now = localtime(&t);

	int w = now->tm_wday; // 0 = Sunday, 1 = Monday ... 6 = Saturday

	std::cout << "tm_wday = " << w << std::endl;
	return w;
}

std::string GetCurrentTimeHour() {
	// Get current time
	auto now = std::chrono::system_clock::now();
	std::time_t now_time = std::chrono::system_clock::to_time_t(now);
	std::tm now_tm;
	// Use localtime_s instead of localtime
	if (localtime_s(&now_tm, &now_time) != 0) {
		std::cerr << "Failed to get local time" << std::endl;
		return "";
	}
	// Format date and time
	std::ostringstream timeStream;
	timeStream << std::put_time(&now_tm, "%H:%M");
	return timeStream.str();
}

std::string GetCurrentTimeMinute() {
	// Get current time
	auto now = std::chrono::system_clock::now();
	std::time_t now_time = std::chrono::system_clock::to_time_t(now);
	std::tm now_tm;
	// Use localtime_s instead of localtime
	if (localtime_s(&now_tm, &now_time) != 0) {
		std::cerr << "Failed to get local time" << std::endl;
		return "";
	}
	// Format date and time
	std::ostringstream timeStream;
	timeStream << std::put_time(&now_tm, "%M");
	return timeStream.str();
}

int ConvertStringToInt(const std::string& str) {
	try {
		return std::stoi(str);
	}
	catch (const std::invalid_argument&) {
		std::cerr << "Invalid argument: " << str << " is not a valid integer." << std::endl;
		return 0;
	}
	catch (const std::out_of_range&) {
		std::cerr << "Out of range: " << str << " is too large to fit in an int." << std::endl;
		return 0;
	}
}

std::wstring DosPathToNtPath(const std::wstring& dosPath) {
	if (dosPath.length() < 2 || dosPath[1] != L':') {
		std::wcerr << L"Invalid DOS path: " << dosPath << std::endl;
		return L"";
	}

	wchar_t drive[3] = { dosPath[0], dosPath[1], L'\0' };
	wchar_t devicePath[512];
	if (QueryDosDeviceW(drive, devicePath, 512) == 0) {
		std::wcerr << L"QueryDosDeviceW failed for drive " << drive << L", error: " << GetLastError() << std::endl;
		return L"";
	}

	std::wstring rest = dosPath.substr(2);
	return std::wstring(devicePath) + rest;
}

std::wstring GetCurrentDir() {
	wchar_t path[MAX_PATH] = { 0 };
	GetModuleFileNameW(NULL, path, MAX_PATH);
	for (int i = wcslen(path) - 1; i >= 0; --i) {
		if (path[i] == '\\') {
			path[i + 1] = '\0';
			break;
		}
	}

	return std::wstring(path);
}

std::wstring GetCurrentProcessPath() {
	wchar_t path[MAX_PATH] = { 0 };
	GetModuleFileNameW(NULL, path, MAX_PATH);
	return std::wstring(path);
}

std::string WstringToString(const std::wstring& wstr) {
	if (wstr.empty()) return "";
	int size = WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, nullptr, 0, nullptr, nullptr);
	std::string result(size - 1, 0);
	WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, &result[0], size, nullptr, nullptr);
	return result;
}

std::wstring StringToWstring(const std::string& str) {
	if (str.empty()) return L"";
	int size = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, nullptr, 0);
	std::wstring result(size - 1, 0);
	MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &result[0], size);
	return result;
}

std::wstring RemoveQuotesW(const std::wstring& input) {
	std::wstring result = input;
	if (!result.empty() && result.front() == L'"' && result.back() == L'"') {
		result = result.substr(1, result.size() - 2);
	}
	return result;
}

std::string RemoveQuotes(const std::string& input) {
	std::string result = input;
	if (!result.empty() && result.front() == '"' && result.back() == '"') {
		result = result.substr(1, result.size() - 2);
	}
	return result;
}

std::wstring ToLowercaseW(const std::wstring& input) {
	std::wstring result = input;
	std::transform(result.begin(), result.end(), result.begin(), ::towlower);
	return result;
}

std::string ToLowercase(const std::string& input) {
	std::string result = input;
	std::transform(result.begin(), result.end(), result.begin(), ::tolower);
	return result;
}

std::string RemoveTrailingSplash(const std::string& input) {
	if (!input.empty() && input.back() == '\\') {
		return input.substr(0, input.length() - 1);
	}
	return input;
}

std::string GetProcessDir(const std::string& processPath) {
	size_t pos = processPath.find_last_of("\\");
	if (pos == std::string::npos) {
		return ""; 
	}
	return processPath.substr(0, pos);
}

std::string GetProcessName(const std::string& processPath) {
	size_t pos = processPath.find_last_of("\\");
	if (pos == std::string::npos) {
		return processPath;
	}
	return processPath.substr(pos + 1);
}


void LogToFile(const std::string& message, const std::wstring& filePath) {
	std::wstring logDir = GetCurrentDir() + L"\\" + LOG_FILE;
	std::ofstream logFile(filePath, std::ios_base::app);
	if (logFile.is_open()) {
		logFile << GetCurrentDate() << " " << GetCurrentTimeHour() << ": " << message << std::endl;
		logFile.close();
	}
}

bool EnablePrivilege(HANDLE hToken, LPCWSTR privilege) {
	TOKEN_PRIVILEGES tp;
	LUID luid;

	if (!LookupPrivilegeValueW(NULL, privilege, &luid)) {
		return false;
	}

	tp.PrivilegeCount = 1;
	tp.Privileges[0].Luid = luid;
	tp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

	return AdjustTokenPrivileges(
		hToken,
		FALSE,
		&tp,
		sizeof(TOKEN_PRIVILEGES),
		NULL,
		NULL
	);
}


#include <wtsapi32.h>
#include <userenv.h>
#pragma comment(lib, "Wtsapi32.lib")
#pragma comment(lib, "Userenv.lib")
bool StartProcessInUserSession(const std::wstring& applicationPath) {
	HANDLE hToken = NULL, hPrimaryToken = NULL;
	DWORD sessionId = WTSGetActiveConsoleSessionId();
	if (sessionId == 0xFFFFFFFF) return false;

	if (!WTSQueryUserToken(sessionId, &hToken)) {
		return false;
	}

	if (!DuplicateTokenEx(
		hToken, MAXIMUM_ALLOWED, NULL,
		SecurityIdentification, TokenPrimary, &hPrimaryToken))
	{
		CloseHandle(hToken);
		return false;
	}

	EnablePrivilege(hPrimaryToken, SE_ASSIGNPRIMARYTOKEN_NAME);
	EnablePrivilege(hPrimaryToken, SE_INCREASE_QUOTA_NAME);
	EnablePrivilege(hPrimaryToken, SE_TCB_NAME);
	EnablePrivilege(hPrimaryToken, SE_DEBUG_NAME);

	PROFILEINFOW profile = { sizeof(profile) };
	WCHAR userName[256];
	DWORD nameLen = 256;
	LPWSTR pUser = NULL;
	DWORD bytes;
	WTSQuerySessionInformationW(
		WTS_CURRENT_SERVER_HANDLE, sessionId,
		WTSUserName, &pUser, &bytes);

	profile.lpUserName = pUser;
	LoadUserProfileW(hPrimaryToken, &profile);
	WTSFreeMemory(pUser);

	LPVOID env = NULL;
	CreateEnvironmentBlock(&env, hPrimaryToken, FALSE);

	STARTUPINFOW si = { sizeof(si) };
	PROCESS_INFORMATION pi;
	si.lpDesktop = (LPWSTR)L"WinSta0\\Default";

	BOOL success = CreateProcessAsUserW(
		hPrimaryToken, applicationPath.c_str(), NULL, NULL, NULL, FALSE,
		CREATE_UNICODE_ENVIRONMENT, env, NULL, &si, &pi
	);

	CloseHandle(hToken);
	if (!success) {
		return false;
	}

	CloseHandle(pi.hProcess);
	CloseHandle(pi.hThread);
	return success;
}

bool DeleteOwnService(const wchar_t* serviceName) {
	SC_HANDLE hSCManager = OpenSCManager(NULL, NULL, SC_MANAGER_ALL_ACCESS);
	if (!hSCManager) {
		std::wcerr << L"Failed to open SCM: " << GetLastError() << std::endl;
		return false;
	}

	SC_HANDLE hService = OpenService(hSCManager, serviceName, SERVICE_ALL_ACCESS);
	if (!hService) {
		std::wcerr << L"Failed to open service: " << GetLastError() << std::endl;
		CloseServiceHandle(hSCManager);
		return false;
	}

	// D?ng service n?u ?ang ch?y
	SERVICE_STATUS status;
	if (ControlService(hService, SERVICE_CONTROL_STOP, &status)) {
		std::wcout << L"Service stopped successfully." << std::endl;
	}

	// Xóa service
	if (DeleteService(hService)) {
		std::wcout << L"Service deleted successfully." << std::endl;
	}
	else {
		std::wcerr << L"Failed to delete service: " << GetLastError() << std::endl;
		CloseServiceHandle(hService);
		CloseServiceHandle(hSCManager);
		return false;
	}

	CloseServiceHandle(hService);
	CloseServiceHandle(hSCManager);
	return true;
}

void UninstallSelfProtectDriver(const std::wstring& serviceName) {
	std::wofstream batFile(L"uninstall_filter_driver.bat");
	batFile << L"@echo off\n";
	//batFile << L"fltmc unload \"" << serviceName << L"\"\n";
	batFile << L"sc stop \"" << serviceName << L"\"\n"; // Stop service
	batFile << L"sc delete \"" << serviceName << L"\"\n";
	//batFile << L":repeat\n";
	//batFile << L"del \"" << sysFilePath << L"\"\n";        
	//batFile << L"if exist \"" << sysFilePath << L"\" goto repeat\n";
	batFile << L"del \"%~f0\"\n";
	batFile.close();

	ShellExecuteW(NULL, L"open", L"uninstall_filter_driver.bat", NULL, NULL, SW_HIDE);
}

#include "SafeDeskTray.h"

void SelfDelete(){
	std::wstring curDir = GetCurrentDir();
	std::wofstream batFile(L"self_selete.bat");

	batFile << L"@echo off\n";
	batFile << L"timeout /t 3 /nobreak >nul";
	batFile << L":repeat\n";
	batFile << L"rmdir /s /q \"" << curDir << L"\"\n";
	batFile << L"if exist \"" << curDir << L"\" goto repeat\n";

	batFile << L"del \"%~f0\"\n";
	batFile.close();
	SafeDeskTray& tray = SafeDeskTray::GetInstance();
	tray.SetStartProcess(false);
	tray.KillTrayProcess();

	ShellExecuteW(NULL, L"open", L"self_selete.bat", NULL, NULL, SW_HIDE);
	exit(0);
}

ULONG_PTR gdiplusToken = 0;

//============================
//  INIT / SHUTDOWN GDI+
//============================
void InitGDIPlus()
{
	Gdiplus::GdiplusStartupInput gdiplusStartupInput;
	Gdiplus::GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);
}

void ShutdownGDIPlus()
{
	Gdiplus::GdiplusShutdown(gdiplusToken);
}



//============================
//  ICON ? PNG bytes (NO FILE)
//============================
std::vector<BYTE> IconToPngBytes(HICON hIcon)
{
	std::vector<BYTE> pngData;

	if (!hIcon) return pngData;

	HDC hdc = GetDC(NULL);

	ICONINFO iconInfo = {};
	GetIconInfo(hIcon, &iconInfo);

	BITMAP bm = {};
	GetObject(iconInfo.hbmColor, sizeof(bm), &bm);

	int width = bm.bmWidth;
	int height = bm.bmHeight;

	HDC memDC = CreateCompatibleDC(hdc);
	HBITMAP hBmp = CreateCompatibleBitmap(hdc, width, height);
	SelectObject(memDC, hBmp);

	// Draw icon to bitmap
	DrawIconEx(memDC, 0, 0, hIcon, width, height, 0, NULL, DI_NORMAL);

	// Convert hBmp to GDI+ Bitmap
	Gdiplus::Bitmap bitmap(hBmp, NULL);

	// Create stream memory
	IStream* pStream = NULL;
	CreateStreamOnHGlobal(NULL, TRUE, &pStream);

	// Get PNG encoder
	CLSID pngClsid = {};
	UINT num = 0, size = 0;
	Gdiplus::GetImageEncodersSize(&num, &size);

	std::vector<BYTE> codecs(size);
	Gdiplus::ImageCodecInfo* pCodecs = (Gdiplus::ImageCodecInfo*)codecs.data();
	Gdiplus::GetImageEncoders(num, size, pCodecs);

	for (UINT i = 0; i < num; i++) {
		if (wcscmp(pCodecs[i].MimeType, L"image/png") == 0) {
			pngClsid = pCodecs[i].Clsid;
			break;
		}
	}

	// Save stream as PNG
	bitmap.Save(pStream, &pngClsid, NULL);

	// Get data from stream
	HGLOBAL hGlobal = NULL;
	GetHGlobalFromStream(pStream, &hGlobal);

	SIZE_T pngSize = GlobalSize(hGlobal);
	pngData.resize(pngSize);

	void* pData = GlobalLock(hGlobal);
	memcpy(pngData.data(), pData, pngSize);
	GlobalUnlock(hGlobal);

	pStream->Release();
	DeleteObject(hBmp);
	DeleteDC(memDC);
	ReleaseDC(NULL, hdc);

	return pngData;
}

//============================
//  Extract EXE ICON ? Base64
//============================
std::string ExtractIconBase64(const std::wstring& exePath)
{
	HICON hIcon = NULL;

	ExtractIconExW(exePath.c_str(), 0, &hIcon, NULL, 1);
	if (!hIcon) {
		printf("Failed to extract icon.\n");
		return "";
	}

	auto pngBytes = IconToPngBytes(hIcon);
	if (pngBytes.empty()) {
		printf("Failed to convert to PNG.\n");
		return "";
	}

	return Base64Encode(pngBytes.data(), (DWORD)pngBytes.size());
}

//============================
//  BASE64 ENCODE
//============================
std::string Base64Encode(const BYTE* data, DWORD length)
{
	DWORD outLen = 0;
	CryptBinaryToStringA(data, length,
		CRYPT_STRING_BASE64 | CRYPT_STRING_NOCRLF,
		NULL, &outLen);

	std::string output(outLen, '\0');

	CryptBinaryToStringA(data, length,
		CRYPT_STRING_BASE64 | CRYPT_STRING_NOCRLF,
		&output[0], &outLen);

	return output;
}

std::string CleanProcessPath(const std::string& input) {
	// find lash '|'
	size_t pos = input.rfind('|');
	if (pos == std::string::npos)
		return input;

	std::string path = input.substr(pos + 1);

	// Trim space
	auto isSpaceOrControl = [](unsigned char c) {
		return std::isspace(c) || std::iscntrl(c);
		};

	// Trim left
	path.erase(path.begin(),
		std::find_if(path.begin(), path.end(),
			[&](unsigned char c) { return !isSpaceOrControl(c); }));

	// Trim right
	path.erase(
		std::find_if(path.rbegin(), path.rend(),
			[&](unsigned char c) { return !isSpaceOrControl(c); }).base(),
		path.end()
	);

	return path;
}


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