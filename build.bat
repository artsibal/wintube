@echo off
echo ========================================
echo    WinTube Player v4.0 - Build Script
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found:
node --version
echo.

:: Check if yt-dlp is installed
where yt-dlp >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: yt-dlp is not installed!
    echo YouTube playback will not work without it.
    echo Install from: https://github.com/yt-dlp/yt-dlp
    echo Or run: winget install yt-dlp
    echo.
) else (
    echo yt-dlp found:
    yt-dlp --version
    echo.
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

:: Check for icon
if not exist "icon.ico" (
    echo NOTE: No icon.ico found. The app will use a default icon.
    echo You can add your own 256x256 icon.ico file later.
    echo.
)

:menu
echo.
echo What would you like to do?
echo.
echo [1] Run the app (development mode)
echo [2] Build portable .exe (Windows)
echo [3] Build installer (Windows)
echo [4] Build Linux AppImage *
echo [5] Clean build (delete dist and node_modules)
echo [6] Update yt-dlp
echo [7] Exit
echo.
echo * Linux builds require running on Linux or using WSL/Docker
echo.
set /p choice="Enter choice (1-7): "

if "%choice%"=="1" (
    echo.
    echo Starting WinTube...
    call npm start
    goto menu
) else if "%choice%"=="2" (
    echo.
    echo Building portable executable...
    call npm run build
    echo.
    echo Done! Check the 'dist' folder for WinTube-Portable.exe
    if exist "dist" explorer dist
    goto menu
) else if "%choice%"=="3" (
    echo.
    echo Building installer...
    call npm run build:installer
    echo.
    echo Done! Check the 'dist' folder for the installer.
    if exist "dist" explorer dist
    goto menu
) else if "%choice%"=="4" (
    echo.
    echo NOTE: Linux builds must be run on Linux or via WSL/Docker.
    echo This will attempt to build anyway, but may fail on Windows.
    echo.
    echo Building Linux AppImage...
    call npm run build:linux
    echo.
    if exist "dist" explorer dist
    goto menu
) else if "%choice%"=="5" (
    echo.
    echo Cleaning build files...
    if exist "dist" rmdir /s /q dist
    if exist "node_modules" rmdir /s /q node_modules
    echo Done! Run the script again to reinstall dependencies.
    pause
    exit /b 0
) else if "%choice%"=="6" (
    echo.
    echo Updating yt-dlp...
    yt-dlp -U
    echo.
    pause
    goto menu
) else if "%choice%"=="7" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice. Please enter 1-7.
    goto menu
)

echo.
pause
