// src/lib/services/supabase/rekap-tahunan.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPemasukanBulanan } from "./pemasukan/pemasukan";
import { getPengeluaranBulanan } from "./pengeluaran/pengeluaran";

export interface RekapPemasukan {
  id: number;
  sumber:
    | "DONATUR"
    | "KOTAK_AMAL_LUAR"
    | "KOTAK_AMAL_MASJID"
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

function getMonthDateRange(tahun: number, bulan: number) {
  const start = new Date(tahun, bulan - 1, 1);
  const end = new Date(tahun, bulan, 0);

  return {
    startStr: start.toISOString().split("T")[0],
    endStr: end.toISOString().split("T")[0],
  };
}

type BulanKey =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "mei"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "okt"
  | "nov"
  | "des";

const bulanToProperty: Record<number, BulanKey> = {
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

export async function getRekapPemasukanTahunan(
  tahun: number
): Promise<RekapPemasukan[]> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: sumberArray, error: sumberError } = await supabase
      .from("Pemasukan")
      .select("sumber")
      .eq("tahun", tahun);

    if (sumberError) throw sumberError;

    const uniqueSumber = [...new Set(sumberArray?.map((item) => item.sumber))];

    console.log("Sumber unik yang ditemukan:", uniqueSumber);

    if (!uniqueSumber.length) {
      console.log(`Tidak ada data pemasukan untuk tahun ${tahun}`);
      return [];
    }

    const rekapData: RekapPemasukan[] = [];

    const { count, error: countError } = await supabase
      .from("Pemasukan")
      .select("*", { count: "exact", head: true })
      .eq("tahun", tahun);

    if (countError) throw countError;

    if (count === 0) {
      console.log(`Tidak ada data pemasukan untuk tahun ${tahun}`);
      return [];
    }

    for (let i = 0; i < uniqueSumber.length; i++) {
      const sumberValue = uniqueSumber[i];
      const validSumber = [
        "DONATUR",
        "KOTAK_AMAL_LUAR",
        "KOTAK_AMAL_MASJID",
        "DONASI_KHUSUS",
        "LAINNYA",
      ].includes(sumberValue)
        ? (sumberValue as
            | "DONATUR"
            | "KOTAK_AMAL_LUAR"
            | "KOTAK_AMAL_MASJID"
            | "DONASI_KHUSUS"
            | "LAINNYA")
        : "LAINNYA";

      const rekap: RekapPemasukan = {
        id: i + 1,
        sumber: validSumber,
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

      for (let bulan = 1; bulan <= 12; bulan++) {
        const { startStr, endStr } = getMonthDateRange(tahun, bulan);

        try {
          const { data: bulananData, error: bulananError } = await supabase
            .from("Pemasukan")
            .select("jumlah")
            .eq("tahun", tahun)
            .eq("sumber", sumberValue)
            .gte("tanggal", startStr)
            .lte("tanggal", endStr);

          if (bulananError) {
            console.error(
              `Error saat mengambil data bulan ${bulan} untuk sumber ${sumberValue}:`,
              bulananError
            );
            throw bulananError;
          }

          console.log(
            `Data bulan ${bulan} untuk sumber ${sumberValue}:`,
            bulananData?.length || 0,
            "item"
          );

          const totalBulan =
            bulananData?.reduce((sum, item) => sum + item.jumlah, 0) || 0;
          const bulanKey = bulanToProperty[bulan];
          rekap[bulanKey] = totalBulan;
          rekap.total += totalBulan;
        } catch (err) {
          console.error(`Error pada bulan ${bulan}:`, err);
        }
      }

      rekapData.push(rekap);
    }

    return rekapData;
  } catch (error: any) {
    console.error("Error membuat rekap pemasukan tahunan:", error);
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
    const { data: namaArray, error: namaError } = await supabase
      .from("Pengeluaran")
      .select("nama")
      .eq("tahun", tahun);

    if (namaError) throw namaError;

    const uniqueNama = [...new Set(namaArray?.map((item) => item.nama))];

    console.log("Nama pengeluaran unik yang ditemukan:", uniqueNama);

    if (!uniqueNama.length) {
      console.log(`Tidak ada data pengeluaran untuk tahun ${tahun}`);
      return [];
    }

    const rekapData: RekapPengeluaran[] = [];

    for (let i = 0; i < uniqueNama.length; i++) {
      const nama = uniqueNama[i];

      const rekap: RekapPengeluaran = {
        id: i + 1,
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

      for (let bulan = 1; bulan <= 12; bulan++) {
        const { startStr, endStr } = getMonthDateRange(tahun, bulan);

        try {
          const { data: bulananData, error: bulananError } = await supabase
            .from("Pengeluaran")
            .select("jumlah")
            .eq("tahun", tahun)
            .eq("nama", nama)
            .gte("tanggal", startStr)
            .lte("tanggal", endStr);

          if (bulananError) {
            console.error(
              `Error saat mengambil data bulan ${bulan} untuk nama ${nama}:`,
              bulananError
            );
            throw bulananError;
          }

          console.log(
            `Data bulan ${bulan} untuk nama ${nama}:`,
            bulananData?.length || 0,
            "item"
          );

          const totalBulan =
            bulananData?.reduce((sum, item) => sum + item.jumlah, 0) || 0;
          const bulanKey = bulanToProperty[bulan];
          rekap[bulanKey] = totalBulan;
          rekap.total += totalBulan;
        } catch (err) {
          console.error(`Error pada bulan ${bulan}:`, err);
        }
      }

      rekapData.push(rekap);
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
  const supabase = await createServerSupabaseClient();

  try {
    const { data: pemasukanData, error: pemasukanError } = await supabase
      .from("Pemasukan")
      .select("jumlah")
      .eq("tahun", tahun);

    if (pemasukanError) throw pemasukanError;

    const { data: pengeluaranData, error: pengeluaranError } = await supabase
      .from("Pengeluaran")
      .select("jumlah")
      .eq("tahun", tahun);

    if (pengeluaranError) throw pengeluaranError;

    const totalPemasukan =
      pemasukanData?.reduce((sum, item) => sum + item.jumlah, 0) || 0;
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
