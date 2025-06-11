// src/lib/services/supabase/kotak-amal.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { KotakAmalData } from "@/components/admin/layout/finance/pemasukan/table-donation/schema";

export async function getKotakAmalData(
  tahunFilter?: number
): Promise<KotakAmalData[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("KotakAmal")
    .select("*")
    .order("no", { ascending: true });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data kotak amal:", error);
    throw new Error("Gagal mengambil data kotak amal");
  }

  return data || [];
}

export async function updateKotakAmalBulanan(
  id: number,
  bulan:
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
    | "des",
  jumlah: number
): Promise<KotakAmalData> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("KotakAmal")
    .update({ [bulan]: jumlah })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error mengupdate kotak amal bulan ${bulan}:`, error);
    throw new Error(`Gagal mengupdate kotak amal bulan ${bulan}`);
  }

  return data;
}

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("KotakAmal")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return [...new Set(data.map((item) => item.tahun))];
}

export async function updateKotakAmalOrder(kotakAmalData: KotakAmalData[]) {
  const supabase = await createServerSupabaseClient();

  const updates = kotakAmalData.map((item, index) => ({
    id: item.id,
    no: index + 1,
  }));

  const { error } = await supabase
    .from("KotakAmal")
    .upsert(updates, { onConflict: "id" });

  if (error) {
    console.error("Error updating kotak amal order:", error);
    throw new Error("Failed to update kotak amal order");
  }

  return true;
}

export async function getKotakAmalById(
  id: number
): Promise<KotakAmalData | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("KotakAmal")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data kotak amal:", error);
    throw new Error("Gagal mengambil data kotak amal");
  }

  return data;
}

export async function createKotakAmal(
  kotakAmal: Omit<KotakAmalData, "id" | "createdAt"> & {
    tahun: number;
  }
): Promise<KotakAmalData> {
  const supabase = await createServerSupabaseClient();

  const { data: lastItem, error: lastItemError } = await supabase
    .from("KotakAmal")
    .select("no")
    .eq("tahun", kotakAmal.tahun)
    .order("no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastItemError) {
    console.error("Error mengambil nomor terakhir:", lastItemError);
    throw new Error("Gagal mengambil nomor terakhir");
  }

  const nextNo = lastItem ? (lastItem.no || 0) + 1 : 1;

  const { data, error } = await supabase
    .from("KotakAmal")
    .insert([
      {
        ...kotakAmal,
        no: nextNo,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error membuat kotak amal:", error);
    throw new Error("Gagal membuat kotak amal");
  }

  return data;
}

export async function updateKotakAmal(
  id: number,
  kotakAmal: Partial<Omit<KotakAmalData, "id" | "createdAt">>
): Promise<KotakAmalData> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("KotakAmal")
    .update(kotakAmal)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate kotak amal:", error);
    throw new Error("Gagal mengupdate kotak amal");
  }

  return data;
}

export async function deleteKotakAmal(id: number): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: kotakAmalToDelete, error: getError } = await supabase
      .from("KotakAmal")
      .select("tahun")
      .eq("id", id)
      .single();

    if (getError) throw getError;

    const { error: deleteError } = await supabase
      .from("KotakAmal")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    const { data: remainingItems, error: getRemainingError } = await supabase
      .from("KotakAmal")
      .select("id")
      .eq("tahun", kotakAmalToDelete.tahun)
      .order("no", { ascending: true });

    if (getRemainingError) throw getRemainingError;

    if (remainingItems) {
      for (let i = 0; i < remainingItems.length; i++) {
        const { error: updateError } = await supabase
          .from("KotakAmal")
          .update({ no: i + 1 })
          .eq("id", remainingItems[i].id);

        if (updateError) throw updateError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error menghapus kotak amal:", error);
    throw new Error("Gagal menghapus kotak amal");
  }
}

export async function getKotakAmalBulanan(
  tahun: number,
  bulan: string
): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const bulanMapping: { [key: string]: string } = {
    jan: "jan",
    feb: "feb",
    mar: "mar",
    apr: "apr",
    mei: "mei",
    jun: "jun",
    jul: "jul",
    aug: "aug",
    sep: "sep",
    okt: "okt",
    nov: "nov",
    des: "des",
  };

  const kolom = bulanMapping[bulan.toLowerCase()];

  if (!kolom) {
    throw new Error("Bulan tidak valid");
  }

  const { data, error } = await supabase
    .from("KotakAmal")
    .select(`${kolom}`)
    .eq("tahun", tahun);

  if (error) {
    console.error(`Error mengambil total kotak amal bulan ${bulan}:`, error);
    throw new Error(`Gagal mengambil total kotak amal bulan ${bulan}`);
  }

  return (
    data?.reduce(
      (total, item) =>
        total + ((item[kolom as keyof typeof item] as number) || 0),
      0
    ) || 0
  );
}

export async function getKotakAmalTahunan(tahun: number): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("KotakAmal")
    .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
    .eq("tahun", tahun);

  if (error) {
    console.error("Error mengambil total kotak amal tahunan:", error);
    throw new Error("Gagal mengambil total kotak amal tahunan");
  }

  return (
    data?.reduce((total, item) => {
      return (
        total +
        (item.jan || 0) +
        (item.feb || 0) +
        (item.mar || 0) +
        (item.apr || 0) +
        (item.mei || 0) +
        (item.jun || 0) +
        (item.jul || 0) +
        (item.aug || 0) +
        (item.sep || 0) +
        (item.okt || 0) +
        (item.nov || 0) +
        (item.des || 0)
      );
    }, 0) || 0
  );
}

export async function getTotalKotakAmal(tahun?: number): Promise<number> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("KotakAmal")
    .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des");

  if (tahun) {
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching kotak amal total:", error);
    throw new Error("Failed to fetch kotak amal total");
  }

  return (
    data?.reduce((total, item) => {
      return (
        total +
        (item.jan || 0) +
        (item.feb || 0) +
        (item.mar || 0) +
        (item.apr || 0) +
        (item.mei || 0) +
        (item.jun || 0) +
        (item.jul || 0) +
        (item.aug || 0) +
        (item.sep || 0) +
        (item.okt || 0) +
        (item.nov || 0) +
        (item.des || 0)
      );
    }, 0) || 0
  );
}
