/**
 * Authentication Verification Script
 * Comprehensive check of auth setup
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyAuth() {
  console.log('🔍 Starting auth verification...\n');

  // 1. Check database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return;
  }

  // 2. Check if users exist
  const users = await prisma.user.findMany({
    take: 5,
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  });
  console.log(`✅ Found ${users.length} users in database`);

  if (users.length === 0) {
    console.log('⚠️  No users found. Run: npx tsx prisma/seed.ts');
    await prisma.$disconnect();
    return;
  }

  // 3. Test password verification
  const testUser = users.find((u) => u.email === 'admin@test.com') || users[0];
  console.log(`\n🔐 Testing password for: ${testUser.email || testUser.phone}`);

  const testPassword = 'Test1234';
  const isValid = await bcrypt.compare(testPassword, testUser.passwordHash);

  if (isValid) {
    console.log('✅ Password verification works');
  } else {
    console.log('❌ Password verification failed');
    console.log('   Trying to fix password...');
    const newHash = await bcrypt.hash(testPassword, 10);
    await prisma.user.update({
      where: { id: testUser.id },
      data: { passwordHash: newHash },
    });
    console.log('✅ Password updated!');
  }

  // 4. Display test credentials
  console.log('\n📋 Test Credentials:');
  const testAccounts = users.filter(
    (u) => u.email?.includes('@test.com') || u.phone?.includes('233')
  );
  testAccounts.forEach((user) => {
    const identifier = user.email || user.phone || 'N/A';
    console.log(
      `   ${user.role.toString().padEnd(15)} → ${identifier} / Test1234`
    );
  });

  // 5. Check environment variables
  console.log('\n🔧 Environment Variables:');
  console.log(
    `   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`
  );
  console.log(
    `   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ Missing'}`
  );
  console.log(
    `   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}`
  );

  // 6. Check auth file structure
  console.log('\n📁 File Structure:');
  const fs = require('fs');
  const path = require('path');

  const files = [
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/lib/auth.ts',
    'src/app/auth/signin/page.tsx',
    'prisma/schema.prisma',
  ];

  files.forEach((file) => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  });

  await prisma.$disconnect();
  console.log('\n✅ Verification complete!');
}

verifyAuth().catch(console.error);
