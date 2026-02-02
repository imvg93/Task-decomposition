@echo off
echo ========================================
echo Cleaning Frontend and Fixing Issues
echo ========================================
cd /d "%~dp0"

echo.
echo Step 1: Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Removing nested frontend folder...
if exist "frontend" (
    echo Found nested frontend folder, removing...
    rmdir /s /q "frontend" 2>nul
    if exist "frontend" (
        echo WARNING: Could not remove nested folder. Please close any programs using it.
    ) else (
        echo Successfully removed nested folder.
    )
)

echo.
echo Step 3: Clearing caches...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
    echo Cleared webpack cache.
)
if exist ".cache" (
    rmdir /s /q ".cache" 2>nul
    echo Cleared .cache folder.
)
if exist "build" (
    rmdir /s /q "build" 2>nul
    echo Cleared build folder.
)

echo.
echo Step 4: Reinstalling dependencies...
call npm install

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Now run: npm start
echo.
pause
