/**
 * Create Simple Test Users
 * Creates test users with easy-to-remember credentials for all roles
 * 
 * Run: npx tsx scripts/create-test-users.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { formatGhanaPhone } from '../src/server/db/utils';

const prisma = new PrismaClient();

const TEST_PASSWORD = 'Test1234'; // Simple password for all test users

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function createOrUpdateUser(
  email: string,
  phone: string,
  name: string,
  role: UserRole,
  agencyId?: string
) {
  const passwordHash = await hashPassword(TEST_PASSWORD);
  
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    });
    console.log(`✅ Updated: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        phone: formatGhanaPhone(phone),
        name,
        passwordHash,
        role,
        agencyId: agencyId || null,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    });
    console.log(`✅ Created: ${email}`);
  }
}

async function main() {
  console.log('\n🔐 Creating Test Users...\n');
  console.log(`📝 All users will have password: ${TEST_PASSWORD}\n`);

  // Get first agency for responders/agency admins
  const firstAgency = await prisma.agency.findFirst();
  if (!firstAgency) {
    console.error('❌ No agencies found. Please run: npm run db:seed');
    process.exit(1);
  }

  // 1. CITIZEN (for testing reporting)
  console.log('👤 Creating Citizen...');
  await createOrUpdateUser(
    'citizen@test.com',
    '0244111111',
    'Test Citizen',
    UserRole.CITIZEN
  );

  // 2. DISPATCHER (for testing dispatch center)
  console.log('📞 Creating Dispatcher...');
  await createOrUpdateUser(
    'dispatcher@test.com',
    '0244222222',
    'Test Dispatcher',
    UserRole.DISPATCHER,
    firstAgency.id
  );

  // 3. RESPONDER (for testing responder dashboard)
  console.log('🚨 Creating Responder...');
  await createOrUpdateUser(
    'responder@test.com',
    '0244333333',
    'Test Responder',
    UserRole.RESPONDER,
    firstAgency.id
  );

  // 4. AGENCY_ADMIN (for testing agency dashboard)
  console.log('🏢 Creating Agency Admin...');
  await createOrUpdateUser(
    'agency@test.com',
    '0244444444',
    'Test Agency Admin',
    UserRole.AGENCY_ADMIN,
    firstAgency.id
  );

  // 5. SYSTEM_ADMIN (for testing admin dashboard)
  console.log('👑 Creating System Admin...');
  await createOrUpdateUser(
    'admin@test.com',
    '0244555555',
    'Test System Admin',
    UserRole.SYSTEM_ADMIN
  );

  console.log('\n' + '='.repeat(60));
  console.log('✅ All test users created/updated!');
  console.log('='.repeat(60));
  console.log('\n📋 Test Credentials:\n');
  console.log('┌─────────────────────┬──────────────────────┬─────────────┐');
  console.log('│ Role                │ Email                │ Password    │');
  console.log('├─────────────────────┼──────────────────────┼─────────────┤');
  console.log('│ Citizen             │ citizen@test.com     │ Test1234    │');
  console.log('│ Dispatcher          │ dispatcher@test.com  │ Test1234    │');
  console.log('│ Responder           │ responder@test.com   │ Test1234    │');
  console.log('│ Agency Admin        │ agency@test.com      │ Test1234    │');
  console.log('│ System Admin        │ admin@test.com       │ Test1234    │');
  console.log('└─────────────────────┴──────────────────────┴─────────────┘');
  console.log('\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
