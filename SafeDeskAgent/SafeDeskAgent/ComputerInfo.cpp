#include "ComputerInfo.h"
#include "Common.h"

ComputerInfo::ComputerInfo() {
	if (!SetMachineGUID()) {}
}

ComputerInfo::~ComputerInfo() {

}

ComputerInfo& ComputerInfo::GetInstance() {
	static ComputerInfo instance;
	return instance;
}

bool ComputerInfo::SetMachineGUID() {
	HKEY hKey;
	const char* subkey = "SOFTWARE\\Microsoft\\Cryptography";
	const char* value = "MachineGuid";

	if (RegOpenKeyExA(HKEY_LOCAL_MACHINE, subkey, 0, KEY_READ, &hKey) != ERROR_SUCCESS) {
		return false;
	}

	char buffer[128];
	DWORD bufferSize = sizeof(buffer);
	if (RegQueryValueExA(hKey, value, NULL, NULL, (LPBYTE)buffer, &bufferSize) != ERROR_SUCCESS) {
		RegCloseKey(hKey);
		return false;
	}

	RegCloseKey(hKey);
	m_szMachineGUID = std::string(buffer);

	return true;
}

std::string ComputerInfo::GetMachineGUID() {
	return m_szMachineGUID;
}

std::string ComputerInfo::GetDesktopName() {
	char desktopName[MAX_PATH];
	DWORD size = MAX_PATH;

	if (GetComputerNameA(desktopName, &size)) {
		return std::string(desktopName);
	}
	return "";
}

std::string ComputerInfo::GetWindowsVersion() {
	typedef LONG(WINAPI* RtlGetVersionPtr)(PRTL_OSVERSIONINFOW);

	HMODULE hMod = GetModuleHandleA("ntdll.dll");
	if (!hMod)
		return "";

	RtlGetVersionPtr fn = (RtlGetVersionPtr)GetProcAddress(hMod, "RtlGetVersion");
	if (!fn)
		return "";

	RTL_OSVERSIONINFOW info = { 0 };
	info.dwOSVersionInfoSize = sizeof(info);

	if (fn(&info) != 0)
		return "";

	char buffer[128];
	snprintf(buffer, sizeof(buffer),
		"Windows %u.%u (Build %u)",
		info.dwMajorVersion,
		info.dwMinorVersion,
		info.dwBuildNumber
	);

	return std::string(buffer);
}