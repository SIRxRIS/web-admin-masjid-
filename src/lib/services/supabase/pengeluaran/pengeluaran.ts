// src/lib/services/supabase/pengeluaran/pengeluaran.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type Pengeluaran } from "@prisma/client";

// Fungsi validasi data pengeluaran
export function validatePengeluaranData(
  data: Partial<Pengeluaran>,
  isUpdate: boolean = false
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isUpdate || data.tanggal !== undefined) {
    if (!data.tanggal) {
      errors.push("Tanggal pengeluaran wajib diisi");
    } else {
      const tanggal = new Date(data.tanggal);
      if (isNaN(tanggal.getTime())) {
        errors.push("Format tanggal tidak valid");
      }
    }
  }

  if (!isUpdate || data.keterangan !== undefined) {
    if (!data.keterangan || data.keterangan.trim() === "") {
      errors.push("Keterangan pengeluaran wajib diisi");
    } else if (data.keterangan.length > 500) {
      errors.push("Keterangan terlalu panjang (maksimal 500 karakter)");
    }
  }

  if (!isUpdate || data.jumlah !== undefined) {
    if (!data.jumlah || data.jumlah <= 0) {
      errors.push("Jumlah pengeluaran harus lebih dari 0");
    } else if (data.jumlah > 999999999) {
      errors.push("Jumlah pengeluaran terlalu besar");
    }
  }

  if (!isUpdate || data.tahun !== undefined) {
    if (!data.tahun) {
      errors.push("Tahun pengeluaran wajib diisi");
    } else if (data.tahun < 2000 || data.tahun > new Date().getFullYear() + 1) {
      errors.push("Tahun tidak valid");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function getPengeluaranData(
  tahunFilter?: number
): Promise<Pengeluaran[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("Pengeluaran")
    .select("*")
    .order("tanggal", { ascending: false });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data pengeluaran:", error);
    throw new Error("Gagal mengambil data pengeluaran");
  }

  return data || [];
}

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pengeluaran")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return [...new Set(data.map((item) => item.tahun))];
}

export async function getPengeluaranById(
  id: number
): Promise<Pengeluaran | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pengeluaran")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data pengeluaran:", error);
    throw new Error("Gagal mengambil data pengeluaran");
  }

  return data;
}

export async function createPengeluaran(
  pengeluaran: Omit<Pengeluaran, "id" | "createdAt" | "updatedAt" | "no"> & {
    tahun: number;
  }
): Promise<Pengeluaran> {
  const supabase = await createServerSupabaseClient();

  // Logika nomor urut
  const { data: lastItem, error: lastItemError } = await supabase
    .from("Pengeluaran")
    .select("no")
    .eq("tahun", pengeluaran.tahun)
    .order("no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastItemError) {
    console.error("Error mengambil nomor terakhir:", lastItemError);
    throw new Error("Gagal mengambil nomor terakhir");
  }

  const nextNo = lastItem ? (lastItem.no || 0) + 1 : 1;

  // Tambahkan tanggal updatedAt sesuai dengan schema
  const now = new Date();

  const { data, error } = await supabase
    .from("Pengeluaran")
    .insert([
      {
        ...pengeluaran,
        no: nextNo,
        updatedAt: now.toISOString(), // Tambahkan updatedAt
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error membuat pengeluaran:", error);
    throw new Error("Gagal membuat pengeluaran");
  }

  return data;
}

export async function updatePengeluaran(
  id: number,
  pengeluaran: Partial<Omit<Pengeluaran, "id" | "createdAt" | "updatedAt">>
): Promise<Pengeluaran> {
  const supabase = await createServerSupabaseClient();

  // Tambahkan tanggal updatedAt sesuai dengan schema
  const now = new Date();

  const { data, error } = await supabase
    .from("Pengeluaran")
    .update({
      ...pengeluaran,
      updatedAt: now.toISOString(), // Perbarui updatedAt
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate pengeluaran:", error);
    throw new Error("Gagal mengupdate pengeluaran");
  }

  return data;
}

export async function getPengeluaranBulanan(
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
    .from("Pengeluaran")
    .select("jumlah")
    .gte("tanggal", startStr)
    .lte("tanggal", endStr); // Gunakan lte untuk mencakup hari terakhir

  if (error) {
    console.error("Error mengambil total pengeluaran bulanan:", error);
    throw new Error("Gagal mengambil total pengeluaran bulanan");
  }

  return data?.reduce((total, item) => total + item.jumlah, 0) || 0;
}

export async function deletePengeluaran(id: number): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: pengeluaranToDelete, error: getError } = await supabase
      .from("Pengeluaran")
      .select("tahun")
      .eq("id", id)
      .single();

    if (getError) throw getError;

    const { error: deleteError } = await supabase
      .from("Pengeluaran")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    const { data: remainingItems, error: getRemainingError } = await supabase
      .from("Pengeluaran")
      .select("id")
      .eq("tahun", pengeluaranToDelete.tahun)
      .order("no", { ascending: true });

    if (getRemainingError) throw getRemainingError;

    if (remainingItems) {
      for (let i = 0; i < remainingItems.length; i++) {
        const { error: updateError } = await supabase
          .from("Pengeluaran")
          .update({ no: i + 1 })
          .eq("id", remainingItems[i].id);

        if (updateError) throw updateError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error menghapus pengeluaran:", error);
    throw new Error("Gagal menghapus pengeluaran");
  }
}

export async function getPengeluaranTahunan(tahun: number): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pengeluaran")
    .select("jumlah")
    .gte("tanggal", `${tahun}-01-01`)
    .lt("tanggal", `${tahun + 1}-01-01`);

  if (error) {
    console.error("Error mengambil total pengeluaran tahunan:", error);
    throw new Error("Gagal mengambil total pengeluaran tahunan");
  }

  return data?.reduce((total, item) => total + item.jumlah, 0) || 0;
}