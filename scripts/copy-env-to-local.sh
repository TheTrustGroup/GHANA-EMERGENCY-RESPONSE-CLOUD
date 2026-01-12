#!/bin/bash

# Copy environment variables from .env.production to .env.local
# Adjusts values that need to be different for local development

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     📋 Copying Production Env to Local                     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found!"
    echo "   Please create it first with your production values."
    exit 1
fi

# Backup existing .env.local if it exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists"
    read -p "Backup existing .env.local? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        cp .env.local .env.local.backup
        echo "✅ Backed up to .env.local.backup"
    fi
fi

echo ""
echo "📋 Copying values from .env.production to .env.local..."
echo "   (Adjusting values for local development)"
echo ""

# Copy .env.production to .env.local
cp .env.production .env.local

# Adjust values that should be different for local development
echo "🔧 Adjusting local-specific values..."

# Change NEXTAUTH_URL to localhost
sed -i '' 's|NEXTAUTH_URL="https://.*"|NEXTAUTH_URL="http://localhost:3000"|g' .env.local 2>/dev/null || \
sed -i 's|NEXTAUTH_URL="https://.*"|NEXTAUTH_URL="http://localhost:3000"|g' .env.local

# Change NODE_ENV to development
sed -i '' 's|NODE_ENV="production"|NODE_ENV="development"|g' .env.local 2>/dev/null || \
sed -i 's|NODE_ENV="production"|NODE_ENV="development"|g' .env.local

# Change LOG_LEVEL to debug for local
sed -i '' 's|LOG_LEVEL="info"|LOG_LEVEL="debug"|g' .env.local 2>/dev/null || \
sed -i 's|LOG_LEVEL="info"|LOG_LEVEL="debug"|g' .env.local

# Update DATABASE_URL if it's still production (keep if already local)
if grep -q "ghana_emergency_prod" .env.local; then
    echo ""
    echo "⚠️  DATABASE_URL still points to production database"
    echo "   Please update it to your local database:"
    echo "   DATABASE_URL=\"postgresql://user:password@localhost:5432/ghana_emergency_dev?schema=public\""
    echo ""
    read -p "Do you want to update it now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter local database connection string: " db_url
        if [ ! -z "$db_url" ]; then
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|g" .env.local 2>/dev/null || \
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|g" .env.local
            echo "✅ DATABASE_URL updated"
        fi
    fi
fi

echo ""
echo "✅ Done! Values copied from .env.production to .env.local"
echo ""
echo "📝 What was changed for local development:"
echo "   • NEXTAUTH_URL → http://localhost:3000"
echo "   • NODE_ENV → development"
echo "   • LOG_LEVEL → debug"
echo ""
echo "⚠️  Please verify:"
echo "   • DATABASE_URL points to your local database"
echo "   • All API keys are correct"
echo ""
echo "🚀 Next steps:"
echo "   1. Verify DATABASE_URL in .env.local"
echo "   2. Run: npm run db:generate"
echo "   3. Run: npm run db:push"
echo "   4. Run: npm run dev"
echo ""

