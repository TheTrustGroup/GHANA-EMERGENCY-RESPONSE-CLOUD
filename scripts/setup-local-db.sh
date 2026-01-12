#!/bin/bash

# Setup Local Database Script
# Creates the local development database

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     🗄️  Local Database Setup                               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found!"
    echo "   Please install PostgreSQL first:"
    echo "   macOS: brew install postgresql"
    echo "   Linux: sudo apt-get install postgresql"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL is not running!"
    echo "   Start it with:"
    echo "   macOS: brew services start postgresql"
    echo "   Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is installed and running"
echo ""

# Check if database already exists
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw ghana_emergency_dev; then
    echo "✅ Database 'ghana_emergency_dev' already exists"
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        psql postgres -c "DROP DATABASE IF EXISTS ghana_emergency_dev;" 2>/dev/null || true
        echo "✅ Database dropped"
    else
        echo "Using existing database"
        exit 0
    fi
fi

echo ""
echo "Creating database 'ghana_emergency_dev'..."

# Try to create database (may need password)
if psql postgres -c "CREATE DATABASE ghana_emergency_dev;" 2>/dev/null; then
    echo "✅ Database created successfully!"
else
    echo ""
    echo "⚠️  Could not create database automatically"
    echo "   You may need to enter your PostgreSQL password"
    echo ""
    echo "Please run these commands manually:"
    echo ""
    echo "  psql postgres"
    echo "  CREATE DATABASE ghana_emergency_dev;"
    echo "  \\q"
    echo ""
    read -p "Press Enter after you've created the database..."
fi

# Check if database was created
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw ghana_emergency_dev; then
    echo ""
    echo "✅ Database 'ghana_emergency_dev' is ready!"
    echo ""
    echo "📝 Next: Update .env.local with your database connection:"
    echo ""
    echo "   DATABASE_URL=\"postgresql://postgres@localhost:5432/ghana_emergency_dev?schema=public\""
    echo ""
    echo "   (Add password if needed: postgres:YOUR_PASSWORD@localhost)"
    echo ""
else
    echo ""
    echo "❌ Database creation failed or not found"
    echo "   Please create it manually using the commands above"
fi

