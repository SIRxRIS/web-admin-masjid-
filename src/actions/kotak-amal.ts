// src/actions/kotak-amal.ts
"use server";

import { revalidatePath } from "next/cache";
import { 
  getKotakAmalData as getKotakAmalDataService,
  updateKotakAmal,
  deleteKotakAmal
} from "@/lib/services/supabase/kotak-amal";
import { type KotakAmalData } from "@/lib/schema/pemasukan/schema";

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Server action wrapper for getKotakAmalData
export async function getKotakAmalData(tahunFilter?: number): Promise<ActionResult<KotakAmalData[]>> {
  try {
    const data = await getKotakAmalDataService(tahunFilter);
    return { success: true, data };
  } catch (error) {
    console.error("Error in getKotakAmalData action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data kotak amal"
    };
  }
}

/**
 * Mengupdate kotak amal berdasarkan ID
 */
export async function updateKotakAmalAction(id: number, data: any): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID kotak amal tidak valid" };
    }

    // Update kotak amal menggunakan service
    await updateKotakAmal(id, data);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/pemasukan");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update Kotak Amal Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengupdate data kotak amal",
    };
  }
}

/**
 * Menghapus kotak amal berdasarkan ID
 */
export async function deleteKotakAmalAction(id: number): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID kotak amal tidak valid" };
    }

    // Hapus kotak amal menggunakan service
    await deleteKotakAmal(id);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/pemasukan");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete Kotak Amal Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus data kotak amal",
    };
  }
}