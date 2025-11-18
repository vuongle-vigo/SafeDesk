#ifndef APP_MONITOR_HPP
#define APP_MONITOR_HPP

#include <windows.h>
#include <string>
#include <vector>

struct AppInfo {
    std::wstring m_sAppName;
    std::wstring m_sVersion;
    std::wstring m_sPublisher;
    std::wstring m_sInstallLocation;
    std::string m_sIconBase64;
    std::wstring m_sUninstallString;
    std::wstring m_sQuietUninstallString;
	std::wstring m_sIconPath;
};

typedef AppInfo* AppInfoPtr;

class RegistryKey {
public:
    RegistryKey() : m_hKey(nullptr) {}
    explicit RegistryKey(HKEY hKey) : m_hKey(hKey) {}
    ~RegistryKey() { if (m_hKey) RegCloseKey(m_hKey); }
    HKEY* operator&() { return &m_hKey; }
    HKEY get() const { return m_hKey; }
private:
    HKEY m_hKey;
	bool bAppChanged = false;
};

class AppMonitor {
public:
    AppMonitor();
    ~AppMonitor();
    static AppMonitor& GetInstance();
    void QueryInstalledApplications();
    BOOL UninstallApplication(const std::wstring& wsAppName);
	bool IsEqualAppInfo(const std::vector<AppInfo> app1, const std::vector<AppInfo> app2);
    void DisplayApplications();
    void AddApplicationsToDb();
    bool ExecuteUninstall(const std::string& quietUninstallString);
	json GetInstalledAppJson();
	std::vector<AppInfo> GetInstalledApplications() { return m_vAppInfo; }
    void MonitorApp();

	bool m_bNeedPostApp = false;
private:
    AppMonitor(const AppMonitor&) = delete;
    AppMonitor& operator=(const AppMonitor&) = delete;
    std::vector<AppInfo> m_vAppInfo;
};



#endif