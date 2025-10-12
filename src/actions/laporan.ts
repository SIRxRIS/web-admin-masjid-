// src/actions/laporan.ts
"use server";

import { revalidatePath } from "next/cache";

// Interface untuk total laporan
export interface TotalLaporan {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoAkhir: number;
}

// Interface untuk laporan berdasarkan periode
export interface LaporanPeriode extends TotalLaporan {
  periode: {
    dari: Date;
    sampai: Date;
  };
}

// Interface untuk laporan tahunan
export interface LaporanTahunan extends TotalLaporan {
  tahun: number;
  perBulan: {
    bulan: number;
    namaBulan: string;
    totalPemasukan: number;
    totalPengeluaran: number;
    saldo: number;
  }[];
}

// Action untuk mendapatkan total keseluruhan
export async function getTotalKeseluruhanAction(): Promise<TotalLaporan> {
  try {
    // Import service functions yang diperlukan
    const { getPemasukanData } = await import("@/lib/services/supabase/pemasukan/pemasukan");
    const { getPengeluaranData } = await import("@/lib/services/supabase/pengeluaran/pengeluaran");

    // Ambil semua data pemasukan dan pengeluaran (tanpa filter tahun untuk mendapatkan semua data)
    const [pemasukanData, pengeluaranData] = await Promise.all([
      getPemasukanData(), // Tanpa filter untuk mendapatkan semua data
      getPengeluaranData() // Tanpa filter untuk mendapatkan semua data
    ]);

    // Hitung total pemasukan dari semua sumber
    let totalPemasukan = 0;
    
    // Dari donatur
    totalPemasukan += pemasukanData.donatur.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    
    // Dari kotak amal
    totalPemasukan += pemasukanData.kotakAmal.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    
    // Dari donasi khusus
    totalPemasukan += pemasukanData.donasiKhusus.reduce((total, item) => total + item.jumlah, 0);
    
    // Dari kotak amal masjid
    totalPemasukan += pemasukanData.kotakAmalMasjid.reduce((total, item) => total + item.jumlah, 0);

    // Hitung total pengeluaran
    const totalPengeluaran = pengeluaranData.reduce((total: number, item: any) => total + item.jumlah, 0);

    // Hitung saldo akhir
    const saldoAkhir = totalPemasukan - totalPengeluaran;

    return {
      totalPemasukan,
      totalPengeluaran,
      saldoAkhir
    };
  } catch (error) {
    console.error("Error dalam getTotalKeseluruhanAction:", error);
    throw new Error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil total keseluruhan");
  }
}

// Action untuk mendapatkan laporan berdasarkan periode tertentu
export async function getLaporanPeriodeAction(
  tanggalMulai: Date,
  tanggalSelesai: Date
): Promise<LaporanPeriode> {
  try {
    // Import service functions yang ada
    const { getPemasukanByDateRange } = await import("@/lib/services/supabase/pemasukan/pemasukan");
    const { getPengeluaranByDateRange } = await import("@/lib/services/supabase/pengeluaran/pengeluaran");

    // Ambil data berdasarkan rentang tanggal menggunakan fungsi yang sudah tersedia
    const [pemasukanData, pengeluaranData] = await Promise.all([
      getPemasukanByDateRange(tanggalMulai, tanggalSelesai),
      getPengeluaranByDateRange(tanggalMulai, tanggalSelesai)
    ]);

    // Hitung total pemasukan dari data yang dikembalikan
    const totalPemasukan = pemasukanData.donasiKhusus.reduce((total, item) => total + item.jumlah, 0) +
                           pemasukanData.kotakAmalMasjid.reduce((total, item) => total + item.jumlah, 0);
    
    const totalPengeluaran = pengeluaranData.reduce((total: number, item: any) => total + item.jumlah, 0);
    const saldoAkhir = totalPemasukan - totalPengeluaran;

    return {
      totalPemasukan,
      totalPengeluaran,
      saldoAkhir,
      periode: {
        dari: tanggalMulai,
        sampai: tanggalSelesai
      }
    };
  } catch (error) {
    console.error("Error dalam getLaporanPeriodeAction:", error);
    throw new Error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil laporan periode");
  }
}

// Action untuk mendapatkan laporan tahunan
export async function getLaporanTahunanAction(tahun: number): Promise<LaporanTahunan> {
  try {
    // Import service functions yang ada
    const { getPemasukanData } = await import("@/lib/services/supabase/pemasukan/pemasukan");
    const { getPengeluaranData } = await import("@/lib/services/supabase/pengeluaran/pengeluaran");

    // Ambil data berdasarkan tahun menggunakan filter tahun
    const [pemasukanData, pengeluaranData] = await Promise.all([
      getPemasukanData({ tahun }), // Menggunakan filter object
      getPengeluaranData(tahun)    // Menggunakan parameter tahun langsung
    ]);

    // Hitung total keseluruhan tahun dari semua sumber
    let totalPemasukan = 0;
    
    // Dari donatur
    totalPemasukan += pemasukanData.donatur.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    
    // Dari kotak amal
    totalPemasukan += pemasukanData.kotakAmal.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    
    // Dari donasi khusus
    totalPemasukan += pemasukanData.donasiKhusus.reduce((total, item) => total + item.jumlah, 0);
    
    // Dari kotak amal masjid
    totalPemasukan += pemasukanData.kotakAmalMasjid.reduce((total, item) => total + item.jumlah, 0);

    const totalPengeluaran = pengeluaranData.reduce((total: number, item: any) => total + item.jumlah, 0);
    const saldoAkhir = totalPemasukan - totalPengeluaran;

    // Nama bulan dalam bahasa Indonesia
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Buat laporan per bulan
    const perBulan = Array.from({ length: 12 }, (_, index) => {
      const bulan = index + 1;
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 
                         'jul', 'aug', 'sep', 'okt', 'nov', 'des'] as const;
      const monthKey = monthNames[index];
      
      // Hitung pemasukan per bulan
      let totalPemasukanBulan = 0;
      
      // Dari donatur untuk bulan ini
      totalPemasukanBulan += pemasukanData.donatur.reduce((total, item) => total + (item[monthKey] || 0), 0);
      
      // Dari kotak amal untuk bulan ini
      totalPemasukanBulan += pemasukanData.kotakAmal.reduce((total, item) => total + (item[monthKey] || 0), 0);
      
      // Dari donasi khusus untuk bulan ini
      totalPemasukanBulan += pemasukanData.donasiKhusus
        .filter(item => new Date(item.tanggal).getMonth() + 1 === bulan)
        .reduce((total, item) => total + item.jumlah, 0);
      
      // Dari kotak amal masjid untuk bulan ini
      totalPemasukanBulan += pemasukanData.kotakAmalMasjid
        .filter(item => new Date(item.tanggal).getMonth() + 1 === bulan)
        .reduce((total, item) => total + item.jumlah, 0);

      // Hitung pengeluaran per bulan
      const totalPengeluaranBulan = pengeluaranData
        .filter((item: any) => new Date(item.tanggal).getMonth() + 1 === bulan)
        .reduce((total: number, item: any) => total + item.jumlah, 0);
      
      const saldoBulan = totalPemasukanBulan - totalPengeluaranBulan;

      return {
        bulan,
        namaBulan: namaBulan[index],
        totalPemasukan: totalPemasukanBulan,
        totalPengeluaran: totalPengeluaranBulan,
        saldo: saldoBulan
      };
    });

    return {
      tahun,
      totalPemasukan,
      totalPengeluaran,
      saldoAkhir,
      perBulan
    };
  } catch (error) {
    console.error("Error dalam getLaporanTahunanAction:", error);
    throw new Error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil laporan tahunan");
  }
}

// Action untuk mendapatkan ringkasan statistik
export async function getStatistikRingkasanAction(): Promise<{
  totalKeseluruhan: TotalLaporan;
  tahunIni: LaporanTahunan;
  bulanIni: {
    bulan: string;
    tahun: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    saldo: number;
  };
}> {
  try {
    const sekarang = new Date();
    const tahunSekarang = sekarang.getFullYear();
    const bulanSekarang = sekarang.getMonth() + 1;

    // Ambil total keseluruhan
    const totalKeseluruhan = await getTotalKeseluruhanAction();

    // Ambil laporan tahun ini
    const tahunIni = await getLaporanTahunanAction(tahunSekarang);

    // Ambil data bulan ini
    const bulanIniData = tahunIni.perBulan.find(b => b.bulan === bulanSekarang);
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const bulanIni = {
      bulan: namaBulan[bulanSekarang - 1],
      tahun: tahunSekarang,
      totalPemasukan: bulanIniData?.totalPemasukan || 0,
      totalPengeluaran: bulanIniData?.totalPengeluaran || 0,
      saldo: bulanIniData?.saldo || 0
    };

    return {
      totalKeseluruhan,
      tahunIni,
      bulanIni
    };
  } catch (error) {
    console.error("Error dalam getStatistikRingkasanAction:", error);
    throw new Error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil statistik ringkasan");
  }
}

// Action untuk revalidate laporan
export async function revalidateLaporanAction(): Promise<void> {
  revalidatePath("/laporan");
  revalidatePath("/dashboard");
}