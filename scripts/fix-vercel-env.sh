#!/bin/bash

# Fix Vercel Environment Variables
# This script helps clean up and verify environment variables

echo "🔧 Vercel Environment Variables Fix Script"
echo "=========================================="
echo ""

# Production URL
PROD_URL="https://ghana-emergency-response.vercel.app"

echo "📋 Current Environment Variables:"
echo ""
vercel env ls

echo ""
echo "⚠️  Issues Found:"
echo "1. NEXTAUTH_URL is missing for Preview and Development"
echo "2. Need to verify NEXTAUTH_SECRET is set correctly"
echo ""

echo "🔧 To fix, run these commands:"
echo ""
echo "# Add NEXTAUTH_URL for Preview:"
echo "echo '$PROD_URL' | vercel env add NEXTAUTH_URL preview"
echo ""
echo "# Add NEXTAUTH_URL for Development:"
echo "echo 'http://localhost:3000' | vercel env add NEXTAUTH_URL development"
echo ""
echo "# Verify NEXTAUTH_SECRET exists (should already be set):"
echo "vercel env ls | grep NEXTAUTH_SECRET"
echo ""
echo "# If NEXTAUTH_SECRET is missing, generate and add:"
echo "SECRET=\$(openssl rand -base64 32)"
echo "echo \"\$SECRET\" | vercel env add NEXTAUTH_SECRET production"
echo "echo \"\$SECRET\" | vercel env add NEXTAUTH_SECRET preview"
echo "echo \"\$SECRET\" | vercel env add NEXTAUTH_SECRET development"
echo ""
