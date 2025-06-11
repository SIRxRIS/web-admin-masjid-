// src/actions/inventaris.ts
"use server";

import { revalidatePath } from "next/cache";
import * as inventarisService from "@/lib/services/supabase/inventaris/inventaris";
import { InventarisData } from "@/components/admin/layout/inventaris/schema";
import { z } from "zod";

// Schema validasi untuk server actions
const CreateInventarisSchema = z.object({
  namaBarang: z.string().min(1, "Nama barang wajib diisi"),
  kategori: z.enum([
    "PERLENGKAPAN",
    "ELEKTRONIK",
    "KEBERSIHAN",
    "DOKUMEN",
    "LAINNYA",
  ]),
  jumlah: z.number().positive("Jumlah harus lebih dari 0"),
  satuan: z.enum(["UNIT", "BUAH", "LEMBAR", "SET", "LAINNYA"]),
  lokasi: z.string().min(1, "Lokasi wajib diisi"),
  kondisi: z.enum(["BAIK", "CUKUP", "RUSAK"]),
  tanggalMasuk: z.date(),
  keterangan: z.string().optional(),
});

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getInventarisData(
  tahunFilter?: number
): Promise<ActionResult<inventarisService.Inventaris[]>> {
  try {
    const data = await inventarisService.getInventarisData(tahunFilter);
    return { success: true, data };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data inventaris",
    };
  }
}

export async function getAvailableTahun(): Promise<ActionResult<number[]>> {
  try {
    const years = await inventarisService.getAvailableTahun();
    return { success: true, data: years };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error: "Gagal mengambil data tahun",
    };
  }
}

export async function createInventaris(
  formData: FormData
): Promise<ActionResult<inventarisService.Inventaris>> {
  try {
    // Extract dan validasi data dari FormData
    const rawData = {
      namaBarang: formData.get("namaBarang") as string,
      kategori: formData.get("kategori") as any,
      jumlah: Number(formData.get("jumlah")),
      satuan: formData.get("satuan") as any,
      lokasi: formData.get("lokasi") as string,
      kondisi: formData.get("kondisi") as any,
      tanggalMasuk: new Date(formData.get("tanggalMasuk") as string),
      keterangan: (formData.get("keterangan") as string) || undefined,
    };

    // Validasi dengan Zod
    const validatedData = CreateInventarisSchema.parse(rawData);

    // Extract file jika ada
    const file = formData.get("foto") as File | null;
    const fileToUpload = file && file.size > 0 ? file : undefined;

    // Panggil service
    const result = await inventarisService.createInventaris(
      validatedData,
      fileToUpload
    );

    // Revalidate cache
    revalidatePath("/admin/inventaris");

    return { success: true, data: result };
  } catch (error) {
    console.error("Create Inventaris Error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal membuat inventaris",
    };
  }
}

export async function updateInventaris(
  id: number,
  formData: FormData
): Promise<ActionResult<inventarisService.Inventaris>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID inventaris tidak valid" };
    }

    // Extract data yang akan diupdate (hanya yang ada)
    const updates: any = {};

    const namaBarang = formData.get("namaBarang") as string;
    if (namaBarang) updates.namaBarang = namaBarang;

    const kategori = formData.get("kategori") as string;
    if (kategori) updates.kategori = kategori;

    const jumlah = formData.get("jumlah") as string;
    if (jumlah) updates.jumlah = Number(jumlah);

    // ... extract field lainnya sesuai kebutuhan

    if (Object.keys(updates).length === 0) {
      return { success: false, error: "Tidak ada data yang diupdate" };
    }

    const file = formData.get("foto") as File | null;
    const fileToUpload = file && file.size > 0 ? file : undefined;

    const result = await inventarisService.updateInventaris(
      id,
      updates,
      fileToUpload
    );

    revalidatePath("/admin/inventaris");

    return { success: true, data: result };
  } catch (error) {
    console.error("Update Inventaris Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal mengupdate inventaris",
    };
  }
}

export async function deleteInventaris(
  id: number
): Promise<ActionResult<boolean>> {
  try {
    if (!id || id <= 0) {
      return { success: false, error: "ID inventaris tidak valid" };
    }

    await inventarisService.deleteInventaris(id);

    revalidatePath("/admin/inventaris");

    return { success: true, data: true };
  } catch (error) {
    console.error("Delete Inventaris Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal menghapus inventaris",
    };
  }
}
