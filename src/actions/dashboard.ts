// src/actions/dashboard.ts
"use server";

import {
  getDashboardData as getDashboardDataService,
  getDonasiBulanan as getDonasiBulananService,
  getPertumbuhanDonasi as getPertumbuhanDonasiService,
} from "@/lib/services/supabase/dashboard/dashboard";

// Type definitions untuk return values
export interface DashboardData {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  jumlahDonatur: number;
  pertumbuhanDonatur: number;
  donasiBulanan: number;
  pertumbuhanDonasi: number;
  tahun: number;
  bulan: number;
  totalKotakAmal: number;
  totalKotakAmalMasjid: number;
  totalGabunganKotakAmal: number;
  totalKontenPublished: number;
  pertumbuhanDanaTahunan: number;
  pertumbuhanDanaBulanan: number;
}

/**
 * Server Action untuk mengambil semua data dashboard
 * @param tahun - Tahun yang ingin diambil datanya
 * @param bulan - Bulan yang ingin diambil datanya (1-12)
 * @returns Promise<DashboardData> - Data lengkap dashboard
 */
export async function getDashboardData(
  tahun: number,
  bulan: number
): Promise<DashboardData> {
  try {
    // Validasi input
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 1) {
      throw new Error("Tahun tidak valid");
    }

    if (!bulan || bulan < 1 || bulan > 12) {
      throw new Error("Bulan tidak valid (harus 1-12)");
    }

    const data = await getDashboardDataService(tahun, bulan);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil data dashboard:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Gagal mengambil data dashboard"
    );
  }
}

/**
 * Server Action untuk mengambil total donasi bulanan saja
 * @param tahun - Tahun yang ingin diambil datanya
 * @param bulan - Bulan yang ingin diambil datanya (1-12)
 * @returns Promise<number> - Total donasi bulan tersebut
 */
export async function getDonasiBulanan(
  tahun: number,
  bulan: number
): Promise<number> {
  try {
    // Validasi input
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 1) {
      throw new Error("Tahun tidak valid");
    }

    if (!bulan || bulan < 1 || bulan > 12) {
      throw new Error("Bulan tidak valid (harus 1-12)");
    }

    const totalDonasi = await getDonasiBulananService(tahun, bulan);
    return totalDonasi;
  } catch (error) {
    console.error("Server Action - Error mengambil donasi bulanan:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Gagal mengambil data donasi bulanan"
    );
  }
}

/**
 * Server Action untuk mengambil pertumbuhan donasi
 * @param tahun - Tahun yang ingin diambil datanya
 * @param bulan - Bulan yang ingin diambil datanya (1-12)
 * @returns Promise<number> - Persentase pertumbuhan donasi
 */
export async function getPertumbuhanDonasi(
  tahun: number,
  bulan: number
): Promise<number> {
  try {
    // Validasi input
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 1) {
      throw new Error("Tahun tidak valid");
    }

    if (!bulan || bulan < 1 || bulan > 12) {
      throw new Error("Bulan tidak valid (harus 1-12)");
    }

    const pertumbuhan = await getPertumbuhanDonasiService(tahun, bulan);
    return pertumbuhan;
  } catch (error) {
    console.error("Server Action - Error mengambil pertumbuhan donasi:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Gagal mengambil data pertumbuhan donasi"
    );
  }
}

/**
 * Server Action untuk mengambil data dashboard dengan range tahun
 * @param tahunMulai - Tahun mulai
 * @param tahunAkhir - Tahun akhir
 * @returns Promise<DashboardData[]> - Array data dashboard per tahun
 */
export async function getDashboardDataRange(
  tahunMulai: number,
  tahunAkhir: number
): Promise<DashboardData[]> {
  try {
    // Validasi input
    if (!tahunMulai || !tahunAkhir) {
      throw new Error("Tahun mulai dan akhir harus diisi");
    }

    if (tahunMulai > tahunAkhir) {
      throw new Error("Tahun mulai tidak boleh lebih besar dari tahun akhir");
    }

    if (tahunAkhir - tahunMulai > 10) {
      throw new Error("Range tahun maksimal 10 tahun");
    }

    const results: DashboardData[] = [];
    const currentMonth = new Date().getMonth() + 1;

    for (let tahun = tahunMulai; tahun <= tahunAkhir; tahun++) {
      const data = await getDashboardDataService(tahun, currentMonth);
      results.push(data);
    }

    return results;
  } catch (error) {
    console.error("Server Action - Error mengambil data dashboard range:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Gagal mengambil data dashboard untuk range tahun"
    );
  }
}

/**
 * Server Action untuk mengambil ringkasan dashboard (data penting saja)
 * @param tahun - Tahun yang ingin diambil datanya
 * @param bulan - Bulan yang ingin diambil datanya (1-12)
 * @returns Promise<object> - Ringkasan data dashboard
 */
export async function getDashboardSummary(tahun: number, bulan: number) {
  try {
    // Validasi input
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 1) {
      throw new Error("Tahun tidak valid");
    }

    if (!bulan || bulan < 1 || bulan > 12) {
      throw new Error("Bulan tidak valid (harus 1-12)");
    }

    const fullData = await getDashboardDataService(tahun, bulan);

    // Return hanya data penting untuk summary
    return {
      saldo: fullData.saldo,
      donasiBulanan: fullData.donasiBulanan,
      pertumbuhanDonasi: fullData.pertumbuhanDonasi,
      jumlahDonatur: fullData.jumlahDonatur,
      pertumbuhanDonatur: fullData.pertumbuhanDonatur,
      totalKontenPublished: fullData.totalKontenPublished,
      tahun: fullData.tahun,
      bulan: fullData.bulan,
    };
  } catch (error) {
    console.error("Server Action - Error mengambil ringkasan dashboard:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Gagal mengambil ringkasan dashboard"
    );
  }
}

/**
 * Server Action untuk mengambil data dashboard bulan ini (current month)
 * @param tahun - Tahun yang ingin diambil datanya
 * @returns Promise<DashboardData> - Data dashboard bulan ini
 */
export async function getDashboardCurrentMonth(tahun: number): Promise<DashboardData> {
  try {
    const currentMonth = new Date().getMonth() + 1;
    return await getDashboardData(tahun, currentMonth);
  } catch (error) {
    console.error("Server Action - Error mengambil data dashboard bulan ini:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Gagal mengambil data dashboard bulan ini"
    );
  }
}