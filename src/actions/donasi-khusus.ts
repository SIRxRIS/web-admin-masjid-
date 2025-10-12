// src/actions/donasi-khusus.ts
"use server";

import { revalidatePath } from "next/cache";
import { 
  updateDonasiKhusus,
  deleteDonasiKhusus
} from "@/lib/services/supabase/donasi-khusus";

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Mengupdate donasi khusus berdasarkan ID
 */
export async function updateDonasiKhususAction(id: number, data: any): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID donasi khusus tidak valid" };
    }

    // Update donasi khusus menggunakan service
    await updateDonasiKhusus(id, data);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/pemasukan");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update Donasi Khusus Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengupdate data donasi khusus",
    };
  }
}

/**
 * Menghapus donasi khusus berdasarkan ID
 */
export async function deleteDonasiKhususAction(id: number): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID donasi khusus tidak valid" };
    }

    // Hapus donasi khusus menggunakan service
    await deleteDonasiKhusus(id);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/pemasukan");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete Donasi Khusus Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus data donasi khusus",
    };
  }
}