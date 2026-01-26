@echo off
echo Killing all Node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo Done! Run restart-dev.bat to start fresh.
