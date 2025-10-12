// src/lib/services/supabase/kotak-amal-jumat.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { KotakAmalJumatData } from "@/lib/schema/pemasukan/schema";

export async function getKotakAmalJumatData(
  tahunFilter?: number
): Promise<KotakAmalJumatData[]> {
  const supabase = supabaseAdmin;

  let query = supabase
    .from("KotakAmalJumat")
    .select("*")
    .order("tanggal", { ascending: false });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data kotak amal jumat:", error);
    throw new Error("Gagal mengambil data kotak amal jumat");
  }

  return data || [];
}

export async function createKotakAmalJumat(
  kotakAmalJumat: Omit<KotakAmalJumatData, "id" | "createdAt">
): Promise<KotakAmalJumatData> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("KotakAmalJumat")
    .insert([kotakAmalJumat])
    .select()
    .single();

  if (error) {
    console.error("Error membuat kotak amal jumat:", error);
    throw new Error("Gagal membuat kotak amal jumat");
  }

  return data;
}

export async function updateKotakAmalJumat(
  id: number,
  kotakAmalJumat: Partial<Omit<KotakAmalJumatData, "id" | "createdAt">>
): Promise<KotakAmalJumatData> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("KotakAmalJumat")
    .update(kotakAmalJumat)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate kotak amal jumat:", error);
    throw new Error("Gagal mengupdate kotak amal jumat");
  }

  return data;
}

export async function deleteKotakAmalJumat(id: number): Promise<boolean> {
  const supabase = supabaseAdmin;

  const { error } = await supabase
    .from("KotakAmalJumat")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error menghapus kotak amal jumat:", error);
    throw new Error("Gagal menghapus kotak amal jumat");
  }

  return true;
}

export async function getTotalKotakAmalJumat(tahun?: number): Promise<number> {
  const supabase = supabaseAdmin;

  let query = supabase.from("KotakAmalJumat").select("jumlah");

  if (tahun) {
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil total kotak amal jumat:", error);
    throw new Error("Gagal mengambil total kotak amal jumat");
  }

  return data?.reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0;
}

export async function getKotakAmalJumatTahunan(
  tahun: number
): Promise<number> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("KotakAmalJumat")
    .select("jumlah")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil data kotak amal jumat tahunan:", error);
    throw new Error("Gagal mengambil data kotak amal jumat tahunan");
  }

  return data?.reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0;
}

export async function getKotakAmalJumatTahunanByDate(
  tahunParam: number
): Promise<number> {
  const supabase = supabaseAdmin;

  const startDate = new Date(tahunParam, 0, 1);
  const endDate = new Date(tahunParam, 11, 31, 23, 59, 59);

  const { data, error } = await supabase
    .from("KotakAmalJumat")
    .select("jumlah")
    .gte("tanggal", startDate.toISOString())
    .lte("tanggal", endDate.toISOString());

  if (error) {
    console.error("Error mengambil data kotak amal jumat tahunan by date:", error);
    throw new Error("Gagal mengambil data kotak amal jumat tahunan");
  }

  return data?.reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0;
}

export async function getKotakAmalJumatBulanan(
  tahunParam: number,
  bulan: number
): Promise<number> {
  const supabase = supabaseAdmin;

  const startDate = new Date(tahunParam, bulan - 1, 1);
  const endDate = new Date(tahunParam, bulan, 0, 23, 59, 59);

  const { data, error } = await supabase
    .from("KotakAmalJumat")
    .select("jumlah")
    .gte("tanggal", startDate.toISOString())
    .lte("tanggal", endDate.toISOString());

  if (error) {
    console.error("Error mengambil data kotak amal jumat bulanan:", error);
    throw new Error("Gagal mengambil data kotak amal jumat bulanan");
  }

  return data?.reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0;
}

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("KotakAmalJumat")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return [...new Set(data.map((item) => item.tahun))];
}