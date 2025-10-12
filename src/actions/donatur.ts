// src/actions/donatur.ts
"use server";

import { revalidatePath } from "next/cache";
import { 
  getDonaturData as getDonaturDataService,
  getAvailableTahun as getAvailableTahunService,
  getDonaturById as getDonaturByIdService,
  createDonatur as createDonaturService,
  updateDonatur as updateDonaturService,
  deleteDonatur as deleteDonaturService,
  updateDonaturOrder as updateDonaturOrderService,
  getDonaturBulanan as getDonaturBulananService,
  getDonaturTahunan as getDonaturTahunService,
  getTotalInfaq as getTotalInfaqService
} from "@/lib/services/supabase/donatur";
import { createDonaturSchema, updateDonaturSchema } from "@/lib/schema/pemasukan/schema";
import type { CreateDonaturInput, DonaturData, UpdateDonaturInput } from "@/lib/schema/pemasukan/schema";
import { z } from "zod";

// Use imported schemas from schema file

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Mengambil semua data donatur dengan filter tahun opsional
 */
export async function getDonaturData(
  tahunFilter?: number
): Promise<ActionResult<DonaturData[]>> {
  try {
    const data = await getDonaturDataService(tahunFilter);
    return { success: true, data };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data donatur",
    };
  }
}

/**
 * Mengambil daftar tahun yang tersedia
 */
export async function getAvailableTahun(): Promise<ActionResult<number[]>> {
  try {
    const years = await getAvailableTahunService();
    return { success: true, data: years };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error: "Gagal mengambil data tahun",
    };
  }
}

/**
 * Mengambil data donatur berdasarkan ID
 */
export async function getDonaturById(
  id: number
): Promise<ActionResult<DonaturData | null>> {
  try {
    const data = await getDonaturByIdService(id);
    return { success: true, data };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data donatur",
    };
  }
}

/**
 * Membuat donatur baru
 */
export async function createDonatur(
  formData: FormData
): Promise<ActionResult<DonaturData>> {
  try {
    // Extract dan validasi data dari FormData
    const rawData = {
      nama: formData.get("nama") as string,
      alamat: formData.get("alamat") as string,
      noTelp: (formData.get("noTelp") as string) || undefined,
      tahun: Number(formData.get("tahun")),
      jan: formData.get("jan") ? Number(formData.get("jan")) : 0,
      feb: formData.get("feb") ? Number(formData.get("feb")) : 0,
      mar: formData.get("mar") ? Number(formData.get("mar")) : 0,
      apr: formData.get("apr") ? Number(formData.get("apr")) : 0,
      mei: formData.get("mei") ? Number(formData.get("mei")) : 0,
      jun: formData.get("jun") ? Number(formData.get("jun")) : 0,
      jul: formData.get("jul") ? Number(formData.get("jul")) : 0,
      aug: formData.get("aug") ? Number(formData.get("aug")) : 0,
      sep: formData.get("sep") ? Number(formData.get("sep")) : 0,
      okt: formData.get("okt") ? Number(formData.get("okt")) : 0,
      nov: formData.get("nov") ? Number(formData.get("nov")) : 0,
      des: formData.get("des") ? Number(formData.get("des")) : 0,
      infaq: formData.get("infaq") ? Number(formData.get("infaq")) : 0,
    };

    // Validasi dengan Zod
    const validatedData = createDonaturSchema.parse(rawData);

    // Konversi ke format yang diharapkan service layer
    const serviceInput: CreateDonaturInput = {
      nama: validatedData.nama,
      alamat: validatedData.alamat,
      tahun: validatedData.tahun,
      jan: validatedData.jan || 0,
      feb: validatedData.feb || 0,
      mar: validatedData.mar || 0,
      apr: validatedData.apr || 0,
      mei: validatedData.mei || 0,
      jun: validatedData.jun || 0,
      jul: validatedData.jul || 0,
      aug: validatedData.aug || 0,
      sep: validatedData.sep || 0,
      okt: validatedData.okt || 0,
      nov: validatedData.nov || 0,
      des: validatedData.des || 0,
      infaq: validatedData.infaq || 0,
    };

    // Panggil service
    const result = await createDonaturService(serviceInput);

    // Revalidate cache
    revalidatePath("/admin/donatur");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/pemasukan");

    return { success: true, data: result };
  } catch (error) {
    console.error("Create Donatur Error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal membuat donatur",
    };
  }
}

/**
 * Mengupdate data donatur
 */
export async function updateDonatur(
  id: number,
  formData: FormData
): Promise<ActionResult<DonaturData>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID donatur tidak valid" };
    }

    // Extract data yang akan diupdate
    const updates: any = {};

    const nama = formData.get("nama") as string;
    if (nama) updates.nama = nama;

    const alamat = formData.get("alamat") as string;
    if (alamat) updates.alamat = alamat;

    const noTelp = formData.get("noTelp") as string;
    if (noTelp !== null) updates.noTelp = noTelp;

    const tahun = formData.get("tahun") as string;
    if (tahun) updates.tahun = Number(tahun);

    // Extract nominal bulanan
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    monthKeys.forEach(month => {
      const value = formData.get(month) as string;
      if (value !== null) {
        updates[month] = value === "" ? 0 : Number(value);
      }
    });

    const infaq = formData.get("infaq") as string;
    if (infaq !== null) {
      updates.infaq = infaq === "" ? 0 : Number(infaq);
    }

    // Validasi dengan Zod (hanya untuk update, tidak perlu semua field)
    if (Object.keys(updates).length > 0) {
      const validatedUpdates = updateDonaturSchema.parse({ id, ...updates });

      // Konversi ke format service layer yang compatible
      const serviceUpdates: Partial<UpdateDonaturInput> = {};
      
      Object.keys(validatedUpdates).forEach(key => {
        if (key !== 'id') {
          const value = (validatedUpdates as any)[key];
          if (value !== undefined) {
            (serviceUpdates as any)[key] = value;
          }
        }
      });

      const result = await updateDonaturService(id, serviceUpdates);

      // Revalidate cache
      revalidatePath("/admin/donatur");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/pemasukan");

      return { success: true, data: result };
    } else {
      return { success: false, error: "Tidak ada data yang diupdate" };
    }
  } catch (error) {
    console.error("Update Donatur Error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal mengupdate donatur",
    };
  }
}

/**
 * Menghapus donatur
 */
export async function deleteDonatur(
  id: number
): Promise<ActionResult<boolean>> {
  try {
    if (!id || id <= 0) {
      return { success: false, error: "ID donatur tidak valid" };
    }

    await deleteDonaturService(id);

    // Revalidate cache
    revalidatePath("/admin/donatur");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/pemasukan");

    return { success: true, data: true };
  } catch (error) {
    console.error("Delete Donatur Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal menghapus donatur",
    };
  }
}

/**
 * Mengupdate urutan donatur
 */
export async function updateDonaturOrder(
  donaturData: DonaturData[]
): Promise<ActionResult<boolean>> {
  try {
    if (!donaturData || donaturData.length === 0) {
      return { success: false, error: "Data donatur tidak valid" };
    }

    await updateDonaturOrderService(donaturData);

    // Revalidate cache
    revalidatePath("/admin/donatur");

    return { success: true, data: true };
  } catch (error) {
    console.error("Update Donatur Order Error:", error);
    return {
      success: false,
      error:
        error instanceof Error 
          ? error.message 
          : "Gagal mengupdate urutan donatur",
    };
  }
}

/**
 * Mengambil data donatur bulanan
 */
export async function getDonaturBulanan(
  tahun: number
): Promise<ActionResult<Record<string, number>>> {
  try {
    const data = await getDonaturBulananService(tahun);
    return { success: true, data };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data donatur bulanan",
    };
  }
}

/**
 * Mengambil total donatur tahunan
 */
export async function getDonaturTahunan(
  tahun: number
): Promise<ActionResult<number>> {
  try {
    const total = await getDonaturTahunService(tahun);
    return { success: true, data: total };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data donatur tahunan",
    };
  }
}

/**
 * Mengambil total infaq
 */
export async function getTotalInfaq(
  tahun: number
): Promise<ActionResult<number>> {
  try {
    const total = await getTotalInfaqService(tahun);
    return { success: true, data: total };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil total infaq",
    };
  }
}

/**
 * Membuat donatur baru dengan input object (untuk form yang lebih sederhana)
 */
export async function createDonaturSimpleAction(data: {
  nama: string;
  alamat: string;
  bulan: string;
  jumlah: number;
  tahun?: number;
}): Promise<ActionResult<DonaturData>> {
  try {
    // Validasi input
    if (!data.nama || data.nama.trim() === "") {
      return { success: false, error: "Nama donatur wajib diisi" };
    }
    if (!data.alamat || data.alamat.trim() === "") {
      return { success: false, error: "Alamat wajib diisi" };
    }
    if (!data.bulan) {
      return { success: false, error: "Bulan wajib dipilih" };
    }
    if (data.jumlah <= 0) {
      return { success: false, error: "Jumlah harus lebih dari 0" };
    }

    // Set tahun default ke tahun sekarang jika tidak disediakan
    const tahun = data.tahun || new Date().getFullYear();

    // Buat objek CreateDonaturInput dengan bulan yang dipilih
    const donaturData: CreateDonaturInput = {
      nama: data.nama.trim(),
      alamat: data.alamat.trim(),
      tahun,
      jan: data.bulan === "jan" ? data.jumlah : 0,
      feb: data.bulan === "feb" ? data.jumlah : 0,
      mar: data.bulan === "mar" ? data.jumlah : 0,
      apr: data.bulan === "apr" ? data.jumlah : 0,
      mei: data.bulan === "mei" ? data.jumlah : 0,
      jun: data.bulan === "jun" ? data.jumlah : 0,
      jul: data.bulan === "jul" ? data.jumlah : 0,
      aug: data.bulan === "aug" ? data.jumlah : 0,
      sep: data.bulan === "sep" ? data.jumlah : 0,
      okt: data.bulan === "okt" ? data.jumlah : 0,
      nov: data.bulan === "nov" ? data.jumlah : 0,
      des: data.bulan === "des" ? data.jumlah : 0,
      infaq: 0,
    };

    // Panggil service layer
    const result = await createDonaturService(donaturData);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/pemasukan");
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data donatur",
    };
  }
}

/**
 * Menghapus donatur berdasarkan ID
 */
export async function deleteDonaturAction(id: number): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID donatur tidak valid" };
    }

    // Hapus donatur menggunakan service
    await deleteDonaturService(id);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/pemasukan");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete Donatur Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus data donatur",
    };
  }
}