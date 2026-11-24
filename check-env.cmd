@echo off
REM 本机 PowerShell 执行策略禁止直接运行 .ps1，这里用 Bypass 包装调用。
REM 用法：双击本文件，或在终端里执行 check-env.cmd
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\check-env.ps1"
echo.
pause
