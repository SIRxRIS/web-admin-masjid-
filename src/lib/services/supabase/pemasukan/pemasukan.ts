// src/lib/services/supabase/pemasukan/pemasukan.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type Pemasukan } from "@prisma/client";

// Definisi enum SumberPemasukan
export const SUMBER_PEMASUKAN = [
  "DONATUR",
  "KOTAK_AMAL_LUAR",
  "KOTAK_AMAL_MASJID",
  "DONASI_KHUSUS",
  "LAINNYA",
] as const;

export type SumberPemasukan = (typeof SUMBER_PEMASUKAN)[number];

export async function getPemasukanData(
  tahunFilter?: number
): Promise<Pemasukan[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("Pemasukan")
    .select("*")
    .order("tanggal", { ascending: false });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data pemasukan:", error);
    throw new Error("Gagal mengambil data pemasukan");
  }

  return data || [];
}

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return [...new Set(data.map((item) => item.tahun))];
}

export async function getPemasukanById(id: number): Promise<Pemasukan | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data pemasukan:", error);
    throw new Error("Gagal mengambil data pemasukan");
  }

  return data;
}

export async function createPemasukan(
  pemasukan: Omit<Pemasukan, "id" | "createdAt" | "updatedAt">
): Promise<Pemasukan> {
  const supabase = await createServerSupabaseClient();

  // Validasi sumber pemasukan
  if (!SUMBER_PEMASUKAN.includes(pemasukan.sumber as any)) {
    throw new Error("Sumber pemasukan tidak valid");
  }

  const { data, error } = await supabase
    .from("Pemasukan")
    .insert([pemasukan])
    .select()
    .single();

  if (error) {
    console.error("Error membuat pemasukan:", error);
    throw new Error("Gagal membuat pemasukan");
  }

  return data;
}

export async function updatePemasukan(
  id: number,
  pemasukan: Partial<Omit<Pemasukan, "id" | "createdAt" | "updatedAt">>
): Promise<Pemasukan> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .update(pemasukan)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate pemasukan:", error);
    throw new Error("Gagal mengupdate pemasukan");
  }

  return data;
}

export async function deletePemasukan(id: number): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase.from("Pemasukan").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error menghapus pemasukan:", error);
    throw new Error("Gagal menghapus pemasukan");
  }
}

export async function getPemasukanBulanan(
  tahun: number,
  bulan: number
): Promise<number> {
  const supabase = await createServerSupabaseClient();

  // Gunakan metode yang benar untuk menentukan tanggal awal dan akhir bulan
  const start = new Date(tahun, bulan - 1, 1);
  const end = new Date(tahun, bulan, 0); // Hari terakhir bulan

  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("jumlah")
    .gte("tanggal", startStr)
    .lte("tanggal", endStr); // Gunakan lte untuk mencakup hari terakhir

  if (error) {
    console.error("Error mengambil total pemasukan bulanan:", error);
    throw new Error("Gagal mengambil total pemasukan bulanan");
  }

  return data?.reduce((total, item) => total + item.jumlah, 0) || 0;
}

export async function getPemasukanTahunan(tahun: number): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("jumlah")
    .gte("tanggal", `${tahun}-01-01`)
    .lt("tanggal", `${tahun + 1}-01-01`);

  if (error) {
    console.error("Error mengambil total pemasukan tahunan:", error);
    throw new Error("Gagal mengambil total pemasukan tahunan");
  }

  return data?.reduce((total, item) => total + item.jumlah, 0) || 0;
}

export async function getPemasukanBySumber(
  tahun: number,
  sumber: string
): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("jumlah")
    .eq("tahun", tahun)
    .eq("sumber", sumber);

  if (error) {
    console.error(`Error mengambil pemasukan dari sumber ${sumber}:`, error);
    throw new Error(`Gagal mengambil pemasukan dari sumber ${sumber}`);
  }

  return data?.reduce((total, item) => total + item.jumlah, 0) || 0;
}

export async function getPemasukanByDonatur(
  donaturId: number
): Promise<Pemasukan[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("*")
    .eq("donaturId", donaturId)
    .order("tanggal", { ascending: false });

  if (error) {
    console.error("Error mengambil pemasukan berdasarkan donatur:", error);
    throw new Error("Gagal mengambil pemasukan berdasarkan donatur");
  }

  return data || [];
}

export async function getPemasukanByDonaturWithDetail(
  donaturId: number
): Promise<any[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select(
      `
      *,
      donatur:Donatur(id, nama, alamat)
    `
    )
    .eq("donaturId", donaturId)
    .order("tanggal", { ascending: false });

  if (error) {
    console.error("Error mengambil pemasukan dengan detail donatur:", error);
    throw new Error("Gagal mengambil pemasukan dengan detail donatur");
  }

  return data || [];
}

export async function getPemasukanByDonasiKhusus(
  donasiKhususId: number
): Promise<Pemasukan[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("*")
    .eq("donasiKhususId", donasiKhususId)
    .order("tanggal", { ascending: false });

  if (error) {
    console.error(
      "Error mengambil pemasukan berdasarkan donasi khusus:",
      error
    );
    throw new Error("Gagal mengambil pemasukan berdasarkan donasi khusus");
  }

  return data || [];
}

export async function getPemasukanByKotakAmal(
  kotakAmalId: number
): Promise<Pemasukan[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("*")
    .eq("kotakAmalId", kotakAmalId)
    .order("tanggal", { ascending: false });

  if (error) {
    console.error("Error mengambil pemasukan berdasarkan kotak amal:", error);
    throw new Error("Gagal mengambil pemasukan berdasarkan kotak amal");
  }

  return data || [];
}

export async function getPemasukanByKotakMasjid(
  kotakMasjidId: number
): Promise<Pemasukan[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pemasukan")
    .select("*")
    .eq("kotakMasjidId", kotakMasjidId)
    .order("tanggal", { ascending: false });

  if (error) {
    console.error("Error mengambil pemasukan berdasarkan kotak masjid:", error);
    throw new Error("Gagal mengambil pemasukan berdasarkan kotak masjid");
  }

  return data || [];
}

/**
 * Fungsi untuk menghapus semua pemasukan yang terkait dengan suatu entitas
 * dan mengisikan ulang berdasarkan data terbaru
 */
export async function refreshPemasukanForEntity(
  entityType: "donatur" | "kotakAmal" | "kotakMasjid" | "donasiKhusus",
  entityId: number
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  try {
    // Mapping field ID sesuai entity type
    const fieldMapping = {
      donatur: "donaturId",
      kotakAmal: "kotakAmalId",
      kotakMasjid: "kotakMasjidId",
      donasiKhusus: "donasiKhususId",
    };

    const idField = fieldMapping[entityType];

    // Hapus pemasukan yang terkait dengan entity
    const { error: deleteError } = await supabase
      .from("Pemasukan")
      .delete()
      .eq(idField, entityId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error(`Error saat refresh pemasukan untuk ${entityType}:`, error);
    throw new Error(`Gagal refresh pemasukan untuk ${entityType}`);
  }
}

export async function syncAllPemasukan(): Promise<void> {
  const supabase = await createServerSupabaseClient();

  try {
    // Hapus semua data pemasukan terlebih dahulu untuk menghindari duplikasi
    const { error: deleteError } = await supabase
      .from("Pemasukan")
      .delete()
      .neq("id", 0); // Menghapus semua data

    if (deleteError) throw new Error("Gagal menghapus data pemasukan lama");

    // 1. Sync Donasi Khusus
    const { data: donasiList, error: donasiError } = await supabase
      .from("DonasiKhusus")
      .select("*");

    if (donasiError) throw new Error("Gagal mengambil data donasi khusus");

    if (donasiList?.length) {
      const donasiRows = donasiList.map((d) => ({
        tanggal: d.tanggal,
        sumber: "DONASI_KHUSUS" as SumberPemasukan,
        jumlah: d.jumlah,
        keterangan: d.keterangan,
        tahun: d.tahun,
        donasiKhususId: d.id,
        kotakAmalId: null,
        kotakMasjidId: null,
        donaturId: null,
      }));

      await supabase.from("Pemasukan").insert(donasiRows);
    }

    // 2. Sync Kotak Amal Masjid
    const { data: kotakMasjidList, error: kotakMasjidError } = await supabase
      .from("KotakAmalMasjid")
      .select("*");

    if (kotakMasjidError)
      throw new Error("Gagal mengambil data kotak amal masjid");

    if (kotakMasjidList?.length) {
      const kotakMasjidRows = kotakMasjidList.map((k) => ({
        tanggal: k.tanggal,
        sumber: "KOTAK_AMAL_MASJID" as SumberPemasukan,
        jumlah: k.jumlah,
        tahun: k.tahun,
        kotakMasjidId: k.id,
        keterangan: "",
        kotakAmalId: null,
        donasiKhususId: null,
        donaturId: null,
      }));

      await supabase.from("Pemasukan").insert(kotakMasjidRows);
    }

    // 3. Sync Kotak Amal (Bulanan)
    const { data: kotakList, error: kotakError } = await supabase
      .from("KotakAmal")
      .select("*");

    if (kotakError) throw new Error("Gagal mengambil data kotak amal");

    if (kotakList?.length) {
      const bulanMap = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        mei: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        okt: 9,
        nov: 10,
        des: 11,
      };

      const kotakRows = kotakList.flatMap((k) =>
        Object.entries(bulanMap)
          .filter(([bulan]) => k[bulan] > 0)
          .map(([bulan, index]) => ({
            tanggal: new Date(k.tahun, index, 1).toISOString(),
            sumber: "KOTAK_AMAL_LUAR" as SumberPemasukan,
            jumlah: k[bulan],
            tahun: k.tahun,
            kotakAmalId: k.id,
            keterangan: `Pemasukan bulan ${bulan.toUpperCase()}`,
            kotakMasjidId: null,
            donasiKhususId: null,
            donaturId: null,
          }))
      );

      if (kotakRows.length) {
        await supabase.from("Pemasukan").insert(kotakRows);
      }
    }

    // 4. Sync Donatur (Bulanan)
    const { data: donaturList, error: donaturError } = await supabase
      .from("Donatur")
      .select("*");

    if (donaturError) throw new Error("Gagal mengambil data donatur");

    if (donaturList?.length) {
      const bulanMap = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        mei: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        okt: 9,
        nov: 10,
        des: 11,
      };

      const donaturRows = donaturList.flatMap((d) =>
        Object.entries(bulanMap)
          .filter(([bulan]) => d[bulan] > 0)
          .map(([bulan, index]) => ({
            tanggal: new Date(d.tahun, index, 1).toISOString(),
            sumber: "DONATUR" as SumberPemasukan,
            jumlah: d[bulan],
            tahun: d.tahun,
            donaturId: d.id,
            keterangan: `Donatur bulan ${bulan.toUpperCase()} - ${d.nama}`,
            kotakAmalId: null,
            kotakMasjidId: null,
            donasiKhususId: null,
          }))
      );

      if (donaturRows.length) {
        await supabase.from("Pemasukan").insert(donaturRows);
      }
    }

    console.log("Berhasil mensinkronkan semua data pemasukan");
  } catch (error) {
    console.error("Error saat mensinkronkan data pemasukan:", error);
    throw new Error("Gagal mensinkronkan data pemasukan");
  }
}
