#include "Installer.h"
#include "SQLiteDB.h"
#include "SafeDeskTray.h"
#include "Common.h"

#include <newdev.h>      // DiInstallDriverW
#pragma comment(lib, "newdev.lib")

bool IsServiceInstalled(const wchar_t* serviceName)
{
	bool exists = FALSE;

	SC_HANDLE hSCM = OpenSCManagerW(NULL, NULL, SC_MANAGER_CONNECT);
	if (!hSCM)
		return FALSE;

	SC_HANDLE hSvc = OpenServiceW(
		hSCM,
		serviceName,
		SERVICE_QUERY_STATUS
	);

	if (hSvc) {
		exists = TRUE;
		CloseServiceHandle(hSvc);
	}

	CloseServiceHandle(hSCM);
	return exists;
}

bool DriverInstaller() {
	BOOL rebootRequired = FALSE;
	std::wstring newDriverInfPath = std::wstring(INSATLLER_FOLDER) + L"\\" + DRIVER_INF;
	int i = 0;
	while (IsServiceInstalled(DRIVER_SERVICE_NAME)) {
		BOOL ok = DiInstallDriverW(
			NULL,               // hwndParent
			(PWSTR)newDriverInfPath.c_str(),     // Full path to INF
			DIIRFLAG_FORCE_INF, // force use this INF
			&rebootRequired
		);

		if (ok) {
			return true;;
		}

		if (i++ > 5) {
			break;
		}

		Sleep(5000);
	}

	return false;
}

bool CheckFileInstaller() {
	std::wstring currentDir = GetCurrentDir();
	
	std::wstring trayPath = currentDir + PROCESS_TRAY_NAME;
	std::wstring dbPath = currentDir + SQLITE_DB_PATH;
	std::wstring driverInfPath = currentDir + DRIVER_INF;
	std::wstring driverCatPath = currentDir + DRIVER_CAT;
	std::wstring driverFilePath = currentDir + DRIVER_FILE;

	//Check existing file
	DWORD fileAttrTray = GetFileAttributesW(trayPath.c_str());
	DWORD fileAttrDB = GetFileAttributesW(dbPath.c_str());
	DWORD fileAttrInf = GetFileAttributesW(driverInfPath.c_str());
	DWORD fileAttrCat = GetFileAttributesW(driverCatPath.c_str());
	DWORD fileAttrSys = GetFileAttributesW(driverFilePath.c_str());

	if (fileAttrTray == INVALID_FILE_ATTRIBUTES ||
		fileAttrDB == INVALID_FILE_ATTRIBUTES ||
		fileAttrInf == INVALID_FILE_ATTRIBUTES ||
		fileAttrCat == INVALID_FILE_ATTRIBUTES ||
		fileAttrSys == INVALID_FILE_ATTRIBUTES) {
		return false;
	}

	return true;
}

bool MoveFileToInstallerFolder() {
	wchar_t currentPath[MAX_PATH] = { 0 };
	GetModuleFileNameW(NULL, currentPath, MAX_PATH);
	std::wstring newPath = std::wstring(INSATLLER_FOLDER) + L"\\" + EXE_NAME;

	//Create installer folder
	DWORD folderAttr = GetFileAttributesW(INSATLLER_FOLDER);
	if (folderAttr == INVALID_FILE_ATTRIBUTES) {
		if (!CreateDirectoryW(INSATLLER_FOLDER, NULL)) {
			return false;
		}
	}

	if (!CopyFileW(currentPath, newPath.c_str(), FALSE)) {
		return false;
	}

	std::wstring currentDir = GetCurrentDir();

	std::wstring trayPath = currentDir + PROCESS_TRAY_NAME;
	std::wstring dbPath = currentDir + SQLITE_DB_PATH;
	std::wstring driverInfPath = currentDir + DRIVER_INF;
	std::wstring driverCatPath = currentDir + DRIVER_CAT;
	std::wstring driverFilePath = currentDir + DRIVER_FILE;

	//Create db folder

	std::wstring dbFolder = std::wstring(INSATLLER_FOLDER) + L"\\" + std::wstring(SQLITE_DB_PATH).substr(0, std::wstring(SQLITE_DB_PATH).find_last_of(L"\\"));
	DWORD dbFolderAttr = GetFileAttributesW(dbFolder.c_str());
	if (dbFolderAttr == INVALID_FILE_ATTRIBUTES) {
		if (!CreateDirectoryW(dbFolder.c_str(), NULL)) {
			return false;
		}
	}

	std::wstring newTrayPath = std::wstring(INSATLLER_FOLDER) + L"\\" + PROCESS_TRAY_NAME;
	if (!CopyFileW(trayPath.c_str(), newTrayPath.c_str(), FALSE)) {
		return false;
	}

	std::wstring newDBPath = std::wstring(INSATLLER_FOLDER) + L"\\" + SQLITE_DB_PATH;
	if (!CopyFileW(dbPath.c_str(), newDBPath.c_str(), FALSE)) {
		return false;
	}

	std::wstring newDriverInfPath = std::wstring(INSATLLER_FOLDER) + L"\\" + DRIVER_INF;
	if (!CopyFileW(driverInfPath.c_str(), newDriverInfPath.c_str(), FALSE)) {
		return false;
	}

	std::wstring newDriverCatPath = std::wstring(INSATLLER_FOLDER) + L"\\" + DRIVER_CAT;
	if (!CopyFileW(driverCatPath.c_str(), newDriverCatPath.c_str(), FALSE)) {
		return false;
	}

	std::wstring newDriverFilePath = std::wstring(INSATLLER_FOLDER) + L"\\" + DRIVER_FILE;
	if (!CopyFileW(driverFilePath.c_str(), newDriverFilePath.c_str(), FALSE)) {
		return false;
	}

	return true;
}

bool RunInstaller() {
	if (!CheckFileInstaller()) {
		return false;
	}

	if (!MoveFileToInstallerFolder()) {
		return false;
	}
	
	// Install driver
	if (!DriverInstaller()) {
		return false;
	}

	return true;
}