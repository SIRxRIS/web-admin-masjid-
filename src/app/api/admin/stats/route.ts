import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Cache untuk menyimpan stats sementara (5 menit)
let statsCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

// GET - Ambil statistik admin dashboard
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Panggil fungsi secara sekuensial untuk diagnosis
    const activeWhitelistCount = await getEmailWhitelistCount();
    const authenticatedOnlineUsers = await getOnlineUsersCount();
    const { systemStatus, uptime } = await checkSystemHealth();
    const recentActivity = await getRecentActivityCount();

    const totalDuration = Date.now() - startTime;
    console.info('[admin/stats] Aggregation completed', { duration_ms: totalDuration });

    const stats = {
      onlineUsers: authenticatedOnlineUsers,
      activeEmailWhitelist: activeWhitelistCount,
      systemStatus,
      uptime,
      recentActivity,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      {
        headers: {
          'Cache-Control': 'no-cache', // Nonaktifkan cache untuk diagnosis
        },
      }
    );
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil statistik admin',
      },
      { status: 500 }
    );
  }
}

// Helper functions untuk optimasi
async function getOnlineUsersCount(): Promise<number> {
  try {
    // Simplified approach - just count recent profiles instead of auth users
    const { count, error } = await supabaseAdmin
      .from('profile')
      .select('id', { count: 'exact', head: true })
      .gte('updatedAt', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (error) {
      console.warn('Error counting online users:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.warn('Exception counting online users:', error);
    return 0;
  }
}

// Hitung jumlah email whitelist aktif dengan query ringan
async function getEmailWhitelistCount(): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from('email_whitelist')
      .select('id', { count: 'exact', head: true })
      .eq('isActive', true);

    if (error) {
      console.warn('Error counting email whitelist:', error);
      return 0;
    }
    return count || 0;
  } catch (error) {
    console.warn('Exception counting email whitelist:', error);
    return 0;
  }
}
async function checkSystemHealth(): Promise<{ systemStatus: string; uptime: string }> {
  try {
    // Simple health check - just try to connect to database
    const { error } = await supabaseAdmin
      .from('profile')
      .select('id')
      .limit(1);
    
    if (error) {
      return { systemStatus: 'Offline', uptime: '0%' };
    }
    
    return { systemStatus: 'Online', uptime: '99.9%' };
  } catch (error) {
    return { systemStatus: 'Offline', uptime: '0%' };
  }
}

async function getRecentActivityCount(): Promise<number> {
  try {
    // Gunakan head count dengan kolom ringan ('id') untuk mengurangi beban
    const { count, error } = await supabaseAdmin
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // 7 hari saja

    if (error) {
      console.warn('Error counting recent activity:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.warn('Exception counting recent activity:', error);
    return 0;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn(`[withTimeout] Operation timed out after ${ms}ms`);
      resolve(fallback);
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        console.error('[withTimeout] Operation failed:', error);
        clearTimeout(timeout);
        resolve(fallback); // Resolve with fallback on error as well
      });
  });
}
