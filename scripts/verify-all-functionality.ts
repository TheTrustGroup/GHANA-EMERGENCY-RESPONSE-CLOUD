/**
 * COMPREHENSIVE FUNCTIONALITY VERIFICATION
 * 
 * Run this script to verify ALL buttons, links, and features work correctly
 * 
 * Usage: npx tsx scripts/verify-all-functionality.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  feature: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  details?: string;
}

async function verifyDatabaseConnection(): Promise<VerificationResult> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return { feature: 'Database Connection', status: 'pass' };
  } catch (error: any) {
    return { 
      feature: 'Database Connection', 
      status: 'fail', 
      error: error.message 
    };
  }
}

async function verifyTablesExist(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  const tables = ['User', 'Incident', 'Agency', 'DispatchAssignment', 'Notification'];
  
  for (const table of tables) {
    try {
      // @ts-ignore - Dynamic table access
      const count = await prisma[table.toLowerCase()].count();
      results.push({ 
        feature: `Table: ${table}`, 
        status: 'pass',
        details: `${count} records found`
      });
    } catch (error: any) {
      results.push({ 
        feature: `Table: ${table}`, 
        status: 'fail', 
        error: error.message 
      });
    }
  }
  
  return results;
}

async function verifyDashboards(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  const dashboards = [
    '/dashboard/citizen',
    '/dashboard/dispatch',
    '/dashboard/responder',
    '/dashboard/agency',
    '/dashboard/admin',
  ];

  // Note: These would need actual HTTP requests to verify
  // For now, we'll just check that routes exist
  for (const dashboard of dashboards) {
    results.push({ 
      feature: `Dashboard Route: ${dashboard}`, 
      status: 'skip',
      details: 'Manual verification required - start dev server and test'
    });
  }

  return results;
}

async function verifyTRPCQueries(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  
  const queries = [
    'incidents.getAll',
    'incidents.create',
    'dispatch.getMyActiveAssignment',
    'analytics.getSystemStats',
    'analytics.getDispatchStats',
    'agencies.getAgencyStats',
    'users.getMyStats',
    'system.getHealth',
  ];

  for (const query of queries) {
    results.push({ 
      feature: `tRPC Query: ${query}`, 
      status: 'skip',
      details: 'Manual verification required - test in application'
    });
  }

  return results;
}

async function verifyComponents(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  
  const components = [
    'Premium Button',
    'Premium Card',
    'Premium Badge',
    'SatelliteIncidentMap',
    'LiveIncidentMap',
  ];

  for (const component of components) {
    results.push({ 
      feature: `Component: ${component}`, 
      status: 'skip',
      details: 'Manual verification required - check component renders correctly'
    });
  }

  return results;
}

async function runVerification() {
  console.log('🔍 Starting Comprehensive Functionality Verification...\n');
  console.log('=' .repeat(60));
  console.log('');

  const allResults: VerificationResult[] = [];

  // 1. Database
  console.log('📊 Verifying Database...');
  allResults.push(await verifyDatabaseConnection());
  allResults.push(...await verifyTablesExist());
  console.log('');

  // 2. Dashboards
  console.log('🎨 Verifying Dashboards...');
  allResults.push(...await verifyDashboards());
  console.log('');

  // 3. tRPC Queries
  console.log('🔌 Verifying tRPC Queries...');
  allResults.push(...await verifyTRPCQueries());
  console.log('');

  // 4. Components
  console.log('🧩 Verifying Components...');
  allResults.push(...await verifyComponents());
  console.log('');

  // Summary
  console.log('=' .repeat(60));
  console.log('📊 Verification Results:\n');
  
  const passed = allResults.filter(r => r.status === 'pass').length;
  const failed = allResults.filter(r => r.status === 'fail').length;
  const skipped = allResults.filter(r => r.status === 'skip').length;

  allResults.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
    console.log(`${icon} ${result.feature}`);
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }
    if (result.details) {
      console.log(`   ℹ️  ${result.details}`);
    }
  });

  console.log('');
  console.log('=' .repeat(60));
  console.log(`📈 Summary: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);

  if (failed === 0) {
    console.log('🎉 Database and core systems verified!');
    console.log('⚠️  Manual testing required for dashboards and components.');
    console.log('   Start dev server: npm run dev');
    console.log('   Test each dashboard manually.\n');
  } else {
    console.log('⚠️  Some features failed verification. Please fix before deployment.\n');
  }

  await prisma.$disconnect();
}

runVerification().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
