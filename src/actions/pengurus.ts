// src/actions/pengurus.ts
"use server";

import {
  getPengurusData as getPengurusDataService,
  createPengurusWithFoto as createPengurusWithFotoService,
  updatePengurusWithOptionalFoto as updatePengurusWithOptionalFotoService,
  deletePengurus as deletePengurusService,
  PengurusData,
} from "@/lib/services/supabase/pengurus";

// Server Action untuk mengambil semua data pengurus
export async function getPengurusData() {
  try {
    const data = await getPengurusDataService();
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil data pengurus:", error);
    throw new Error("Gagal mengambil data pengurus");
  }
}

// Server Action untuk membuat pengurus baru dengan foto
export async function createPengurus(
  pengurusData: {
    no: number;
    nama: string;
    jabatan: string;
    periode: string;
  },
  file?: File | null
) {
  try {
    if (!pengurusData) {
      throw new Error("Data pengurus tidak boleh kosong");
    }

    // Validasi field wajib
    if (!pengurusData.nama || !pengurusData.jabatan || !pengurusData.periode) {
      throw new Error("Nama, jabatan, dan periode harus diisi");
    }

    if (!pengurusData.no || pengurusData.no <= 0) {
      throw new Error("Nomor urut harus berupa angka positif");
    }

    const result = await createPengurusWithFotoService(pengurusData, file || null);
    return result;
  } catch (error) {
    console.error("Server Action - Error membuat pengurus:", error);
    throw new Error("Gagal membuat pengurus baru");
  }
}

// Server Action untuk update pengurus dengan foto opsional
export async function updatePengurus(
  id: number,
  updates: Partial<
    Omit<PengurusData, "id" | "createdAt" | "updatedAt" | "fotoUrl">
  >,
  file?: File
) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pengurus tidak valid");
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error("Data update tidak boleh kosong");
    }

    // Validasi field jika ada
    if (updates.no !== undefined && updates.no <= 0) {
      throw new Error("Nomor urut harus berupa angka positif");
    }

    if (updates.nama !== undefined && !updates.nama.trim()) {
      throw new Error("Nama tidak boleh kosong");
    }

    if (updates.jabatan !== undefined && !updates.jabatan.trim()) {
      throw new Error("Jabatan tidak boleh kosong");
    }

    if (updates.periode !== undefined && !updates.periode.trim()) {
      throw new Error("Periode tidak boleh kosong");
    }

    const result = await updatePengurusWithOptionalFotoService(id, updates, file);
    return result;
  } catch (error) {
    console.error("Server Action - Error update pengurus:", error);
    throw new Error("Gagal mengupdate data pengurus");
  }
}

// Server Action untuk menghapus pengurus
export async function deletePengurus(id: number): Promise<boolean> {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pengurus tidak valid");
    }

    const result = await deletePengurusService(id);
    // Pastikan return value adalah boolean
    return Boolean(result);
  } catch (error) {
    console.error("Server Action - Error hapus pengurus:", error);
    throw new Error("Gagal menghapus data pengurus");
  }
}

// Server Action untuk mendapatkan pengurus berdasarkan ID (jika diperlukan)
export async function getPengurusById(id: number): Promise<PengurusData | null> {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pengurus tidak valid");
    }

    const allPengurus = await getPengurusDataService();
    const pengurus = allPengurus.find(p => p.id === id);
    
    return pengurus || null;
  } catch (error) {
    console.error("Server Action - Error mengambil pengurus by ID:", error);
    throw new Error("Gagal mengambil data pengurus");
  }
}

// Server Action untuk mendapatkan pengurus berdasarkan periode
export async function getPengurusByPeriode(periode: string): Promise<PengurusData[]> {
  try {
    if (!periode || !periode.trim()) {
      throw new Error("Periode tidak boleh kosong");
    }

    const allPengurus = await getPengurusDataService();
    const pengurusByPeriode = allPengurus.filter(p => p.periode === periode);
    
    return pengurusByPeriode;
  } catch (error) {
    console.error("Server Action - Error mengambil pengurus by periode:", error);
    throw new Error("Gagal mengambil data pengurus berdasarkan periode");
  }
}

// Server Action untuk mendapatkan daftar periode yang tersedia
export async function getAvailablePeriode(): Promise<string[]> {
  try {
    const allPengurus = await getPengurusDataService();
    const periods = [...new Set(allPengurus.map(p => p.periode))];
    
    return periods.sort();
  } catch (error) {
    console.error("Server Action - Error mengambil data periode:", error);
    throw new Error("Gagal mengambil data periode");
  }
}

// Server Action untuk validasi nomor urut yang unik
export async function validateUniqueNo(no: number, excludeId?: number): Promise<boolean> {
  try {
    if (!no || no <= 0) {
      throw new Error("Nomor urut tidak valid");
    }

    const allPengurus = await getPengurusDataService();
    const existingPengurus = allPengurus.find(p => 
      p.no === no && (excludeId ? p.id !== excludeId : true)
    );
    
    return !existingPengurus; // return true jika nomor urut unik
  } catch (error) {
    console.error("Server Action - Error validasi nomor urut:", error);
    throw new Error("Gagal memvalidasi nomor urut");
  }
}