#!/bin/bash

# Seed Production Database
# This script seeds the production Supabase database with test users

echo "🌱 Seeding Production Database..."
echo ""
echo "⚠️  WARNING: This will DELETE all existing data!"
echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

# Get production DATABASE_URL from Vercel
echo "📥 Pulling production environment variables..."
vercel env pull .env.production 2>/dev/null || echo "⚠️  Could not pull from Vercel, using current DATABASE_URL"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    if [ -f .env.production ]; then
        export $(grep -v '^#' .env.production | xargs)
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found!"
    echo "Please set DATABASE_URL environment variable or run:"
    echo "  vercel env pull .env.production"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Run seed script
echo "🌱 Running seed script..."
npm run db:seed

echo ""
echo "✅ Production database seeded!"
echo ""
echo "🔑 Test Credentials:"
echo "   Email: admin@test.com"
echo "   Password: Test1234"
echo ""
echo "🌐 Try logging in at:"
echo "   https://ghana-emergency-response.vercel.app/auth/signin"
