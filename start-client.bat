@echo off
title Excel Portal - Frontend (React)
set PATH=C:\Program Files\nodejs;%PATH%
echo Starting Excel Portal UI on http://localhost:5173 ...
cd /d "%~dp0client"
npx vite
pause
