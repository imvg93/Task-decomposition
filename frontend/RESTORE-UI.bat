@echo off
echo ========================================
echo RESTORING FRONTEND UI
echo ========================================
echo.
echo This will fix the webpack error and restore your UI
echo.
pause

cd /d "%~dp0"

echo.
echo Step 1: Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Step 2: Removing nested frontend folder...
if exist "frontend" (
    echo Attempting to remove nested folder...
    rmdir /s /q "frontend" 2>nul
    if exist "frontend" (
        echo.
        echo WARNING: Could not remove nested folder!
        echo Please manually close:
        echo   - File Explorer windows
        echo   - VS Code / IDE
        echo   - Any other programs using the folder
        echo.
        echo Then delete: frontend\frontend folder manually
        echo.
        pause
    ) else (
        echo Successfully removed nested folder!
    )
)

echo.
echo Step 3: Clearing all caches...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
    echo Cleared webpack cache
)
if exist ".cache" (
    rmdir /s /q ".cache" 2>nul
    echo Cleared .cache folder
)
if exist "build" (
    rmdir /s /q "build" 2>nul
    echo Cleared build folder
)

echo.
echo Step 4: Verifying structure...
if exist "src\App.js" (
    echo ✓ App.js found
) else (
    echo ✗ App.js NOT found!
)
if exist "src\App.css" (
    echo ✓ App.css found
) else (
    echo ✗ App.css NOT found!
)
if exist "package.json" (
    echo ✓ package.json found
) else (
    echo ✗ package.json NOT found!
)

echo.
echo Step 5: Reinstalling dependencies...
call npm install

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Now run: npm start
echo.
echo Your UI should appear at: http://localhost:3000
echo.
pause
