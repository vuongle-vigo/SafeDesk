#include "HttpClient.h"
#include "AppMonitor.h"
#include "Common.h"
#include <nlohmann/json.hpp>
#include "SQLiteDB.h"
#include "Config.h"

AppMonitor::AppMonitor() {}

AppMonitor::~AppMonitor() {}

AppMonitor& AppMonitor::GetInstance() {
    static AppMonitor instance;
    return instance;
}

void AppMonitor::QueryInstalledApplications() {
	std::vector<AppInfo> vApp;
	HttpClient& httpClient = HttpClient::GetInstance();
    HKEY hKeyEnumApp[2] = { HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER };
    const wchar_t* registryPaths[2] = { L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
                                        L"SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall" };
    for (HKEY hKeyRoot : hKeyEnumApp) {
        for (const wchar_t* registryPath : registryPaths) {
            HKEY hKey;
            if (RegOpenKeyEx(hKeyRoot, registryPath, 0, KEY_READ, &hKey) != ERROR_SUCCESS) {
                PRINT_API_ERR("RegOpenKeyEx");
                continue;
            }

            DWORD index = 0;
            TCHAR subKeyName[256];
            DWORD subKeyNameSize = 256;
            while (RegEnumKeyEx(hKey, index, subKeyName, &subKeyNameSize, NULL, NULL, NULL, NULL) == ERROR_SUCCESS) {
                HKEY hSubKey;
                if (RegOpenKeyEx(hKey, subKeyName, 0, KEY_READ, &hSubKey) == ERROR_SUCCESS) {
                    TCHAR displayName[256];
                    DWORD bufferSize = sizeof(displayName);

                    if (RegQueryValueEx(hSubKey, TEXT("DisplayName"), NULL, NULL, (LPBYTE)displayName, &bufferSize) == ERROR_SUCCESS) {
                        AppInfo appInfo;
                        appInfo.m_sAppName = RemoveQuotesW(std::wstring(displayName));

                        // Get DisplayVersion
                        TCHAR version[256];
                        bufferSize = sizeof(version);
                        if (RegQueryValueEx(hSubKey, TEXT("DisplayVersion"), NULL, NULL, (LPBYTE)version, &bufferSize) == ERROR_SUCCESS) {
                            appInfo.m_sVersion = RemoveQuotesW(std::wstring(version));
                        }

                        // Get Publisher
                        TCHAR publisher[256] = { 0 };
                        bufferSize = sizeof(publisher);
                        if (RegQueryValueEx(hSubKey, TEXT("Publisher"), NULL, NULL, (LPBYTE)publisher, &bufferSize) == ERROR_SUCCESS) {
							std::wstring puslisherStr(publisher);
                            appInfo.m_sPublisher = RemoveQuotesW(std::wstring(publisher));
                        }

                        // Get InstallLocation
                        TCHAR installLocation[512];
                        bufferSize = sizeof(installLocation);
                        if (RegQueryValueEx(hSubKey, TEXT("InstallLocation"), NULL, NULL, (LPBYTE)installLocation, &bufferSize) == ERROR_SUCCESS) {
                            std::wstring cleaned = RemoveQuotesW(std::wstring(installLocation));
                            //Remove last // in cleaned
							if (!cleaned.empty() && cleaned.back() == L'\\') {
								cleaned.pop_back();
							}

                            appInfo.m_sInstallLocation = ToLowercaseW(cleaned);
                        }

                        // Get DisplayIcon (m_sExePath)
                        TCHAR exePath[512];
                        bufferSize = sizeof(exePath);
                        if (RegQueryValueEx(hSubKey, TEXT("DisplayIcon"), NULL, NULL, (LPBYTE)exePath, &bufferSize) == ERROR_SUCCESS) {
                            std::wstring cleaned = RemoveQuotesW(std::wstring(exePath));
                            if (cleaned != L"") {
                                // remove ,
								size_t commaPos = cleaned.find(L',');
								if (commaPos != std::wstring::npos) {
									cleaned = cleaned.substr(0, commaPos);
								}
								appInfo.m_sIconPath = ToLowercaseW(cleaned);
                                appInfo.m_sIconBase64 = ExtractIconBase64(cleaned);
                            }
                        }

                        // Get UninstallString
                        TCHAR uninstallString[512];
                        bufferSize = sizeof(uninstallString);
                        if (RegQueryValueEx(hSubKey, TEXT("UninstallString"), NULL, NULL, (LPBYTE)uninstallString, &bufferSize) == ERROR_SUCCESS) {
                            std::wstring cleaned = RemoveQuotesW(std::wstring(uninstallString));
                            appInfo.m_sUninstallString = ToLowercaseW(cleaned);
                        }

                        // Get QuietUninstallString
                        TCHAR quietUninstallString[512];
                        bufferSize = sizeof(quietUninstallString);
                        if (RegQueryValueEx(hSubKey, TEXT("QuietUninstallString"), NULL, NULL, (LPBYTE)quietUninstallString, &bufferSize) == ERROR_SUCCESS) {
                            std::wstring cleaned = RemoveQuotesW(std::wstring(quietUninstallString));
                            appInfo.m_sQuietUninstallString = ToLowercaseW(cleaned);
                        }

                       /* if (appInfo.m_sPublisher == std::wstring(L"Microsoft Corporation")) {
                            goto __NEXT;
                        }*/

						if (appInfo.m_sInstallLocation == std::wstring(L"") && appInfo.m_sIconPath == std::wstring(L"")) {
							goto __NEXT;
						}

                        if (appInfo.m_sInstallLocation == std::wstring(L"")) {
							appInfo.m_sInstallLocation = appInfo.m_sIconPath.substr(0, appInfo.m_sIconPath.find_last_of(L"\\"));
                        }

                        vApp.push_back(appInfo);
                    }

                    RegCloseKey(hSubKey);
                }
            __NEXT:
                index++;
                subKeyNameSize = 256;
            }

            RegCloseKey(hKey);
        }
    }

    if (!IsEqualAppInfo(vApp, this->m_vAppInfo)) {
        this->m_vAppInfo = vApp;
		m_bNeedPostApp = true;
    }
}

bool AppMonitor::IsEqualAppInfo(const std::vector<AppInfo> app1, const std::vector<AppInfo> app2) {
	return (app1.size() == app2.size());
}


BOOL AppMonitor::UninstallApplication(const std::wstring& wsAppName) {
    HKEY hKeyEnumApp[2] = { HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER };
    const wchar_t* registryPaths[2] = { L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
        L"SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall" };
    for (HKEY hKeyRoot : hKeyEnumApp) {
        for (const wchar_t* registryPath : registryPaths) {
            HKEY hKey;
            if (RegOpenKeyEx(hKeyRoot, registryPath, 0, KEY_READ, &hKey) != ERROR_SUCCESS) {
                PRINT_API_ERR("RegOpenKeyEx");
                continue;
            }

            DWORD index = 0;
            TCHAR subKeyName[256];
            DWORD subKeyNameSize = 256;
            while (RegEnumKeyEx(hKey, index, subKeyName, &subKeyNameSize, NULL, NULL, NULL, NULL) == ERROR_SUCCESS) {
                HKEY hSubKey;
                if (RegOpenKeyEx(hKey, subKeyName, 0, KEY_READ, &hSubKey) == ERROR_SUCCESS) {
                    TCHAR displayName[256];
                    TCHAR uninstallString[512];
                    DWORD bufferSize = sizeof(displayName);

                    if (RegQueryValueEx(hSubKey, L"DisplayName", NULL, NULL, (LPBYTE)displayName, &bufferSize) == ERROR_SUCCESS) {
                        std::wstring wDisplayName(displayName);
                        if (wDisplayName == wsAppName) {
                            bufferSize = sizeof(uninstallString);
                            if (RegQueryValueEx(hSubKey, L"UninstallString", NULL, NULL, (LPBYTE)uninstallString, &bufferSize) == ERROR_SUCCESS) {
                                std::wcout << L"Uninstalling: " << wDisplayName << std::endl;
                                std::wcout << L"UninstallString: " << uninstallString << std::endl;

                                STARTUPINFO si = { sizeof(si) };
                                si.wShowWindow = SW_HIDE;
                                PROCESS_INFORMATION pi;
                                if (CreateProcess(NULL, uninstallString, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL, &si, &pi)) {
                                    WaitForSingleObject(pi.hProcess, INFINITE);
                                    CloseHandle(pi.hProcess);
                                    CloseHandle(pi.hThread);

                                    std::wcout << L"Uninstall successed" << std::endl;
                                    RegCloseKey(hSubKey);
                                    RegCloseKey(hKey);
                                    return true;
                                }
                                else {
                                    std::wcerr << L"Error uninstall with error code: " << GetLastError() << std::endl;
                                }
                            }
                        }
                    }

                    RegCloseKey(hSubKey);
                }

                index++;
                subKeyNameSize = 256;
            }
        }
    }
}

void AppMonitor::DisplayApplications() {
    for (AppInfo appInfo : this->m_vAppInfo) {
        std::wcout << appInfo.m_sAppName << std::endl;
    }
}

void AppMonitor::AddApplicationsToDb() {
    AppDB& appDB = AppDB::GetInstance();
    appDB.delete_all();
    for (const auto& app : m_vAppInfo) {
        appDB.add(WstringToString(app.m_sAppName), WstringToString(app.m_sVersion), WstringToString(app.m_sPublisher),
            RemoveTrailingSplash(WstringToString(app.m_sInstallLocation)), app.m_sIconBase64,
            WstringToString(app.m_sUninstallString), WstringToString(app.m_sQuietUninstallString));
    }
}

// Executes the QuietUninstallString to uninstall an application
// Returns true if the uninstallation process completes successfully, false otherwise
bool AppMonitor::ExecuteUninstall(const std::string& quietUninstallString) {
    // Check if the uninstall string is empty
    if (quietUninstallString.empty()) {
        return false;
    }

    // Convert std::string to wide string (Windows API requires wchar_t)
    std::wstring wQuietUninstallString(quietUninstallString.begin(), quietUninstallString.end());

    // Initialize STARTUPINFOW structure for process creation
    STARTUPINFOW si = { sizeof(si) };
    // Initialize PROCESS_INFORMATION structure to store process details
    PROCESS_INFORMATION pi = {};

    // Execute the uninstall command using CreateProcessW
    // nullptr for lpApplicationName means the command is parsed from lpCommandLine
    BOOL success = CreateProcessW(
        nullptr,                            // No module name (use command line)
        (LPWSTR)wQuietUninstallString.c_str(), // Command line (uninstall string)
        nullptr,                            // Process handle not inheritable
        nullptr,                            // Thread handle not inheritable
        FALSE,                              // Set handle inheritance to FALSE
        0,                                  // No creation flags
        nullptr,                            // Use parent's environment block
        nullptr,                            // Use parent's starting directory
        &si,                                // Pointer to STARTUPINFO structure
        &pi                                 // Pointer to PROCESS_INFORMATION structure
    );

    // Check if process creation failed
    if (!success) {
        return false;
    }

    // Wait for the uninstall process to complete, with a timeout of 30 seconds
    WaitForSingleObject(pi.hProcess, 30 * 1000);

    // Retrieve the exit code of the process
    DWORD exitCode;
    GetExitCodeProcess(pi.hProcess, &exitCode);

    // Close process and thread handles to free resources
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);

    // Return true if the process exited successfully (exit code 0)
    return exitCode == 0;
}

void AppMonitor::MonitorApp() {
    HttpClient& httpClient = HttpClient::GetInstance();
    AppDB& appDB = AppDB::GetInstance();
    ConfigMonitor& configMonitor = ConfigMonitor::GetInstance();
    while (1) {
		DEBUG_LOG("AppMonitor: Checking installed applications...");
        QueryInstalledApplications();
        if (m_bNeedPostApp) {
            json appJson = GetInstalledAppJson();
            if (httpClient.PostApplication(appJson)) {
				m_bNeedPostApp = false;
            }
        }

        ConfigMonitor::AppConfig configApps = configMonitor.GetConfig().config_apps;
        for (const auto& app : configApps.uninstall) {
            std::cout << "Checking if app is installed: " << app.name << std::endl;
            //check if app.name in json app
            bool found = false;
            for (const auto& installedApp : m_vAppInfo) {
                if (WstringToString(installedApp.m_sAppName) == app.name) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                std::cout << "App not found: " << app.name << std::endl;
                continue;
            }

            std::cout << "Uninstalling app: " << app.name << std::endl;
            // Uninstall the application using its quiet uninstall string
            if (!ExecuteUninstall(app.app_id)) {
                std::cerr << "Failed to uninstall app: " << app.name << std::endl;
            }
            else {
                std::cout << "Successfully uninstalled app: " << app.name << std::endl;
            }
        }

        std::this_thread::sleep_for(std::chrono::minutes(1)); // Sleep for 1 minute before next iteration
    }
}

json AppMonitor::GetInstalledAppJson() {
	json result = json::array();
    for (const auto& app : m_vAppInfo) {
        json appJson;
        appJson["app_name"] = WstringToString(app.m_sAppName);
        appJson["version"] = WstringToString(app.m_sVersion);
        appJson["publisher"] = WstringToString(app.m_sPublisher);
        appJson["install_location"] = WstringToString(app.m_sInstallLocation);
        appJson["icon_base64"] = app.m_sIconBase64;
		appJson["icon_path"] = WstringToString(app.m_sIconPath);
        appJson["uninstall_string"] = WstringToString(app.m_sUninstallString);
        appJson["quiet_uninstall_string"] = WstringToString(app.m_sQuietUninstallString);
        result.push_back(appJson);
	}

	return result;
}