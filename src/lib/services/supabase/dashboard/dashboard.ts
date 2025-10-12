// src/lib/services/supabase/dashboard/dashboard.ts
import { getPemasukanData } from "../pemasukan/pemasukan";
import { getPengeluaranTahunan } from "../pengeluaran/pengeluaran";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTotalKotakAmal } from "../kotak-amal";
import { getKotakAmalMasjidTahunan } from "../kotak-amal-masjid";
import { getTotalKontenPublished } from "../konten";

// Definisi enum SumberPemasukan
export const SUMBER_PEMASUKAN = [
  "DONATUR",
  "KOTAK_AMAL_LUAR",
  "KOTAK_AMAL_MASJID",
  "DONASI_KHUSUS",
  "LAINNYA",
] as const;

export type SumberPemasukan = (typeof SUMBER_PEMASUKAN)[number];

export async function getDashboardData(tahun: number, bulan: number) {
  try {
    const pemasukanData = await getPemasukanData({ tahun });
    // Calculate total from all sources
    let totalPemasukan = 0;
    totalPemasukan += pemasukanData.donatur.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    totalPemasukan += pemasukanData.kotakAmal.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    totalPemasukan += pemasukanData.donasiKhusus.reduce((total, item) => total + item.jumlah, 0);
    totalPemasukan += pemasukanData.kotakAmalMasjid.reduce((total, item) => total + item.jumlah, 0);
    const totalPengeluaran = await getPengeluaranTahunan(tahun);

    const jumlahDonatur = await getTotalDonatur(tahun);

    // Mendapatkan persentase pertumbuhan donatur dibanding bulan sebelumnya
    const pertumbuhanDonatur = await getPertumbuhanDonatur(tahun, bulan);

    // Mendapatkan total donasi bulan ini
    const donasiBulanan = await getDonasiBulanan(tahun, bulan);

    // Mendapatkan persentase pertumbuhan donasi dibanding bulan sebelumnya
    const pertumbuhanDonasi = await getPertumbuhanDonasi(tahun, bulan);

    // Mendapatkan total kotak amal dan kotak amal masjid
    const totalKotakAmal = await getTotalKotakAmal(tahun);
    const totalKotakAmalMasjid = await getKotakAmalMasjidTahunan(tahun);
    const totalGabunganKotakAmal = totalKotakAmal + totalKotakAmalMasjid;

    // Mendapatkan total konten yang dipublish
    const totalKontenPublished = await getTotalKontenPublished();

    const saldo = totalPemasukan - totalPengeluaran;

    // Mendapatkan pertumbuhan dana tahunan dan bulanan
    const pertumbuhanDanaTahunan = await getPertumbuhanDanaTahunan(tahun);
    const pertumbuhanDanaBulanan = await getPertumbuhanDanaBulanan(
      tahun,
      bulan
    );

    return {
      totalPemasukan,
      totalPengeluaran,
      saldo,
      jumlahDonatur,
      pertumbuhanDonatur,
      donasiBulanan,
      pertumbuhanDonasi,
      tahun,
      bulan,
      totalKotakAmal,
      totalKotakAmalMasjid,
      totalGabunganKotakAmal,
      totalKontenPublished,
      pertumbuhanDanaTahunan, // Menambahkan pertumbuhan dana tahunan (15.5%)
      pertumbuhanDanaBulanan, // Menambahkan pertumbuhan dana bulanan (2.3%)
    };
  } catch (error) {
    console.error("Error mengambil data dashboard:", error);
    throw new Error("Gagal mengambil data dashboard");
  }
}

// Fungsi untuk mendapatkan jumlah total donatur aktif pada tahun tertentu
async function getTotalDonatur(tahun: number): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient();

    const { count, error } = await supabase
      .from("Donatur")
      .select("*", { count: "exact", head: true })
      .eq("tahun", tahun);

    if (error) {
      console.error("Error mengambil jumlah donatur:", error);
      throw new Error("Gagal mengambil jumlah donatur");
    }

    return count || 0;
  } catch (error) {
    console.error("Error menghitung total donatur:", error);
    throw new Error("Gagal menghitung total donatur");
  }
}

// Fungsi untuk mendapatkan persentase pertumbuhan donatur
async function getPertumbuhanDonatur(
  tahun: number,
  bulanIni: number
): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient();

    // Menentukan bulan sebelumnya dan tahun sebelumnya
    let bulanSebelumnya = bulanIni - 1;
    let tahunSebelumnya = tahun;

    if (bulanSebelumnya === 0) {
      bulanSebelumnya = 12;
      tahunSebelumnya = tahun - 1;
    }

    // Nama kolom bulan sesuai database
    const namaBulan = getBulanName(bulanIni);
    const namaBulanSebelumnya = getBulanName(bulanSebelumnya);

    // Menghitung donatur aktif bulan ini (yang memiliki nilai donasi > 0)
    const { data: dataBulanIni, error: errorBulanIni } = await supabase
      .from("Donatur")
      .select("id")
      .eq("tahun", tahun)
      .gt(namaBulan, 0);

    if (errorBulanIni) throw errorBulanIni;

    // Menghitung donatur aktif bulan sebelumnya
    const { data: dataBulanSebelumnya, error: errorSebelumnya } = await supabase
      .from("Donatur")
      .select("id")
      .eq("tahun", tahunSebelumnya)
      .gt(namaBulanSebelumnya, 0);

    if (errorSebelumnya) throw errorSebelumnya;

    const donaturBulanIni = dataBulanIni ? dataBulanIni.length : 0;
    const donaturBulanSebelumnya = dataBulanSebelumnya
      ? dataBulanSebelumnya.length
      : 0;

    // Menghitung persentase pertumbuhan
    if (donaturBulanSebelumnya === 0) return 100; // Jika sebelumnya 0, pertumbuhan 100%

    return parseFloat(
      (
        ((donaturBulanIni - donaturBulanSebelumnya) / donaturBulanSebelumnya) *
        100
      ).toFixed(1)
    );
  } catch (error) {
    console.error("Error menghitung pertumbuhan donatur:", error);
    return 0;
  }
}

// Fungsi untuk mendapatkan total donasi bulanan
export async function getDonasiBulanan(tahun: number, bulan: number): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient();
    const namaBulan = getBulanName(bulan);

    const { data, error } = await supabase
      .from("Donatur")
      .select(namaBulan)
      .eq("tahun", tahun);

    if (error) throw error;

    // Jumlahkan semua donasi bulan ini
    return data.reduce((total, item) => {
      return total + ((item[namaBulan as keyof typeof item] as number) || 0);
    }, 0);
  } catch (error) {
    console.error("Error menghitung donasi bulanan:", error);
    return 0;
  }
}

// Fungsi untuk mendapatkan persentase pertumbuhan donasi
export async function getPertumbuhanDonasi(
  tahun: number,
  bulanIni: number
): Promise<number> {
  try {
    // Menentukan bulan sebelumnya dan tahun sebelumnya
    let bulanSebelumnya = bulanIni - 1;
    let tahunSebelumnya = tahun;

    if (bulanSebelumnya === 0) {
      bulanSebelumnya = 12;
      tahunSebelumnya = tahun - 1;
    }

    const donasiBulanIni = await getDonasiBulanan(tahun, bulanIni);
    const donasiBulanSebelumnya = await getDonasiBulanan(
      tahunSebelumnya,
      bulanSebelumnya
    );

    // Menghitung persentase pertumbuhan
    if (donasiBulanSebelumnya === 0) return 100; // Jika sebelumnya 0, pertumbuhan 100%

    return parseFloat(
      (
        ((donasiBulanIni - donasiBulanSebelumnya) / donasiBulanSebelumnya) *
        100
      ).toFixed(1)
    );
  } catch (error) {
    console.error("Error menghitung pertumbuhan donasi:", error);
    return 0;
  }
}

// Fungsi helper untuk mendapatkan nama bulan dalam format database
function getBulanName(bulan: number): string {
  const bulanMap: Record<number, string> = {
    1: "jan",
    2: "feb",
    3: "mar",
    4: "apr",
    5: "mei",
    6: "jun",
    7: "jul",
    8: "aug",
    9: "sep",
    10: "okt",
    11: "nov",
    12: "des",
  };

  return bulanMap[bulan] || "jan";
}

// Fungsi untuk menghitung pertumbuhan dana tahunan
async function getPertumbuhanDanaTahunan(tahun: number): Promise<number> {
  try {
    // Ambil total pemasukan tahun ini dan tahun lalu
    // Get data for current and previous year
    const [pemasukanDataIni, pemasukanDataLalu] = await Promise.all([
      getPemasukanData({ tahun }),
      getPemasukanData({ tahun: tahun - 1 })
    ]);
    
    // Calculate totals for current year
    let pemasukanTahunIni = 0;
    pemasukanTahunIni += pemasukanDataIni.donatur.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    pemasukanTahunIni += pemasukanDataIni.kotakAmal.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    pemasukanTahunIni += pemasukanDataIni.donasiKhusus.reduce((total, item) => total + item.jumlah, 0);
    pemasukanTahunIni += pemasukanDataIni.kotakAmalMasjid.reduce((total, item) => total + item.jumlah, 0);
    
    // Calculate totals for previous year
    let pemasukanTahunLalu = 0;
    pemasukanTahunLalu += pemasukanDataLalu.donatur.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    pemasukanTahunLalu += pemasukanDataLalu.kotakAmal.reduce((total, item) => {
      return total + (item.jan || 0) + (item.feb || 0) + (item.mar || 0) + (item.apr || 0) +
             (item.mei || 0) + (item.jun || 0) + (item.jul || 0) + (item.aug || 0) +
             (item.sep || 0) + (item.okt || 0) + (item.nov || 0) + (item.des || 0);
    }, 0);
    pemasukanTahunLalu += pemasukanDataLalu.donasiKhusus.reduce((total, item) => total + item.jumlah, 0);
    pemasukanTahunLalu += pemasukanDataLalu.kotakAmalMasjid.reduce((total, item) => total + item.jumlah, 0);

    // Jika tahun lalu tidak ada data, return 100% (pertumbuhan penuh)
    if (pemasukanTahunLalu === 0) return 100;

    // Hitung persentase pertumbuhan
    return parseFloat(
      (
        ((pemasukanTahunIni - pemasukanTahunLalu) / pemasukanTahunLalu) *
        100
      ).toFixed(1)
    );
  } catch (error) {
    console.error("Error menghitung pertumbuhan dana tahunan:", error);
    return 0;
  }
}

// Fungsi untuk menghitung pertumbuhan dana bulanan
async function getPertumbuhanDanaBulanan(
  tahun: number,
  bulanIni: number
): Promise<number> {
  try {
    // Tentukan bulan dan tahun sebelumnya
    let bulanSebelumnya = bulanIni - 1;
    let tahunSebelumnya = tahun;

    if (bulanSebelumnya === 0) {
      bulanSebelumnya = 12;
      tahunSebelumnya = tahun - 1;
    }

    const pemasukanBulanIni = await getDonasiBulanan(tahun, bulanIni);
    const pemasukanBulanLalu = await getDonasiBulanan(
      tahunSebelumnya,
      bulanSebelumnya
    );

    if (pemasukanBulanLalu === 0) return 100;

    return parseFloat(
      (
        ((pemasukanBulanIni - pemasukanBulanLalu) / pemasukanBulanLalu) *
        100
      ).toFixed(1)
    );
  } catch (error) {
    console.error("Error menghitung pertumbuhan dana bulanan:", error);
    return 0;
  }
}
