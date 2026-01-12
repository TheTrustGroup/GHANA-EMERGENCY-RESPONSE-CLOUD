import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { formatGhanaPhone } from '../src/server/db/utils';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  
  // Find or create a test agency
  let agency = await prisma.agency.findFirst({
    where: { name: { contains: 'NADMO' } }
  });
  
  if (!agency) {
    // Create a test agency if none exists
    agency = await prisma.agency.create({
      data: {
        name: 'NADMO Headquarters',
        type: 'NADMO',
        description: 'National Disaster Management Organization - Test Agency',
        contactEmail: 'test@nadmo.gov.gh',
        contactPhone: formatGhanaPhone('0302661234'),
        address: '37 Independence Avenue, Accra',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        latitude: 5.6037,
        longitude: -0.187,
        isActive: true,
      },
    });
    console.log('✅ Created test agency:', agency.name);
  }
  
  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email: 'agency@example.com' }
  });
  
  if (existing) {
    // Update password and ensure correct role/agency
    await prisma.user.update({
      where: { email: 'agency@example.com' },
      data: { 
        passwordHash,
        role: UserRole.AGENCY_ADMIN,
        agencyId: agency.id,
        isActive: true,
      }
    });
    console.log('✅ Updated agency@example.com');
  } else {
    // Create user
    await prisma.user.create({
      data: {
        email: 'agency@example.com',
        phone: formatGhanaPhone('0244000002'),
        name: 'Test Agency Admin',
        passwordHash,
        role: UserRole.AGENCY_ADMIN,
        agencyId: agency.id,
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
      }
    });
    console.log('✅ Created agency@example.com');
  }
  
  console.log('\n📋 Login Credentials:');
  console.log('   Email: agency@example.com');
  console.log('   Password: Admin@123');
  console.log(`   Agency: ${agency.name}`);
  console.log(`   Role: AGENCY_ADMIN`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
