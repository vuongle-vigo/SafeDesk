const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const installerModel = require('./installer.model');

async function createBatInstaller(installerToken) {
    const installerContent = `@echo off
setlocal enabledelayedexpansion

:: ============================
:: CONFIG
:: ============================
set DOWNLOAD_URL=http://10.15.4.3:8889/installer-files/safedesk.zip
set ZIP_FILE=%TEMP%\\safedesk.zip
set TEMP_EXTRACT=%TEMP%\\safedesk_extract
set EXE_NAME=SafeDeskAgent.exe
set INSTALLER_FOLDER=%ProgramFiles%\\SafeDesk
set EXE_ARGS="${installerToken}"
:: ============================


:: ========== 1. Elevate quyền admin ==========
net session >nul 2>&1
if %errorlevel% NEQ 0 (
    echo [*] Dang yeu cau quyen admin...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)

echo [*] Dang chay voi quyen Administrator


:: ========== 2. Download file ZIP ==========
echo [*] Dang tai file ZIP...
powershell -Command "(New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%ZIP_FILE%')"

if not exist "%ZIP_FILE%" (
    echo [X] Tai file that bai!
    pause
    exit /b
)

echo [+] Tai thanh cong: %ZIP_FILE%


:: ========== 3. Giai nen ==========
if exist "%TEMP_EXTRACT%" rd /s /q "%TEMP_EXTRACT%"
mkdir "%TEMP_EXTRACT%"

echo [*] Dang giai nen...
powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%TEMP_EXTRACT%' -Force"
echo [+] Giai nen xong.


:: ========== 4. Chay EXE (BLOCKING) voi tham so ==========
set TARGET_EXE=%TEMP_EXTRACT%\\%EXE_NAME%

if not exist "%TARGET_EXE%" (
    echo [X] Khong tim thay file: %TARGET_EXE%
    pause
    exit /b
)

echo [*] Dang chay file ung dung duoi dang Admin (cho den khi hoan tat)...

:: Chay va CHO den khi exe ket thuc
powershell -Command "Start-Process '%TARGET_EXE%' -ArgumentList %EXE_ARGS% -Verb runAs -Wait"

echo [+] Ung dung da ket thuc.


:: ========== 5. Cleanup ==========
echo [*] Dang xoa file tam...

if exist "%ZIP_FILE%" del /f /q "%ZIP_FILE%"
if exist "%TEMP_EXTRACT%" rd /s /q "%TEMP_EXTRACT%"

echo [+] Da xoa tat ca file tam.

if exist "%INSTALLER_FOLDER%" (
    echo [*] Installer da duoc cai dat vao: %INSTALLER_FOLDER%
    powershell -Command "Start-Process '%INSTALLER_FOLDER%\\%EXE_NAME%' -Verb runAs"
) else (
    echo [X] Khong tim thay thu muc cai dat: %INSTALLER_FOLDER%
)

echo [+] Hoan tat!
pause
`;

    return installerContent;
}


exports.generateInstallerToken = async (userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expireAt = new Date(Date.now() + 15 * 60 * 1000); 
    await installerModel.generateInstallerToken(
        userId,
        token,
        expireAt
    );

    const batfileContent = await createBatInstaller(token);
    //savefile with token filename
    const installerDir = path.join(__dirname, 'installer');
    await fs.mkdir(installerDir, { recursive: true });

    const filePath = path.join(installerDir, `${token}.bat`);
    await fs.writeFile(filePath, batfileContent, 'utf8');

    return { installerfilePath: filePath, expiresAt: expireAt };
}