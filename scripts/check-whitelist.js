// Script untuk melihat data whitelist
// Jalankan dengan: node scripts/check-whitelist.js [email]

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWhitelist(email = null) {
  try {
    if (email) {
      // Check specific email
      const user = await prisma.emailWhitelist.findUnique({
        where: { email: email }
      });
      
      if (user) {
        console.log('✅ User found in whitelist:');
        console.log(JSON.stringify(user, null, 2));
      } else {
        console.log('❌ User not found in whitelist:', email);
      }
    } else {
      // Show all users
      const users = await prisma.emailWhitelist.findMany({
        orderBy: { email: 'asc' }
      });
      
      console.log('📋 All users in whitelist:');
      users.forEach(user => {
        console.log(`${user.email} - ${user.role} - ${user.jabatan} - Active: ${user.isActive}`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking whitelist:', error.message);
  }
}

async function main() {
  const email = process.argv[2];
  
  console.log('🔍 Checking email whitelist...\n');
  
  await checkWhitelist(email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());