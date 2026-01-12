#!/bin/bash

# Generate Production Secrets
# This script generates secure random secrets for production use

echo "=========================================="
echo "Generating Production Secrets"
echo "=========================================="
echo ""

echo "1. NEXTAUTH_SECRET (32+ characters):"
openssl rand -base64 32
echo ""

echo "2. ENCRYPTION_MASTER_KEY (32+ characters):"
openssl rand -base64 32
echo ""

echo "3. Database Password (24 characters):"
openssl rand -base64 24
echo ""

echo "4. Redis Password (24 characters):"
openssl rand -base64 24
echo ""

echo "5. Session Secret (32 characters):"
openssl rand -base64 32
echo ""

echo "=========================================="
echo "IMPORTANT:"
echo "- Store these secrets securely"
echo "- Never commit them to git"
echo "- Use a password manager"
echo "- Rotate every 90 days"
echo "=========================================="

