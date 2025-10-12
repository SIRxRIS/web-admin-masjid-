"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge/Badge";
import { 
  Users, 
  Mail, 
  Settings, 
  Shield, 
  Database, 
  Activity,
  UserCheck,
  Globe,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface AdminStats {
  onlineUsers: number;
  activeEmailWhitelist: number;
  systemStatus: string;
  uptime: string;
  recentActivity: number;
  lastUpdated: string;
}

export function AdminDashboard() {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedStats = useRef(false);

  // Fetch stats on mount (authorization handled by RoleGuard in layout)
  useEffect(() => {
    if (!hasInitializedStats.current) {
      hasInitializedStats.current = true;
      console.log('Initializing stats fetch...');
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    // Hoist controller to be accessible in catch scope
    let controller: AbortController | null = null;
    try {
      console.log('Starting stats fetch...');
      setLoading(true);
      setError(null);
      
      controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Stats fetch timeout');
        // Beri alasan jelas saat abort agar tidak "without reason"
        // Catatan: AbortController.signal.reason tersedia di browser modern
        try {
          // @ts-ignore optional reason for runtimes that support it
          if (controller) {
            controller.abort(new Error('Timeout saat mengambil statistik admin'));
          }
        } catch {
          if (controller) {
            controller.abort();
          }
        }
      }, 15000);

      // Ensure cleanup if component unmounts during fetch
      // Attach temporary listener to simulate component lifecycle cleanup
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
      });
      
      // Coba baca dari cache lokal terlebih dahulu untuk render instan
      const cached = typeof window !== 'undefined' ? window.sessionStorage.getItem('admin_stats') : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setStats(parsed);
        } catch {}
      }

      const response = await fetch('/api/admin/stats', {
        signal: controller.signal,
        // Biarkan browser mempertimbangkan Cache-Control (hindari no-store)
        cache: 'default',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      console.log('Stats fetch response:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Stats fetch result:', result);
      
      if (result.success) {
        setStats(result.data);
        // Simpan ke cache lokal untuk akses cepat pada refresh berikutnya
        try {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('admin_stats', JSON.stringify(result.data));
          }
        } catch {}
        console.log('Stats updated successfully');
      } else {
        setError(result.message || 'Gagal mengambil data statistik');
      }
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      // Tangani alasan abort jika tersedia
      const reasonMsg = (
        err?.name === 'AbortError' && controller
          ? (controller.signal as any)?.reason?.message
          : undefined
      );
      if (err.name === 'AbortError') {
        setError(reasonMsg || 'Request timeout - halaman memuat terlalu lama');
      } else {
        setError('Terjadi kesalahan saat mengambil data: ' + (err?.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
      console.log('Stats fetch completed');
    }
  };

  const adminFeatures = [
    {
      title: "Email Whitelist",
      description: "Kelola daftar email yang diizinkan mengakses sistem",
      icon: <Mail className="h-6 w-6" />,
      href: "/admin/email-whitelist",
      status: "active",
      color: "bg-blue-500"
    },
    {
      title: "Manajemen User",
      description: "Kelola pengguna dan role mereka dalam sistem",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/users",
      status: "coming-soon",
      color: "bg-green-500"
    },
    {
      title: "Pengaturan Sistem",
      description: "Konfigurasi umum dan pengaturan aplikasi",
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/settings",
      status: "coming-soon",
      color: "bg-purple-500"
    },
    {
      title: "Keamanan",
      description: "Monitor aktivitas dan pengaturan keamanan",
      icon: <Shield className="h-6 w-6" />,
      href: "/admin/security",
      status: "coming-soon",
      color: "bg-red-500"
    },
    {
      title: "Database",
      description: "Backup, restore, dan maintenance database",
      icon: <Database className="h-6 w-6" />,
      href: "/admin/database",
      status: "coming-soon",
      color: "bg-yellow-500"
    },
    {
      title: "Log Aktivitas",
      description: "Monitor semua aktivitas pengguna dalam sistem",
      icon: <Activity className="h-6 w-6" />,
      href: "/admin/logs",
      status: "coming-soon",
      color: "bg-indigo-500"
    }
  ];

  // Skeleton loading component
  const SkeletonCard = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>
          <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
            <div className="h-5 w-5"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const systemStats = [
    {
      title: "Pengguna Online",
      value: loading ? "..." : (stats?.onlineUsers?.toString() || "0"),
      icon: <Activity className="h-5 w-5" />,
      change: loading ? "..." : "Login dalam 24 jam terakhir"
    },
    {
      title: "Email Whitelist",
      value: loading ? "..." : (stats?.activeEmailWhitelist?.toString() || "0"),
      icon: <Mail className="h-5 w-5" />,
      change: "Aktif"
    },
    {
      title: "Status Sistem",
      value: loading ? "..." : (stats?.systemStatus || "Unknown"),
      icon: <Globe className="h-5 w-5" />,
      change: loading ? "..." : (stats?.uptime || "0%") + " uptime"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kelola dan pantau sistem website masjid
            {stats?.lastUpdated && (
              <span className="block text-xs text-gray-500 mt-1">
                Terakhir diperbarui: {new Date(stats.lastUpdated).toLocaleString('id-ID')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge 
            variant="outline" 
            className={`${
              stats?.systemStatus === 'Online' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <Activity className="h-3 w-3 mr-1" />
            {loading ? 'Memuat...' : (stats?.systemStatus || 'Unknown')}
          </Badge>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchStats}
                className="ml-auto text-red-700 hover:text-red-800"
              >
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          // Show skeleton loading
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          // Show actual stats
          systemStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Admin Features */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Fitur Administrasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    {feature.icon}
                  </div>
                  <Badge 
                    variant={feature.status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {feature.status === "active" ? "Aktif" : "Segera Hadir"}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {feature.status === "active" ? (
                  <Link href={feature.href}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Buka
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    Segera Hadir
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}