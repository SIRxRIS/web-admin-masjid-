// src/lib/services/supabase/donatur.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { 
  DonaturData, 
  CreateDonaturInput, 
  UpdateDonaturInput,
  createDonaturSchema,
  updateDonaturSchema,
  donaturFilterSchema
} from "@/lib/schema/pemasukan/schema";
import { syncPemasukanForDonatur } from "./pemasukan/sync-helpers";

// Definisikan tipe untuk bulan-bulan
type MonthKey = 'jan' | 'feb' | 'mar' | 'apr' | 'mei' | 'jun' | 'jul' | 'aug' | 'sep' | 'okt' | 'nov' | 'des';

export async function getDonaturData(
  tahunFilter?: number
): Promise<DonaturData[]> {
  const supabase = supabaseAdmin;

  // Validasi input filter jika ada
  if (tahunFilter) {
    const filterResult = donaturFilterSchema.safeParse({ tahun: tahunFilter });
    if (!filterResult.success) {
      throw new Error("Filter tahun tidak valid");
    }
  }

  let query = supabase
    .from("Donatur")
    .select("*")
    .order("no", { ascending: true });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data donatur:", error);
    throw new Error("Gagal mengambil data donatur");
  }

  return data || [];
}

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("Donatur")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return [...new Set(data.map((item) => item.tahun))];
}

export async function updateDonaturOrder(donaturData: DonaturData[]) {
  const supabase = supabaseAdmin;

  const updates = donaturData.map((donatur, index) => ({
    id: donatur.id,
    no: index + 1,
    updatedAt: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("Donatur")
    .upsert(updates, { onConflict: "id" });

  if (error) {
    console.error("Error mengupdate urutan donatur:", error);
    throw new Error("Gagal mengupdate urutan donatur");
  }

  return true;
}

export async function getDonaturById(id: number): Promise<DonaturData | null> {
  const supabase = supabaseAdmin;

  // Validasi input ID
  if (!id || id <= 0) {
    throw new Error("ID donatur tidak valid");
  }

  const { data, error } = await supabase
    .from("Donatur")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Data tidak ditemukan
    }
    console.error("Error mengambil data donatur:", error);
    throw new Error("Gagal mengambil data donatur");
  }

  return data;
}

export async function createDonatur(
  donaturInput: CreateDonaturInput
): Promise<DonaturData> {
  const supabase = supabaseAdmin;

  // Validasi input menggunakan schema
  const validationResult = createDonaturSchema.safeParse(donaturInput);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(e => e.message).join(", ");
    throw new Error(`Data tidak valid: ${errors}`);
  }

  const validatedData = validationResult.data;

  // Dapatkan nomor urut berikutnya
  const { data: lastItem, error: lastItemError } = await supabase
    .from("Donatur")
    .select("no")
    .eq("tahun", validatedData.tahun)
    .order("no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastItemError) {
    console.error("Error mengambil nomor terakhir:", lastItemError);
    throw new Error("Gagal mengambil nomor terakhir");
  }

  const nextNo = lastItem ? (lastItem.no || 0) + 1 : 1;
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("Donatur")
    .insert([
      {
        ...validatedData,
        no: nextNo,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error membuat donatur:", error);
    throw new Error("Gagal membuat donatur");
  }

  // AUTO-SYNC: Update tabel Pemasukan
  try {
    await syncPemasukanForDonatur(data.id);
  } catch (syncError) {
    console.error("Error sync pemasukan setelah create donatur:", syncError);
    // Tidak throw error agar create tetap berhasil
  }

  return data;
}

export async function updateDonatur(
  id: number,
  donaturInput: Omit<UpdateDonaturInput, 'id'>
): Promise<DonaturData> {
  const supabase = supabaseAdmin;

  // Validasi input
  const validationResult = updateDonaturSchema.safeParse({ id, ...donaturInput });
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(e => e.message).join(", ");
    throw new Error(`Data tidak valid: ${errors}`);
  }

  const { id: validatedId, ...validatedData } = validationResult.data;

  try {
    // 1. Dapatkan data donatur sebelum diupdate
    const { data: oldDonatur, error: getError } = await supabase
      .from("Donatur")
      .select("*")
      .eq("id", id)
      .single();

    if (getError) {
      if (getError.code === 'PGRST116') {
        throw new Error("Donatur tidak ditemukan");
      }
      throw getError;
    }

    // 2. Update donatur
    const { data: updatedDonatur, error: updateError } = await supabase
      .from("Donatur")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // AUTO-SYNC: Update tabel Pemasukan
    try {
      await syncPemasukanForDonatur(id);
    } catch (syncError) {
      console.error("Error sync pemasukan setelah update donatur:", syncError);
      // Tidak throw error agar update tetap berhasil
    }

    return updatedDonatur;
  } catch (error) {
    console.error("Error mengupdate donatur:", error);
    throw new Error("Gagal mengupdate donatur");
  }
}

export async function deleteDonatur(id: number): Promise<boolean> {
  const supabase = supabaseAdmin;

  // Validasi input ID
  if (!id || id <= 0) {
    throw new Error("ID donatur tidak valid");
  }

  try {
    // Cek apakah donatur ada
    const { data: donaturToDelete, error: getError } = await supabase
      .from("Donatur")
      .select("tahun")
      .eq("id", id)
      .single();

    if (getError) {
      if (getError.code === 'PGRST116') {
        throw new Error("Donatur tidak ditemukan");
      }
      throw getError;
    }

    // AUTO-SYNC: Hapus data pemasukan terkait terlebih dahulu
    const { error: deletePemasukanError } = await supabase
      .from("Pemasukan")
      .delete()
      .eq("donaturId", id);

    if (deletePemasukanError) throw deletePemasukanError;

    // Hapus donatur
    const { error: deleteError } = await supabase
      .from("Donatur")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Update nomor urut untuk donatur lainnya di tahun yang sama
    const { data: remainingDonatur, error: getRemainingError } = await supabase
      .from("Donatur")
      .select("id, no")
      .eq("tahun", donaturToDelete.tahun)
      .order("no", { ascending: true });

    if (getRemainingError) throw getRemainingError;

    if (remainingDonatur && remainingDonatur.length > 0) {
      const updates = remainingDonatur.map((donatur, index) => ({
        id: donatur.id,
        no: index + 1,
        updatedAt: new Date().toISOString(),
      }));

      const { error: updateOrderError } = await supabase
        .from("Donatur")
        .upsert(updates, { onConflict: "id" });

      if (updateOrderError) throw updateOrderError;
    }

    return true;
  } catch (error) {
    console.error("Error menghapus donatur:", error);
    throw new Error("Gagal menghapus donatur");
  }
}

// Fungsi statistik dan utilitas lainnya
export async function getDonaturBulanan(
  tahun: number
): Promise<Record<MonthKey, number>> {
  const supabase = supabaseAdmin;

  // Validasi tahun
  const filterResult = donaturFilterSchema.safeParse({ tahun });
  if (!filterResult.success) {
    throw new Error("Tahun tidak valid");
  }

  const { data, error } = await supabase
    .from("Donatur")
    .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil data donatur bulanan:", error);
    throw new Error("Gagal mengambil data donatur bulanan");
  }

  const result: Record<MonthKey, number> = {
    jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0,
  };

  const monthKeys: MonthKey[] = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

  data?.forEach((item) => {
    monthKeys.forEach((month) => {
      if (item[month] !== undefined && item[month] !== null) {
        result[month] += item[month] || 0;
      }
    });
  });

  return result;
}

export async function getDonaturTahunan(tahun: number): Promise<number> {
  const supabase = supabaseAdmin;

  // Validasi tahun
  const filterResult = donaturFilterSchema.safeParse({ tahun });
  if (!filterResult.success) {
    throw new Error("Tahun tidak valid");
  }

  const { data, error } = await supabase
    .from("Donatur")
    .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil data donatur tahunan:", error);
    throw new Error("Gagal mengambil data donatur tahunan");
  }

  let total = 0;
  const monthKeys: MonthKey[] = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

  data?.forEach((item) => {
    monthKeys.forEach((month) => {
      total += item[month] || 0;
    });
  });

  return total;
}

export async function getTotalInfaq(tahun: number): Promise<number> {
  const supabase = supabaseAdmin;

  // Validasi tahun
  const filterResult = donaturFilterSchema.safeParse({ tahun });
  if (!filterResult.success) {
    throw new Error("Tahun tidak valid");
  }

  const { data, error } = await supabase
    .from("Donatur")
    .select("infaq")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil total infaq:", error);
    throw new Error("Gagal mengambil total infaq");
  }

  return data?.reduce((total, item) => total + (item.infaq || 0), 0) || 0;
}