#!/bin/bash

echo "🔍 COMPREHENSIVE DIAGNOSTIC REPORT"
echo "=================================="
echo ""

echo "📦 Package Versions:"
npm list next-auth bcryptjs @prisma/client 2>&1 | grep -E "next-auth|bcryptjs|@prisma/client" | head -3
echo ""

echo "📁 Critical Files:"
[ -f "src/app/api/auth/[...nextauth]/route.ts" ] && echo "✅ NextAuth route exists" || echo "❌ NextAuth route missing"
[ -f "src/lib/auth.ts" ] && echo "✅ Auth config exists (src/lib/auth.ts)" || echo "❌ Auth config missing"
[ -f "src/lib/auth/auth-options.ts" ] && echo "✅ Auth options exists (src/lib/auth/auth-options.ts)" || echo "⚠️  Auth options not in separate file"
[ -f "src/server/db/index.ts" ] && echo "✅ Prisma client exists" || echo "❌ Prisma client missing"
[ -f ".env.local" ] && echo "✅ .env.local exists" || echo "❌ .env.local missing"
echo ""

echo "🔧 Environment Variables:"
if [ -f ".env.local" ]; then
  grep -q "DATABASE_URL" .env.local && echo "✅ DATABASE_URL set" || echo "❌ DATABASE_URL missing"
  grep -q "NEXTAUTH_SECRET" .env.local && echo "✅ NEXTAUTH_SECRET set" || echo "❌ NEXTAUTH_SECRET missing"
  grep -q "NEXTAUTH_URL" .env.local && echo "✅ NEXTAUTH_URL set" || echo "❌ NEXTAUTH_URL missing"
else
  echo "⚠️  .env.local not found - checking Vercel env vars..."
  vercel env ls 2>&1 | grep -E "NEXTAUTH|DATABASE" | head -3
fi
echo ""

echo "🗄️  Database Check:"
npx prisma db pull --force > /dev/null 2>&1 && echo "✅ Database accessible" || echo "❌ Database not accessible"
echo ""

echo "📊 User Count:"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:dnkc3gJRCCdo6nfY@db.clgewinupgvihlyaaevb.supabase.co:5432/postgres}"
npx tsx -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); p.user.count().then(c=>console.log('Users in DB:',c)).finally(()=>p.\$disconnect())" 2>&1 | tail -1
echo ""

echo "🔍 Schema Check:"
grep -q "passwordHash" prisma/schema.prisma && echo "✅ Schema uses passwordHash" || echo "❌ Schema missing passwordHash"
grep -q "phone" prisma/schema.prisma && echo "✅ Schema has phone field" || echo "❌ Schema missing phone"
echo ""

echo "=================================="
echo "✅ Diagnostic complete!"
