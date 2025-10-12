// Script untuk menambahkan email ke whitelist menggunakan Prisma
// Jalankan dengan: node scripts/add-email-prisma.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addEmailToWhitelist(email, role = 'ADMIN', jabatan = 'DEVELOPER', nama = null) {
  try {
    // Extract name from email if not provided
    const defaultNama = nama || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    console.log(`Adding ${email} to whitelist with role: ${role}, jabatan: ${jabatan}, nama: ${defaultNama}`);
    
    // Check if email already exists
    const existing = await prisma.emailWhitelist.findUnique({
      where: { email: email }
    });
    
    if (existing) {
      console.log('Email already exists in whitelist:', existing);
      
      // Update to make sure it's active
      const updated = await prisma.emailWhitelist.update({
        where: { email: email },
        data: { 
          isActive: true,
          role: role,
          jabatan: jabatan,
          nama: defaultNama
        }
      });
      
      console.log('Email whitelist updated successfully:', updated);
      return true;
    }
    
    // Add new email to whitelist
    const created = await prisma.emailWhitelist.create({
      data: {
        nama: defaultNama,
        email: email,
        role: role,
        jabatan: jabatan,
        isActive: true
      }
    });
    
    console.log('Email added to whitelist successfully:', created);
    return true;
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || 'ADMIN';
  const jabatan = process.argv[4] || 'DEVELOPER';
  const nama = process.argv[5] || null;
  
  if (!email) {
    console.log('Usage: node scripts/add-email-prisma.js <email> [role] [jabatan] [nama]');
    console.log('Example: node scripts/add-email-prisma.js faris.id.go@gmail.com ADMIN DEVELOPER "Faris"');
    process.exit(1);
  }
  
  const success = await addEmailToWhitelist(email, role, jabatan, nama);
  
  if (success) {
    console.log('✅ Email successfully added/updated in whitelist');
  } else {
    console.log('❌ Failed to add email to whitelist');
    process.exit(1);
  }
}

main();