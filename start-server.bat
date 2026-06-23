@echo off
title Excel Portal - Backend Server
set PATH=C:\Program Files\nodejs;%PATH%
echo Starting Excel Portal Server on http://localhost:3001 ...
cd /d "%~dp0server"
node src\index.js
pause
