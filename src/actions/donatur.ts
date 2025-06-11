// src/actions/donatur.ts
"use server";

import { revalidatePath } from "next/cache";
import * as donaturService from "@/lib/services/supabase/donatur";
import { DonaturData } from "@/lib/services/supabase/schema/donatur/schema";
import { z } from "zod";

// Schema validasi untuk server actions
const CreateDonaturSchema = z.object({
  nama: z.string().min(1, "Nama donatur wajib diisi"),
  tahun: z.number().min(2000, "Tahun tidak valid").max(3000, "Tahun tidak valid"),
  alamat: z.string().optional().default(""),
  jan: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  feb: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  mar: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  apr: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  mei: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  jun: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  jul: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  aug: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  sep: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  okt: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  nov: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  des: z.number().min(0, "Jumlah tidak boleh negatif").default(0),
  infaq: z.number().min(0, "Jumlah infaq tidak boleh negatif").default(0),
});

const UpdateDonaturSchema = z.object({
  nama: z.string().min(1, "Nama donatur wajib diisi").optional(),
  alamat: z.string().optional(),
  jan: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  feb: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  mar: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  apr: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  mei: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  jun: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  jul: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  aug: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  sep: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  okt: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  nov: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  des: z.number().min(0, "Jumlah tidak boleh negatif").optional(),
  infaq: z.number().min(0, "Jumlah infaq tidak boleh negatif").optional(),
});

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getDonaturData(
  tahunFilter?: number
): Promise<ActionResult<DonaturData[]>> {
  try {
    const data = await donaturService.getDonaturData(tahunFilter);
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

export async function getAvailableTahun(): Promise<ActionResult<number[]>> {
  try {
    const years = await donaturService.getAvailableTahun();
    return { success: true, data: years };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error: "Gagal mengambil data tahun",
    };
  }
}

export async function getDonaturById(
  id: number
): Promise<ActionResult<DonaturData | null>> {
  try {
    if (!id || id <= 0) {
      return { success: false, error: "ID donatur tidak valid" };
    }

    const data = await donaturService.getDonaturById(id);
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

export async function createDonatur(
  formData: FormData
): Promise<ActionResult<DonaturData>> {
  try {
    // Extract dan validasi data dari FormData
    const rawData = {
      nama: formData.get("nama") as string,
      tahun: Number(formData.get("tahun")),
      alamat: (formData.get("alamat") as string) || "",
      jan: Number(formData.get("jan")) || 0,
      feb: Number(formData.get("feb")) || 0,
      mar: Number(formData.get("mar")) || 0,
      apr: Number(formData.get("apr")) || 0,
      mei: Number(formData.get("mei")) || 0,
      jun: Number(formData.get("jun")) || 0,
      jul: Number(formData.get("jul")) || 0,
      aug: Number(formData.get("aug")) || 0,
      sep: Number(formData.get("sep")) || 0,
      okt: Number(formData.get("okt")) || 0,
      nov: Number(formData.get("nov")) || 0,
      des: Number(formData.get("des")) || 0,
      infaq: Number(formData.get("infaq")) || 0,
    };

    // Validasi dengan Zod
    const validatedData = CreateDonaturSchema.parse(rawData);

    // Panggil service
    const result = await donaturService.createDonatur(validatedData);

    // Revalidate cache
    revalidatePath("/admin/donatur");

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
    if (alamat !== null) updates.alamat = alamat;

    // Handle monthly donations
    const months = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
    months.forEach(month => {
      const value = formData.get(month) as string;
      if (value !== null && value !== "") {
        updates[month] = Number(value) || 0;
      }
    });

    const infaq = formData.get("infaq") as string;
    if (infaq !== null && infaq !== "") {
      updates.infaq = Number(infaq) || 0;
    }

    if (Object.keys(updates).length === 0) {
      return { success: false, error: "Tidak ada data yang diupdate" };
    }

    // Validasi data yang akan diupdate
    const validatedData = UpdateDonaturSchema.parse(updates);

    const result = await donaturService.updateDonatur(id, validatedData);

    revalidatePath("/admin/donatur");

    return { success: true, data: result };
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

export async function deleteDonatur(
  id: number
): Promise<ActionResult<boolean>> {
  try {
    if (!id || id <= 0) {
      return { success: false, error: "ID donatur tidak valid" };
    }

    await donaturService.deleteDonatur(id);

    revalidatePath("/admin/donatur");

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

export async function updateDonaturOrder(
  donaturData: DonaturData[]
): Promise<ActionResult<boolean>> {
  try {
    if (!Array.isArray(donaturData) || donaturData.length === 0) {
      return { success: false, error: "Data donatur tidak valid" };
    }

    await donaturService.updateDonaturOrder(donaturData);

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

// Actions untuk laporan dan statistik
export async function getDonaturBulanan(
  tahun: number
): Promise<ActionResult<Record<string, number>>> {
  try {
    if (!tahun || tahun < 2000 || tahun > 3000) {
      return { success: false, error: "Tahun tidak valid" };
    }

    const data = await donaturService.getDonaturBulanan(tahun);
    return { success: true, data };
  } catch (error) {
    console.error("Get Donatur Bulanan Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data donatur bulanan",
    };
  }
}

export async function getDonaturTahunan(
  tahun: number
): Promise<ActionResult<number>> {
  try {
    if (!tahun || tahun < 2000 || tahun > 3000) {
      return { success: false, error: "Tahun tidak valid" };
    }

    const data = await donaturService.getDonaturTahunan(tahun);
    return { success: true, data };
  } catch (error) {
    console.error("Get Donatur Tahunan Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data donatur tahunan",
    };
  }
}

export async function getTotalInfaq(
  tahun: number
): Promise<ActionResult<number>> {
  try {
    if (!tahun || tahun < 2000 || tahun > 3000) {
      return { success: false, error: "Tahun tidak valid" };
    }

    const data = await donaturService.getTotalInfaq(tahun);
    return { success: true, data };
  } catch (error) {
    console.error("Get Total Infaq Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil total infaq",
    };
  }
}