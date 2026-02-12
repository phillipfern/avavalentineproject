#!/bin/bash

# Simple script to start a local web server for the Valentine Puzzle

echo "🎉 Starting Valentine Puzzle server..."
echo ""
echo "The website will open at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo ""

# Try Python 3 first, then Python 2, then suggest alternatives
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found. Please install Python or use another method."
    echo ""
    echo "Alternative: Open index.html directly in your browser"
    echo "Or use any local web server tool"
    exit 1
fi
