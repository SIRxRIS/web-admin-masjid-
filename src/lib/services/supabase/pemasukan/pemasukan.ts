// src/lib/services/supabase/pemasukan/pemasukan.ts
import { supabaseAdmin } from "../../../supabase/admin";
import {
  type DonaturData,
  type KotakAmalData,
  type DonasiKhususData,
  type KotakAmalMasjidData,
  type PemasukanData,
  type CreatePemasukanInput,
  type UpdatePemasukanInput,
  donaturSchema,
  kotakAmalSchema,
  donasiKhususSchema,
  kotakAmalMasjidSchema,
  pemasukanSchema,
  createPemasukanSchema,
  updatePemasukanSchema,
} from "../../../schema/pemasukan/schema";

// ========== FUNGSI UNTUK MENGELOLA DATA DONATUR ==========
export async function getDonaturData(tahun?: number): Promise<DonaturData[]> {
  let query = supabaseAdmin
    .from("Donatur")
    .select("*")
    .order("no", { ascending: true });

  if (tahun) {
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data donatur:", error);
    throw new Error("Gagal mengambil data donatur");
  }

  return (data || []).map((item) => donaturSchema.parse(item));
}

export async function getDonaturById(id: number): Promise<DonaturData | null> {
  const { data, error } = await supabaseAdmin
    .from("Donatur")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data donatur:", error);
    return null;
  }

  return data ? donaturSchema.parse(data) : null;
}

export async function createDonatur(
  donatur: Omit<DonaturData, "id" | "createdAt" | "updatedAt">,
): Promise<DonaturData> {
  const { data, error } = await supabaseAdmin
    .from("Donatur")
    .insert([donatur])
    .select()
    .single();

  if (error) {
    console.error("Error membuat donatur:", error);
    throw new Error("Gagal membuat donatur");
  }

  return donaturSchema.parse(data);
}

export async function updateDonatur(
  id: number,
  donatur: Partial<Omit<DonaturData, "id" | "createdAt" | "updatedAt">>,
): Promise<DonaturData> {
  const { data, error } = await supabaseAdmin
    .from("Donatur")
    .update(donatur)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate donatur:", error);
    throw new Error("Gagal mengupdate donatur");
  }

  return donaturSchema.parse(data);
}

// ========== FUNGSI UNTUK MENGELOLA DATA KOTAK AMAL ==========
export async function getKotakAmalData(
  tahun?: number,
): Promise<KotakAmalData[]> {
  let query = supabaseAdmin
    .from("KotakAmal")
    .select("*")
    .order("no", { ascending: true });

  if (tahun) {
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data kotak amal:", error);
    throw new Error("Gagal mengambil data kotak amal");
  }

  return (data || []).map((item) => kotakAmalSchema.parse(item));
}

export async function createKotakAmal(
  kotakAmal: Omit<KotakAmalData, "id" | "createdAt">,
): Promise<KotakAmalData> {
  const { data, error } = await supabaseAdmin
    .from("KotakAmal")
    .insert([kotakAmal])
    .select()
    .single();

  if (error) {
    console.error("Error membuat kotak amal:", error);
    throw new Error("Gagal membuat kotak amal");
  }

  return kotakAmalSchema.parse(data);
}

// ========== FUNGSI UNTUK MENGELOLA DATA DONASI KHUSUS ==========
export async function getDonasiKhususData(
  tahun?: number,
): Promise<DonasiKhususData[]> {
  let query = supabaseAdmin
    .from("DonasiKhusus")
    .select("*")
    .order("no", { ascending: true });

  if (tahun) {
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data donasi khusus:", error);
    throw new Error("Gagal mengambil data donasi khusus");
  }

  // Tambahkan field bulan dari tanggal sebelum validasi
  return (data || []).map((item) => {
    const tanggalObj = new Date(item.tanggal);
    const bulan = tanggalObj.getMonth() + 1; // +1 karena getMonth() mulai dari 0

    const itemWithBulan = {
      ...item,
      bulan: bulan,
    };

    return donasiKhususSchema.parse(itemWithBulan);
  });
}

export async function getDonasiKhususById(
  id: number,
): Promise<DonasiKhususData | null> {
  const { data, error } = await supabaseAdmin
    .from("DonasiKhusus")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data donasi khusus:", error);
    return null;
  }

  if (!data) return null;

  // Tambahkan field bulan dari tanggal
  const tanggalObj = new Date(data.tanggal);
  const bulan = tanggalObj.getMonth() + 1;

  const itemWithBulan = {
    ...data,
    bulan: bulan,
  };

  return donasiKhususSchema.parse(itemWithBulan);
}

export async function createDonasiKhusus(
  donasiKhusus: Omit<DonasiKhususData, "id" | "createdAt" | "bulan">,
): Promise<DonasiKhususData> {
  const { data, error } = await supabaseAdmin
    .from("DonasiKhusus")
    .insert([donasiKhusus])
    .select()
    .single();

  if (error) {
    console.error("Error membuat donasi khusus:", error);
    throw new Error("Gagal membuat donasi khusus");
  }

  // Tambahkan field bulan dari tanggal
  const tanggalObj = new Date(data.tanggal);
  const bulan = tanggalObj.getMonth() + 1;

  const itemWithBulan = {
    ...data,
    bulan: bulan,
  };

  return donasiKhususSchema.parse(itemWithBulan);
}

// ========== FUNGSI UNTUK MENGELOLA DATA KOTAK AMAL MASJID ==========
export async function getKotakAmalMasjidData(
  tahun?: number,
): Promise<KotakAmalMasjidData[]> {
  let query = supabaseAdmin
    .from("KotakAmalMasjid")
    .select("*")
    .order("tanggal", { ascending: false });

  if (tahun) {
    query = query.eq("tahun", tahun);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data kotak amal masjid:", error);
    throw new Error("Gagal mengambil data kotak amal masjid");
  }

  return (data || []).map((item) => kotakAmalMasjidSchema.parse(item));
}

export async function createKotakAmalMasjid(
  kotakAmalMasjid: Omit<KotakAmalMasjidData, "id" | "createdAt">,
): Promise<KotakAmalMasjidData> {
  const { data, error } = await supabaseAdmin
    .from("KotakAmalMasjid")
    .insert([kotakAmalMasjid])
    .select()
    .single();

  if (error) {
    console.error("Error membuat kotak amal masjid:", error);
    throw new Error("Gagal membuat kotak amal masjid");
  }

  return kotakAmalMasjidSchema.parse(data);
}

// ========== FUNGSI STATISTIK DAN ANALISIS ==========
export async function getTotalPemasukanBySumber(
  tahun: number,
): Promise<Record<string, number>> {
  try {
    const result: Record<string, number> = {};

    // 1. Total dari Donatur
    const { data: donaturData } = await supabaseAdmin
      .from("Donatur")
      .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
      .eq("tahun", tahun);

    if (donaturData) {
      const totalDonatur = donaturData.reduce((sum, item) => {
        return (
          sum +
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
      }, 0);

      if (totalDonatur > 0) {
        result["DONATUR"] = totalDonatur;
      }
    }

    // 2. Total dari KotakAmal (KOTAK_AMAL_LUAR)
    const { data: kotakAmalData } = await supabaseAdmin
      .from("KotakAmal")
      .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
      .eq("tahun", tahun);

    if (kotakAmalData) {
      const totalKotakAmal = kotakAmalData.reduce((sum, item) => {
        return (
          sum +
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
      }, 0);

      if (totalKotakAmal > 0) {
        result["KOTAK_AMAL_LUAR"] = totalKotakAmal;
      }
    }

    // 3. Total dari KotakAmalMasjid
    const { data: kotakMasjidData } = await supabaseAdmin
      .from("KotakAmalMasjid")
      .select("jumlah")
      .eq("tahun", tahun);

    if (kotakMasjidData) {
      const totalKotakMasjid = kotakMasjidData.reduce(
        (sum, item) => sum + (item.jumlah || 0),
        0,
      );

      if (totalKotakMasjid > 0) {
        result["KOTAK_AMAL_MASJID"] = totalKotakMasjid;
      }
    }

    // 4. Total dari KotakAmalJumat
    const { data: kotakJumatData } = await supabaseAdmin
      .from("KotakAmalJumat")
      .select("jumlah")
      .eq("tahun", tahun);

    if (kotakJumatData) {
      const totalKotakJumat = kotakJumatData.reduce(
        (sum, item) => sum + (item.jumlah || 0),
        0,
      );

      if (totalKotakJumat > 0) {
        result["KOTAK_AMAL_JUMAT"] = totalKotakJumat;
      }
    }

    // 5. Total dari DonasiKhusus
    const { data: donasiKhususData } = await supabaseAdmin
      .from("DonasiKhusus")
      .select("jumlah")
      .eq("tahun", tahun);

    if (donasiKhususData) {
      const totalDonasiKhusus = donasiKhususData.reduce(
        (sum, item) => sum + (item.jumlah || 0),
        0,
      );

      if (totalDonasiKhusus > 0) {
        result["DONASI_KHUSUS"] = totalDonasiKhusus;
      }
    }

    return result;
  } catch (error: any) {
    console.error("Error mengambil total pemasukan berdasarkan sumber:", error);
    throw new Error("Gagal mengambil total pemasukan berdasarkan sumber");
  }
}

// Fungsi untuk mendapatkan tahun yang tersedia dari semua tabel sumber
export async function getAvailableTahunPemasukan(): Promise<number[]> {
  try {
    const tahunSet = new Set<number>();

    // Ambil tahun dari semua tabel sumber
    const [
      donaturData,
      kotakAmalData,
      kotakMasjidData,
      kotakJumatData,
      donasiKhususData,
    ] = await Promise.all([
      supabaseAdmin.from("Donatur").select("tahun"),
      supabaseAdmin.from("KotakAmal").select("tahun"),
      supabaseAdmin.from("KotakAmalMasjid").select("tahun"),
      supabaseAdmin.from("KotakAmalJumat").select("tahun"),
      supabaseAdmin.from("DonasiKhusus").select("tahun"),
    ]);

    // Kumpulkan semua tahun
    donaturData.data?.forEach((item) => tahunSet.add(item.tahun));
    kotakAmalData.data?.forEach((item) => tahunSet.add(item.tahun));
    kotakMasjidData.data?.forEach((item) => tahunSet.add(item.tahun));
    kotakJumatData.data?.forEach((item) => tahunSet.add(item.tahun));
    donasiKhususData.data?.forEach((item) => tahunSet.add(item.tahun));

    return Array.from(tahunSet).sort((a, b) => b - a); // Sort descending
  } catch (error: any) {
    console.error("Error mengambil data tahun pemasukan:", error);
    throw new Error("Gagal mengambil data tahun pemasukan");
  }
}

// Fungsi untuk statistik pemasukan
export async function getStatistikPemasukan(tahun: number) {
  try {
    const [totalBySumber] = await Promise.all([
      getTotalPemasukanBySumber(tahun),
    ]);

    const totalTahunan = Object.values(totalBySumber).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    // Hitung data bulanan dari semua sumber
    const dataBulanan = [];
    for (let bulan = 1; bulan <= 12; bulan++) {
      let totalBulan = 0;

      // Dari Donatur
      const { data: donaturData } = await supabaseAdmin
        .from("Donatur")
        .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
        .eq("tahun", tahun);

      if (donaturData) {
        const monthNames = [
          "jan",
          "feb",
          "mar",
          "apr",
          "mei",
          "jun",
          "jul",
          "aug",
          "sep",
          "okt",
          "nov",
          "des",
        ] as const;
        const monthKey = monthNames[bulan - 1];

        donaturData.forEach((donatur) => {
          totalBulan += donatur[monthKey] || 0;
        });
      }

      // Dari KotakAmal
      const { data: kotakAmalData } = await supabaseAdmin
        .from("KotakAmal")
        .select("jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
        .eq("tahun", tahun);

      if (kotakAmalData) {
        const monthNames = [
          "jan",
          "feb",
          "mar",
          "apr",
          "mei",
          "jun",
          "jul",
          "aug",
          "sep",
          "okt",
          "nov",
          "des",
        ] as const;
        const monthKey = monthNames[bulan - 1];

        kotakAmalData.forEach((kotak) => {
          totalBulan += kotak[monthKey] || 0;
        });
      }

      // Dari KotakAmalMasjid, KotakAmalJumat dan DonasiKhusus (berdasarkan tanggal)
      const startDate = new Date(tahun, bulan - 1, 1);
      const endDate = new Date(tahun, bulan, 0);

      const [kotakMasjidData, kotakJumatData, donasiKhususData] =
        await Promise.all([
          supabaseAdmin
            .from("KotakAmalMasjid")
            .select("jumlah")
            .eq("tahun", tahun)
            .gte("tanggal", startDate.toISOString().split("T")[0])
            .lte("tanggal", endDate.toISOString().split("T")[0]),
          supabaseAdmin
            .from("KotakAmalJumat")
            .select("jumlah")
            .eq("tahun", tahun)
            .gte("tanggal", startDate.toISOString().split("T")[0])
            .lte("tanggal", endDate.toISOString().split("T")[0]),
          supabaseAdmin
            .from("DonasiKhusus")
            .select("jumlah")
            .eq("tahun", tahun)
            .gte("tanggal", startDate.toISOString().split("T")[0])
            .lte("tanggal", endDate.toISOString().split("T")[0]),
        ]);

      if (kotakMasjidData.data) {
        kotakMasjidData.data.forEach((item) => {
          totalBulan += item.jumlah || 0;
        });
      }

      if (kotakJumatData.data) {
        kotakJumatData.data.forEach((item) => {
          totalBulan += item.jumlah || 0;
        });
      }

      if (donasiKhususData.data) {
        donasiKhususData.data.forEach((item) => {
          totalBulan += item.jumlah || 0;
        });
      }

      dataBulanan.push({
        bulan: bulan,
        jumlah: totalBulan,
      });
    }

    return {
      totalTahunan,
      totalBySumber,
      dataBulanan,
    };
  } catch (error: any) {
    console.error("Error mengambil statistik pemasukan:", error);
    throw new Error("Gagal mengambil statistik pemasukan");
  }
}

// ========== FUNGSI UNTUK LAPORAN ==========
export async function getPemasukanData(filter?: { tahun?: number }): Promise<{
  donatur: DonaturData[];
  kotakAmal: KotakAmalData[];
  donasiKhusus: DonasiKhususData[];
  kotakAmalMasjid: KotakAmalMasjidData[];
}> {
  try {
    const [donatur, kotakAmal, donasiKhusus, kotakAmalMasjid] =
      await Promise.all([
        getDonaturData(filter?.tahun),
        getKotakAmalData(filter?.tahun),
        getDonasiKhususData(filter?.tahun),
        getKotakAmalMasjidData(filter?.tahun),
      ]);

    return {
      donatur,
      kotakAmal,
      donasiKhusus,
      kotakAmalMasjid,
    };
  } catch (error) {
    console.error("Error mengambil data pemasukan:", error);
    throw new Error("Gagal mengambil data pemasukan");
  }
}

export async function getPemasukanByDateRange(
  tanggalMulai: Date,
  tanggalSelesai: Date,
): Promise<{
  donasiKhusus: DonasiKhususData[];
  kotakAmalMasjid: KotakAmalMasjidData[];
}> {
  try {
    const startDate = tanggalMulai.toISOString().split("T")[0];
    const endDate = tanggalSelesai.toISOString().split("T")[0];

    const [donasiKhususResult, kotakAmalMasjidResult] = await Promise.all([
      supabaseAdmin
        .from("DonasiKhusus")
        .select("*")
        .gte("tanggal", startDate)
        .lte("tanggal", endDate)
        .order("tanggal", { ascending: false }),
      supabaseAdmin
        .from("KotakAmalMasjid")
        .select("*")
        .gte("tanggal", startDate)
        .lte("tanggal", endDate)
        .order("tanggal", { ascending: false }),
    ]);

    if (donasiKhususResult.error) {
      console.error("Error mengambil donasi khusus:", donasiKhususResult.error);
      throw new Error("Gagal mengambil data donasi khusus");
    }

    if (kotakAmalMasjidResult.error) {
      console.error(
        "Error mengambil kotak amal masjid:",
        kotakAmalMasjidResult.error,
      );
      throw new Error("Gagal mengambil data kotak amal masjid");
    }

    const donasiKhusus = (donasiKhususResult.data || []).map((item) => {
      const tanggalObj = new Date(item.tanggal);
      const bulan = tanggalObj.getMonth() + 1;
      return donasiKhususSchema.parse({ ...item, bulan });
    });

    const kotakAmalMasjid = (kotakAmalMasjidResult.data || []).map((item) =>
      kotakAmalMasjidSchema.parse(item),
    );

    return {
      donasiKhusus,
      kotakAmalMasjid,
    };
  } catch (error) {
    console.error("Error mengambil data pemasukan by date range:", error);
    throw new Error("Gagal mengambil data pemasukan berdasarkan tanggal");
  }
}

// ========== FUNGSI UNTUK MENGELOLA DATA PEMASUKAN ==========

export async function createPemasukan(
  pemasukanData: CreatePemasukanInput,
): Promise<PemasukanData> {
  // Validasi input dengan schema
  const validatedData = createPemasukanSchema.parse(pemasukanData);

  const { data, error } = await supabaseAdmin
    .from("Pemasukan")
    .insert([validatedData])
    .select()
    .single();

  if (error) {
    console.error("Error membuat pemasukan:", error);
    throw new Error("Gagal membuat data pemasukan");
  }

  return pemasukanSchema.parse(data);
}

export async function getPemasukanById(
  id: number,
): Promise<PemasukanData | null> {
  const { data, error } = await supabaseAdmin
    .from("Pemasukan")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil pemasukan:", error);
    return null;
  }

  return pemasukanSchema.parse(data);
}

export async function updatePemasukan(
  id: number,
  pemasukanData: Partial<Omit<CreatePemasukanInput, "id">>,
): Promise<PemasukanData> {
  // Validasi input dengan schema partial
  const validatedData = createPemasukanSchema.partial().parse(pemasukanData);

  const { data, error } = await supabaseAdmin
    .from("Pemasukan")
    .update(validatedData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate pemasukan:", error);
    throw new Error("Gagal mengupdate data pemasukan");
  }

  return pemasukanSchema.parse(data);
}

export async function deletePemasukan(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from("Pemasukan").delete().eq("id", id);

  if (error) {
    console.error("Error menghapus pemasukan:", error);
    return { success: false, error: "Gagal menghapus data pemasukan" };
  }

  return { success: true };
}
