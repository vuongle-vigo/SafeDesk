#include "Policies.h"
#include "HttpClient.h"
#include "Common.h"
#include "SQLiteDB.h"

Policies::Policies() {}
Policies::~Policies() {}

Policies& Policies::GetInstance() {
	static Policies instance;
	return instance;
}

// Monitor and update policies from server every 5 minutes
void Policies::policiesMonitor() {
	HttpClient& httpClient = HttpClient::GetInstance();
	DailyPoliciesDB& dailyPoliciesDB = DailyPoliciesDB::GetInstance();
	AppPoliciesDB& appPoliciesDB = AppPoliciesDB::GetInstance();
	while (WaitForSingleObject(g_StopEvent, 5 * 60 * 1000) != WAIT_OBJECT_0) {
		// Fetch app policies from server
		json res = httpClient.GetAppPolicies();
		if (!res.is_null()) {
			for (auto& policy : res) {
				int app_id = policy["installed_app_id"].get<int>();
				std::string install_location = policy["install_location"].get<std::string>();
				int is_blocked = policy["is_blocked"].get<int>();
				int limit_enabled = policy["limit_enabled"].get<int>();
				int limit_minutes = policy["limit_minutes"].get<int>();
				std::string action_on_limit = policy["action_on_limit"].get<std::string>();
				int warn_interval = policy["warn_interval"].get<int>();
				appPoliciesDB.updatePolicies(
					app_id,
					install_location,
					is_blocked,
					limit_enabled,
					limit_minutes,
					action_on_limit,
					warn_interval
				);
			}
		}

		// Fetch daily policies from server
		res = httpClient.GetDailyPolicies();
		if (res.is_null()) {

			for (auto& policy : res) {
				std::string day_of_week = policy["day_of_week"].get<std::string>();
				int enabled = policy["enabled"].get<int>();
				std::string allowed_hours = policy["allowed_hours"][0];
				int limit_daily_minutes = policy["limit_daily_minutes"].get<int>();
				int warn_on_exceed = policy["warn_on_exceed"].get<int>();
				int shutdown_on_exceed = policy["shutdown_on_exceed"].get<int>();
				dailyPoliciesDB.updatePolicies(
					day_of_week,
					enabled,
					allowed_hours,
					limit_daily_minutes,
					warn_on_exceed,
					shutdown_on_exceed
				);
			}
		}

		// Load policies from local database
		json appPolicies = appPoliciesDB.getPolicies();
		m_appPolicies.clear();
		for (auto& policy : appPolicies) {
			DEBUG_LOG("App Policy: %s", policy.dump().c_str());
			AppPolicy appPolicy;
			appPolicy.install_location = policy["install_location"].get<std::string>();
			appPolicy.is_blocked = policy["is_blocked"].get<int>();
			appPolicy.limit_enabled = policy["limit_enabled"].get<int>();
			appPolicy.limit_minutes = policy["limit_minutes"].get<int>();
			appPolicy.action_on_limit = policy["action_on_limit"].get<std::string>();
			appPolicy.warn_interval = policy["warn_interval"].get<int>();
			m_appPolicies.push_back(appPolicy);
		}

		// Load daily policies from local database
		json dailyPolicies = dailyPoliciesDB.getPolicies();
		for (auto& policy : dailyPolicies) {
			std::string day = policy["day_of_week"].get<std::string>();
			int index = day_map.at(day);
			m_dailyPolicies[index].day_of_week = day;
			m_dailyPolicies[index].enabled = policy["enabled"].get<int>();
			m_dailyPolicies[index].allowed_hours = policy["allowed_hours"].get<std::string>();
			m_dailyPolicies[index].limit_daily_minutes = policy["daily_limit_minutes"].get<int>();
			m_dailyPolicies[index].warn_on_exceed = policy["warn_on_exceed"].get<int>();
			m_dailyPolicies[index].shutdown_on_exceed = policy["shutdown_on_exceed"].get<int>();
		}
	}
}

// Get today's daily policy
DailyPolicy Policies::getDailyPolicy() {
	int today = GetWeekDay();
	return m_dailyPolicies[today];
}

// Get app policy by install location
AppPolicy Policies::getAppPolicy(const std::string& install_location) {
	for (const auto& appPolicy : m_appPolicies) {
		//LogToFile("Checking App Policy Install Location: " + appPolicy.install_location);
		//LogToFile("Given Install Location: " + install_location);
		if (appPolicy.install_location == install_location) {
			//LogToFile("Finded App Policy for Install Location: " + install_location);
			return appPolicy;
		}
	}

	return AppPolicy{};
}
