#!/bin/bash

# Dashboard Preview Script
# Opens all dashboards in browser for quick preview

BASE_URL="http://localhost:3000"

echo "🚨 Ghana Emergency Response Platform - Dashboard Preview"
echo "=========================================================="
echo ""
echo "⚠️  Make sure:"
echo "   1. Development server is running (npm run dev)"
echo "   2. You're logged in with appropriate role for each dashboard"
echo "   3. Database is running and migrated"
echo ""
echo "Opening dashboards..."
echo ""

# Check if server is running
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Error: Development server is not running!"
    echo "   Start it with: npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Function to open URL (works on macOS, Linux, Windows with WSL)
open_url() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$1"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$1" 2>/dev/null || sensible-browser "$1" 2>/dev/null || echo "Please open: $1"
    else
        echo "Please open: $1"
    fi
}

# Open each dashboard
echo "📱 Opening Citizen Dashboard..."
open_url "$BASE_URL/dashboard/citizen"
sleep 2

echo "🎯 Opening Dispatcher Command Center..."
open_url "$BASE_URL/dashboard/dispatch"
sleep 2

echo "🚑 Opening Responder Dashboard..."
open_url "$BASE_URL/dashboard/responder"
sleep 2

echo "🏢 Opening Agency Admin Dashboard..."
open_url "$BASE_URL/dashboard/agency"
sleep 2

echo "⚙️  Opening System Admin Dashboard..."
open_url "$BASE_URL/dashboard/admin"
sleep 2

echo ""
echo "✅ All dashboards opened!"
echo ""
echo "📋 Dashboard URLs:"
echo "   Citizen:      $BASE_URL/dashboard/citizen"
echo "   Dispatcher:   $BASE_URL/dashboard/dispatch"
echo "   Responder:    $BASE_URL/dashboard/responder"
echo "   Agency Admin: $BASE_URL/dashboard/agency"
echo "   System Admin: $BASE_URL/dashboard/admin"
echo ""
echo "💡 Tip: Use different browser profiles or incognito windows"
echo "   to test different user roles simultaneously"
echo ""
