/**
 * Create System Admin
 * Creates the first system administrator for the Ghana Emergency Response Platform
 * 
 * Usage:
 *   npx tsx scripts/create-system-admin.ts
 *   OR with custom values:
 *   EMAIL=your@email.com NAME="Your Name" PASSWORD=YourPassword npx tsx scripts/create-system-admin.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { formatGhanaPhone } from '../src/server/db/utils';
import { randomBytes } from 'crypto';
import * as readline from 'readline';

const prisma = new PrismaClient();

function generateId(prefix: string): string {
  return `${prefix}-${randomBytes(8).toString('hex')}`;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n👑 Create System Administrator\n');
  console.log('=' .repeat(60));

  // Check if system admin already exists
  const existingAdmin = await prisma.users.findFirst({
    where: { role: UserRole.SYSTEM_ADMIN },
  });

  if (existingAdmin) {
    console.log('\n⚠️  A system administrator already exists:');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Name: ${existingAdmin.name}`);
    console.log(`   Created: ${existingAdmin.createdAt}`);
    
    const overwrite = await question('\nDo you want to create another admin? (y/n): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('\n✅ Exiting. No changes made.');
      return;
    }
  }

  // Get user input
  const email = process.env.EMAIL || await question('\n📧 Email address: ');
  const name = process.env.NAME || await question('👤 Full name: ');
  const phone = process.env.PHONE || await question('📱 Phone number (Ghana format, e.g., 0244000001): ');
  const password = process.env.PASSWORD || await question('🔐 Password (min 8 chars, must include uppercase, lowercase, number): ');

  // Validate email
  if (!email || !email.includes('@')) {
    console.error('\n❌ Error: Valid email address is required');
    process.exit(1);
  }

  // Validate password
  if (!password || password.length < 8) {
    console.error('\n❌ Error: Password must be at least 8 characters');
    process.exit(1);
  }

  if (!/[A-Z]/.test(password)) {
    console.error('\n❌ Error: Password must contain at least one uppercase letter');
    process.exit(1);
  }

  if (!/[a-z]/.test(password)) {
    console.error('\n❌ Error: Password must contain at least one lowercase letter');
    process.exit(1);
  }

  if (!/[0-9]/.test(password)) {
    console.error('\n❌ Error: Password must contain at least one number');
    process.exit(1);
  }

  // Check if email already exists
  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    const update = await question(`\n⚠️  User with email ${email} already exists. Update to SYSTEM_ADMIN? (y/n): `);
    if (update.toLowerCase() === 'y' || update.toLowerCase() === 'yes') {
      const passwordHash = await hashPassword(password);
      await prisma.users.update({
        where: { email },
        data: {
          name,
          phone: formatGhanaPhone(phone),
          passwordHash,
          role: UserRole.SYSTEM_ADMIN,
          isActive: true,
          emailVerified: new Date(),
          phoneVerified: new Date(),
        },
      });
      console.log('\n✅ Updated user to System Administrator!');
      console.log(`\n📋 Login Credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Dashboard: https://ghana-emergency-response.vercel.app/dashboard/admin`);
      return;
    } else {
      console.log('\n❌ Exiting. No changes made.');
      return;
    }
  }

  // Create new admin
  console.log('\n⏳ Creating system administrator...');
  
  const passwordHash = await hashPassword(password);
  const userId = generateId('user');
  
  const admin = await prisma.users.create({
    data: {
      id: userId,
      email,
      name,
      phone: formatGhanaPhone(phone),
      passwordHash,
      role: UserRole.SYSTEM_ADMIN,
      isActive: true,
      emailVerified: new Date(),
      phoneVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('\n✅ System Administrator created successfully!');
  console.log('\n' + '='.repeat(60));
  console.log('📋 Login Credentials:');
  console.log('='.repeat(60));
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Phone:    ${admin.phone}`);
  console.log(`   Name:     ${admin.name}`);
  console.log(`   Role:     ${admin.role}`);
  console.log(`   Status:   ${admin.isActive ? 'Active' : 'Inactive'}`);
  console.log('\n🌐 Dashboard URLs:');
  console.log(`   Production: https://ghana-emergency-response.vercel.app/dashboard/admin`);
  console.log(`   Local:      http://localhost:3000/dashboard/admin`);
  console.log('\n🔐 Security Note:');
  console.log('   Please save these credentials securely and change the password after first login.');
  console.log('='.repeat(60));
  console.log('\n');
}

main()
  .catch((error) => {
    console.error('\n❌ Error creating system admin:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
