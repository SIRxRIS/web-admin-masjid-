"use server";

import { revalidatePath } from "next/cache";
import { 
  createVisiMisi,
  updateVisiMisi,
  deleteVisiMisi
} from "@/lib/services/supabase/visi-misi";

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Membuat visi/misi baru
 */
export async function createVisiMisiAction(data: any): Promise<ActionResult<void>> {
  try {
    // Validasi data
    if (!data.konten || !data.kategori || !data.jenis) {
      return { success: false, error: "Data visi/misi tidak lengkap" };
    }

    // Buat visi/misi menggunakan service
    await createVisiMisi(data);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/manajemen");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Create Visi Misi Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal membuat visi/misi",
    };
  }
}

/**
 * Mengupdate visi/misi berdasarkan ID
 */
export async function updateVisiMisiAction(id: number, data: any): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID visi/misi tidak valid" };
    }

    // Update visi/misi menggunakan service
    await updateVisiMisi(id, data);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/manajemen");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update Visi Misi Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengupdate visi/misi",
    };
  }
}

/**
 * Menghapus visi/misi berdasarkan ID
 */
export async function deleteVisiMisiAction(id: number): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID visi/misi tidak valid" };
    }

    // Hapus visi/misi menggunakan service
    await deleteVisiMisi(id);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/manajemen");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete Visi Misi Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus visi/misi",
    };
  }
}

/**
 * Toggle status aktif visi/misi
 */
export async function toggleVisiMisiActiveAction(id: number, isActive: boolean): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID visi/misi tidak valid" };
    }

    // Update status aktif menggunakan service
    await updateVisiMisi(id, { isActive });

    // Revalidate path untuk memperbarui cache
    revalidatePath("/manajemen");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Toggle Visi Misi Active Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengubah status visi/misi",
    };
  }
}