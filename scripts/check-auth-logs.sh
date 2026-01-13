#!/bin/bash

# Check Authentication Logs Script
# Helps debug login issues by monitoring Vercel logs

echo "🔍 Authentication Logs Checker"
echo "=============================="
echo ""

# Get the latest deployment
echo "📋 Getting latest deployment..."
DEPLOYMENT=$(vercel inspect ghana-emergency-response.vercel.app 2>&1 | grep "id" | head -1 | awk '{print $2}')

if [ -z "$DEPLOYMENT" ]; then
  echo "❌ Could not get deployment ID"
  exit 1
fi

echo "✅ Deployment ID: $DEPLOYMENT"
echo ""

# Get logs
echo "📊 Fetching recent logs (last 5 minutes)..."
echo ""

vercel logs "$DEPLOYMENT" 2>&1 | grep -E "(AUTH|VALIDATE|error|Error|ERROR|401|credentials)" || echo "No authentication-related logs found in recent activity."

echo ""
echo "💡 Tip: Try logging in now, then run this script again to see new logs"
echo ""
echo "🔗 View logs in browser:"
echo "   https://vercel.com/technologists-projects-d0a832f8/ghana-emergency-response/deployments"
