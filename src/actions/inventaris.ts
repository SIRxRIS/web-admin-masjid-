// src/actions/inventaris.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createInventaris,
  deleteInventaris,
  getInventarisById,
  updateInventaris,
  type Inventaris,
} from "@/lib/services/supabase/inventaris/inventaris";
import { createInventarisBaruNotification } from "./notifications";

// State untuk form action
export interface ActionState {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
}

// Action untuk membuat inventaris baru
export async function createInventarisAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const namaBarang = formData.get("namaBarang") as string;
    const kategori = formData.get("kategori") as string;
    const jumlah = formData.get("jumlah") as string;
    const satuan = formData.get("satuan") as string;
    const kondisi = formData.get("kondisi") as string;
    const lokasi = formData.get("lokasi") as string;
    const tanggalMasuk = formData.get("tanggalMasuk") as string;
    const keterangan = formData.get("keterangan") as string;
    const file = formData.get("foto") as File | null;

    // Validasi input
    const errors: Record<string, string[]> = {};

    if (!namaBarang?.trim()) {
      errors.namaBarang = ["Nama barang wajib diisi"];
    }
    if (!kategori?.trim()) {
      errors.kategori = ["Kategori barang wajib diisi"];
    }
    if (!jumlah?.trim()) {
      errors.jumlah = ["Jumlah barang wajib diisi"];
    }
    if (!satuan?.trim()) {
      errors.satuan = ["Satuan barang wajib diisi"];
    }
    if (!kondisi?.trim()) {
      errors.kondisi = ["Kondisi barang wajib diisi"];
    }
    if (!lokasi?.trim()) {
      errors.lokasi = ["Lokasi barang wajib diisi"];
    }
    if (!tanggalMasuk?.trim()) {
      errors.tanggalMasuk = ["Tanggal masuk wajib diisi"];
    }

    // Validasi jumlah harus angka
    const jumlahNumber = parseInt(jumlah);
    if (isNaN(jumlahNumber) || jumlahNumber <= 0) {
      errors.jumlah = ["Jumlah harus berupa angka positif"];
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Terdapat kesalahan dalam pengisian form",
        errors,
      };
    }

    const inventarisData: Omit<
      Inventaris,
      "id" | "tahun" | "createdAt" | "updatedAt"
    > = {
      no: 0, // akan diatur otomatis di service layer
      namaBarang: namaBarang.trim(),
      kategori: kategori.trim() as any,
      jumlah: jumlahNumber,
      satuan: satuan.trim() as any,
      kondisi: kondisi.trim() as any,
      lokasi: lokasi.trim(),
      tanggalMasuk: new Date(tanggalMasuk),
      keterangan: keterangan?.trim() || undefined,
      fotoUrl: undefined, // akan diatur jika ada file
    };

    const newInventaris = await createInventaris(
      inventarisData,
      file && file.size > 0 ? file : undefined
    );

    // Trigger notifikasi untuk pengurus
    try {
      const session = await getServerSession(authOptions);
      const createdByName = session?.user?.name || "Admin";
      
      await createInventarisBaruNotification(
        namaBarang.trim(),
        jumlahNumber,
        createdByName
      );
    } catch (notifError) {
      console.error("Error creating inventaris notification:", notifError);
      // Jangan gagalkan proses utama jika notifikasi gagal
    }

    revalidatePath("/inventaris");
    
    return {
      success: true,
      message: "Inventaris berhasil ditambahkan",
      data: newInventaris,
    };
  } catch (error) {
    console.error("Error dalam createInventarisAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk mengupdate inventaris
export async function updateInventarisAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const namaBarang = formData.get("namaBarang") as string;
    const kategori = formData.get("kategori") as string;
    const jumlah = formData.get("jumlah") as string;
    const satuan = formData.get("satuan") as string;
    const kondisi = formData.get("kondisi") as string;
    const lokasi = formData.get("lokasi") as string;
    const tanggalMasuk = formData.get("tanggalMasuk") as string;
    const keterangan = formData.get("keterangan") as string;
    const file = formData.get("foto") as File | null;

    // Validasi input
    const errors: Record<string, string[]> = {};

    if (!namaBarang?.trim()) {
      errors.namaBarang = ["Nama barang wajib diisi"];
    }
    if (!kategori?.trim()) {
      errors.kategori = ["Kategori barang wajib diisi"];
    }
    if (!jumlah?.trim()) {
      errors.jumlah = ["Jumlah barang wajib diisi"];
    }
    if (!satuan?.trim()) {
      errors.satuan = ["Satuan barang wajib diisi"];
    }
    if (!kondisi?.trim()) {
      errors.kondisi = ["Kondisi barang wajib diisi"];
    }
    if (!lokasi?.trim()) {
      errors.lokasi = ["Lokasi barang wajib diisi"];
    }
    if (!tanggalMasuk?.trim()) {
      errors.tanggalMasuk = ["Tanggal masuk wajib diisi"];
    }

    // Validasi jumlah harus angka
    const jumlahNumber = parseInt(jumlah);
    if (isNaN(jumlahNumber) || jumlahNumber <= 0) {
      errors.jumlah = ["Jumlah harus berupa angka positif"];
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Terdapat kesalahan dalam pengisian form",
        errors,
      };
    }

    const updateData: Partial<
      Omit<Inventaris, "id" | "tahun" | "createdAt" | "updatedAt">
    > = {
      namaBarang: namaBarang.trim(),
      kategori: kategori.trim() as any,
      jumlah: jumlahNumber,
      satuan: satuan.trim() as any,
      kondisi: kondisi.trim() as any,
      lokasi: lokasi.trim(),
      tanggalMasuk: new Date(tanggalMasuk),
      keterangan: keterangan?.trim() || undefined,
    };

    const updatedInventaris = await updateInventaris(
      id,
      updateData,
      file && file.size > 0 ? file : undefined
    );

    revalidatePath("/inventaris");
    revalidatePath(`/inventaris/${id}`);

    return {
      success: true,
      message: "Inventaris berhasil diperbarui",
      data: updatedInventaris,
    };
  } catch (error) {
    console.error("Error dalam updateInventarisAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk menghapus inventaris
export async function deleteInventarisAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Cek apakah inventaris ada sebelum menghapus
    const existingInventaris = await getInventarisById(id);
    if (!existingInventaris) {
      return {
        success: false,
        message: "Inventaris tidak ditemukan",
      };
    }

    await deleteInventaris(id);

    revalidatePath("/inventaris");

    return {
      success: true,
      message: "Inventaris berhasil dihapus",
    };
  } catch (error) {
    console.error("Error dalam deleteInventarisAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

// Action untuk menghapus inventaris dengan redirect
export async function deleteInventarisWithRedirectAction(
  id: number
): Promise<void> {
  try {
    await deleteInventaris(id);
    revalidatePath("/inventaris");
  } catch (error) {
    console.error("Error dalam deleteInventarisWithRedirectAction:", error);
    throw error;
  }
  
  redirect("/inventaris");
}

// Action sederhana untuk revalidate path
export async function revalidateInventarisAction(): Promise<void> {
  revalidatePath("/inventaris");
}

// Action untuk revalidate specific inventaris
export async function revalidateInventarisDetailAction(id: number): Promise<void> {
  revalidatePath(`/inventaris/${id}`);
  revalidatePath("/inventaris");
}