import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  
  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });
  
  if (existing) {
    // Update password
    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { passwordHash }
    });
    console.log('✅ Updated admin@example.com password');
  } else {
    // Create user
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        phone: '+233244000000',
        name: 'Test Admin',
        passwordHash,
        role: 'SYSTEM_ADMIN',
        isActive: true,
        emailVerified: new Date(),
      }
    });
    console.log('✅ Created admin@example.com');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
