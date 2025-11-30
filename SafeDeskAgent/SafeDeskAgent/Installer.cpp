#include "Installer.h"
#include "SQLiteDB.h"
#include "SafeDeskTray.h"
#include "Common.h"

bool CheckFileInstaller() {
	std::wstring currentDir = GetCurrentDir();
	
	std::wstring trayPath = currentDir + PROCESS_TRAY_NAME;
	std::wstring dbPath = currentDir + SQLITE_DB_PATH;

	//Check existing file
	DWORD fileAttrTray = GetFileAttributesW(trayPath.c_str());
	DWORD fileAttrDB = GetFileAttributesW(dbPath.c_str());
	if (fileAttrTray == INVALID_FILE_ATTRIBUTES || fileAttrDB == INVALID_FILE_ATTRIBUTES) {
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

	return true;
}

bool RunInstaller() {
	if (!CheckFileInstaller()) {
		return false;
	}

	if (!MoveFileToInstallerFolder()) {
		return false;
	}
	
	return true;
}