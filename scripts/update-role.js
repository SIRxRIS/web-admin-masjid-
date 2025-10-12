// Script untuk update role user
// Jalankan dengan: node scripts/update-role.js <email> <role> [jabatan]

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole(email, role, jabatan = null) {
  try {
    // Check if user exists
    const existingUser = await prisma.emailWhitelist.findUnique({
      where: { email: email }
    });
    
    if (!existingUser) {
      console.log('❌ User not found:', email);
      return false;
    }
    
    console.log('📋 Current user data:');
    console.log(JSON.stringify(existingUser, null, 2));
    
    // Update data
    const updateData = { role: role };
    if (jabatan) {
      updateData.jabatan = jabatan;
    }
    
    const updated = await prisma.emailWhitelist.update({
      where: { email: email },
      data: updateData
    });
    
    console.log('\n✅ User role updated successfully:');
    console.log(JSON.stringify(updated, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    return false;
  }
}

async function main() {
  const email = process.argv[2];
  const role = process.argv[3];
  const jabatan = process.argv[4];
  
  if (!email || !role) {
    console.log('Usage: node scripts/update-role.js <email> <role> [jabatan]');
    console.log('Roles: ADMIN, KETUA, WAKIL_KETUA, SEKRETARIS, BENDAHARA');
    console.log('Example: node scripts/update-role.js faris.id.go@gmail.com BENDAHARA BENDAHARA');
    process.exit(1);
  }
  
  const validRoles = ['ADMIN', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'BENDAHARA'];
  if (!validRoles.includes(role)) {
    console.log('❌ Invalid role. Valid roles:', validRoles.join(', '));
    process.exit(1);
  }
  
  console.log(`🔄 Updating role for ${email} to ${role}${jabatan ? ` with jabatan ${jabatan}` : ''}...\n`);
  
  const success = await updateUserRole(email, role, jabatan);
  
  if (!success) {
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());