// src/lib/services/supabase/kotak-amal-masjid.ts
import { createClient } from "@/lib/supabase/client";
import { KotakAmalMasjidData } from "@/components/admin/layout/finance/pemasukan/table-donation/schema";

// Fungsi untuk mendapatkan client Supabase
function getSupabaseClient() {
  return createClient();
}

export async function getKotakAmalMasjidData(
  tahunFilter?: number
): Promise<KotakAmalMasjidData[]> {
  const supabase = getSupabaseClient();

  try {
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
      throw new Error(
        `Gagal mengambil data kotak amal masjid: ${error.message}`
      );
    }

    return data || [];
  } catch (error) {
    console.error("Error unexpected:", error);
    throw error instanceof Error ? error : new Error("Error tidak diketahui");
  }
}

export async function createKotakAmal(
  kotakAmalMasjid: Omit<KotakAmalMasjidData, "id" | "createdAt">
): Promise<KotakAmalMasjidData> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("KotakAmalMasjid")
      .insert([kotakAmalMasjid])
      .select()
      .single();

    if (error) {
      console.error("Error membuat kotak amal masjid:", error);
      throw new Error(`Gagal membuat kotak amal masjid: ${error.message}`);
    }

    if (!data) {
      throw new Error("Data kotak amal masjid tidak berhasil dibuat");
    }

    return data;
  } catch (error) {
    console.error("Error unexpected:", error);
    throw error instanceof Error ? error : new Error("Error tidak diketahui");
  }
}

export async function updateKotakAmal(
  id: number,
  kotakAmalMasjid: Partial<Omit<KotakAmalMasjidData, "id" | "createdAt">>
): Promise<KotakAmalMasjidData> {
  const supabase = getSupabaseClient();

  try {
    if (!id || id <= 0) {
      throw new Error("ID tidak valid");
    }

    const { data, error } = await supabase
      .from("KotakAmalMasjid")
      .update(kotakAmalMasjid)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error mengupdate kotak amal masjid:", error);
      throw new Error(`Gagal mengupdate kotak amal masjid: ${error.message}`);
    }

    if (!data) {
      throw new Error(
        "Data kotak amal masjid tidak ditemukan atau tidak berhasil diupdate"
      );
    }

    return data;
  } catch (error) {
    console.error("Error unexpected:", error);
    throw error instanceof Error ? error : new Error("Error tidak diketahui");
  }
}

export async function deleteKotakAmal(id: number): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    if (!id || id <= 0) {
      throw new Error("ID tidak valid");
    }

    const { error } = await supabase
      .from("KotakAmalMasjid")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error menghapus kotak amal masjid:", error);
      throw new Error(`Gagal menghapus kotak amal masjid: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error unexpected:", error);
    throw error instanceof Error ? error : new Error("Error tidak diketahui");
  }
}

export async function getTotalKotakAmalMasjid(tahun?: number): Promise<number> {
  const supabase = getSupabaseClient();

  try {
    let query = supabase.from("KotakAmalMasjid").select("jumlah");

    if (tahun) {
      query = query.eq("tahun", tahun);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error mengambil total kotak amal masjid:", error);
      throw new Error(
        `Gagal mengambil total kotak amal masjid: ${error.message}`
      );
    }

    return (
      data?.reduce((total, item) => total + (Number(item.jumlah) || 0), 0) || 0
    );
  } catch (error) {
    console.error("Error unexpected:", error);
    throw error instanceof Error ? error : new Error("Error tidak diketahui");
  }
}

export async function getKotakAmalMasjidTahunan(
  tahun: number
): Promise<number> {
  const supabase = getSupabaseClient();

  try {
    if (!tahun || tahun <= 0) {
      throw new Error("Tahun tidak valid");
    }

    const { data, error } = await supabase
      .from("KotakAmalMasjid")
      .select("jumlah, tanggal")
      .eq("tahun", tahun);

    if (error) {
      console.error("Error mengambil data kotak amal masjid tahunan:", error);
      throw new Error(
        `Gagal mengambil data kotak amal masjid tahunan: ${error.message}`
      );
    }

    return (
      data?.reduce((total, item) => total + (Number(item.jumlah) || 0), 0) || 0
    );
  } catch (error) {
    console.error("Error unexpected:", error);
    throw error instanceof Error ? error : new Error("Error tidak diketahui");
  }
}

export async function getKotakAmalMasjidTahunanByDate(
  tahunParam: number
): Promise<number> {
  const supabase = getSupabaseClient();

  try {
    if (!tahunParam || tahunParam <= 0) {
      throw new Error("Tahun tidak valid");
    }

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
      throw new Error(
        `Gagal mengambil data kotak amal masjid tahunan: ${error.message}`
      );
    }

    return (
      data?.reduce((total, item) => total + (Number(item.jumlah) || 0), 0) || 0
    );
  } catch (error) {
    console.error("Error unexpected:", error);
    throw error instanceof Error ? error : new Error("Error tidak diketahui");
  }
}

export async function getKotakAmalMasjidBulanan(
  tahunParam: number,
  bulan: number
): Promise<number> {
  const supabase = getSupabaseClient();

  try {
    if (!tahunParam || tahunParam <= 0) {
      throw new Error("Tahun tidak valid");
    }

    if (!bulan || bulan < 1 || bulan > 12) {
      throw new Error("Bulan tidak valid (harus 1-12)");
    }

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
      throw new Error(
        `Gagal mengambil data kotak amal masjid bulan ${bulan}: ${error.message}`
      );
    }

    return (
      data?.reduce((total, item) => total + (Number(item.jumlah) || 0), 0) || 0
    );
  } catch (error) {
    console.error("Error unexpected:", error);
    throw error instanceof Error ? error : new Error("Error tidak diketahui");
  }
}

// Tambahan fungsi untuk mendapatkan tahun yang tersedia
export async function getAvailableTahun(): Promise<number[]> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("KotakAmalMasjid")
      .select("tahun")
      .not("tahun", "is", null);

    if (error) {
      console.error("Error mengambil tahun yang tersedia:", error);
      return [new Date().getFullYear()];
    }

    if (!data || data.length === 0) {
      return [new Date().getFullYear()];
    }

    const years = [
      ...new Set(
        data
          .map((item) => Number(item.tahun))
          .filter((year) => year && year > 0)
      ),
    ];
    return years.sort((a, b) => b - a); // Urutkan dari terbaru
  } catch (error) {
    console.error("Error unexpected:", error);
    return [new Date().getFullYear()];
  }
}
