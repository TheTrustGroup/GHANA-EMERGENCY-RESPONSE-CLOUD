#!/bin/bash

# Local Development Setup Script
# This script helps set up the local development environment

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     🚀 Local Development Setup                              ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env.local"
    else
        echo "Creating new .env.local from env.example..."
        cp env.example .env.local
        echo "✅ .env.local created"
    fi
else
    echo "Creating .env.local from env.example..."
    cp env.example .env.local
    echo "✅ .env.local created"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

# Check PostgreSQL (optional)
echo "Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL installed"
    if pg_isready &> /dev/null; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  PostgreSQL is not running. Start it with:"
        echo "   brew services start postgresql (macOS)"
        echo "   sudo systemctl start postgresql (Linux)"
    fi
else
    echo "⚠️  PostgreSQL not found. You can use a cloud database instead."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install dependencies
echo "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate Prisma client
echo "Generating Prisma client..."
npm run db:generate
echo "✅ Prisma client generated"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📝 Next Steps:"
echo ""
echo "1. Edit .env.local and configure:"
echo "   - DATABASE_URL (your local PostgreSQL connection)"
echo "   - API keys (Mapbox, Pusher, etc.)"
echo ""
echo "2. Set up database:"
echo "   npm run db:push"
echo ""
echo "3. (Optional) Seed test data:"
echo "   npm run db:seed"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "5. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For detailed instructions, see: LOCAL_TESTING_GUIDE.md"
echo ""
echo "✅ Setup complete!"

