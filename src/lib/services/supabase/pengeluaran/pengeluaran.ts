// src/lib/services/supabase/pengeluaran/pengeluaran.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { 
  type PengeluaranData,
  type PengeluaranTahunanData,
  type CreatePengeluaranInput,
  type UpdatePengeluaranInput,
  pengeluaranSchema,
  pengeluaranTahunanSchema,
  createPengeluaranSchema,
  updatePengeluaranSchema
} from "@/lib/schema/pengeluaran/schema";
import { syncPengeluaranData } from "./sync-helpers";

// Export types yang diperlukan
export type { PengeluaranData, PengeluaranTahunanData, CreatePengeluaranInput, UpdatePengeluaranInput };

// Fungsi helper untuk mengonversi data dari database
function transformPengeluaranData(item: any): any {
  return {
    ...item,
    // Pastikan semua field tanggal dalam format yang benar
    tanggal: item.tanggal,
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at,
    keterangan: item.keterangan || ""
  };
}

export async function getPengeluaranData(
  tahunFilter?: number
): Promise<PengeluaranData[]> {
  const supabase = supabaseAdmin;

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

  // Transform dan validasi data dengan schema menggunakan safeParse untuk error handling yang lebih baik
  const results: PengeluaranData[] = [];
  
  for (const item of data || []) {
    try {
      const transformed = transformPengeluaranData(item);
      const result = pengeluaranSchema.safeParse(transformed);
      
      if (result.success) {
        results.push(result.data);
      } else {
        console.error(`Failed to parse pengeluaran item ${item.id}:`, result.error.issues);
        // Skip item yang tidak valid atau coba dengan fallback values
        const fallback = {
          ...transformed,
          tanggal: new Date(transformed.tanggal || new Date()),
          createdAt: new Date(transformed.createdAt || new Date()),
          updatedAt: new Date(transformed.updatedAt || new Date()),
          keterangan: transformed.keterangan || ""
        };
        
        const fallbackResult = pengeluaranSchema.safeParse(fallback);
        if (fallbackResult.success) {
          results.push(fallbackResult.data);
        }
      }
    } catch (err) {
      console.error(`Error processing pengeluaran item ${item.id}:`, err);
    }
  }
  
  return results;
}

export async function getPengeluaranById(id: number): Promise<PengeluaranData | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("Pengeluaran")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data pengeluaran:", error);
    throw new Error("Gagal mengambil data pengeluaran");
  }

  if (!data) return null;

  const transformed = transformPengeluaranData(data);
  const result = pengeluaranSchema.safeParse(transformed);
  
  if (result.success) {
    return result.data;
  } else {
    console.error("Failed to parse pengeluaran:", result.error.issues);
    return null;
  }
}

export async function createPengeluaran(
  pengeluaran: CreatePengeluaranInput
): Promise<PengeluaranData> {
  const supabase = supabaseAdmin;

  // Validasi input dengan schema
  const validatedInput = createPengeluaranSchema.parse(pengeluaran);
  
  // Konversi Date ke string untuk Supabase
  const inputForDB = {
    ...validatedInput,
    tanggal: validatedInput.tanggal instanceof Date 
      ? validatedInput.tanggal.toISOString().split('T')[0] // Format YYYY-MM-DD untuk date
      : validatedInput.tanggal
  };

  const { data, error } = await supabase
    .from("Pengeluaran")
    .insert([inputForDB])
    .select()
    .single();

  if (error) {
    console.error("Error membuat pengeluaran:", error);
    throw new Error("Gagal membuat pengeluaran");
  }

  const result = pengeluaranSchema.safeParse(transformPengeluaranData(data));
  if (!result.success) {
    console.error("Failed to parse created pengeluaran:", result.error.issues);
    throw new Error("Data yang dibuat tidak valid");
  }

  // AUTO-SYNC: Trigger sync after create
  try {
    await syncPengeluaranData(data.id);
  } catch (syncError) {
    console.error("Error sync pengeluaran setelah create:", syncError);
    // Tidak throw error agar create tetap berhasil
  }
  
  return result.data;
}

export async function updatePengeluaran(
  id: number,
  pengeluaran: Partial<Omit<PengeluaranData, "id" | "createdAt" | "updatedAt">>
): Promise<PengeluaranData> {
  const supabase = supabaseAdmin;

  // Validasi input dengan schema (partial)
  const validatedInput = updatePengeluaranSchema.partial().parse({ ...pengeluaran, id });
  
  // Konversi Date ke string untuk Supabase jika ada
  const inputForDB: any = { ...validatedInput };
  delete inputForDB.id; // Hapus id dari input update
  
  if (inputForDB.tanggal && inputForDB.tanggal instanceof Date) {
    inputForDB.tanggal = inputForDB.tanggal.toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from("Pengeluaran")
    .update(inputForDB)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate pengeluaran:", error);
    throw new Error("Gagal mengupdate pengeluaran");
  }

  const result = pengeluaranSchema.safeParse(transformPengeluaranData(data));
  if (!result.success) {
    console.error("Failed to parse updated pengeluaran:", result.error.issues);
    throw new Error("Data yang diupdate tidak valid");
  }

  // AUTO-SYNC: Trigger sync after update
  try {
    await syncPengeluaranData(id);
  } catch (syncError) {
    console.error("Error sync pengeluaran setelah update:", syncError);
    // Tidak throw error agar update tetap berhasil
  }
  
  return result.data;
}

export async function deletePengeluaran(id: number): Promise<boolean> {
  const supabase = supabaseAdmin;

  try {
    // AUTO-SYNC: Trigger sync before delete (if needed for cleanup)
    try {
      await syncPengeluaranData(id);
    } catch (syncError) {
      console.error("Error sync pengeluaran sebelum delete:", syncError);
      // Continue with delete even if sync fails
    }

    const { error } = await supabase.from("Pengeluaran").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error menghapus pengeluaran:", error);
    throw new Error("Gagal menghapus pengeluaran");
  }
}

export async function getPengeluaranBulanan(
  tahun: number,
  bulan: number
): Promise<number> {
  const supabase = supabaseAdmin;

  // Gunakan metode yang benar untuk menentukan tanggal awal dan akhir bulan
  const start = new Date(tahun, bulan - 1, 1);
  const end = new Date(tahun, bulan, 0); // Hari terakhir bulan

  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("Pengeluaran")
    .select("jumlah")
    .gte("tanggal", startStr)
    .lte("tanggal", endStr);

  if (error) {
    console.error("Error mengambil total pengeluaran bulanan:", error);
    throw new Error("Gagal mengambil total pengeluaran bulanan");
  }

  return data?.reduce((total, item) => total + item.jumlah, 0) || 0;
}

export async function getPengeluaranTahunan(tahun: number): Promise<number> {
  const supabase = supabaseAdmin;

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

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("Pengeluaran")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return Array.from(new Set(data.map((item) => item.tahun)));
}

export async function getPengeluaranByNama(
  nama: string,
  tahun?: number
): Promise<PengeluaranData[]> {
  const supabase = supabaseAdmin;

  let query = supabase
    .from("Pengeluaran")
    .select("*")
    .ilike("nama", `%${nama}%`)
    .order("tanggal", { ascending: false });

  if (tahun) {
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil pengeluaran berdasarkan nama:", error);
    throw new Error("Gagal mengambil pengeluaran berdasarkan nama");
  }

  const results: PengeluaranData[] = [];
  
  for (const item of data || []) {
    const transformed = transformPengeluaranData(item);
    const result = pengeluaranSchema.safeParse(transformed);
    
    if (result.success) {
      results.push(result.data);
    }
  }
  
  return results;
}

export async function getPengeluaranByDateRange(
  startDate: Date,
  endDate: Date
): Promise<PengeluaranData[]> {
  const supabase = supabaseAdmin;

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("Pengeluaran")
    .select("*")
    .gte("tanggal", startStr)
    .lte("tanggal", endStr)
    .order("tanggal", { ascending: false });

  if (error) {
    console.error("Error mengambil pengeluaran berdasarkan rentang tanggal:", error);
    throw new Error("Gagal mengambil pengeluaran berdasarkan rentang tanggal");
  }

  const results: PengeluaranData[] = [];
  
  for (const item of data || []) {
    const transformed = transformPengeluaranData(item);
    const result = pengeluaranSchema.safeParse(transformed);
    
    if (result.success) {
      results.push(result.data);
    }
  }
  
  return results;
}

// Fungsi untuk pengeluaran tahunan (data bulanan dalam satu row)
export async function getPengeluaranTahunanData(
  tahun?: number
): Promise<PengeluaranTahunanData[]> {
  const supabase = supabaseAdmin;

  let query = supabase
    .from("PengeluaranTahunan")
    .select("*")
    .order("no", { ascending: true });

  if (tahun) {
    // Asumsi ada field tahun di tabel PengeluaranTahunan
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data pengeluaran tahunan:", error);
    throw new Error("Gagal mengambil data pengeluaran tahunan");
  }

  const results: PengeluaranTahunanData[] = [];
  
  for (const item of data || []) {
    const result = pengeluaranTahunanSchema.safeParse(item);
    
    if (result.success) {
      results.push(result.data);
    }
  }
  
  return results;
}

export async function createPengeluaranTahunan(
  pengeluaranTahunan: Omit<PengeluaranTahunanData, "id">
): Promise<PengeluaranTahunanData> {
  const supabase = supabaseAdmin;

  // Validasi input dengan schema
  const validatedInput = pengeluaranTahunanSchema.omit({ id: true }).parse(pengeluaranTahunan);

  const { data, error } = await supabase
    .from("PengeluaranTahunan")
    .insert([validatedInput])
    .select()
    .single();

  if (error) {
    console.error("Error membuat pengeluaran tahunan:", error);
    throw new Error("Gagal membuat pengeluaran tahunan");
  }

  const result = pengeluaranTahunanSchema.safeParse(data);
  if (!result.success) {
    console.error("Failed to parse created pengeluaran tahunan:", result.error.issues);
    throw new Error("Data yang dibuat tidak valid");
  }

  // AUTO-SYNC: Trigger sync after create (if needed)
  try {
    // For tahunan data, you might want different sync logic
    console.log(`PengeluaranTahunan ${data.id} created successfully`);
  } catch (syncError) {
    console.error("Error sync pengeluaran tahunan setelah create:", syncError);
  }

  return result.data;
}

export async function updatePengeluaranTahunan(
  id: number,
  pengeluaranTahunan: Partial<Omit<PengeluaranTahunanData, "id">>
): Promise<PengeluaranTahunanData> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("PengeluaranTahunan")
    .update(pengeluaranTahunan)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate pengeluaran tahunan:", error);
    throw new Error("Gagal mengupdate pengeluaran tahunan");
  }

  const result = pengeluaranTahunanSchema.safeParse(data);
  if (!result.success) {
    console.error("Failed to parse updated pengeluaran tahunan:", result.error.issues);
    throw new Error("Data yang diupdate tidak valid");
  }

  // AUTO-SYNC: Trigger sync after update (if needed)
  try {
    console.log(`PengeluaranTahunan ${id} updated successfully`);
  } catch (syncError) {
    console.error("Error sync pengeluaran tahunan setelah update:", syncError);
  }

  return result.data;
}

export async function deletePengeluaranTahunan(id: number): Promise<boolean> {
  const supabase = supabaseAdmin;

  try {
    const { error } = await supabase.from("PengeluaranTahunan").delete().eq("id", id);

    if (error) throw error;

    // AUTO-SYNC: Log deletion (if needed)
    console.log(`PengeluaranTahunan ${id} deleted successfully`);

    return true;
  } catch (error) {
    console.error("Error menghapus pengeluaran tahunan:", error);
    throw new Error("Gagal menghapus pengeluaran tahunan");
  }
}

