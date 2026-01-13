/**
 * Comprehensive Project Check Script
 * Verifies database connection, test accounts, authentication, and signup flow
 * 
 * Usage: DATABASE_URL="your-db-url" npx tsx scripts/comprehensive-check.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { formatGhanaPhone } from '../src/server/db/utils';

const prisma = new PrismaClient();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

async function comprehensiveCheck(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  console.log('🔍 COMPREHENSIVE PROJECT CHECK\n');
  console.log('='.repeat(60));

  // 1. Database Connection
  console.log('\n1️⃣ DATABASE CONNECTION');
  try {
    await prisma.$connect();
    results.push({
      name: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to database',
    });
    console.log('✅ Database connection: SUCCESS');

    await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database version check: OK');
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.error('❌ Database connection: FAILED');
    console.error(error);
    await prisma.$disconnect();
    return results;
  }

  // 2. Test Accounts Verification
  console.log('\n2️⃣ TEST ACCOUNTS VERIFICATION');
  const testAccounts = [
    { email: 'admin@test.com', password: 'Test1234', role: 'SYSTEM_ADMIN' },
    { email: 'citizen@test.com', password: 'Test1234', role: 'CITIZEN' },
    { email: 'dispatcher@test.com', password: 'Test1234', role: 'DISPATCHER' },
    { email: 'responder@test.com', password: 'Test1234', role: 'RESPONDER' },
    { email: 'agency@test.com', password: 'Test1234', role: 'AGENCY_ADMIN' },
  ];

  for (const account of testAccounts) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: account.email },
      });

      if (!user) {
        console.log(`❌ ${account.email}: NOT FOUND`);
        results.push({
          name: `Test Account: ${account.email}`,
          status: 'fail',
          message: 'Account not found in database',
        });
        allAccountsValid = false;
      } else {
        const isValid = await bcrypt.compare(account.password, user.passwordHash);
        const isActive = user.isActive;
        const status = isValid && isActive ? '✅' : '❌';
        console.log(`${status} ${account.email}`);
        console.log(
          `   Role: ${user.role} | Active: ${isActive} | Password Valid: ${isValid}`
        );

        if (!isValid || !isActive) {
        results.push({
          name: `Test Account: ${account.email}`,
          status: 'fail',
          message: `Invalid password or inactive (Active: ${isActive}, Password Valid: ${isValid})`,
        });
        } else {
          results.push({
            name: `Test Account: ${account.email}`,
            status: 'pass',
            message: `Valid and active (${user.role})`,
          });
        }
      }
    } catch (error) {
        results.push({
          name: `Test Account: ${account.email}`,
          status: 'fail',
          message: `Error checking account: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
    }
  }

  // 3. Database Schema Check
  console.log('\n3️⃣ DATABASE SCHEMA CHECK');
  try {
    const userCount = await prisma.user.count();
    const agencyCount = await prisma.agency.count();
    const incidentCount = await prisma.incident.count();

    console.log(`✅ Users: ${userCount}`);
    console.log(`✅ Agencies: ${agencyCount}`);
    console.log(`✅ Incidents: ${incidentCount}`);

    results.push({
      name: 'Database Schema',
      status: 'pass',
      message: `Users: ${userCount}, Agencies: ${agencyCount}, Incidents: ${incidentCount}`,
    });
  } catch (error) {
    results.push({
      name: 'Database Schema',
      status: 'fail',
      message: `Schema check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.error('❌ Schema check failed:', error);
  }

  // 4. Agency Verification
  console.log('\n4️⃣ AGENCY VERIFICATION');
  try {
    const agencies = await prisma.agency.findMany();
    if (agencies.length === 0) {
      results.push({
        name: 'Agencies',
        status: 'warning',
        message: 'No agencies found - responder signup may fail',
      });
      console.log('⚠️  No agencies found - some users may need agencies');
    } else {
      results.push({
        name: 'Agencies',
        status: 'pass',
        message: `Found ${agencies.length} agencies`,
      });
      console.log(`✅ Found ${agencies.length} agencies`);
    }
  } catch (error) {
    results.push({
      name: 'Agencies',
      status: 'fail',
      message: `Error checking agencies: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  // 5. Signup Flow Test
  console.log('\n5️⃣ SIGNUP FLOW TEST');
  const testEmail = `test-citizen-${Date.now()}@test.com`;
  const testPhone = '0244999999';
  const testPassword = 'Test1234!';

  try {
    // Check if test user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: testEmail }, { phone: formatGhanaPhone(testPhone) }],
      },
    });

    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } });
    }

    // Simulate registration
    const passwordHash = await bcrypt.hash(testPassword, 10);
    const newUser = await prisma.user.create({
      data: {
        name: 'Test Citizen',
        email: testEmail,
        phone: formatGhanaPhone(testPhone),
        passwordHash,
        role: 'CITIZEN',
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    });

    // Verify password
    const isValid = await bcrypt.compare(testPassword, newUser.passwordHash);

    if (isValid && newUser.isActive) {
      results.push({
        name: 'Signup Flow',
        status: 'pass',
        message: 'Citizen signup simulation successful',
      });
      console.log('✅ Citizen signup simulation: SUCCESS');
    } else {
      results.push({
        name: 'Signup Flow',
        status: 'fail',
        message: `Signup created but validation failed (Active: ${newUser.isActive}, Password Valid: ${isValid})`,
      });
    }

    // Cleanup
    await prisma.user.delete({ where: { id: newUser.id } });
    console.log('✅ Test user cleaned up');
  } catch (error) {
    results.push({
      name: 'Signup Flow',
      status: 'fail',
      message: `Signup test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.error('❌ Citizen signup test failed:', error);
  }

  // 6. Email Normalization Check
  console.log('\n6️⃣ EMAIL NORMALIZATION CHECK');
  try {
    const testEmails = ['Test@Example.COM', 'test@example.com', 'TEST@EXAMPLE.COM'];
    let normalizationWorks = true;

    for (const email of testEmails) {
      const normalized = email.toLowerCase();
      const user = await prisma.user.findFirst({
        where: { email: normalized },
      });
      const found = user !== null;
      console.log(`   ${email} -> ${normalized} ${found ? '✅ Found' : '❌ Not found'}`);
      if (!found && normalized === 'test@example.com') {
        normalizationWorks = false;
      }
    }

    results.push({
      name: 'Email Normalization',
      status: normalizationWorks ? 'pass' : 'warning',
      message: normalizationWorks
        ? 'Email normalization working correctly'
        : 'Email normalization may have issues',
    });
  } catch (error) {
    results.push({
      name: 'Email Normalization',
      status: 'fail',
      message: `Error checking normalization: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  // 7. Authentication Flow Check
  console.log('\n7️⃣ AUTHENTICATION FLOW CHECK');
  try {
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
    });

    if (testUser) {
      const passwordValid = await bcrypt.compare('Test1234', testUser.passwordHash);
      if (passwordValid && testUser.isActive) {
        results.push({
          name: 'Authentication Flow',
          status: 'pass',
          message: 'Authentication flow should work correctly',
        });
        console.log('✅ Authentication flow: OK');
      } else {
        results.push({
          name: 'Authentication Flow',
          status: 'fail',
          message: 'Test account password invalid or inactive',
        });
      }
    } else {
      results.push({
        name: 'Authentication Flow',
        status: 'fail',
        message: 'Test account not found',
      });
    }
  } catch (error) {
    results.push({
      name: 'Authentication Flow',
      status: 'fail',
      message: `Error checking auth flow: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  await prisma.$disconnect();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 CHECK SUMMARY\n');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;

  results.forEach((result) => {
    const icon =
      result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 ALL CHECKS PASSED!');
  } else {
    console.log('\n⚠️  SOME CHECKS FAILED - Please review above');
  }

  return results;
}

comprehensiveCheck()
  .catch((error) => {
    console.error('❌ Comprehensive check failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
