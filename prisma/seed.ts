/**
 * Prisma Seed Script
 * Seeds the database with initial data for Ghana Emergency Response Platform
 */

import { PrismaClient, UserRole, AgencyType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { formatGhanaPhone } from '../src/server/db/utils';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

/**
 * Ghana city coordinates
 */
const GHANA_LOCATIONS = {
  accra: { lat: 5.6037, lon: -0.187, region: 'Greater Accra', district: 'Accra Metropolitan' },
  tema: { lat: 5.6833, lon: -0.0167, region: 'Greater Accra', district: 'Tema Metropolitan' },
  kumasi: { lat: 6.6885, lon: -1.6244, region: 'Ashanti', district: 'Kumasi Metropolitan' },
  takoradi: { lat: 4.8845, lon: -1.7554, region: 'Western', district: 'Sekondi-Takoradi Metropolitan' },
  tamale: { lat: 9.4008, lon: -0.8393, region: 'Northern', district: 'Tamale Metropolitan' },
};

/**
 * Hash password helper
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.notifications.deleteMany();
  await prisma.audit_logs.deleteMany();
  await prisma.incident_updates.deleteMany();
  await prisma.messages.deleteMany();
  await prisma.dispatch_assignments.deleteMany();
  await prisma.incidents.deleteMany();
  await prisma.users.deleteMany();
  await prisma.agencies.deleteMany();

  // Create Agencies
  console.log('🏢 Creating agencies...');
  const now = new Date();
  const agencies = await Promise.all([
    prisma.agencies.create({
      data: {
        id: `agency-${randomBytes(8).toString('hex')}`,
        name: 'NADMO Headquarters',
        type: AgencyType.NADMO,
        description: 'National Disaster Management Organization - Headquarters',
        contactEmail: 'hq@nadmo.gov.gh',
        contactPhone: formatGhanaPhone('0302661234'),
        address: '37 Independence Avenue, Accra',
        region: GHANA_LOCATIONS.accra.region,
        district: GHANA_LOCATIONS.accra.district,
        latitude: GHANA_LOCATIONS.accra.lat,
        longitude: GHANA_LOCATIONS.accra.lon,
        updatedAt: now,
        isActive: true,
      },
    }),
    prisma.agencies.create({
      data: {
        id: `agency-${randomBytes(8).toString('hex')}`,
        name: 'Ghana National Fire Service - Tema',
        type: AgencyType.FIRE_SERVICE,
        description: 'Fire Service Station in Tema',
        contactEmail: 'tema@gnfs.gov.gh',
        contactPhone: formatGhanaPhone('0303201234'),
        address: 'Community 1, Tema',
        region: GHANA_LOCATIONS.tema.region,
        district: GHANA_LOCATIONS.tema.district,
        latitude: GHANA_LOCATIONS.tema.lat,
        longitude: GHANA_LOCATIONS.tema.lon,
        updatedAt: now,
        isActive: true,
      },
    }),
    prisma.agencies.create({
      data: {
        id: `agency-${randomBytes(8).toString('hex')}`,
        name: 'Ghana Police Service - Kumasi',
        type: AgencyType.POLICE,
        description: 'Police Regional Command - Ashanti Region',
        contactEmail: 'kumasi@police.gov.gh',
        contactPhone: formatGhanaPhone('0322021234'),
        address: 'Adum, Kumasi',
        region: GHANA_LOCATIONS.kumasi.region,
        district: GHANA_LOCATIONS.kumasi.district,
        latitude: GHANA_LOCATIONS.kumasi.lat,
        longitude: GHANA_LOCATIONS.kumasi.lon,
        updatedAt: now,
        isActive: true,
      },
    }),
    prisma.agencies.create({
      data: {
        id: `agency-${randomBytes(8).toString('hex')}`,
        name: 'National Ambulance Service - Takoradi',
        type: AgencyType.AMBULANCE,
        description: 'Ambulance Service Station - Western Region',
        contactEmail: 'takoradi@ambulance.gov.gh',
        contactPhone: formatGhanaPhone('0312021234'),
        address: 'Airport Road, Takoradi',
        region: GHANA_LOCATIONS.takoradi.region,
        district: GHANA_LOCATIONS.takoradi.district,
        latitude: GHANA_LOCATIONS.takoradi.lat,
        longitude: GHANA_LOCATIONS.takoradi.lon,
        updatedAt: now,
        isActive: true,
      },
    }),
    prisma.agencies.create({
      data: {
        id: `agency-${randomBytes(8).toString('hex')}`,
        name: 'SecureGuard Emergency Services',
        type: AgencyType.PRIVATE_RESPONDER,
        description: 'Private emergency response service in Accra',
        contactEmail: 'info@secureguard.gh',
        contactPhone: formatGhanaPhone('0244123456'),
        address: 'East Legon, Accra',
        region: GHANA_LOCATIONS.accra.region,
        district: GHANA_LOCATIONS.accra.district,
        latitude: GHANA_LOCATIONS.accra.lat + 0.05,
        longitude: GHANA_LOCATIONS.accra.lon + 0.02,
        updatedAt: now,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${agencies.length} agencies`);

  // Create SYSTEM_ADMIN user
  console.log('👤 Creating system admin...');
  await prisma.users.create({
    data: {
      email: 'admin@emergency.gov.gh',
      phone: formatGhanaPhone('0244000001'),
      name: 'System Administrator',
      passwordHash: await hashPassword('Admin@123'),
      role: UserRole.SYSTEM_ADMIN,
      isActive: true,
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });
  console.log('✅ Created system admin');

  // Create AGENCY_ADMIN users
  console.log('👥 Creating agency admins...');
  const agencyAdmins = await Promise.all([
    prisma.users.create({
      data: {
        email: 'nadmo.admin@emergency.gov.gh',
        phone: formatGhanaPhone('0244000002'),
        name: 'NADMO Administrator',
        passwordHash: await hashPassword('Admin@123'),
        role: UserRole.AGENCY_ADMIN,
        agencyId: agencies[0]!.id,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'fire.admin@emergency.gov.gh',
        phone: formatGhanaPhone('0244000003'),
        name: 'Fire Service Administrator',
        passwordHash: await hashPassword('Admin@123'),
        role: UserRole.AGENCY_ADMIN,
        agencyId: agencies[1]!.id,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'police.admin@emergency.gov.gh',
        phone: formatGhanaPhone('0244000004'),
        name: 'Police Administrator',
        passwordHash: await hashPassword('Admin@123'),
        role: UserRole.AGENCY_ADMIN,
        agencyId: agencies[2]!.id,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    }),
  ]);
  console.log(`✅ Created ${agencyAdmins.length} agency admins`);

  // Create DISPATCHER users
  console.log('📞 Creating dispatchers...');
  const dispatchers = await Promise.all([
    prisma.users.create({
      data: {
        email: 'dispatcher1@emergency.gov.gh',
        phone: formatGhanaPhone('0244000010'),
        name: 'John Dispatcher',
        passwordHash: await hashPassword('Dispatcher@123'),
        role: UserRole.DISPATCHER,
        agencyId: agencies[0]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'dispatcher2@emergency.gov.gh',
        phone: formatGhanaPhone('0244000011'),
        name: 'Mary Dispatcher',
        passwordHash: await hashPassword('Dispatcher@123'),
        role: UserRole.DISPATCHER,
        agencyId: agencies[1]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
  ]);
  console.log(`✅ Created ${dispatchers.length} dispatchers`);

  // Create RESPONDER users
  console.log('🚨 Creating responders...');
  const responders = await Promise.all([
    // NADMO Responders
    prisma.users.create({
      data: {
        email: 'responder1@nadmo.gov.gh',
        phone: formatGhanaPhone('0244000101'),
        name: 'Kwame Asante',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[0]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'responder2@nadmo.gov.gh',
        phone: formatGhanaPhone('0244000102'),
        name: 'Ama Mensah',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[0]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    // Fire Service Responders
    prisma.users.create({
      data: {
        email: 'responder3@fire.gov.gh',
        phone: formatGhanaPhone('0244000201'),
        name: 'Kofi Firefighter',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[1]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'responder4@fire.gov.gh',
        phone: formatGhanaPhone('0244000202'),
        name: 'Akosua Firefighter',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[1]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    // Police Responders
    prisma.users.create({
      data: {
        email: 'responder5@police.gov.gh',
        phone: formatGhanaPhone('0244000301'),
        name: 'Yaw Policeman',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[2]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'responder6@police.gov.gh',
        phone: formatGhanaPhone('0244000302'),
        name: 'Efua Policewoman',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[2]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    // Ambulance Responders
    prisma.users.create({
      data: {
        email: 'responder7@ambulance.gov.gh',
        phone: formatGhanaPhone('0244000401'),
        name: 'Kojo Paramedic',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[3]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'responder8@ambulance.gov.gh',
        phone: formatGhanaPhone('0244000402'),
        name: 'Adwoa Paramedic',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[3]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    // Private Responders
    prisma.users.create({
      data: {
        email: 'responder9@secureguard.gh',
        phone: formatGhanaPhone('0244000501'),
        name: 'Nana Security',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[4]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'responder10@secureguard.gh',
        phone: formatGhanaPhone('0244000502'),
        name: 'Maame Security',
        passwordHash: await hashPassword('Responder@123'),
        role: UserRole.RESPONDER,
        agencyId: agencies[4]!.id,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
  ]);
  console.log(`✅ Created ${responders.length} responders`);

  // Create CITIZEN users
  console.log('👥 Creating citizens...');
  const citizens = await Promise.all([
    prisma.users.create({
      data: {
        email: 'citizen1@example.com',
        phone: formatGhanaPhone('0245000001'),
        name: 'Kwabena Osei',
        passwordHash: await hashPassword('Citizen@123'),
        role: UserRole.CITIZEN,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'citizen2@example.com',
        phone: formatGhanaPhone('0245000002'),
        name: 'Ama Darko',
        passwordHash: await hashPassword('Citizen@123'),
        role: UserRole.CITIZEN,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'citizen3@example.com',
        phone: formatGhanaPhone('0245000003'),
        name: 'Kofi Appiah',
        passwordHash: await hashPassword('Citizen@123'),
        role: UserRole.CITIZEN,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'citizen4@example.com',
        phone: formatGhanaPhone('0245000004'),
        name: 'Efua Boateng',
        passwordHash: await hashPassword('Citizen@123'),
        role: UserRole.CITIZEN,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        email: 'citizen5@example.com',
        phone: formatGhanaPhone('0245000005'),
        name: 'Yaw Mensah',
        passwordHash: await hashPassword('Citizen@123'),
        role: UserRole.CITIZEN,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      },
    }),
  ]);
  console.log(`✅ Created ${citizens.length} citizens`);

  // Create simple test accounts (all use Test1234)
  console.log('🔐 Creating simple test accounts...');
  const testAccounts = [
    {
      email: 'admin@test.com',
      phone: formatGhanaPhone('0244555555'),
      name: 'Test System Admin',
      role: UserRole.SYSTEM_ADMIN,
      agencyId: null,
    },
    {
      email: 'citizen@test.com',
      phone: formatGhanaPhone('0244111111'),
      name: 'Test Citizen',
      role: UserRole.CITIZEN,
      agencyId: null,
    },
    {
      email: 'dispatcher@test.com',
      phone: formatGhanaPhone('0244222222'),
      name: 'Test Dispatcher',
      role: UserRole.DISPATCHER,
      agencyId: agencies[0]?.id || null,
    },
    {
      email: 'responder@test.com',
      phone: formatGhanaPhone('0244333333'),
      name: 'Test Responder',
      role: UserRole.RESPONDER,
      agencyId: agencies[0]?.id || null,
    },
    {
      email: 'agency@test.com',
      phone: formatGhanaPhone('0244444444'),
      name: 'Test Agency Admin',
      role: UserRole.AGENCY_ADMIN,
      agencyId: agencies[0]?.id || null,
    },
  ];

  for (const account of testAccounts) {
    const existing = await prisma.users.findUnique({
      where: { email: account.email },
    });

    if (existing) {
      await prisma.users.update({
        where: { email: account.email },
        data: {
          passwordHash: await hashPassword('Test1234'),
          isActive: true,
          emailVerified: new Date(),
          phoneVerified: new Date(),
          role: account.role,
          agencyId: account.agencyId,
        },
      });
    } else {
      await prisma.users.create({
        data: {
          ...account,
          passwordHash: await hashPassword('Test1234'),
          isActive: true,
          emailVerified: new Date(),
          phoneVerified: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created/updated ${testAccounts.length} simple test accounts`);

  console.log('\n✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Agencies: ${agencies.length}`);
  console.log(`   - System Admin: 1`);
  console.log(`   - Agency Admins: ${agencyAdmins.length}`);
  console.log(`   - Dispatchers: ${dispatchers.length}`);
  console.log(`   - Responders: ${responders.length}`);
  console.log(`   - Citizens: ${citizens.length}`);
  console.log(`   - Simple Test Accounts: ${testAccounts.length}`);
  console.log(`   - Total Users: ${1 + agencyAdmins.length + dispatchers.length + responders.length + citizens.length + testAccounts.length}`);
  console.log('\n🔑 Default Passwords:');
  console.log('   - Admin: Admin@123');
  console.log('   - Dispatcher: Dispatcher@123');
  console.log('   - Responder: Responder@123');
  console.log('   - Citizen: Citizen@123');
  console.log('   - Simple Test Accounts: Test1234 (admin@test.com, citizen@test.com, etc.)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

