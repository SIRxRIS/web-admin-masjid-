// src/lib/services/supabase/rekap-tahunan.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPengeluaranBulanan } from "./pengeluaran/pengeluaran";

export interface RekapPemasukan {
  id: number;
  sumber:
    | "DONATUR"
    | "KOTAK_AMAL_LUAR"
    | "KOTAK_AMAL_MASJID"
    | "KOTAK_AMAL_JUMAT"
    | "DONASI_KHUSUS"
    | "LAINNYA";
  tahun: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  okt: number;
  nov: number;
  des: number;
  total: number;
}

export interface RekapPengeluaran {
  id: number;
  nama: string;
  tahun: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  okt: number;
  nov: number;
  des: number;
  total: number;
}

// Helper function untuk menghitung total dari data bulanan
function calculateMonthlyTotal(data: Record<string, number>): number {
  return (data.jan || 0) + (data.feb || 0) + (data.mar || 0) + (data.apr || 0) +
         (data.mei || 0) + (data.jun || 0) + (data.jul || 0) + (data.aug || 0) +
         (data.sep || 0) + (data.okt || 0) + (data.nov || 0) + (data.des || 0);
}

// Helper function untuk menghitung total bulanan dari data dengan tanggal
function calculateMonthlyFromDate(data: any[], tahun: number): Record<string, number> {
  const monthlyData: Record<string, number> = {
    jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
  };

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 
                     'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

  data.forEach(item => {
    const date = new Date(item.tanggal);
    if (date.getFullYear() === tahun) {
      const monthIndex = date.getMonth();
      const monthKey = monthNames[monthIndex];
      monthlyData[monthKey] += item.jumlah || 0;
    }
  });

  return monthlyData;
}

export async function getRekapPemasukanTahunan(
  tahun: number
): Promise<RekapPemasukan[]> {
  const supabase = await createServerSupabaseClient();

  try {
    console.log(`🔍 Mengambil data pemasukan untuk tahun: ${tahun}`);
    
    // 1. Ambil data dari tabel Donatur
    const { data: donaturData, error: donaturError } = await supabase
      .from("Donatur")
      .select("*")
      .eq("tahun", tahun);

    if (donaturError) {
      console.error("❌ Error mengambil data donatur:", donaturError);
    }

    // 2. Ambil data dari tabel KotakAmal (KOTAK_AMAL_LUAR)
    const { data: kotakAmalData, error: kotakAmalError } = await supabase
      .from("KotakAmal")
      .select("*")
      .eq("tahun", tahun);

    if (kotakAmalError) {
      console.error("❌ Error mengambil data kotak amal:", kotakAmalError);
    }

    // 3. Ambil data dari tabel KotakAmalMasjid
    const { data: kotakAmalMasjidData, error: kotakAmalMasjidError } = await supabase
      .from("KotakAmalMasjid")
      .select("*")
      .eq("tahun", tahun);

    if (kotakAmalMasjidError) {
      console.error("❌ Error mengambil data kotak amal masjid:", kotakAmalMasjidError);
    }

    // 4. Ambil data dari tabel KotakAmalJumat
    const { data: kotakAmalJumatData, error: kotakAmalJumatError } = await supabase
      .from("KotakAmalJumat")
      .select("*")
      .eq("tahun", tahun);

    if (kotakAmalJumatError) {
      console.error("❌ Error mengambil data kotak amal jumat:", kotakAmalJumatError);
    }

    // 5. Ambil data dari tabel DonasiKhusus
    const { data: donasiKhususData, error: donasiKhususError } = await supabase
      .from("DonasiKhusus")
      .select("*")
      .eq("tahun", tahun);

    if (donasiKhususError) {
      console.error("❌ Error mengambil data donasi khusus:", donasiKhususError);
    }

    const rekapData: RekapPemasukan[] = [];
    let idCounter = 1;

    // 5. Proses data DONATUR
    if (donaturData && donaturData.length > 0) {
      const totalDonatur: Record<string, number> = {
        jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
        jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
      };

      donaturData.forEach(donatur => {
        totalDonatur.jan += donatur.jan || 0;
        totalDonatur.feb += donatur.feb || 0;
        totalDonatur.mar += donatur.mar || 0;
        totalDonatur.apr += donatur.apr || 0;
        totalDonatur.mei += donatur.mei || 0;
        totalDonatur.jun += donatur.jun || 0;
        totalDonatur.jul += donatur.jul || 0;
        totalDonatur.aug += donatur.aug || 0;
        totalDonatur.sep += donatur.sep || 0;
        totalDonatur.okt += donatur.okt || 0;
        totalDonatur.nov += donatur.nov || 0;
        totalDonatur.des += donatur.des || 0;
      });

      const totalDonaturAmount = calculateMonthlyTotal(totalDonatur);

      if (totalDonaturAmount > 0) {
        rekapData.push({
          id: idCounter++,
          sumber: "DONATUR",
          tahun: tahun,
          jan: totalDonatur.jan,
          feb: totalDonatur.feb,
          mar: totalDonatur.mar,
          apr: totalDonatur.apr,
          mei: totalDonatur.mei,
          jun: totalDonatur.jun,
          jul: totalDonatur.jul,
          aug: totalDonatur.aug,
          sep: totalDonatur.sep,
          okt: totalDonatur.okt,
          nov: totalDonatur.nov,
          des: totalDonatur.des,
          total: totalDonaturAmount
        });
      }
    }

    // 6. Proses data KOTAK_AMAL_LUAR
    if (kotakAmalData && kotakAmalData.length > 0) {
      const totalKotakAmal: Record<string, number> = {
        jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
        jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
      };

      kotakAmalData.forEach(kotak => {
        totalKotakAmal.jan += kotak.jan || 0;
        totalKotakAmal.feb += kotak.feb || 0;
        totalKotakAmal.mar += kotak.mar || 0;
        totalKotakAmal.apr += kotak.apr || 0;
        totalKotakAmal.mei += kotak.mei || 0;
        totalKotakAmal.jun += kotak.jun || 0;
        totalKotakAmal.jul += kotak.jul || 0;
        totalKotakAmal.aug += kotak.aug || 0;
        totalKotakAmal.sep += kotak.sep || 0;
        totalKotakAmal.okt += kotak.okt || 0;
        totalKotakAmal.nov += kotak.nov || 0;
        totalKotakAmal.des += kotak.des || 0;
      });

      const totalKotakAmalAmount = calculateMonthlyTotal(totalKotakAmal);

      if (totalKotakAmalAmount > 0) {
        rekapData.push({
          id: idCounter++,
          sumber: "KOTAK_AMAL_LUAR",
          tahun: tahun,
          jan: totalKotakAmal.jan,
          feb: totalKotakAmal.feb,
          mar: totalKotakAmal.mar,
          apr: totalKotakAmal.apr,
          mei: totalKotakAmal.mei,
          jun: totalKotakAmal.jun,
          jul: totalKotakAmal.jul,
          aug: totalKotakAmal.aug,
          sep: totalKotakAmal.sep,
          okt: totalKotakAmal.okt,
          nov: totalKotakAmal.nov,
          des: totalKotakAmal.des,
          total: totalKotakAmalAmount
        });
      }
    }

    // 7. Proses data KOTAK_AMAL_MASJID
    if (kotakAmalMasjidData && kotakAmalMasjidData.length > 0) {
      const monthlyKotakMasjid = calculateMonthlyFromDate(kotakAmalMasjidData, tahun);
      const totalKotakMasjidAmount = calculateMonthlyTotal(monthlyKotakMasjid);

      if (totalKotakMasjidAmount > 0) {
        rekapData.push({
          id: idCounter++,
          sumber: "KOTAK_AMAL_MASJID",
          tahun: tahun,
          jan: monthlyKotakMasjid.jan,
          feb: monthlyKotakMasjid.feb,
          mar: monthlyKotakMasjid.mar,
          apr: monthlyKotakMasjid.apr,
          mei: monthlyKotakMasjid.mei,
          jun: monthlyKotakMasjid.jun,
          jul: monthlyKotakMasjid.jul,
          aug: monthlyKotakMasjid.aug,
          sep: monthlyKotakMasjid.sep,
          okt: monthlyKotakMasjid.okt,
          nov: monthlyKotakMasjid.nov,
          des: monthlyKotakMasjid.des,
          total: totalKotakMasjidAmount
        });
      }
    }

    // 8. Proses data KOTAK_AMAL_JUMAT
    if (kotakAmalJumatData && kotakAmalJumatData.length > 0) {
      const monthlyKotakJumat = calculateMonthlyFromDate(kotakAmalJumatData, tahun);
      const totalKotakJumatAmount = calculateMonthlyTotal(monthlyKotakJumat);

      if (totalKotakJumatAmount > 0) {
        rekapData.push({
          id: idCounter++,
          sumber: "KOTAK_AMAL_JUMAT",
          tahun: tahun,
          jan: monthlyKotakJumat.jan,
          feb: monthlyKotakJumat.feb,
          mar: monthlyKotakJumat.mar,
          apr: monthlyKotakJumat.apr,
          mei: monthlyKotakJumat.mei,
          jun: monthlyKotakJumat.jun,
          jul: monthlyKotakJumat.jul,
          aug: monthlyKotakJumat.aug,
          sep: monthlyKotakJumat.sep,
          okt: monthlyKotakJumat.okt,
          nov: monthlyKotakJumat.nov,
          des: monthlyKotakJumat.des,
          total: totalKotakJumatAmount
        });
      }
    }

    // 9. Proses data DONASI_KHUSUS
    if (donasiKhususData && donasiKhususData.length > 0) {
      const monthlyDonasiKhusus = calculateMonthlyFromDate(donasiKhususData, tahun);
      const totalDonasiKhususAmount = calculateMonthlyTotal(monthlyDonasiKhusus);

      if (totalDonasiKhususAmount > 0) {
        rekapData.push({
          id: idCounter++,
          sumber: "DONASI_KHUSUS",
          tahun: tahun,
          jan: monthlyDonasiKhusus.jan,
          feb: monthlyDonasiKhusus.feb,
          mar: monthlyDonasiKhusus.mar,
          apr: monthlyDonasiKhusus.apr,
          mei: monthlyDonasiKhusus.mei,
          jun: monthlyDonasiKhusus.jun,
          jul: monthlyDonasiKhusus.jul,
          aug: monthlyDonasiKhusus.aug,
          sep: monthlyDonasiKhusus.sep,
          okt: monthlyDonasiKhusus.okt,
          nov: monthlyDonasiKhusus.nov,
          des: monthlyDonasiKhusus.des,
          total: totalDonasiKhususAmount
        });
      }
    }

    console.log(`✅ Berhasil mengambil ${rekapData.length} sumber pemasukan untuk tahun ${tahun}`);
    
    // Log detail untuk debugging
    rekapData.forEach(item => {
      console.log(`📊 ${item.sumber}: Rp ${item.total.toLocaleString('id-ID')}`);
    });

    return rekapData;

  } catch (error: any) {
    console.error("❌ Error membuat rekap pemasukan tahunan:", error);
    throw new Error(
      `Gagal membuat rekap pemasukan tahunan: ${
        error.message || "Unknown error"
      }`
    );
  }
}

export async function getRekapPengeluaranTahunan(
  tahun: number
): Promise<RekapPengeluaran[]> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: allPengeluaranData, error: pengeluaranError } = await supabase
      .from("Pengeluaran")
      .select("nama, tanggal, jumlah")
      .eq("tahun", tahun);

    if (pengeluaranError) throw pengeluaranError;

    if (!allPengeluaranData || allPengeluaranData.length === 0) {
      console.log(`Tidak ada data pengeluaran untuk tahun ${tahun}`);
      return [];
    }

    const uniqueNama = [...new Set(allPengeluaranData.map((item) => item.nama))];
    console.log("Nama pengeluaran unik yang ditemukan:", uniqueNama);

    const rekapData: RekapPengeluaran[] = [];
    let idCounter = 1;

    for (const nama of uniqueNama) {
      const itemsForNama = allPengeluaranData.filter(item => item.nama === nama);
      
      const rekap: RekapPengeluaran = {
        id: idCounter++,
        nama: nama,
        tahun: tahun,
        jan: 0,
        feb: 0,
        mar: 0,
        apr: 0,
        mei: 0,
        jun: 0,
        jul: 0,
        aug: 0,
        sep: 0,
        okt: 0,
        nov: 0,
        des: 0,
        total: 0,
      };

      const monthlyData = calculateMonthlyFromDate(itemsForNama, tahun);
      
      rekap.jan = monthlyData.jan;
      rekap.feb = monthlyData.feb;
      rekap.mar = monthlyData.mar;
      rekap.apr = monthlyData.apr;
      rekap.mei = monthlyData.mei;
      rekap.jun = monthlyData.jun;
      rekap.jul = monthlyData.jul;
      rekap.aug = monthlyData.aug;
      rekap.sep = monthlyData.sep;
      rekap.okt = monthlyData.okt;
      rekap.nov = monthlyData.nov;
      rekap.des = monthlyData.des;
      rekap.total = calculateMonthlyTotal(monthlyData);

      if (rekap.total > 0) {
        rekapData.push(rekap);
      }
    }

    return rekapData;
  } catch (error: any) {
    console.error("Error membuat rekap pengeluaran tahunan:", error);
    throw new Error(
      `Gagal membuat rekap pengeluaran tahunan: ${
        error.message || "Unknown error"
      }`
    );
  }
}

// Fungsi helper untuk mendapatkan total pemasukan bulanan dari semua sumber
export async function getPemasukanBulanan(
  tahun: number,
  bulan: number
): Promise<number> {
  const supabase = await createServerSupabaseClient();

  try {
    let totalPemasukan = 0;

    // 1. Dari tabel Donatur
    const { data: donaturData } = await supabase
      .from("Donatur")
      .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
      .eq("tahun", tahun);

    if (donaturData) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 
                         'jul', 'aug', 'sep', 'okt', 'nov', 'des'] as const;
      const monthKey = monthNames[bulan - 1];
      
      donaturData.forEach(donatur => {
        totalPemasukan += donatur[monthKey] || 0;
      });
    }

    // 2. Dari tabel KotakAmal
    const { data: kotakAmalData } = await supabase
      .from("KotakAmal")
      .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
      .eq("tahun", tahun);

    if (kotakAmalData) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 
                         'jul', 'aug', 'sep', 'okt', 'nov', 'des'] as const;
      const monthKey = monthNames[bulan - 1];
      
      kotakAmalData.forEach(kotak => {
        totalPemasukan += kotak[monthKey] || 0;
      });
    }

    // 3. Dari tabel KotakAmalMasjid
    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0);
    
    const { data: kotakMasjidData } = await supabase
      .from("KotakAmalMasjid")
      .select("jumlah")
      .eq("tahun", tahun)
      .gte("tanggal", startDate.toISOString().split("T")[0])
      .lte("tanggal", endDate.toISOString().split("T")[0]);

    if (kotakMasjidData) {
      kotakMasjidData.forEach(item => {
        totalPemasukan += item.jumlah || 0;
      });
    }

    // 4. Dari tabel DonasiKhusus
    const { data: donasiKhususData } = await supabase
      .from("DonasiKhusus")
      .select("jumlah")
      .eq("tahun", tahun)
      .gte("tanggal", startDate.toISOString().split("T")[0])
      .lte("tanggal", endDate.toISOString().split("T")[0]);

    if (donasiKhususData) {
      donasiKhususData.forEach(item => {
        totalPemasukan += item.jumlah || 0;
      });
    }

    return totalPemasukan;

  } catch (error: any) {
    console.error("Error menghitung pemasukan bulanan:", error);
    throw new Error(`Gagal menghitung pemasukan bulanan: ${error.message}`);
  }
}

// Fungsi helper untuk mendapatkan total pemasukan tahunan dari semua sumber
export async function getPemasukanTahunan(tahun: number): Promise<number> {
  try {
    const rekapData = await getRekapPemasukanTahunan(tahun);
    return rekapData.reduce((total, item) => total + item.total, 0);
  } catch (error: any) {
    console.error("Error menghitung pemasukan tahunan:", error);
    throw new Error(`Gagal menghitung pemasukan tahunan: ${error.message}`);
  }
}

export async function getSaldoBulanan(
  tahun: number,
  bulan: number
): Promise<number> {
  try {
    const totalPemasukan = await getPemasukanBulanan(tahun, bulan);
    const totalPengeluaran = await getPengeluaranBulanan(tahun, bulan);

    return totalPemasukan - totalPengeluaran;
  } catch (error: any) {
    console.error("Error menghitung saldo bulanan:", error);
    throw new Error(
      `Gagal menghitung saldo bulanan: ${error.message || "Unknown error"}`
    );
  }
}

export async function getSaldoTahunan(tahun: number): Promise<number> {
  try {
    const totalPemasukan = await getPemasukanTahunan(tahun);
    
    const supabase = await createServerSupabaseClient();
    const { data: pengeluaranData, error: pengeluaranError } = await supabase
      .from("Pengeluaran")
      .select("jumlah")
      .eq("tahun", tahun);

    if (pengeluaranError) throw pengeluaranError;

    const totalPengeluaran =
      pengeluaranData?.reduce((sum, item) => sum + item.jumlah, 0) || 0;

    return totalPemasukan - totalPengeluaran;
  } catch (error: any) {
    console.error("Error menghitung saldo tahunan:", error);
    throw new Error(
      `Gagal menghitung saldo tahunan: ${error.message || "Unknown error"}`
    );
  }
}
