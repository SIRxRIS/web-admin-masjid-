// src/lib/services/supabase/donatur.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DonaturData } from "./schema/donatur/schema";

export async function getDonaturData(
  tahunFilter?: number
): Promise<DonaturData[]> {
  const supabase = await createServerSupabaseClient();

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
  const supabase = await createServerSupabaseClient();

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

export async function getDonaturById(
  id: number
): Promise<DonaturData | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Donatur")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data donatur:", error);
    throw new Error("Gagal mengambil data donatur");
  }

  return data;
}

export async function createDonatur(
  donatur: Omit<DonaturData, "id" | "no">
): Promise<DonaturData> {
  const supabase = await createServerSupabaseClient();

  // Ambil nomor urut terakhir untuk tahun yang sama
  const { data: lastItem, error: lastItemError } = await supabase
    .from("Donatur")
    .select("no")
    .eq("tahun", donatur.tahun)
    .order("no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastItemError) {
    console.error("Error mengambil nomor terakhir:", lastItemError);
    throw new Error("Gagal mengambil nomor terakhir");
  }

  // Hitung nomor urut berikutnya
  const nextNo = lastItem ? (lastItem.no || 0) + 1 : 1;

  // Insert data donatur baru dengan nomor urut
  const { data, error } = await supabase
    .from("Donatur")
    .insert([
      {
        ...donatur,
        no: nextNo,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error menambahkan donatur:", error);
    throw new Error("Gagal menambahkan donatur");
  }

  return data;
}

export async function updateDonatur(
  id: number,
  donatur: Partial<Omit<DonaturData, "id" | "no">>
): Promise<DonaturData> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Donatur")
    .update(donatur)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate donatur:", error);
    throw new Error("Gagal mengupdate donatur");
  }

  return data;
}

export async function deleteDonatur(id: number): Promise<void> {
  const supabase = await createServerSupabaseClient();

  // Ambil data donatur yang akan dihapus untuk mendapatkan tahun dan no
  const { data: donaturToDelete, error: getError } = await supabase
    .from("Donatur")
    .select("no, tahun")
    .eq("id", id)
    .single();

  if (getError) {
    console.error("Error mengambil data donatur:", getError);
    throw new Error("Gagal mengambil data donatur");
  }

  // Hapus donatur
  const { error: deleteError } = await supabase
    .from("Donatur")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Error menghapus donatur:", deleteError);
    throw new Error("Gagal menghapus donatur");
  }

  // Update nomor urut untuk donatur lain di tahun yang sama
  // yang memiliki nomor urut lebih besar dari donatur yang dihapus
  const { data: remainingDonatur, error: getRemainingError } = await supabase
    .from("Donatur")
    .select("id")
    .eq("tahun", donaturToDelete.tahun)
    .gt("no", donaturToDelete.no)
    .order("no", { ascending: true });

  if (getRemainingError) {
    console.error("Error mengambil data donatur tersisa:", getRemainingError);
    throw new Error("Gagal mengambil data donatur tersisa");
  }

  // Update nomor urut secara berurutan
  if (remainingDonatur && remainingDonatur.length > 0) {
    for (let i = 0; i < remainingDonatur.length; i++) {
      const newNo = donaturToDelete.no + i;
      const { error: updateError } = await supabase
        .from("Donatur")
        .update({ no: newNo })
        .eq("id", remainingDonatur[i].id);

      if (updateError) {
        console.error("Error mengupdate nomor urut:", updateError);
        throw new Error("Gagal mengupdate nomor urut");
      }
    }
  }
}

export async function updateDonaturOrder(
  donaturData: DonaturData[]
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  try {
    // Update urutan donatur satu per satu
    for (let i = 0; i < donaturData.length; i++) {
      const { error } = await supabase
        .from("Donatur")
        .update({ no: i + 1 })
        .eq("id", donaturData[i].id);

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error mengupdate urutan donatur:", error);
    throw new Error("Gagal mengupdate urutan donatur");
  }
}

// Fungsi untuk laporan dan statistik
export async function getDonaturBulanan(
  tahun: number
): Promise<Record<string, number>> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Donatur")
    .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil data donatur bulanan:", error);
    throw new Error("Gagal mengambil data donatur bulanan");
  }

  // Hitung total per bulan
  const totals = {
    jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
  };

  data.forEach(donatur => {
    Object.keys(totals).forEach(month => {
      totals[month as keyof typeof totals] += donatur[month] || 0;
    });
  });

  return totals;
}

export async function getDonaturTahunan(tahun: number): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Donatur")
    .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil data donatur tahunan:", error);
    throw new Error("Gagal mengambil data donatur tahunan");
  }

  // Hitung total tahunan
  let total = 0;
  data.forEach(donatur => {
    const months = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
    months.forEach(month => {
      total += donatur[month] || 0;
    });
  });

  return total;
}

export async function getTotalInfaq(tahun: number): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Donatur")
    .select("infaq")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil total infaq:", error);
    throw new Error("Gagal mengambil total infaq");
  }

  // Hitung total infaq
  const total = data.reduce((sum, donatur) => sum + (donatur.infaq || 0), 0);
  return total;
}