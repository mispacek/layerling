@echo off
setlocal
set "LAYERLING_NODE=%LOCALAPPDATA%\nvm\v24.21.0"
if not exist "%LAYERLING_NODE%\node.exe" (
  echo Node.js 24.21.0 is missing. Install it with: nvm install 24.21.0
  pause
  exit /b 1
)
cd /d "%~dp0"
set "PATH=%LAYERLING_NODE%;%PATH%"
"%LAYERLING_NODE%\node.exe" "%LAYERLING_NODE%\node_modules\npm\bin\npm-cli.js" run dev -- --hostname 127.0.0.1 --port 3000
pause
