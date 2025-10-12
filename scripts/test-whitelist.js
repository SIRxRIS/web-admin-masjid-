// Script untuk testing whitelist - menghapus dan menambahkan kembali email
// Jalankan dengan: node scripts/test-whitelist.js <action> <email>
// Actions: remove, add, deactivate, activate

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeFromWhitelist(email) {
  try {
    const deleted = await prisma.emailWhitelist.delete({
      where: { email: email }
    });
    console.log('✅ Email removed from whitelist:', deleted);
    return true;
  } catch (error) {
    console.error('❌ Error removing email:', error.message);
    return false;
  }
}

async function addToWhitelist(email, role = 'ADMIN', jabatan = 'DEVELOPER', nama = null) {
  try {
    const defaultNama = nama || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const created = await prisma.emailWhitelist.create({
      data: {
        nama: defaultNama,
        email: email,
        role: role,
        jabatan: jabatan,
        isActive: true
      }
    });
    
    console.log('✅ Email added to whitelist:', created);
    return true;
  } catch (error) {
    console.error('❌ Error adding email:', error.message);
    return false;
  }
}

async function deactivateEmail(email) {
  try {
    const updated = await prisma.emailWhitelist.update({
      where: { email: email },
      data: { isActive: false }
    });
    console.log('✅ Email deactivated:', updated);
    return true;
  } catch (error) {
    console.error('❌ Error deactivating email:', error.message);
    return false;
  }
}

async function activateEmail(email) {
  try {
    const updated = await prisma.emailWhitelist.update({
      where: { email: email },
      data: { isActive: true }
    });
    console.log('✅ Email activated:', updated);
    return true;
  } catch (error) {
    console.error('❌ Error activating email:', error.message);
    return false;
  }
}

async function main() {
  const action = process.argv[2];
  const email = process.argv[3];
  
  if (!action || !email) {
    console.log('Usage: node scripts/test-whitelist.js <action> <email>');
    console.log('Actions: remove, add, deactivate, activate');
    console.log('Example: node scripts/test-whitelist.js remove faris.id.go@gmail.com');
    process.exit(1);
  }
  
  let success = false;
  
  switch (action) {
    case 'remove':
      success = await removeFromWhitelist(email);
      break;
    case 'add':
      success = await addToWhitelist(email);
      break;
    case 'deactivate':
      success = await deactivateEmail(email);
      break;
    case 'activate':
      success = await activateEmail(email);
      break;
    default:
      console.log('❌ Invalid action. Use: remove, add, deactivate, activate');
      process.exit(1);
  }
  
  if (!success) {
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());