// src/lib/services/supabase/kotak-amal-masjid.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { KotakAmalMasjidData } from "@/lib/schema/pemasukan/schema";

export async function getKotakAmalMasjidData(
  tahunFilter?: number
): Promise<KotakAmalMasjidData[]> {
  const supabase = supabaseAdmin;

  let query = supabase
    .from("KotakAmalMasjid")
    .select("*")
    .order("tanggal", { ascending: false });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data kotak amal masjid:", error);
    throw new Error("Gagal mengambil data kotak amal masjid");
  }

  return data || [];
}

export async function createKotakAmalMasjid(
  kotakAmalMasjid: Omit<KotakAmalMasjidData, "id" | "createdAt">
): Promise<KotakAmalMasjidData> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("KotakAmalMasjid")
    .insert([kotakAmalMasjid])
    .select()
    .single();

  if (error) {
    console.error("Error membuat kotak amal masjid:", error);
    throw new Error("Gagal membuat kotak amal masjid");
  }

  return data;
}

export async function updateKotakAmalMasjid(
  id: number,
  kotakAmalMasjid: Partial<Omit<KotakAmalMasjidData, "id" | "createdAt">>
): Promise<KotakAmalMasjidData> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("KotakAmalMasjid")
    .update(kotakAmalMasjid)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate kotak amal masjid:", error);
    throw new Error("Gagal mengupdate kotak amal masjid");
  }

  return data;
}

export async function deleteKotakAmalMasjid(id: number): Promise<boolean> {
  const supabase = supabaseAdmin;

  const { error } = await supabase
    .from("KotakAmalMasjid")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error menghapus kotak amal masjid:", error);
    throw new Error("Gagal menghapus kotak amal masjid");
  }

  return true;
}

export async function getTotalKotakAmalMasjid(tahun?: number): Promise<number> {
  const supabase = supabaseAdmin;

  let query = supabase.from("KotakAmalMasjid").select("jumlah");

  if (tahun) {
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil total kotak amal masjid:", error);
    throw new Error("Gagal mengambil total kotak amal masjid");
  }

  return (
    data?.reduce((total, item) => total + (Number(item.jumlah) || 0), 0) || 0
  );
}

export async function getKotakAmalMasjidTahunan(
  tahun: number
): Promise<number> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("KotakAmalMasjid")
    .select("jumlah, tanggal")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil data kotak amal masjid tahunan:", error);
    throw new Error("Gagal mengambil data kotak amal masjid tahunan");
  }

  return (
    data?.reduce((total, item) => total + (Number(item.jumlah) || 0), 0) || 0
  );
}

export async function getKotakAmalMasjidTahunanByDate(
  tahunParam: number
): Promise<number> {
  const supabase = supabaseAdmin;

  const startDate = `${tahunParam}-01-01`;
  const endDate = `${tahunParam}-12-31`;

  const { data, error } = await supabase
    .from("KotakAmalMasjid")
    .select("jumlah")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);

  if (error) {
    console.error(
      "Error mengambil data kotak amal masjid tahunan by date:",
      error
    );
    throw new Error("Gagal mengambil data kotak amal masjid tahunan");
  }

  return (
    data?.reduce((total, item) => total + (Number(item.jumlah) || 0), 0) || 0
  );
}

export async function getKotakAmalMasjidBulanan(
  tahunParam: number,
  bulan: number
): Promise<number> {
  const supabase = supabaseAdmin;

  const bulanFormatted = bulan.toString().padStart(2, "0");
  const startDate = `${tahunParam}-${bulanFormatted}-01`;

  const lastDay = new Date(tahunParam, bulan, 0).getDate();
  const endDate = `${tahunParam}-${bulanFormatted}-${lastDay
    .toString()
    .padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("KotakAmalMasjid")
    .select("jumlah")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);

  if (error) {
    console.error(
      `Error mengambil data kotak amal masjid bulan ${bulan}:`,
      error
    );
    throw new Error(`Gagal mengambil data kotak amal masjid bulan ${bulan}`);
  }

  return (
    data?.reduce((total, item) => total + (Number(item.jumlah) || 0), 0) || 0
  );
}

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("KotakAmalMasjid")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return [...new Set(data.map((item) => item.tahun))];
}