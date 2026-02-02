@echo off
echo Cleaning webpack cache and fixing paths...
cd /d "%~dp0"

REM Remove nested frontend folder if it exists
if exist "frontend" (
    echo Removing nested frontend folder...
    rmdir /s /q "frontend" 2>nul
)

REM Clear webpack cache
if exist "node_modules\.cache" (
    echo Clearing webpack cache...
    rmdir /s /q "node_modules\.cache" 2>nul
)

REM Clear build folder
if exist "build" (
    echo Clearing build folder...
    rmdir /s /q "build" 2>nul
)

echo Done! Now run: npm start
pause
