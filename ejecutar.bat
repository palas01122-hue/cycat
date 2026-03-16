@echo off
title CyCat
cd /d "%~dp0"

echo Liberando puertos...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001 "') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173 "') do taskkill /PID %%a /F >nul 2>&1

echo Iniciando Backend...
start "BACKEND" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 4 /nobreak >nul

echo Iniciando Frontend...
start "FRONTEND" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 /nobreak >nul

start http://localhost:5173
exit
