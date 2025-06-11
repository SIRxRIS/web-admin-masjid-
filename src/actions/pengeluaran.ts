// src/actions/pengeluaran.ts
"use server";

import {
  getPengeluaranData as getPengeluaranDataService,
  getAvailableTahun as getAvailableTahunService,
  createPengeluaran as createPengeluaranService,
  updatePengeluaran as updatePengeluaranService,
  deletePengeluaran as deletePengeluaranService,
  getPengeluaranById as getPengeluaranByIdService,
  getPengeluaranBulanan as getPengeluaranBulananService,
  getPengeluaranTahunan as getPengeluaranTahunanService,
  validatePengeluaranData, // Import dari services layer
} from "@/lib/services/supabase/pengeluaran/pengeluaran";
import { type Pengeluaran } from "@prisma/client";

// Server Actions untuk digunakan oleh Client Components
export async function getPengeluaranData(tahunFilter?: number) {
  try {
    const data = await getPengeluaranDataService(tahunFilter);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil data pengeluaran:", error);
    throw new Error("Gagal mengambil data pengeluaran");
  }
}

export async function getAvailableTahun() {
  try {
    const years = await getAvailableTahunService();
    return years;
  } catch (error) {
    console.error("Server Action - Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }
}

export async function getPengeluaranById(id: number) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pengeluaran tidak valid");
    }

    const data = await getPengeluaranByIdService(id);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil pengeluaran by ID:", error);
    throw new Error("Gagal mengambil data pengeluaran");
  }
}

export async function createPengeluaran(
  pengeluaran: Omit<Pengeluaran, "id" | "createdAt" | "updatedAt" | "no"> & {
    tahun: number;
  }
) {
  try {
    if (!pengeluaran) {
      throw new Error("Data pengeluaran tidak boleh kosong");
    }

    // Gunakan fungsi validasi dari services layer
    const validation = validatePengeluaranData(pengeluaran, false);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const result = await createPengeluaranService(pengeluaran);
    return result;
  } catch (error) {
    console.error("Server Action - Error membuat pengeluaran:", error);
    throw error; // Throw original error untuk mendapatkan pesan yang tepat
  }
}

export async function updatePengeluaran(
  id: number,
  pengeluaran: Partial<Omit<Pengeluaran, "id" | "createdAt" | "updatedAt">>
) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pengeluaran tidak valid");
    }

    if (!pengeluaran || Object.keys(pengeluaran).length === 0) {
      throw new Error("Data update tidak boleh kosong");
    }

    // Gunakan fungsi validasi dari services layer untuk update
    const validation = validatePengeluaranData(pengeluaran, true);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const result = await updatePengeluaranService(id, pengeluaran);
    return result;
  } catch (error) {
    console.error("Server Action - Error update pengeluaran:", error);
    throw error; // Throw original error untuk mendapatkan pesan yang tepat
  }
}

export async function deletePengeluaran(id: number): Promise<boolean> {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pengeluaran tidak valid");
    }

    const result = await deletePengeluaranService(id);
    // Pastikan return value adalah boolean
    return Boolean(result);
  } catch (error) {
    console.error("Server Action - Error hapus pengeluaran:", error);
    throw new Error("Gagal menghapus pengeluaran");
  }
}

export async function getPengeluaranBulanan(tahun: number, bulan: number) {
  try {
    if (!tahun || tahun <= 0) {
      throw new Error("Tahun tidak valid");
    }

    if (!bulan || bulan < 1 || bulan > 12) {
      throw new Error("Bulan tidak valid (1-12)");
    }

    const total = await getPengeluaranBulananService(tahun, bulan);
    return total;
  } catch (error) {
    console.error("Server Action - Error mengambil pengeluaran bulanan:", error);
    throw new Error("Gagal mengambil total pengeluaran bulanan");
  }
}

export async function getPengeluaranTahunan(tahun: number) {
  try {
    if (!tahun || tahun <= 0) {
      throw new Error("Tahun tidak valid");
    }

    const total = await getPengeluaranTahunanService(tahun);
    return total;
  } catch (error) {
    console.error("Server Action - Error mengambil pengeluaran tahunan:", error);
    throw new Error("Gagal mengambil total pengeluaran tahunan");
  }
}

// Helper function untuk mendapatkan ringkasan pengeluaran
export async function getRingkasanPengeluaran(tahun: number) {
  try {
    if (!tahun || tahun <= 0) {
      throw new Error("Tahun tidak valid");
    }

    const [totalTahunan, dataPengeluaran] = await Promise.all([
      getPengeluaranTahunanService(tahun),
      getPengeluaranDataService(tahun)
    ]);

    // Hitung total per bulan
    const totalPerBulan = Array.from({ length: 12 }, (_, index) => {
      const bulan = index + 1;
      return dataPengeluaran
        .filter(item => {
          const itemDate = new Date(item.tanggal);
          return itemDate.getMonth() + 1 === bulan;
        })
        .reduce((sum, item) => sum + item.jumlah, 0);
    });

    return {
      totalTahunan,
      totalPerBulan,
      jumlahTransaksi: dataPengeluaran.length,
      rataRataPerBulan: totalTahunan / 12,
    };
  } catch (error) {
    console.error("Server Action - Error mengambil ringkasan pengeluaran:", error);
    throw new Error("Gagal mengambil ringkasan pengeluaran");
  }
}

// Helper function untuk mendapatkan pengeluaran terbaru
export async function getPengeluaranTerbaru(limit: number = 5) {
  try {
    if (limit <= 0) {
      throw new Error("Limit harus lebih dari 0");
    }

    const allData = await getPengeluaranDataService();
    
    // Ambil data terbaru berdasarkan tanggal
    const dataTerbaru = allData
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, limit);

    return dataTerbaru;
  } catch (error) {
    console.error("Server Action - Error mengambil pengeluaran terbaru:", error);
    throw new Error("Gagal mengambil pengeluaran terbaru");
  }
}