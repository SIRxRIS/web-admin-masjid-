// src/actions/pengeluaran.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPengeluaran,
  deletePengeluaran,
  getPengeluaranById,
  updatePengeluaran,
  getPengeluaranData,
  getPengeluaranBulanan,
  getPengeluaranTahunan,
  getAvailableTahun,
  getPengeluaranByNama,
  getPengeluaranByDateRange,
  getPengeluaranTahunanData,
} from "@/lib/services/supabase/pengeluaran/pengeluaran";
import {
  type PengeluaranData,
  type PengeluaranTahunanData,
  type CreatePengeluaranInput,
} from "@/lib/schema/pengeluaran/schema";

// State untuk form action
export interface ActionState {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
}

// ============== CRUD OPERATIONS ==============

// Action untuk membuat pengeluaran baru
export async function createPengeluaranAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const tanggal = formData.get("tanggal") as string;
    const nama = formData.get("nama") as string;
    const jumlah = formData.get("jumlah") as string;
    const keterangan = formData.get("keterangan") as string;

    // Validasi input
    const errors: Record<string, string[]> = {};

    if (!tanggal?.trim()) {
      errors.tanggal = ["Tanggal wajib diisi"];
    }
    if (!nama?.trim()) {
      errors.nama = ["Nama pengeluaran wajib diisi"];
    }
    if (!jumlah?.trim()) {
      errors.jumlah = ["Jumlah pengeluaran wajib diisi"];
    }

    // Validasi jumlah harus angka
    const jumlahNumber = parseFloat(jumlah);
    if (isNaN(jumlahNumber) || jumlahNumber <= 0) {
      errors.jumlah = ["Jumlah harus berupa angka positif"];
    }

    // Validasi tanggal
    const tanggalDate = new Date(tanggal);
    if (isNaN(tanggalDate.getTime())) {
      errors.tanggal = ["Format tanggal tidak valid"];
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Terdapat kesalahan dalam pengisian form",
        errors,
      };
    }

    const pengeluaranData: CreatePengeluaranInput = {
      tanggal: tanggalDate,
      tahun: tanggalDate.getFullYear(),
      nama: nama.trim(),
      jumlah: jumlahNumber,
      no: 1, // Default value, atau bisa diambil dari form jika diperlukan
      keterangan: keterangan?.trim() || "",
    };

    const newPengeluaran = await createPengeluaran(pengeluaranData);

    revalidatePath("/pengeluaran");
    
    return {
      success: true,
      message: "Pengeluaran berhasil ditambahkan",
      data: newPengeluaran,
    };
  } catch (error) {
    console.error("Error dalam createPengeluaranAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk mengupdate pengeluaran
export async function updatePengeluaranAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const tanggal = formData.get("tanggal") as string;
    const nama = formData.get("nama") as string;
    const jumlah = formData.get("jumlah") as string;
    const keterangan = formData.get("keterangan") as string;

    // Validasi input
    const errors: Record<string, string[]> = {};

    if (!tanggal?.trim()) {
      errors.tanggal = ["Tanggal wajib diisi"];
    }
    if (!nama?.trim()) {
      errors.nama = ["Nama pengeluaran wajib diisi"];
    }
    if (!jumlah?.trim()) {
      errors.jumlah = ["Jumlah pengeluaran wajib diisi"];
    }

    // Validasi jumlah harus angka
    const jumlahNumber = parseFloat(jumlah);
    if (isNaN(jumlahNumber) || jumlahNumber <= 0) {
      errors.jumlah = ["Jumlah harus berupa angka positif"];
    }

    // Validasi tanggal
    const tanggalDate = new Date(tanggal);
    if (isNaN(tanggalDate.getTime())) {
      errors.tanggal = ["Format tanggal tidak valid"];
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Terdapat kesalahan dalam pengisian form",
        errors,
      };
    }

    const updateData: Partial<Omit<PengeluaranData, "id" | "createdAt" | "updatedAt">> = {
      tanggal: tanggalDate,
      tahun: tanggalDate.getFullYear(),
      nama: nama.trim(),
      jumlah: jumlahNumber,
      no: 1, // Atau ambil dari form jika field no bisa diubah
      keterangan: keterangan?.trim() || "",
    };

    const updatedPengeluaran = await updatePengeluaran(id, updateData);

    revalidatePath("/pengeluaran");
    revalidatePath(`/pengeluaran/${id}`);

    return {
      success: true,
      message: "Pengeluaran berhasil diperbarui",
      data: updatedPengeluaran,
    };
  } catch (error) {
    console.error("Error dalam updatePengeluaranAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk menghapus pengeluaran
export async function deletePengeluaranAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Cek apakah pengeluaran ada sebelum menghapus
    const existingPengeluaran = await getPengeluaranById(id);
    if (!existingPengeluaran) {
      return {
        success: false,
        message: "Data pengeluaran tidak ditemukan",
      };
    }

    await deletePengeluaran(id);

    revalidatePath("/pengeluaran");

    return {
      success: true,
      message: "Pengeluaran berhasil dihapus",
    };
  } catch (error) {
    console.error("Error dalam deletePengeluaranAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk menghapus pengeluaran dengan redirect
export async function deletePengeluaranWithRedirectAction(
  id: number
): Promise<void> {
  try {
    await deletePengeluaran(id);
    revalidatePath("/pengeluaran");
  } catch (error) {
    console.error("Error dalam deletePengeluaranWithRedirectAction:", error);
    throw error;
  }
  
  redirect("/pengeluaran");
}

// ============== READ OPERATIONS ==============

// Action untuk mengambil semua data pengeluaran
export async function getPengeluaranAction(
  tahunFilter?: number
): Promise<ActionState> {
  try {
    const data = await getPengeluaranData(tahunFilter);
    
    return {
      success: true,
      message: "Data pengeluaran berhasil diambil",
      data,
    };
  } catch (error) {
    console.error("Error dalam getPengeluaranAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengambil data pengeluaran",
    };
  }
}

// Action untuk mengambil pengeluaran berdasarkan ID
export async function getPengeluaranByIdAction(
  id: number
): Promise<ActionState> {
  try {
    const data = await getPengeluaranById(id);
    
    if (!data) {
      return {
        success: false,
        message: "Data pengeluaran tidak ditemukan",
      };
    }
    
    return {
      success: true,
      message: "Data pengeluaran berhasil diambil",
      data,
    };
  } catch (error) {
    console.error("Error dalam getPengeluaranByIdAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengambil data pengeluaran",
    };
  }
}

// Action untuk mengambil total pengeluaran bulanan
export async function getPengeluaranBulananAction(
  tahun: number,
  bulan: number
): Promise<ActionState> {
  try {
    const total = await getPengeluaranBulanan(tahun, bulan);
    
    return {
      success: true,
      message: "Total pengeluaran bulanan berhasil diambil",
      data: { total, tahun, bulan },
    };
  } catch (error) {
    console.error("Error dalam getPengeluaranBulananAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengambil total pengeluaran bulanan",
    };
  }
}

// Action untuk mengambil total pengeluaran tahunan
export async function getPengeluaranTahunanAction(
  tahun: number
): Promise<ActionState> {
  try {
    const total = await getPengeluaranTahunan(tahun);
    
    return {
      success: true,
      message: "Total pengeluaran tahunan berhasil diambil",
      data: { total, tahun },
    };
  } catch (error) {
    console.error("Error dalam getPengeluaranTahunanAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengambil total pengeluaran tahunan",
    };
  }
}

// Action untuk mengambil tahun-tahun yang tersedia
export async function getAvailableTahunAction(): Promise<ActionState> {
  try {
    const tahunList = await getAvailableTahun();
    
    return {
      success: true,
      message: "Daftar tahun berhasil diambil",
      data: tahunList,
    };
  } catch (error) {
    console.error("Error dalam getAvailableTahunAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengambil daftar tahun",
    };
  }
}

// Action untuk pencarian pengeluaran berdasarkan nama
export async function searchPengeluaranByNamaAction(
  nama: string,
  tahun?: number
): Promise<ActionState> {
  try {
    if (!nama.trim()) {
      return {
        success: false,
        message: "Nama pencarian tidak boleh kosong",
      };
    }

    const data = await getPengeluaranByNama(nama, tahun);
    
    return {
      success: true,
      message: `Ditemukan ${data.length} hasil pencarian`,
      data,
    };
  } catch (error) {
    console.error("Error dalam searchPengeluaranByNamaAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal melakukan pencarian",
    };
  }
}

// Action untuk mengambil pengeluaran berdasarkan rentang tanggal
export async function getPengeluaranByDateRangeAction(
  startDate: string,
  endDate: string
): Promise<ActionState> {
  try {
    // Validasi tanggal
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        success: false,
        message: "Format tanggal tidak valid",
      };
    }
    
    if (start > end) {
      return {
        success: false,
        message: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
      };
    }

    const data = await getPengeluaranByDateRange(start, end);
    
    return {
      success: true,
      message: `Ditemukan ${data.length} data dalam rentang tanggal`,
      data,
    };
  } catch (error) {
    console.error("Error dalam getPengeluaranByDateRangeAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengambil data berdasarkan rentang tanggal",
    };
  }
}

// Action untuk mengambil data pengeluaran tahunan (format bulanan)
export async function getPengeluaranTahunanDataAction(
  tahun?: number
): Promise<ActionState> {
  try {
    const data = await getPengeluaranTahunanData(tahun);
    
    return {
      success: true,
      message: "Data pengeluaran tahunan berhasil diambil",
      data,
    };
  } catch (error) {
    console.error("Error dalam getPengeluaranTahunanDataAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengambil data pengeluaran tahunan",
    };
  }
}

// ============== UTILITY ACTIONS ==============

// Action sederhana untuk revalidate path
export async function revalidatePengeluaranAction(): Promise<void> {
  revalidatePath("/pengeluaran");
}

// Action untuk revalidate specific pengeluaran
export async function revalidatePengeluaranDetailAction(id: number): Promise<void> {
  revalidatePath(`/pengeluaran/${id}`);
  revalidatePath("/pengeluaran");
}

// Action untuk mengambil statistik pengeluaran
export async function getPengeluaranStatistikAction(
  tahun: number
): Promise<ActionState> {
  try {
    const totalTahunan = await getPengeluaranTahunan(tahun);
    const dataPengeluaran = await getPengeluaranData(tahun);
    
    // Hitung statistik bulanan
    const statistikBulanan = [];
    for (let bulan = 1; bulan <= 12; bulan++) {
      const totalBulanan = await getPengeluaranBulanan(tahun, bulan);
      statistikBulanan.push({
        bulan,
        total: totalBulanan,
      });
    }
    
    // Hitung rata-rata per bulan
    const rataRataBulanan = totalTahunan / 12;
    
    return {
      success: true,
      message: "Statistik pengeluaran berhasil diambil",
      data: {
        tahun,
        totalTahunan,
        rataRataBulanan,
        jumlahTransaksi: dataPengeluaran.length,
        statistikBulanan,
      },
    };
  } catch (error) {
    console.error("Error dalam getPengeluaranStatistikAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengambil statistik pengeluaran",
    };
  }
}

// Simple action untuk form submission dengan object data
export async function createPengeluaranSimpleAction(data: {
  nama: string;
  tanggal: Date;
  jumlah: number;
  keterangan?: string;
}): Promise<ActionState> {
  try {
    const pengeluaranData: CreatePengeluaranInput = {
      tanggal: data.tanggal,
      tahun: data.tanggal.getFullYear(),
      nama: data.nama.trim(),
      jumlah: data.jumlah,
      no: 1, // Will be auto-generated in the service
      keterangan: data.keterangan?.trim() || "",
    };

    const newPengeluaran = await createPengeluaran(pengeluaranData);

    revalidatePath("/pengeluaran");
    
    return {
      success: true,
      message: "Pengeluaran berhasil ditambahkan",
      data: newPengeluaran,
    };
  } catch (error) {
    console.error("Error dalam createPengeluaranSimpleAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan pengeluaran",
    };
  }
}