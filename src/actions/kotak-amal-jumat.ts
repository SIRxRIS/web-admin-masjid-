"use server";

import { revalidatePath } from "next/cache";
import * as kotakAmalJumatService from "@/lib/services/supabase/kotak-amal-jumat";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Mengupdate kotak amal jumat berdasarkan ID
 */
export async function updateKotakAmalJumatAction(id: number, data: any): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID kotak amal jumat tidak valid" };
    }

    // Update kotak amal jumat menggunakan service
    await kotakAmalJumatService.updateKotakAmalJumat(id, data);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/pemasukan");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update Kotak Amal Jumat Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengupdate data kotak amal jumat",
    };
  }
}

/**
 * Menghapus kotak amal jumat berdasarkan ID
 */
export async function deleteKotakAmalJumatAction(id: number): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID kotak amal jumat tidak valid" };
    }

    // Hapus kotak amal jumat menggunakan service
    await kotakAmalJumatService.deleteKotakAmalJumat(id);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/pemasukan");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete Kotak Amal Jumat Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus data kotak amal jumat",
    };
  }
}