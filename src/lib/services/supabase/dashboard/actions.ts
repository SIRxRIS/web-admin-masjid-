// src/lib/supabase/dashboard/actions.ts
"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

// Fungsi untuk mendapatkan total donasi bulanan - diimpor dari kode yang sudah ada
export async function getDonasiBulananAction(
  tahun: number,
  bulan: number
): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient();
    const namaBulan = getBulanNameAction(bulan);

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

// Fungsi helper untuk mendapatkan nama bulan dalam format database
function getBulanNameAction(bulan: number): string {
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

// Mengekspos fungsi dashboard lainnya yang mungkin diperlukan
export async function getDashboardDataLegacy(tahun: number, bulan: number) {
  try {
    // Mendapatkan total donasi bulan ini
    const donasiBulanan = await getDonasiBulananAction(tahun, bulan);

    // Mendapatkan persentase pertumbuhan donasi dibanding bulan sebelumnya
    const pertumbuhanDonasi = await getPertumbuhanDonasiLegacy(tahun, bulan);

    // Tambahkan data lain yang diperlukan dari dashboard.ts sesuai kebutuhan

    return {
      donasiBulanan,
      pertumbuhanDonasi,
      tahun,
      bulan,
    };
  } catch (error) {
    console.error("Error mengambil data dashboard:", error);
    throw new Error("Gagal mengambil data dashboard");
  }
}

// Fungsi untuk mendapatkan persentase pertumbuhan donasi (legacy)
async function getPertumbuhanDonasiLegacy(
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

    const donasiBulanIni = await getDonasiBulananAction(tahun, bulanIni);
    const donasiBulanSebelumnya = await getDonasiBulananAction(
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
