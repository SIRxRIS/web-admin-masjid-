// src/lib/services/supabase/donasi-khusus.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DonasiKhususData } from "@/lib/schema/pemasukan/schema";
import { syncPemasukanForDonasiKhusus } from "./pemasukan/sync-helpers";
import { createDonasiBaruNotification } from "@/actions/notifications";

export async function getDonasiKhusus(
  tahunFilter?: number
): Promise<DonasiKhususData[]> {
  const supabase = supabaseAdmin;

  let query = supabase
    .from("DonasiKhusus")
    .select("*")
    .order("no", { ascending: true });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data donasi khusus:", error);
    throw new Error("Gagal mengambil data donasi khusus");
  }

  return data || [];
}

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("DonasiKhusus")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return [...new Set(data.map((item) => item.tahun))];
}

export async function getDonasiKhususById(
  id: number
): Promise<DonasiKhususData | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("DonasiKhusus")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data donasi khusus:", error);
    throw new Error("Gagal mengambil data donasi khusus");
  }

  return data;
}

export async function getDonasiKhususData(
  tahunFilter?: number
): Promise<DonasiKhususData[]> {
  const supabase = supabaseAdmin;

  let query = supabase
    .from("DonasiKhusus")
    .select("*")
    .order("tanggal", { ascending: false });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data donasi khusus:", error);
    throw new Error("Gagal mengambil data donasi khusus");
  }

  return data || [];
}

export async function createDonasiKhusus(
  donasiKhusus: Omit<DonasiKhususData, "id" | "createdAt"> & {
    tahun: number;
  }
): Promise<DonasiKhususData> {
  const supabase = supabaseAdmin;

  const { data: lastItem, error: lastItemError } = await supabase
    .from("DonasiKhusus")
    .select("no")
    .eq("tahun", donasiKhusus.tahun)
    .order("no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastItemError) {
    console.error("Error mengambil nomor terakhir:", lastItemError);
    throw new Error("Gagal mengambil nomor terakhir");
  }

  const nextNo = lastItem ? (lastItem.no || 0) + 1 : 1;

  const now = new Date();

  const { data, error } = await supabase
    .from("DonasiKhusus")
    .insert([
      {
        ...donasiKhusus,
        no: nextNo,
        createdAt: now.toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error membuat donasi khusus:", error);
    throw new Error("Gagal membuat donasi khusus");
  }

  // Sync dengan tabel Pemasukan
  try {
    await syncPemasukanForDonasiKhusus(data.id);
  } catch (syncError) {
    console.error("Error sync pemasukan setelah create donasi khusus:", syncError);
  }

  // Trigger notifikasi untuk pengurus
  try {
    await createDonasiBaruNotification(
      donasiKhusus.nama,
      donasiKhusus.jumlah,
      donasiKhusus.keterangan || "Donasi khusus"
    );
  } catch (notifError) {
    console.error("Error creating donasi notification:", notifError);
    // Jangan gagalkan proses utama jika notifikasi gagal
  }

  return data;
}

export async function updateDonasiKhusus(
  id: number,
  donasiKhususData: Partial<Omit<DonasiKhususData, "id" | "createdAt">>
): Promise<DonasiKhususData> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("DonasiKhusus")
    .update(donasiKhususData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate donasi khusus:", error);
    throw new Error("Gagal mengupdate donasi khusus");
  }

  // AUTO-SYNC: Update tabel Pemasukan
  try {
    await syncPemasukanForDonasiKhusus(id);
  } catch (syncError) {
    console.error("Error sync pemasukan setelah update donasi khusus:", syncError);
    // Tidak throw error agar update tetap berhasil
  }

  return data;
}

export async function deleteDonasiKhusus(id: number): Promise<boolean> {
  const supabase = supabaseAdmin;

  try {
    const { data: donasiToDelete, error: getError } = await supabase
      .from("DonasiKhusus")
      .select("tahun")
      .eq("id", id)
      .single();

    if (getError) throw getError;

    // AUTO-SYNC: Hapus data pemasukan terkait terlebih dahulu
    const { error: deletePemasukanError } = await supabase
      .from("Pemasukan")
      .delete()
      .eq("donasiKhususId", id);

    if (deletePemasukanError) throw deletePemasukanError;

    const { error: deleteError } = await supabase
      .from("DonasiKhusus")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    const { data: remainingItems, error: getRemainingError } = await supabase
      .from("DonasiKhusus")
      .select("id")
      .eq("tahun", donasiToDelete.tahun)
      .order("no", { ascending: true });

    if (getRemainingError) throw getRemainingError;

    if (remainingItems) {
      for (let i = 0; i < remainingItems.length; i++) {
        const { error: updateError } = await supabase
          .from("DonasiKhusus")
          .update({ no: i + 1 })
          .eq("id", remainingItems[i].id);

        if (updateError) throw updateError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error menghapus donasi khusus:", error);
    throw new Error("Gagal menghapus donasi khusus");
  }
}

export async function updateDonasiKhususOrder(
  dataList: DonasiKhususData[],
  tahun: number
) {
  const supabase = supabaseAdmin;

  const updates = dataList
    .filter((item) => item.tahun === tahun)
    .map((item, index) => ({
      id: item.id,
      no: index + 1,
    }));

  const { error } = await supabase
    .from("DonasiKhusus")
    .upsert(updates, { onConflict: "id" });

  if (error) {
    console.error("Error mengupdate urutan donasi khusus:", error);
    throw new Error("Gagal mengupdate urutan donasi khusus");
  }

  return true;
}

export async function getDonasiKhususBulanan(
  tahun: number,
  bulan: number
): Promise<number> {
  const supabase = supabaseAdmin;

  const start = `${tahun}-${bulan.toString().padStart(2, "0")}-01`;
  const end = new Date(tahun, bulan, 1).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("DonasiKhusus")
    .select("jumlah")
    .gte("tanggal", start)
    .lt("tanggal", end);

  if (error) {
    console.error("Error mengambil total donasi khusus bulanan:", error);
    throw new Error("Gagal mengambil total donasi khusus bulanan");
  }

  return data?.reduce((total: number, item: any) => total + item.jumlah, 0) || 0;
}

export async function getDonasiKhususTahunan(tahun: number): Promise<number> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("DonasiKhusus")
    .select("jumlah")
    .gte("tanggal", `${tahun}-01-01`)
    .lt("tanggal", `${tahun + 1}-01-01`);

  if (error) {
    console.error("Error mengambil total donasi khusus tahunan:", error);
    throw new Error("Gagal mengambil total donasi khusus tahunan");
  }

  return data?.reduce((total: number, item: any) => total + item.jumlah, 0) || 0;
}
