#include "BrowserHistory.h"


BrowserHistory::BrowserHistory() {}

BrowserHistory::~BrowserHistory() {}

BrowserHistory& BrowserHistory::GetInstance() {
	static BrowserHistory instance;
	return instance;
}

void BrowserHistory::SetAppDataPath(std::wstring wszAppDataPath) {
	m_wszAppDataPath = wszAppDataPath;
}

