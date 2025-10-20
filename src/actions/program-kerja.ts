// src/app/actions/program-kerja.ts

"use server";

import { revalidatePath } from "next/cache";
import { 
  createProgramKerja,
  updateProgramKerja,
  deleteProgramKerja
} from "@/lib/services/supabase/program-kerja";

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Membuat program kerja baru
 */
interface CreateProgramKerjaData {
  kategori: 'PENGURUS_MASJID' | 'REMAS' | 'MAJLIS_TALIM';
  seksi: string;
  programKerja: string;
  urutan: number;
  tahun?: number | null;
  isActive: boolean;
}

export async function createProgramKerjaAction(data: CreateProgramKerjaData): Promise<ActionResult<void>> {
  try {
    // Validasi data
    if (!data.programKerja || !data.kategori || !data.seksi) {
      return { success: false, error: "Data program kerja tidak lengkap" };
    }

    // Buat program kerja menggunakan service
    await createProgramKerja(data);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/manajemen");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Create Program Kerja Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal membuat program kerja",
    };
  }
}

/**
 * Mengupdate program kerja berdasarkan ID
 */
type UpdateProgramKerjaData = Partial<CreateProgramKerjaData>;

export async function updateProgramKerjaAction(id: number, data: UpdateProgramKerjaData): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID program kerja tidak valid" };
    }

    // Update program kerja menggunakan service
    await updateProgramKerja(id, data);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/manajemen");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update Program Kerja Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengupdate program kerja",
    };
  }
}

/**
 * Menghapus program kerja berdasarkan ID
 */
export async function deleteProgramKerjaAction(id: number): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID program kerja tidak valid" };
    }

    // Hapus program kerja menggunakan service
    await deleteProgramKerja(id);

    // Revalidate path untuk memperbarui cache
    revalidatePath("/manajemen");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete Program Kerja Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus program kerja",
    };
  }
}

/**
 * Toggle status aktif program kerja
 */
export async function toggleProgramKerjaActiveAction(id: number, isActive: boolean): Promise<ActionResult<void>> {
  try {
    // Validasi ID
    if (!id || id <= 0) {
      return { success: false, error: "ID program kerja tidak valid" };
    }

    // Update status aktif menggunakan service
    await updateProgramKerja(id, { isActive });

    // Revalidate path untuk memperbarui cache
    revalidatePath("/manajemen");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Toggle Program Kerja Active Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengubah status program kerja",
    };
  }
}
