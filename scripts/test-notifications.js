// Test script untuk sistem notifikasi
// Jalankan dengan: node scripts/test-notifications.js

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n');

  try {
    // Test 1: Create test notifications for PENGURUS
    console.log('📝 Creating test notifications for PENGURUS...');
    
    const pengurusNotifications = await prisma.notification.createMany({
      data: [
        {
          id: randomUUID(),
          title: 'Target Pemasukan Tercapai',
          message: 'Target pemasukan bulan ini sebesar Rp 10,000,000 telah tercapai!',
          type: 'TARGET_PEMASUKAN',
          priority: 'HIGH',
          targetRoles: ['PENGURUS'],
          actionUrl: '/finance/target-pemasukan',
          createdBy: null
        },
        {
          id: randomUUID(),
          title: 'Donasi Baru Masuk',
          message: 'Donasi baru dari Ahmad Hidayat sebesar Rp 500,000',
          type: 'DONASI_BARU',
          priority: 'MEDIUM',
          targetRoles: ['PENGURUS'],
          actionUrl: '/finance/donasi',
          createdBy: null
        },
        {
          id: randomUUID(),
          title: 'Konten Baru Ditambahkan',
          message: 'Artikel baru "Panduan Sholat Jumat" telah ditambahkan',
          type: 'KONTEN_BARU',
          priority: 'LOW',
          targetRoles: ['PENGURUS'],
          actionUrl: '/content',
          createdBy: null
        },
        {
          id: randomUUID(),
          title: 'Inventaris Baru Ditambahkan',
          message: 'Inventaris baru "Karpet Masjid" (10 unit) telah ditambahkan',
          type: 'INVENTARIS_BARU',
          priority: 'LOW',
          targetRoles: ['PENGURUS'],
          actionUrl: '/inventaris',
          createdBy: null
        }
      ]
    });

    console.log(`✅ Created ${pengurusNotifications.count} PENGURUS notifications`);

    // Test 2: Create test notifications for ADMIN
    console.log('\n📝 Creating test notifications for ADMIN...');
    
    const adminNotifications = await prisma.notification.createMany({
      data: [
        {
          id: randomUUID(),
          title: 'System Health Warning',
          message: 'Database response time is slow (1200ms), High memory usage (95%)',
          type: 'SYSTEM_HEALTH',
          priority: 'URGENT',
          targetRoles: ['ADMIN'],
          actionUrl: '/admin/system-health',
          createdBy: null
        },
        {
          id: randomUUID(),
          title: 'Email Whitelist Baru',
          message: 'Email baru admin@masjid.com telah ditambahkan ke whitelist',
          type: 'EMAIL_WHITELIST',
          priority: 'MEDIUM',
          targetRoles: ['ADMIN'],
          actionUrl: '/admin/email-whitelist',
          createdBy: null
        }
      ]
    });

    console.log(`✅ Created ${adminNotifications.count} ADMIN notifications`);

    // Test 3: Query notifications by role
    console.log('\n🔍 Testing notification queries by role...');
    
    const pengurusNotifs = await prisma.notification.findMany({
      where: {
        targetRoles: {
          has: 'PENGURUS'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const adminNotifs = await prisma.notification.findMany({
      where: {
        targetRoles: {
          has: 'ADMIN'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${pengurusNotifs.length} notifications for PENGURUS`);
    console.log(`📊 Found ${adminNotifs.length} notifications for ADMIN`);

    // Test 4: Test notification types
    console.log('\n📋 Notification breakdown by type:');
    
    const notificationTypes = await prisma.notification.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });

    notificationTypes.forEach(type => {
      console.log(`   ${type.type}: ${type._count.type} notifications`);
    });

    // Test 5: Test priority distribution
    console.log('\n🚨 Notification breakdown by priority:');
    
    const notificationPriorities = await prisma.notification.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    });

    notificationPriorities.forEach(priority => {
      console.log(`   ${priority.priority}: ${priority._count.priority} notifications`);
    });

    // Test 6: Test unread count
    console.log('\n📬 Testing unread notification counts...');
    
    const unreadPengurus = await prisma.notification.count({
      where: {
        targetRoles: {
          has: 'PENGURUS'
        },
        isRead: false
      }
    });

    const unreadAdmin = await prisma.notification.count({
      where: {
        targetRoles: {
          has: 'ADMIN'
        },
        isRead: false
      }
    });

    console.log(`📬 Unread notifications for PENGURUS: ${unreadPengurus}`);
    console.log(`📬 Unread notifications for ADMIN: ${unreadAdmin}`);

    console.log('\n✅ All notification system tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Total notifications created: ${pengurusNotifications.count + adminNotifications.count}`);
    console.log(`   - PENGURUS notifications: ${pengurusNotifs.length}`);
    console.log(`   - ADMIN notifications: ${adminNotifs.length}`);
    console.log(`   - Notification types: ${notificationTypes.length}`);
    console.log(`   - Priority levels: ${notificationPriorities.length}`);

  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Cleanup function to remove test notifications
async function cleanupTestNotifications() {
  console.log('🧹 Cleaning up test notifications...');
  
  try {
    const deleted = await prisma.notification.deleteMany({
      where: {
        createdBy: null,
        title: {
          in: [
            'Target Pemasukan Tercapai',
            'Donasi Baru Masuk',
            'Konten Baru Ditambahkan',
            'Inventaris Baru Ditambahkan',
            'System Health Warning',
            'Email Whitelist Baru'
          ]
        }
      }
    });

    console.log(`🗑️ Deleted ${deleted.count} test notifications`);
  } catch (error) {
    console.error('❌ Error cleaning up test notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
if (process.argv.includes('--cleanup')) {
  cleanupTestNotifications();
} else {
  testNotificationSystem();
}