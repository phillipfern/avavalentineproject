@echo off
REM Simple script to start a local web server for Windows

echo Starting Valentine Puzzle server...
echo.
echo The website will open at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.

REM Try Python 3 first, then Python 2
python -m http.server 8000 2>nul || python -m SimpleHTTPServer 8000
