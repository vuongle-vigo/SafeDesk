#include "HttpClient.h"
#include <iostream>
#include <atomic>
#include <thread>
#include <windows.h>

#include "SQLiteDB.h"
#include "ProcessMonitor.h"
#include "AppMonitor.h"
#include "PowerMonitor.h"
#include "SafeDeskTray.h"
#include "Communication.h"
#include "Common.h"
#include "CaptureScreen.h"
#include "BrowserHistory.h"
#include "Policies.h"
#include "Installer.h"

// ---------------- GLOBALS ----------------

SERVICE_STATUS g_ServiceStatus = { 0 };
SERVICE_STATUS_HANDLE g_ServiceStatusHandle = NULL;
bool g_RunningAsService = false;

std::atomic<bool> g_ServiceStopping(false);

// ---------------- THREAD FUNCTIONS ----------------

void ThreadMonitorApp();
void ThreadMonitorPower();
void ThreadMonitorProcess();
void ThreadSafeDeskTray();
void ThreadBrowserHistory();
void ThreadCommandHandle();
void ThreadPolicies();
void ThreadInitSelfProtectDriver();

// ---------------- SERVICE STOP HANDLER ----------------

void StopServiceClean()
{
    bool expected = false;
    if (!g_ServiceStopping.compare_exchange_strong(expected, true))
        return;

    g_ServiceStatus.dwCurrentState = SERVICE_STOP_PENDING;
    g_ServiceStatus.dwWin32ExitCode = 0;
    g_ServiceStatus.dwWaitHint = 30000;
    SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);

    if (g_StopEvent)
        SetEvent(g_StopEvent);
}

// ---------------- SERVICE CTRL HANDLER ----------------

namespace service {

    void WINAPI ServiceCtrlHandler(DWORD dwControl)
    {
        switch (dwControl)
        {
        case SERVICE_CONTROL_STOP:
        case SERVICE_CONTROL_SHUTDOWN:
            LogToFile("Service received STOP/SHUTDOWN control.");
            StopServiceClean();
            break;

        default:
            break;
        }

        SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);
    }

    // ---------------- DISABLE AUTO-RESTART ----------------

    bool DisableServiceAutoRestart(const char* serviceName)
    {
        SC_HANDLE hSCM = OpenSCManagerA(NULL, NULL, SC_MANAGER_CONNECT);
        if (!hSCM) return false;

        SC_HANDLE hService = OpenServiceA(
            hSCM, serviceName,
            SERVICE_CHANGE_CONFIG | SERVICE_QUERY_CONFIG
        );
        if (!hService)
        {
            CloseServiceHandle(hSCM);
            return false;
        }

        SC_ACTION action;
        action.Type = SC_ACTION_NONE;
        action.Delay = 0;

        SERVICE_FAILURE_ACTIONS fa;
        ZeroMemory(&fa, sizeof(fa));
        fa.dwResetPeriod = 0;
        fa.cActions = 1;
        fa.lpsaActions = &action;

        if (!ChangeServiceConfig2A(hService, SERVICE_CONFIG_FAILURE_ACTIONS, &fa))
        {
            CloseServiceHandle(hService);
            CloseServiceHandle(hSCM);
            return false;
        }

        DWORD flag = 0;
        ChangeServiceConfig2A(hService, SERVICE_CONFIG_FAILURE_ACTIONS_FLAG, &flag);

        CloseServiceHandle(hService);
        CloseServiceHandle(hSCM);

        return true;
    }

    // ---------------- SERVICE MAIN LOGIC ----------------

    void RunMainLogic()
    {
        g_StopEvent = CreateEvent(NULL, TRUE, FALSE, NULL);

        HttpClient& httpClient = HttpClient::GetInstance();

        std::thread tDriver(ThreadInitSelfProtectDriver);
        std::thread tTray(ThreadSafeDeskTray);
        std::thread tApp(ThreadMonitorApp);
        std::thread tPower(ThreadMonitorPower);
        std::thread tProcess(ThreadMonitorProcess);
        std::thread tCommand(ThreadCommandHandle);
        std::thread tBrowser(ThreadBrowserHistory);
        std::thread tPolicies(ThreadPolicies);
        
		// Init gdi to capture screen
        InitGDIPlus();
		InitSelfProtectDriver(); // Init driver for self-protect files

        while (WaitForSingleObject(g_StopEvent, 0) != WAIT_OBJECT_0)
        {
            PowerUsageDB& powerDB = PowerUsageDB::GetInstance();
            json powerData = powerDB.query_all();
            if (!powerData.is_null())
            {
                if (httpClient.PostPowerUsage(powerData))
                    powerDB.update_status(powerData);
            }

            ProcessUsageDB& procDB = ProcessUsageDB::GetInstance();
            json procData = procDB.query_all();
            if (!procData.is_null())
            {
                if (httpClient.PostProcessUsage(procData))
                    procDB.update_status(procData);
            }

            for (int i = 0; i < 60; ++i)
            {
                if (WaitForSingleObject(g_StopEvent, 0) == WAIT_OBJECT_0)
                    break;
                std::this_thread::sleep_for(std::chrono::seconds(1));
            }
        }

        if (g_StopEvent)
            SetEvent(g_StopEvent);

		if (tDriver.joinable()) tDriver.join();
        if (tTray.joinable()) tTray.join();
        if (tApp.joinable()) tApp.join();
        if (tPower.joinable()) tPower.join();
        if (tProcess.joinable()) tProcess.join();
        if (tCommand.joinable()) tCommand.join();
        if (tBrowser.joinable()) tBrowser.join();
        if (tPolicies.joinable()) tPolicies.join();

        if (g_StopEvent)
        {
            CloseHandle(g_StopEvent);
            g_StopEvent = NULL;
        }
    }

    // ---------------- SERVICE MAIN ----------------

    void WINAPI ServiceMain(DWORD argc, LPSTR* argv)
    {
        LogToFile("Service initializing...");

        // Register the control handler so the SCM can send STOP/SHUTDOWN/PAUSE
        g_ServiceStatusHandle = RegisterServiceCtrlHandlerA(SERVICE_NAME, ServiceCtrlHandler);
        if (!g_ServiceStatusHandle)
        {
            LogToFile("Failed to register service handler.");
            return;
        }

		// Initialize service status
        g_ServiceStatus.dwServiceType = SERVICE_WIN32_OWN_PROCESS;  // Service runs in its own process.
        g_ServiceStatus.dwCurrentState = SERVICE_START_PENDING;     // We are still starting up.
        g_ServiceStatus.dwControlsAccepted = SERVICE_ACCEPT_SHUTDOWN | SERVICE_ACCEPT_STOP; // Controls we can handle.
        g_ServiceStatus.dwWin32ExitCode = 0;     // 0 = no error.
        g_ServiceStatus.dwWaitHint = 5000;  		// Service auto restart settings

        SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);

        g_ServiceStatus.dwCurrentState = SERVICE_RUNNING;
        SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);


        RunMainLogic();

        g_ServiceStatus.dwCurrentState = SERVICE_STOPPED;
        g_ServiceStatus.dwWin32ExitCode = 0;
        SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);
    }

    // ---------------- SERVICE CREATION ----------------

    class ServiceManager {
    public:
        static bool CreateService()
        {
            SC_HANDLE scm = OpenSCManagerA(NULL, NULL, SC_MANAGER_CREATE_SERVICE);
            if (!scm)
            {
                LogToFile("Failed to open SCM.");
                return false;
            }

            SC_HANDLE existing = OpenServiceA(scm, SERVICE_NAME, SERVICE_QUERY_STATUS);
            if (existing)
            {
                LogToFile("Service already exists.");
                CloseServiceHandle(existing);
                CloseServiceHandle(scm);
                return true;
            }

            char path[MAX_PATH];
            if (!GetModuleFileNameA(NULL, path, MAX_PATH))
            {
                LogToFile("Failed to get module path.");
                CloseServiceHandle(scm);
                return false;
            }

            std::string svcPath = std::string(path) + " --service";

            SC_HANDLE svc = CreateServiceA(
                scm,
                SERVICE_NAME,
                "SafeDesk Monitoring Service",
                SERVICE_ALL_ACCESS,
                SERVICE_WIN32_OWN_PROCESS,
                SERVICE_AUTO_START,
                SERVICE_ERROR_NORMAL,
                svcPath.c_str(),
                NULL, NULL, NULL, NULL, NULL
            );

            if (!svc)
            {
                LogToFile("Failed to create service.");
                CloseServiceHandle(scm);
                return false;
            }

            SC_ACTION actions[3] = {
                { SC_ACTION_RESTART, 60 * 1000 },
                { SC_ACTION_RESTART, 60 * 1000 },
                { SC_ACTION_RESTART, 60 * 1000 },
            };


            SERVICE_FAILURE_ACTIONS fa{};
            fa.dwResetPeriod = 60; // 60s
            fa.cActions = 3;
            fa.lpsaActions = actions;


            if (!ChangeServiceConfig2A(svc, SERVICE_CONFIG_FAILURE_ACTIONS, &fa)) {
                LogToFile("Failed to set failure actions.");
            }


            SERVICE_FAILURE_ACTIONS_FLAG flag{};
            flag.fFailureActionsOnNonCrashFailures = TRUE;


            if (!ChangeServiceConfig2A(svc, SERVICE_CONFIG_FAILURE_ACTIONS_FLAG, &flag)) {
                LogToFile("Failed to set failure actions flag.");
            }

            SERVICE_DESCRIPTIONA desc = { (LPSTR)"Safedesk monitoring service for tracking system usage." };
            ChangeServiceConfig2A(svc, SERVICE_CONFIG_DESCRIPTION, &desc);

            StartService(svc, 0, NULL);

            CloseServiceHandle(svc);
            CloseServiceHandle(scm);

            LogToFile("Service created and started.");
            return true;
        }
    };

} // namespace service

// ---------------- MAIN ENTRY ----------------

int main(int argc, char* argv[])
{
    if (argc > 1 && std::string(argv[1]) == "--service")
    {
        // Run service
        g_RunningAsService = true;
        SERVICE_TABLE_ENTRYA table[] = {
            { (LPSTR)SERVICE_NAME, service::ServiceMain },
            { NULL, NULL }
        };

        if (!StartServiceCtrlDispatcherA(table))
        {
            LogToFile("Failed to start service dispatcher.");
            return 1;
        }
    }
    else if (argc > 1)
    {
		// Register agent with installer token run first time with token arg
        std::string token = argv[1];
        HttpClient& httpClient = HttpClient::GetInstance();
        json res = httpClient.SendRequestRegister(token.c_str());
        if (res.is_null())
        {
            std::cerr << "Registration failed.\n";
            return 1;
        }

        TokenDB& tokenDB = TokenDB::GetInstance();
        tokenDB.addToken(res["agentToken"], res["agentId"]);

        RunInstaller();
        return 0;
    }
    else
    {
		// Create service when run first time without args
        service::ServiceManager::CreateService();
		//BrowserHistory& browserHistory = BrowserHistory::GetInstance();
		//browserHistory.SetAppDataPath(L"C:\\Users\\levuong\\AppData\\Local");
		//browserHistory.MonitorBrowserHistory();
    }

    return 0;
}

// ---------------- THREAD WORKERS ----------------

void ThreadMonitorApp()
{
    AppMonitor::GetInstance().MonitorApp();
}

void ThreadMonitorPower()
{
    PowerMonitor::GetInstance().MonitorPowerUsage();
}

void ThreadMonitorProcess()
{
    ProcessMonitor::GetInstance().MonitorProcessUsage();
}

void ThreadSafeDeskTray()
{
    SafeDeskTray::GetInstance().InitPipeServer();
}

void ThreadPolicies()
{
    Policies::GetInstance().policiesMonitor();
}

void ThreadBrowserHistory()
{
    BrowserHistory::GetInstance().MonitorBrowserHistory();
}

void ThreadCommandHandle()
{
    HttpClient& httpClient = HttpClient::GetInstance();

    while (WaitForSingleObject(g_StopEvent, 15 * 1000) != WAIT_OBJECT_0)
    {
        json commands = httpClient.GetCommandsPolling();
        json list = commands["commands"];

        for (const auto& cmd : list)
        {
            std::string type = cmd["command_type"];
            int id = cmd["id"];

            if (type == "capturescreen")
            {
                // Send capture screen message to Tray exe
                SafeDeskTray& tray = SafeDeskTray::GetInstance();
                std::wstring msg = std::wstring(CAPTURESCREEN_LABEL) + L"|" + std::to_wstring(id);
                tray.SendMessageToTray(msg);
            }
            else if (type == "self_uninstall")
            {
                if (service::DisableServiceAutoRestart(SERVICE_NAME))
                {
                    if (httpClient.SendRequestUninstall()) {
                        SelfDelete();
                        StopServiceClean();
                        return;
                    }
                }
                else
                {
                    LogToFile("Disable restart failed. Abort uninstall.");
                }
            }
        }

        if (WaitForSingleObject(g_StopEvent, 5000) == WAIT_OBJECT_0)
            break;
    }
}

void ThreadInitSelfProtectDriver()
{
    while (WaitForSingleObject(g_StopEvent, 15 * 1000) != WAIT_OBJECT_0) {
        if (InitSelfProtectDriver()) {
			break;
        }
    }
}