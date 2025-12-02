#include "PowerMonitor.h"
#include "Config.h"
#include "Common.h"
#include <chrono>
#include <ctime>
#include <sstream>
#include <iomanip>
#include <windows.h>
#include "SQLiteDB.h"
#include <thread>
#include "Policies.h"

#include "SafeDeskTray.h"

#define _CRT_SECURE_NO_WARNINGS

PowerMonitor::PowerMonitor() {
    dwTimeUseLimit = 123;
}

PowerMonitor::~PowerMonitor() {

}

PowerMonitor& PowerMonitor::GetInstance() {
    static PowerMonitor instance;
    return instance;
}

void PowerMonitor::SetTimeUseLimit(DWORD dwTimeUseLimit) {
    dwTimeUseLimit = dwTimeUseLimit;
}

void PowerMonitor::MonitorPowerUsage() {
    PowerUsageDB& powerUsageDB = PowerUsageDB::GetInstance();
	Policies& policies = Policies::GetInstance();
    SafeDeskTray& safeDeskTray = SafeDeskTray::GetInstance();
    while (WaitForSingleObject(g_StopEvent, 1 * 60 * 1000) != WAIT_OBJECT_0) {
        std::cout << "Monitoring power usage..." << std::endl;
        int current_hour = atoi(GetCurrentTimeHour().c_str());
        int current_minute = atoi(GetCurrentTimeMinute().c_str());
        std::ostringstream current_time_ss;
        current_time_ss << std::setw(2) << std::setfill('0') << current_hour << ":"
            << std::setw(2) << std::setfill('0') << current_minute;
        std::string current_time_str = current_time_ss.str(); // e.g., "03:05"
        // Get today's config
		DailyPolicy configMonitor = policies.getDailyPolicy();
		if (configMonitor.enabled == 0) {
			continue; // Skip if monitoring is disabled for today
		}

		float max_hours = (float)configMonitor.limit_daily_minutes / 60.0f;
        bool within_allowed_time = false;
		std::string ranges_str = configMonitor.allowed_hours;
		// range time example 9:00-13:00, parse it to int time
		
        size_t pos = ranges_str.find('-');
        std::string startStr = ranges_str.substr(0, pos);
        std::string endStr = ranges_str.substr(pos + 1);

    
        if (current_time_str >= startStr && current_time_str <= endStr) {
            within_allowed_time = true;
            break;
        }

        // Calculate total usage time for today
        double total_usage_minutes = powerUsageDB.query_today();
        double total_usage_hours = total_usage_minutes / 60.0;

        // Check for violations and show warnings
        if (!within_allowed_time) {
			if (configMonitor.shutdown_on_exceed) {
                safeDeskTray.SendMessageToTray(NOTI_LABEL + std::wstring(L"|Warning: System usage is outside allowed time ranges! System will shutdown after 3 minutes"));
				std::this_thread::sleep_for(std::chrono::minutes(3));
                ShutdownPC();
			} else if (configMonitor.warn_on_exceed) {
                safeDeskTray.SendMessageToTray(NOTI_LABEL + std::wstring(L"|Warning: System usage is outside allowed time ranges!"));
			}
        }

        if (total_usage_hours > max_hours) {
            if (configMonitor.shutdown_on_exceed) {
                safeDeskTray.SendMessageToTray(NOTI_LABEL + std::wstring(L"|Warning: Daily usage limit exceeded! System will shutdown after 3 minutes"));
                std::this_thread::sleep_for(std::chrono::minutes(3));
                ShutdownPC();
			}
			else if (configMonitor.warn_on_exceed) {
				safeDeskTray.SendMessageToTray(NOTI_LABEL + std::wstring(L"|Warning: Daily usage limit exceeded!"));
			}   
        }
    }
}

