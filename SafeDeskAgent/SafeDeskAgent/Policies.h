#pragma once
#include <string>
#include <vector>
#include <unordered_map>

//map 'mon','tue','wed','thu','fri','sat','sun' to 0-6
static const std::unordered_map<std::string, int> day_map = {
	{"mon", 1},
	{"tue", 2},
	{"wed", 3},
	{"thu", 4},
	{"fri", 5},
	{"sat", 6},
	{"sun", 0}
};

typedef struct _AppPolicy {
	int app_id;
	std::string install_location;
	int is_blocked;
	int limit_enabled;
	int limit_minutes;
	std::string action_on_limit;
	int warn_interval;
} AppPolicy;

typedef struct _DailyPolicy {
	std::string day_of_week;
	int enabled;
	std::string allowed_hours;
	int limit_daily_minutes;
	int warn_on_exceed;
	int shutdown_on_exceed;
} DailyPolicy;

class Policies {
public:
	Policies();
	~Policies();
	static Policies& GetInstance();
	void policiesMonitor();
	DailyPolicy getDailyPolicy(int day_of_week);
	AppPolicy getAppPolicy(const std::string& install_location);

private:
	std::vector<AppPolicy> m_appPolicies;
	DailyPolicy m_dailyPolicies[7];
};