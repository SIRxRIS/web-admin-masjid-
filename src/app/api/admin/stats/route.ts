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
    // Check cache first
    const now = Date.now();
    if (statsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.info('[admin/stats] Serving from cache', {
        age_ms: now - cacheTimestamp,
      });
      return NextResponse.json(
        {
          success: true,
          data: {
            ...statsCache,
            lastUpdated: new Date(cacheTimestamp).toISOString(),
            cached: true,
          },
        },
        {
          headers: {
            // Izinkan browser meng-cache 60 detik dan gunakan stale-while-revalidate 5 menit
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          },
        }
      );
    }

    // Jalankan semua operasi secara paralel dengan timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const statsPromise = Promise.allSettled([
      // 1. Email whitelist count (lebih ringan)
      getEmailWhitelistCount(),
      
      // 2. Online users (sederhana)
      getOnlineUsersCount(),
      
      // 3. System health (sederhana)
      checkSystemHealth(),
      
      // 4. Recent activity (head count)
      getRecentActivityCount()
    ]);

    const results = await Promise.race([statsPromise, timeoutPromise]) as PromiseSettledResult<any>[];
    const totalDuration = Date.now() - startTime;
    console.info('[admin/stats] Aggregation completed', { duration_ms: totalDuration });

    // Process results dengan fallback values
    const activeWhitelistCount = results[0].status === 'fulfilled' ? results[0].value : 0;
    const authenticatedOnlineUsers = results[1].status === 'fulfilled' ? results[1].value : 0;
    const { systemStatus, uptime } = results[2].status === 'fulfilled' ? results[2].value : { systemStatus: 'Unknown', uptime: '0%' };
    const recentActivity = results[3].status === 'fulfilled' ? results[3].value : 0;

    const stats = {
      onlineUsers: authenticatedOnlineUsers,
      activeEmailWhitelist: activeWhitelistCount,
      systemStatus,
      uptime,
      recentActivity,
      lastUpdated: new Date().toISOString()
    };

    // Cache the results
    statsCache = stats;
    cacheTimestamp = now;

    console.info('[admin/stats] Stats cached', { cache_timestamp: cacheTimestamp });

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
    // Return cached data if available, even if stale
    if (statsCache) {
      console.warn('[admin/stats] Returning stale cached data due to error');
      return NextResponse.json(
        {
          success: true,
          data: {
            ...statsCache,
            lastUpdated: new Date(cacheTimestamp).toISOString(),
            cached: true,
            stale: true,
          },
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          },
        }
      );
    }
    
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