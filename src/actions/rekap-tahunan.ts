// src/actions/rekap-tahunan.ts
"use server";

import {
  getRekapPemasukanTahunan,
  getRekapPengeluaranTahunan,
  getSaldoBulanan,
  getSaldoTahunan,
  RekapPemasukan,
  RekapPengeluaran
} from "@/lib/services/supabase/rekap-tahunan";

// Server Action untuk mendapatkan rekap pemasukan tahunan
export async function getRekapPemasukanAction(tahun: number): Promise<RekapPemasukan[]> {
  try {
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 10) {
      throw new Error("Tahun tidak valid");
    }

    const data = await getRekapPemasukanTahunan(tahun);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil rekap pemasukan:", error);
    throw new Error("Gagal mengambil data rekap pemasukan tahunan");
  }
}

// Server Action untuk mendapatkan rekap pengeluaran tahunan
export async function getRekapPengeluaranAction(tahun: number): Promise<RekapPengeluaran[]> {
  try {
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 10) {
      throw new Error("Tahun tidak valid");
    }

    const data = await getRekapPengeluaranTahunan(tahun);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil rekap pengeluaran:", error);
    throw new Error("Gagal mengambil data rekap pengeluaran tahunan");
  }
}

// Server Action untuk mendapatkan rekap lengkap (pemasukan + pengeluaran)
export async function getRekapLengkapAction(tahun: number): Promise<{
  pemasukan: RekapPemasukan[];
  pengeluaran: RekapPengeluaran[];
  saldoTahunan: number;
}> {
  try {
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 10) {
      throw new Error("Tahun tidak valid");
    }

    const [pemasukanData, pengeluaranData, saldoTahunan] = await Promise.all([
      getRekapPemasukanTahunan(tahun),
      getRekapPengeluaranTahunan(tahun),
      getSaldoTahunan(tahun)
    ]);

    return {
      pemasukan: pemasukanData,
      pengeluaran: pengeluaranData,
      saldoTahunan
    };
  } catch (error) {
    console.error("Server Action - Error mengambil rekap lengkap:", error);
    throw new Error("Gagal mengambil data rekap lengkap");
  }
}

// Server Action untuk mendapatkan saldo bulanan
export async function getSaldoBulananAction(tahun: number, bulan: number): Promise<number> {
  try {
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 10) {
      throw new Error("Tahun tidak valid");
    }

    if (!bulan || bulan < 1 || bulan > 12) {
      throw new Error("Bulan tidak valid (1-12)");
    }

    const saldo = await getSaldoBulanan(tahun, bulan);
    return saldo;
  } catch (error) {
    console.error("Server Action - Error mengambil saldo bulanan:", error);
    throw new Error("Gagal mengambil saldo bulanan");
  }
}

// Server Action untuk mendapatkan saldo tahunan
export async function getSaldoTahunanAction(tahun: number): Promise<number> {
  try {
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 10) {
      throw new Error("Tahun tidak valid");
    }

    const saldo = await getSaldoTahunan(tahun);
    return saldo;
  } catch (error) {
    console.error("Server Action - Error mengambil saldo tahunan:", error);
    throw new Error("Gagal mengambil saldo tahunan");
  }
}

// Server Action untuk mendapatkan rangkuman keuangan
export async function getRangkumanKeuanganAction(tahun: number): Promise<{
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoTahunan: number;
  pemasukanTertinggi: { sumber: string; jumlah: number; bulan: string } | null;
  pengeluaranTertinggi: { nama: string; jumlah: number; bulan: string } | null;
  trendBulanan: Array<{
    bulan: string;
    pemasukan: number;
    pengeluaran: number;
    saldo: number;
  }>;
}> {
  try {
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 10) {
      throw new Error("Tahun tidak valid");
    }

    const [pemasukanData, pengeluaranData] = await Promise.all([
      getRekapPemasukanTahunan(tahun),
      getRekapPengeluaranTahunan(tahun)
    ]);

    // Hitung total pemasukan dan pengeluaran
    const totalPemasukan = pemasukanData.reduce((sum, item) => sum + item.total, 0);
    const totalPengeluaran = pengeluaranData.reduce((sum, item) => sum + item.total, 0);
    const saldoTahunan = totalPemasukan - totalPengeluaran;

    // Cari pemasukan tertinggi
    let pemasukanTertinggi: { sumber: string; jumlah: number; bulan: string } | null = null;
    const bulanNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    
    pemasukanData.forEach(item => {
      bulanNames.forEach(bulan => {
        const jumlah = item[bulan as keyof typeof item] as number;
        if (!pemasukanTertinggi || jumlah > pemasukanTertinggi.jumlah) {
          pemasukanTertinggi = {
            sumber: item.sumber,
            jumlah,
            bulan: bulan.charAt(0).toUpperCase() + bulan.slice(1)
          };
        }
      });
    });

    // Cari pengeluaran tertinggi
    let pengeluaranTertinggi: { nama: string; jumlah: number; bulan: string } | null = null;
    
    pengeluaranData.forEach(item => {
      bulanNames.forEach(bulan => {
        const jumlah = item[bulan as keyof typeof item] as number;
        if (!pengeluaranTertinggi || jumlah > pengeluaranTertinggi.jumlah) {
          pengeluaranTertinggi = {
            nama: item.nama,
            jumlah,
            bulan: bulan.charAt(0).toUpperCase() + bulan.slice(1)
          };
        }
      });
    });

    // Buat trend bulanan
    const trendBulanan = bulanNames.map(bulan => {
      const pemasukanBulan = pemasukanData.reduce((sum, item) => 
        sum + (item[bulan as keyof typeof item] as number), 0
      );
      const pengeluaranBulan = pengeluaranData.reduce((sum, item) => 
        sum + (item[bulan as keyof typeof item] as number), 0
      );
      
      return {
        bulan: bulan.charAt(0).toUpperCase() + bulan.slice(1),
        pemasukan: pemasukanBulan,
        pengeluaran: pengeluaranBulan,
        saldo: pemasukanBulan - pengeluaranBulan
      };
    });

    return {
      totalPemasukan,
      totalPengeluaran,
      saldoTahunan,
      pemasukanTertinggi,
      pengeluaranTertinggi,
      trendBulanan
    };
  } catch (error) {
    console.error("Server Action - Error mengambil rangkuman keuangan:", error);
    throw new Error("Gagal mengambil rangkuman keuangan");
  }
}

// Server Action untuk export data rekap
export async function exportRekapDataAction(
  tahun: number,
  format: 'json' | 'csv' = 'json'
): Promise<{
  data: any;
  filename: string;
  mimeType: string;
}> {
  try {
    if (!tahun || tahun < 2000 || tahun > new Date().getFullYear() + 10) {
      throw new Error("Tahun tidak valid");
    }

    const rekapData = await getRekapLengkapAction(tahun);
    
    if (format === 'json') {
      return {
        data: JSON.stringify(rekapData, null, 2),
        filename: `rekap-keuangan-${tahun}.json`,
        mimeType: 'application/json'
      };
    } else {
      // Format CSV sederhana untuk pemasukan
      let csvContent = "REKAP PEMASUKAN\n";
      csvContent += "Sumber,Jan,Feb,Mar,Apr,Mei,Jun,Jul,Aug,Sep,Okt,Nov,Des,Total\n";
      
      rekapData.pemasukan.forEach(item => {
        csvContent += [
          item.sumber,
          item.jan, item.feb, item.mar, item.apr,
          item.mei, item.jun, item.jul, item.aug,
          item.sep, item.okt, item.nov, item.des,
          item.total
        ].join(',') + '\n';
      });

      csvContent += "\nREKAP PENGELUARAN\n";
      csvContent += "Nama,Jan,Feb,Mar,Apr,Mei,Jun,Jul,Aug,Sep,Okt,Nov,Des,Total\n";
      
      rekapData.pengeluaran.forEach(item => {
        csvContent += [
          item.nama,
          item.jan, item.feb, item.mar, item.apr,
          item.mei, item.jun, item.jul, item.aug,
          item.sep, item.okt, item.nov, item.des,
          item.total
        ].join(',') + '\n';
      });

      csvContent += `\nSALDO TAHUNAN,${rekapData.saldoTahunan}\n`;

      return {
        data: csvContent,
        filename: `rekap-keuangan-${tahun}.csv`,
        mimeType: 'text/csv'
      };
    }
  } catch (error) {
    console.error("Server Action - Error export rekap data:", error);
    throw new Error("Gagal export data rekap");
  }
}