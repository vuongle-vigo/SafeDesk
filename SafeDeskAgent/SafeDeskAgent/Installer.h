#pragma once

#define INSATLLER_FOLDER L"C:\\Program Files\\SafeDesk"
#define EXE_NAME L"SafeDeskAgent.exe"
#define DRIVER_INF L"SelfProtect.inf"
#define DRIVER_CAT L"SelfProtect.cat"
#define DRIVER_FILE L"SelfProtect.sys"

bool DriverInstaller();
bool CheckFileInstaller();
bool MoveFileToInstallerFolder();
bool RunInstaller();