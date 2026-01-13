import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

async function runPreDeploymentChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  console.log('🚀 Running Pre-Deployment Checks...\n');
  console.log('='.repeat(60));

  // CHECK 1: Environment Variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const optionalEnvVars = [
    'NEXT_PUBLIC_PUSHER_KEY',
    'PUSHER_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    const exists = !!process.env[envVar];
    results.push({
      name: `Environment Variable: ${envVar}`,
      passed: exists,
      message: exists ? 'Set' : 'Missing',
      critical: true,
    });
  }

  for (const envVar of optionalEnvVars) {
    const exists = !!process.env[envVar];
    results.push({
      name: `Environment Variable: ${envVar} (optional)`,
      passed: exists,
      message: exists ? 'Set' : 'Not set (optional)',
      critical: false,
    });
  }

  // CHECK 2: Database Connection
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    results.push({
      name: 'Database Connection',
      passed: true,
      message: 'Connected successfully',
      critical: true,
    });
  } catch (error: any) {
    results.push({
      name: 'Database Connection',
      passed: false,
      message: `Failed: ${error.message}`,
      critical: true,
    });
  }

  // CHECK 3: Database Schema
  try {
    const userCount = await prisma.users.count();
    results.push({
      name: 'Database Schema',
      passed: true,
      message: `Valid (${userCount} users)`,
      critical: true,
    });
  } catch (error: any) {
    results.push({
      name: 'Database Schema',
      passed: false,
      message: 'Schema not up to date',
      critical: true,
    });
  }

  // CHECK 4: Required Files
  const requiredFiles = [
    'prisma/schema.prisma',
    'next.config.js',
    'package.json',
    'src/app/api/auth/[...nextauth]/route.ts',
  ];

  for (const file of requiredFiles) {
    const exists = fs.existsSync(file);
    results.push({
      name: `Required File: ${file}`,
      passed: exists,
      message: exists ? 'Exists' : 'Missing',
      critical: true,
    });
  }

  // CHECK 5: Build Test
  console.log('\n📦 Running build test...');
  try {
    execSync('npm run build', { stdio: 'ignore', timeout: 300000 });
    results.push({
      name: 'Production Build',
      passed: true,
      message: 'Build successful',
      critical: true,
    });
  } catch (error) {
    results.push({
      name: 'Production Build',
      passed: false,
      message: 'Build failed',
      critical: true,
    });
  }

  // CHECK 6: TypeScript Errors
  try {
    execSync('npx tsc --noEmit', { stdio: 'ignore', timeout: 60000 });
    results.push({
      name: 'TypeScript Check',
      passed: true,
      message: 'No type errors',
      critical: false,
    });
  } catch (error) {
    results.push({
      name: 'TypeScript Check',
      passed: false,
      message: 'Type errors found',
      critical: false,
    });
  }

  // CHECK 7: ESLint
  try {
    execSync('npm run lint', { stdio: 'ignore', timeout: 60000 });
    results.push({
      name: 'ESLint Check',
      passed: true,
      message: 'No linting errors',
      critical: false,
    });
  } catch (error) {
    results.push({
      name: 'ESLint Check',
      passed: false,
      message: 'Linting errors found',
      critical: false,
    });
  }

  await prisma.$disconnect();

  return results;
}

async function generateReport() {
  const results = await runPreDeploymentChecks();

  console.log('\n');
  console.log('='.repeat(60));
  console.log('📊 DEPLOYMENT READINESS REPORT');
  console.log('='.repeat(60));
  console.log('');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const criticalFailed = results.filter(r => !r.passed && r.critical).length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : result.critical ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  console.log('');
  console.log('='.repeat(60));
  console.log(`📈 Summary: ${passed} passed, ${failed} failed`);
  
  if (criticalFailed > 0) {
    console.log(`\n❌ DEPLOYMENT BLOCKED: ${criticalFailed} critical issues must be fixed`);
    process.exit(1);
  } else if (failed > 0) {
    console.log(`\n⚠️  WARNING: ${failed} non-critical issues found`);
    console.log('✅ Safe to deploy, but fix warnings when possible');
  } else {
    console.log('\n✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT! 🚀');
  }
  
  console.log('='.repeat(60));
  console.log('');
}

generateReport().catch(console.error);
