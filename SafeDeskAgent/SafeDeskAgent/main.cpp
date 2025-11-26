#include <iostream>
#include "HttpClient.h"
#include "SQLiteDB.h"
#include "ProcessMonitor.h"
#include "AppMonitor.h"
#include "PowerMonitor.h"
#include "SafeDeskTray.h"
#include "Communication.h"
#include <thread>
#include "Common.h"
#include "CaptureScreen.h"
#include "BrowserHistory.h"
#include "Policies.h"

// Global for service variable
SERVICE_STATUS g_ServiceStatus = { 0 };
SERVICE_STATUS_HANDLE g_ServiceStatusHandle = NULL;
bool g_RunningAsService = false;

#define SERVICE_NAME "SafeDeskService"

void ThreadMonitorApp();
void ThreadMonitorPower();
void ThreadMonitorProcess();
void ThreadSafeDeskTray();
void ThreadCommandHandle();
void ThreadPolicies();

static void SetRecoveryOptions(SC_HANDLE hService) {
    SC_ACTION actions[3];
    actions[0].Type = SC_ACTION_RESTART;  // Restart on first failure
    actions[0].Delay = 5000;              // 5 seconds
    actions[1].Type = SC_ACTION_RESTART;  // Restart on second failure
    actions[1].Delay = 5000;
    actions[2].Type = SC_ACTION_RESTART;  // Restart on all failures
    actions[2].Delay = 5000;

    SERVICE_FAILURE_ACTIONSA failureActions = {};
    failureActions.dwResetPeriod = 0;       // Reset failure count (0 = never reset)
    failureActions.lpCommand = NULL;
    failureActions.lpRebootMsg = NULL;
    failureActions.cActions = 3;
    failureActions.lpsaActions = actions;

    if (!ChangeServiceConfig2A(hService, SERVICE_CONFIG_FAILURE_ACTIONS, &failureActions)) {
        LogToFile("Failed to set service recovery options: " + std::to_string(GetLastError()));
    }
    else {
        LogToFile("Service recovery configured successfully.");
    }
}


void RunMainLogic() {
    // Main logic of the application goes here
    HttpClient& httpClient = HttpClient::GetInstance();

    std::thread safeDeskTray(ThreadSafeDeskTray);
    std::thread monitorApp(ThreadMonitorApp);
    std::thread monitorPower(ThreadMonitorPower);
    std::thread monitorProcess(ThreadMonitorProcess);
    std::thread commandHandle(ThreadCommandHandle);
	std::thread policies(ThreadPolicies);

    InitGDIPlus();
    InitSelfProtectDriver();   

    //while (g_ServiceStatus.dwCurrentState == SERVICE_RUNNING) {
    while (1) {
        PowerUsageDB& powerUsageDB = PowerUsageDB::GetInstance();
        //httpClient.SendRequestUpdateOnline();
        json jsonData = powerUsageDB.query_all();
        if (httpClient.PostPowerUsage(jsonData)) {
            powerUsageDB.update_status(jsonData);
        }

        ProcessUsageDB& processUsageDB = ProcessUsageDB::GetInstance();
        json processData = processUsageDB.query_all();
        if (httpClient.PostProcessUsage(processData)) {
            processUsageDB.update_status(processData);
        }

        std::this_thread::sleep_for(std::chrono::minutes(1));
    }

    safeDeskTray.join();
    monitorApp.join();
    monitorPower.join();
    monitorProcess.join();
    commandHandle.join();
	policies.join();
}

namespace service {
    // Function controller for the service
    void WINAPI ServiceCtrlHandler(DWORD dwControl) {
        switch (dwControl) {
        case SERVICE_CONTROL_STOP:
        case SERVICE_CONTROL_SHUTDOWN:
            g_ServiceStatus.dwCurrentState = SERVICE_STOP_PENDING;
            SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);
            //g_ServiceStatus.dwCurrentState = SERVICE_STOPPED;
            //SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);
            g_ServiceStatus.dwCurrentState = SERVICE_STOPPED;
            LogToFile("Service stopped.");
            break;
        default:
            break;
        }

        SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);
    }

    // Service main function
    void WINAPI ServiceMain(DWORD argc, LPSTR* argv) {
         LogToFile("Service is init...");
        g_ServiceStatusHandle = RegisterServiceCtrlHandlerA(SERVICE_NAME, ServiceCtrlHandler);
        if (!g_ServiceStatusHandle) {
            LogToFile("Failed to register service control handler: " + std::to_string(GetLastError()));
            return;
        }
        LogToFile("Service is init...");
        // Setup service status
        g_ServiceStatus.dwServiceType = SERVICE_WIN32_OWN_PROCESS;
        g_ServiceStatus.dwCurrentState = SERVICE_START_PENDING;
        g_ServiceStatus.dwControlsAccepted = SERVICE_ACCEPT_SHUTDOWN;
        g_ServiceStatus.dwWin32ExitCode = 0;
        g_ServiceStatus.dwServiceSpecificExitCode = 0;
        g_ServiceStatus.dwCheckPoint = 0;
        g_ServiceStatus.dwWaitHint = 5000;

        SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);

        // Set to running status
        g_ServiceStatus.dwCurrentState = SERVICE_RUNNING;
        SetServiceStatus(g_ServiceStatusHandle, &g_ServiceStatus);
        LogToFile("Service is start...");

        //if (EnableShutdownPrivilege()) {
        //    ShutdownPC();
        //}

        // Run main logic
        RunMainLogic();
    }

    // Class ServiceManager to handle service creation
    class ServiceManager {
    public:
        static bool CreateService() {
            SC_HANDLE schSCManager = OpenSCManagerA(NULL, NULL, SC_MANAGER_CREATE_SERVICE);
            if (schSCManager == NULL) {
                LogToFile("Failed to open Service Control Manager: " + std::to_string(GetLastError()));
                return false;
            }

            // Check if the service already exists
            SC_HANDLE schServiceCheck = OpenServiceA(schSCManager, SERVICE_NAME, SERVICE_QUERY_STATUS);
            if (schServiceCheck != NULL) {
                LogToFile("Service already exists.");
                CloseServiceHandle(schServiceCheck);
                CloseServiceHandle(schSCManager);
                return true; // Service already exists, no need to create again
            }

            // Get the path of the current executable
            char szPath[MAX_PATH];
            if (GetModuleFileNameA(NULL, szPath, MAX_PATH) == 0) {
                LogToFile("Failed to get module file name: " + std::to_string(GetLastError()));
                CloseServiceHandle(schSCManager);
                return false;
            }

            // Add the --service argument to the path
            std::string servicePath = std::string(szPath) + " --service";
            if (servicePath.length() >= MAX_PATH) {
                LogToFile("Service path too long after adding --service.");
                CloseServiceHandle(schSCManager);
                return false;
            }

            // Create the service
            SC_HANDLE schService = CreateServiceA(
                schSCManager,
                SERVICE_NAME,
                "SafeDesk Monitoring Service",
                SERVICE_ALL_ACCESS,
                SERVICE_WIN32_OWN_PROCESS,
                SERVICE_AUTO_START,
                SERVICE_ERROR_NORMAL,
                servicePath.c_str(),
                NULL, NULL, NULL, NULL, NULL
            );

            if (schService == NULL) {
                DWORD error = GetLastError();
                LogToFile("Failed to create service: " + std::to_string(error));
                CloseServiceHandle(schSCManager);
                return false;
            }

            SetRecoveryOptions(schService);

            // Set service description
            SERVICE_DESCRIPTIONA description = { (LPSTR)"Safedesk monitoring service for tracking system usage." };
            ChangeServiceConfig2A(schService, SERVICE_CONFIG_DESCRIPTION, &description);

            LogToFile("Service created successfully with --service argument.");
            CloseServiceHandle(schService);
            CloseServiceHandle(schSCManager);
            return true;
        }
    };
}

int main(int argc, char* argv[]) {
    // Check if running as a service
    if (argc > 1 && std::string(argv[1]) == "--service") {
        g_RunningAsService = true;
        SERVICE_TABLE_ENTRYA serviceTable[] = {
            { (LPSTR)SERVICE_NAME, service::ServiceMain },
            { NULL, NULL }
        };

        if (!StartServiceCtrlDispatcherA(serviceTable)) {
            LogToFile("Failed to start service dispatcher: " + std::to_string(GetLastError()));
            return 1;
        }
    }
    else {
        //service::ServiceManager::CreateService();
        //RunMainLogic();

	/*	Policies& policies = Policies::GetInstance();
		policies.policiesMonitor();*/

		BrowserHistory& browserHistory = BrowserHistory::GetInstance();
        std::vector<BrowserItem> history = browserHistory.GetEdgeHistory();
		BrowserHistoryDB& browserHistoryDB = BrowserHistoryDB::GetInstance();
		for (const auto& item : history) {
            if (!browserHistoryDB.add(
                "edge",
                item.url,
                item.title,
                item.visit_count,
                item.typed_count,
                item.last_visit_time,
                item.hidden
            )) {
            }   
		}

        
		//std::cout << history.dump(4) << std::endl;
		return 0;
    }

	//LoginDB& sqlite = LoginDB::GetInstance();
	HttpClient& httpClient = HttpClient::GetInstance();
	//json res = httpClient.SendRequestRegister("48360504e99351302ca21e5c0ace540dde0f956039b4696729a32e6040bb9483");
	//if (res.is_null()) {
	//	std::cout << "Registration failed." << std::endl;
	//	return -1;
	//}

	

	//TokenDB& tokenDB = TokenDB::GetInstance();
	//
	//if (!tokenDB.addToken(res["agentToken"], res["agentId"])) {
	//	DEBUG_LOG("Failed to store token in database.");
	//}
	//DEBUG_LOG("Response: %s", res.dump().c_str());

	//AppMonitor& appMonitor = AppMonitor::GetInstance();
	//appMonitor.MonitorApp();

	//PowerMonitor& powerMonitor = PowerMonitor::GetInstance();
	//powerMonitor.MonitorPowerUsage();

	//ProcessMonitor& processMonitor = ProcessMonitor::GetInstance();
	//processMonitor.MonitorProcessUsage();
	//PowerUsageDB& powerUsageDB = PowerUsageDB::GetInstance();
	//json powerUsageJson = powerUsageDB.query_all();
	//httpClient.PostPowerUsage(powerUsageJson);

	//ProcessUsageDB& processUsageDB = ProcessUsageDB::GetInstance();
	//json processUsageJson = processUsageDB.query_all();
	//httpClient.PostProcessUsage(processUsageJson);
	return 0;

}

void ThreadMonitorApp() {
	AppMonitor& appMonitor = AppMonitor::GetInstance();
	appMonitor.MonitorApp();
}

void ThreadMonitorPower() {
	PowerMonitor& powerMonitor = PowerMonitor::GetInstance();
	powerMonitor.MonitorPowerUsage();
}

void ThreadMonitorProcess() {
	ProcessMonitor& processMonitor = ProcessMonitor::GetInstance();
	processMonitor.MonitorProcessUsage();
}

void ThreadSafeDeskTray() {
    SafeDeskTray& safeDeskTray = SafeDeskTray::GetInstance();
    safeDeskTray.InitPipeServer();
}

void ThreadPolicies() {
	Policies& policies = Policies::GetInstance();
	policies.policiesMonitor();
}

void ThreadCommandHandle() {
	HttpClient& httpClient = HttpClient::GetInstance();
    while (1) {
        json commands = httpClient.GetCommandsPolling();
		DEBUG_LOG("Received commands: %s", commands.dump().c_str());
		json cmd_array = commands["commands"];
		for (const auto& cmd : cmd_array) {
			std::string command_type = cmd["command_type"];
            int command_id = cmd["id"];
            if (command_set.count(command_id)) {
				continue; // Skip already processed command
            }

			DEBUG_LOG("Received command: %s ", command_type.c_str());
			if (command_type == "capturescreen") {
				const char* tmpFilePath = "screenshot_tmp.jpg";
				SafeDeskTray& safeDeskTray = SafeDeskTray::GetInstance();
                std::wstring message = std::wstring(CAPTURESCREEN_LABEL) + L"|" + std::to_wstring(command_id) + L"\0";
                if (safeDeskTray.SendMessageToTray(message)) {
                    command_set.insert(command_id);
                }
			}
			else if (command_type == "self_uninstall") {
				//httpClient.SendRequestUninstall();
                SelfDelete();
			}
			/*else if (command_type == "uninstall_app") {
				std::string quietUninstallString = cmd["quiet_uninstall_string"];
				LogToFile("Executing uninstall command: " + quietUninstallString);
				AppMonitor& appMonitor = AppMonitor::GetInstance();
				appMonitor.ExecuteUninstall(quietUninstallString);
			}*/
			// Handle other command types as needed
		}
        std::this_thread::sleep_for(std::chrono::seconds(5));
	}
}