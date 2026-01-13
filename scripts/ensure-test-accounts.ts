/**
 * Ensure Test Accounts Script
 * Creates or updates test accounts with correct passwords
 * Run: DATABASE_URL="your-db-url" npx tsx scripts/ensure-test-accounts.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { formatGhanaPhone } from '../src/server/db/utils';

const prisma = new PrismaClient();
const TEST_PASSWORD = 'Test1234';

async function ensureTestAccounts() {
  console.log('🔧 Ensuring all test accounts exist with correct passwords...\n');

  const testAccounts = [
    {
      email: 'admin@test.com',
      phone: '0244555555',
      name: 'Test System Admin',
      role: UserRole.SYSTEM_ADMIN,
      needsAgency: false,
    },
    {
      email: 'citizen@test.com',
      phone: '0244111111',
      name: 'Test Citizen',
      role: UserRole.CITIZEN,
      needsAgency: false,
    },
    {
      email: 'dispatcher@test.com',
      phone: '0244222222',
      name: 'Test Dispatcher',
      role: UserRole.DISPATCHER,
      needsAgency: false,
    },
    {
      email: 'responder@test.com',
      phone: '0244333333',
      name: 'Test Responder',
      role: UserRole.RESPONDER,
      needsAgency: true,
    },
    {
      email: 'agency@test.com',
      phone: '0244444444',
      name: 'Test Agency Admin',
      role: UserRole.AGENCY_ADMIN,
      needsAgency: true,
    },
  ];

  // Get first agency for responders/agency admins
  const firstAgency = await prisma.agency.findFirst();

  if (!firstAgency && testAccounts.some((a) => a.needsAgency)) {
    console.error('❌ No agencies found. Please run: npm run db:seed');
    process.exit(1);
  }

  for (const account of testAccounts) {
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    const formattedPhone = formatGhanaPhone(account.phone);

    const existing = await prisma.user.findUnique({
      where: { email: account.email },
    });

    if (existing) {
      // Update password and ensure active
      await prisma.user.update({
        where: { email: account.email },
        data: {
          passwordHash,
          isActive: true,
          emailVerified: new Date(),
          phoneVerified: new Date(),
          role: account.role, // Ensure role is correct
          agencyId:
            account.needsAgency && firstAgency ? firstAgency.id : existing.agencyId,
        },
      });
      console.log(`✅ Updated: ${account.email}`);
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email: account.email,
          phone: formattedPhone,
          name: account.name,
          passwordHash,
          role: account.role,
          agencyId: account.needsAgency && firstAgency ? firstAgency.id : null,
          isActive: true,
          emailVerified: new Date(),
          phoneVerified: new Date(),
        },
      });
      console.log(`✅ Created: ${account.email}`);
    }
  }

  console.log('\n✅ All test accounts verified!');
  console.log(`\n📋 Test Credentials (all use password: ${TEST_PASSWORD}):`);
  testAccounts.forEach((acc) => {
    console.log(`   ${acc.email} - ${acc.role}`);
  });
}

ensureTestAccounts()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
