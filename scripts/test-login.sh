#!/bin/bash

# Test Login Functionality
# Verifies authentication is working correctly

echo "🧪 Testing Login Functionality"
echo "=============================="
echo ""

# Test account credentials
EMAIL="admin@test.com"
PASSWORD="Test1234"
URL="https://ghana-emergency-response.vercel.app/auth/signin"

echo "📋 Test Credentials:"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo "   URL: $URL"
echo ""

echo "🔍 Checking environment variables..."
vercel env ls 2>&1 | grep -E "NEXTAUTH|DATABASE" | head -6

echo ""
echo "✅ Test Steps:"
echo "1. Open: $URL"
echo "2. Enter email: $EMAIL"
echo "3. Enter password: $PASSWORD"
echo "4. Click 'Sign In'"
echo "5. Should redirect to dashboard"
echo ""

echo "🔍 If login fails, check:"
echo "   - Browser console for errors"
echo "   - Vercel logs: vercel logs dpl_AdeV91SutZ374gsT4XXx7E1s6vLs"
echo "   - Network tab for /api/auth/callback/credentials response"
echo ""

echo "📊 To verify account in database:"
echo "   export DATABASE_URL='your-db-url'"
echo "   npx tsx scripts/comprehensive-check.ts"
echo ""
