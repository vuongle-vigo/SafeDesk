#pragma once

#define INSATLLER_FOLDER L"C:\\Program Files\\SafeDesk"
#define EXE_NAME L"SafeDeskAgent.exe"

bool CheckFileInstaller();
bool MoveFileToInstallerFolder();
bool RunInstaller();