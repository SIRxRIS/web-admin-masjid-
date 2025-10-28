// src/app/(admin)/page.tsx (Improved Version)
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EcommerceMetrics } from "@/components/ecommerce/ecommerce-metrics/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/monthly-target/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import {
  getPemasukanBulanan,
  getPemasukanTahunan,
} from "@/lib/services/supabase/rekap-tahunan";
import {
  getDonaturData,
  getKotakAmalData,
  getDonasiKhususData,
  getStatistikPemasukan
} from "@/lib/services/supabase/pemasukan/pemasukan";
import {
  getPengeluaranBulanan,
  getPengeluaranTahunan,
} from "@/lib/services/supabase/pengeluaran/pengeluaran";
import { getTotalKontenPublished } from "@/lib/services/supabase/konten";
import { getTotalKotakAmal } from "@/lib/services/supabase/kotak-amal";
import { getInventarisData } from "@/lib/services/supabase/inventaris/inventaris";
import {
  getMonthlyVisitorsFromDatabase,
  getPreviousMonthVisitorsFromDatabase,
} from "@/lib/services/supabase/daily-visitor-sync";

export const metadata: Metadata = {
  title: "Dashboard Masjid - Masjid Jawahiruzzarqa",
  description: "Portal manajemen terpadu untuk mengelola keuangan dan operasional harian Masjid Jawahiruzzarqa.",
  keywords: ["dashboard", "masjid", "keuangan", "laporan", "manajemen", "jawahiruzzarqa"],
};

async function getUserRole() {
  const supabase = await createServerSupabaseClient();

  // Gunakan getUser() agar data user terautentikasi oleh Supabase Auth server
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log('No authenticated user found:', userError?.message);
    redirect('/signin');
  }

  try {
    // Check email_whitelist directly (consistent with middleware)
    const { data: whitelistUser, error: whitelistError } = await supabase
      .from('email_whitelist')
      .select('role, nama, isActive')
      .eq('email', user.email)
      .single();

    if (whitelistError || !whitelistUser || !whitelistUser.isActive) {
      console.error('User not in whitelist or inactive:', user.email);
      redirect('/signin');
    }

    return { role: whitelistUser.role, nama: whitelistUser.nama, email: user.email };
  } catch (error) {
    console.error('Error fetching user from whitelist:', error);
    redirect('/signin');
  }
}

// Tipe data untuk metrics
interface ServerMetricsData {
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  pemasukanBulanLalu: number;
  pengeluaranBulanLalu: number;
  totalPemasukanKeseluruhan: number;
  totalPengeluaranKeseluruhan: number;
  totalKonten: number;
  totalDonatur: number;
  totalInventaris: number;
  totalKotakAmal: number;
  totalPengunjungWeb: number;
  pengunjungWebBulanLalu: number;
}

// Tipe data untuk dashboard
interface DashboardData {
  // Data keuangan
  metricsData: ServerMetricsData;
  // Data untuk charts
  pemasukanBulanan: number;
  pemasukanTahunan: number;
  pengeluaranBulanan: number;
  pengeluaranTahunan: number;
  statistikPemasukan: any;
  // Data operasional
  totalDonatur: number;
  totalKotakAmal: number;
  totalDonasiKhusus: number;
  // Meta data
  currentYear: number;
  currentMonth: number;
  // Data bulanan lengkap untuk chart
  monthlyData?: Array<{ bulan: number; jumlah: number }>;
}



// Service untuk mengambil semua data dashboard
async function getDashboardData(): Promise<{
  data: DashboardData | null;
  error: string | null;
}> {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Hitung bulan lalu
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Fetch semua data secara paralel untuk performa optimal
    const [
      // Data keuangan utama
      pemasukanBulanIni,
      pengeluaranBulanIni,
      pemasukanBulanLalu,
      pengeluaranBulanLalu,
      pemasukanTahunan,
      pengeluaranTahunan,

      // Data statistik dan operasional
      statistikPemasukan,
      donaturData,
      kotakAmalData,
      donasiKhususData,

      // Data tambahan untuk metrics - menggunakan data real
      totalKonten,
      totalInventaris,
      totalKotakAmalReal,
      pengunjungWebBulanIni,
      pengunjungWebBulanLalu,
    ] = await Promise.all([
      // Data keuangan bulan ini dan lalu
      getPemasukanBulanan(currentYear, currentMonth),
      getPengeluaranBulanan(currentYear, currentMonth),
      getPemasukanBulanan(prevYear, prevMonth),
      getPengeluaranBulanan(prevYear, prevMonth),

      // Data tahunan
      getPemasukanTahunan(currentYear),
      getPengeluaranTahunan(currentYear),

      // Data statistik untuk charts
      getStatistikPemasukan(currentYear),
      getDonaturData(currentYear),
      getKotakAmalData(currentYear),
      getDonasiKhususData(currentYear),

      // Data operasional real dari database
      getTotalKontenPublished(),
      getTotalInventarisReal(),
      getTotalKotakAmal(currentYear),
      getMonthlyVisitorsFromDatabase(currentYear, currentMonth),
      getPreviousMonthVisitorsFromDatabase(),
    ]);

    // Buat metrics data
    const metricsData: ServerMetricsData = {
      pemasukanBulanIni,
      pengeluaranBulanIni,
      pemasukanBulanLalu,
      pengeluaranBulanLalu,
      totalPemasukanKeseluruhan: pemasukanTahunan,
      totalPengeluaranKeseluruhan: pengeluaranTahunan,
      // Data operasional real
      totalKonten,
      totalDonatur: donaturData.length,
      totalInventaris,
      totalKotakAmal: totalKotakAmalReal,
      totalPengunjungWeb: pengunjungWebBulanIni,
      pengunjungWebBulanLalu,
    };

    // Susun semua data dashboard
    const dashboardData: DashboardData = {
      metricsData,
      pemasukanBulanan: pemasukanBulanIni,
      pemasukanTahunan,
      pengeluaranBulanan: pengeluaranBulanIni,
      pengeluaranTahunan,
      statistikPemasukan,
      totalDonatur: donaturData.length,
      totalKotakAmal: totalKotakAmalReal,
      totalDonasiKhusus: donasiKhususData.length,
      currentYear,
      currentMonth,
      // Tambahkan data bulanan lengkap dari statistikPemasukan
      monthlyData: statistikPemasukan.dataBulanan,
    };

    return { data: dashboardData, error: null };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gagal mengambil data dashboard"
    };
  }
}

// Fungsi untuk mengambil total inventaris real dari database
async function getTotalInventarisReal(): Promise<number> {
  try {
    const inventarisData = await getInventarisData();
    return inventarisData.length;
  } catch (error) {
    console.error("Error mengambil total inventaris:", error);
    return 0;
  }
}

export default async function DashboardAdmin() {
  const user = await getUserRole();

  // Check if user has admin or management access
  const adminRoles = ['ADMIN'];
  const managementRoles = ['KETUA', 'SEKRETARIS', 'BENDAHARA', 'HUMAS_MEDIA', 'REMAS_ADMIN', 'MAJLIS_TALIM_ADMIN'];

  if (!adminRoles.includes(user.role || '') && !managementRoles.includes(user.role || '')) {
    // Redirect regular users to main dashboard instead of signin
    redirect('/');
  }

  const { data: dashboardData, error } = await getDashboardData();

  // Error handling
  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Gagal Memuat Dashboard
              </h3>
              <p className="text-red-600 dark:text-red-300 mt-1">
                {error || "Terjadi kesalahan saat mengambil data dashboard"}
              </p>
              <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                Silakan refresh halaman atau hubungi admin sistem.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Masjid
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ringkasan keuangan dan operasional Masjid Jawahiruzzarqa
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Selamat datang, {user.nama || user.email}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Role: {user.role}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Terakhir diperbarui: {new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Grid Layout untuk Dashboard */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Metrics Keuangan */}
        <div className="col-span-12">
          <EcommerceMetrics
            serverData={dashboardData.metricsData}
            isLoading={false}
          />
        </div>

        {/* Grafik Pemasukan Bulanan dan Target Bulanan */}
        <div className="col-span-12 lg:col-span-8">
          <MonthlySalesChart
            initialData={dashboardData}
            title="Grafik Pemasukan Bulanan"
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <MonthlyTarget
            initialData={dashboardData}
            targetAmount={Math.round((dashboardData.pemasukanTahunan / 12) * 1.1)} // Target bulanan: rata-rata tahunan + 10%
          />
        </div>

        {/* Grafik Statistik Pemasukan dihapus sesuai permintaan */}
      </div>
    </div>
  );
}