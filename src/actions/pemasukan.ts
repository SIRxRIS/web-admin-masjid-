// src/actions/pemasukan.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPemasukan,
  deletePemasukan,
  getPemasukanById,
  updatePemasukan,
} from "../lib/services/supabase/pemasukan/pemasukan";
import {
  type PemasukanData,
  type CreatePemasukanInput,
} from "../lib/schema/pemasukan/schema";

// State untuk form action
export interface ActionState {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
}

// Action untuk membuat pemasukan baru
export async function createPemasukanAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const tanggal = formData.get("tanggal") as string;
    const sumber = formData.get("sumber") as string;
    const jumlah = formData.get("jumlah") as string;
    const keterangan = formData.get("keterangan") as string;
    const donaturId = formData.get("donaturId") as string;
    const kotakAmalId = formData.get("kotakAmalId") as string;
    const kotakMasjidId = formData.get("kotakMasjidId") as string;
    const donasiKhususId = formData.get("donasiKhususId") as string;

    // Validasi input
    const errors: Record<string, string[]> = {};

    if (!tanggal?.trim()) {
      errors.tanggal = ["Tanggal wajib diisi"];
    }
    if (!sumber?.trim()) {
      errors.sumber = ["Sumber pemasukan wajib diisi"];
    }
    if (!jumlah?.trim()) {
      errors.jumlah = ["Jumlah pemasukan wajib diisi"];
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

    const pemasukanData: CreatePemasukanInput = {
      tanggal: tanggalDate,
      tahun: tanggalDate.getFullYear(),
      sumber: sumber.trim() as any,
      jumlah: jumlahNumber,
      keterangan: keterangan?.trim() || "",
      donaturId: donaturId && donaturId !== "" ? parseInt(donaturId) : null,
      kotakAmalId: kotakAmalId && kotakAmalId !== "" ? parseInt(kotakAmalId) : null,
      kotakMasjidId: kotakMasjidId && kotakMasjidId !== "" ? parseInt(kotakMasjidId) : null,
      donasiKhususId: donasiKhususId && donasiKhususId !== "" ? parseInt(donasiKhususId) : null,
    };

    const newPemasukan = await createPemasukan(pemasukanData);

    revalidatePath("/pemasukan");
    
    return {
      success: true,
      message: "Pemasukan berhasil ditambahkan",
      data: newPemasukan,
    };
  } catch (error) {
    console.error("Error dalam createPemasukanAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk mengupdate pemasukan
export async function updatePemasukanAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const tanggal = formData.get("tanggal") as string;
    const sumber = formData.get("sumber") as string;
    const jumlah = formData.get("jumlah") as string;
    const keterangan = formData.get("keterangan") as string;
    const donaturId = formData.get("donaturId") as string;
    const kotakAmalId = formData.get("kotakAmalId") as string;
    const kotakMasjidId = formData.get("kotakMasjidId") as string;
    const donasiKhususId = formData.get("donasiKhususId") as string;

    // Validasi input
    const errors: Record<string, string[]> = {};

    if (!tanggal?.trim()) {
      errors.tanggal = ["Tanggal wajib diisi"];
    }
    if (!sumber?.trim()) {
      errors.sumber = ["Sumber pemasukan wajib diisi"];
    }
    if (!jumlah?.trim()) {
      errors.jumlah = ["Jumlah pemasukan wajib diisi"];
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

    const updateData: Partial<Omit<PemasukanData, "id" | "createdAt" | "updatedAt">> = {
      tanggal: tanggalDate,
      tahun: tanggalDate.getFullYear(),
      sumber: sumber.trim() as any,
      jumlah: jumlahNumber,
      keterangan: keterangan?.trim() || "",
      donaturId: donaturId && donaturId !== "" ? parseInt(donaturId) : null,
      kotakAmalId: kotakAmalId && kotakAmalId !== "" ? parseInt(kotakAmalId) : null,
      kotakMasjidId: kotakMasjidId && kotakMasjidId !== "" ? parseInt(kotakMasjidId) : null,
      donasiKhususId: donasiKhususId && donasiKhususId !== "" ? parseInt(donasiKhususId) : null,
    };

    const updatedPemasukan = await updatePemasukan(id, updateData);

    revalidatePath("/pemasukan");
    revalidatePath(`/pemasukan/${id}`);

    return {
      success: true,
      message: "Pemasukan berhasil diperbarui",
      data: updatedPemasukan,
    };
  } catch (error) {
    console.error("Error dalam updatePemasukanAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk menghapus pemasukan
export async function deletePemasukanAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Cek apakah pemasukan ada sebelum menghapus
    const existingPemasukan = await getPemasukanById(id);
    if (!existingPemasukan) {
      return {
        success: false,
        message: "Data pemasukan tidak ditemukan",
      };
    }

    await deletePemasukan(id);

    revalidatePath("/pemasukan");

    return {
      success: true,
      message: "Pemasukan berhasil dihapus",
    };
  } catch (error) {
    console.error("Error dalam deletePemasukanAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk menghapus pemasukan dengan redirect
export async function deletePemasukanWithRedirectAction(
  id: number
): Promise<void> {
  try {
    await deletePemasukan(id);
    revalidatePath("/pemasukan");
  } catch (error) {
    console.error("Error dalam deletePemasukanWithRedirectAction:", error);
    throw error;
  }
  
  redirect("/pemasukan");
}

// Action sederhana untuk revalidate path
export async function revalidatePemasukanAction(): Promise<void> {
  revalidatePath("/pemasukan");
}

// Action untuk revalidate specific pemasukan
export async function revalidatePemasukanDetailAction(id: number): Promise<void> {
  revalidatePath(`/pemasukan/${id}`);
  revalidatePath("/pemasukan");
}

