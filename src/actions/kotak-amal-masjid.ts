// src/actions/kotak-amal-masjid.ts
"use server";

import { format } from "date-fns";
import {
  getKotakAmalMasjidData as getKotakAmalMasjidDataService,
  createKotakAmalMasjid as createKotakAmalService,
  updateKotakAmalMasjid as updateKotakAmalService,
  deleteKotakAmalMasjid as deleteKotakAmalService,
  getTotalKotakAmalMasjid as getTotalKotakAmalMasjidService,
  getKotakAmalMasjidTahunan as getKotakAmalMasjidTahunanService,
  getKotakAmalMasjidTahunanByDate as getKotakAmalMasjidTahunanByDateService,
  getKotakAmalMasjidBulanan as getKotakAmalMasjidBulananService,
  getAvailableTahun as getAvailableTahunService,
} from "@/lib/services/supabase/kotak-amal-masjid";
import { KotakAmalMasjidData } from "@/lib/schema/pemasukan/schema";

// Types untuk server actions response
interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Validation helpers
const validateId = (id: number): void => {
  if (!id || id <= 0) {
    throw new Error("ID kotak amal masjid tidak valid");
  }
};

const validateYear = (tahun: number): void => {
  if (!tahun || tahun <= 0) {
    throw new Error("Tahun tidak valid");
  }
};

const validateMonth = (bulan: number): void => {
  if (!bulan || bulan < 1 || bulan > 12) {
    throw new Error("Bulan tidak valid (harus 1-12)");
  }
};

const validateKotakAmalMasjidData = (
  data: Omit<KotakAmalMasjidData, "id" | "createdAt">
): void => {
  if (!data) {
    throw new Error("Data kotak amal masjid tidak boleh kosong");
  }

  if (!data.tahun || data.tahun <= 0) {
    throw new Error("Tahun tidak valid");
  }

  if (!data.jumlah || data.jumlah <= 0) {
    throw new Error("Jumlah harus lebih dari 0");
  }

  if (!data.tanggal) {
    throw new Error("Tanggal tidak boleh kosong");
  }
};

// Server Actions
export async function getKotakAmalMasjidData(tahunFilter?: number) {
  try {
    const data = await getKotakAmalMasjidDataService(tahunFilter);
    return data;
  } catch (error) {
    console.error(
      "Server Action - Error mengambil data kotak amal masjid:",
      error
    );
    throw new Error("Gagal mengambil data kotak amal masjid");
  }
}

export async function createKotakAmalMasjid(
  kotakAmalMasjid: Omit<KotakAmalMasjidData, "id" | "createdAt">
): Promise<ActionResponse<KotakAmalMasjidData>> {
  try {
    validateKotakAmalMasjidData(kotakAmalMasjid);

    const result = await createKotakAmalService(kotakAmalMasjid);
    return { success: true, data: result };
  } catch (error) {
    console.error("Server Action - Error membuat kotak amal masjid:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal membuat kotak amal masjid baru",
    };
  }
}

export async function createKotakAmalMasjidFromForm(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const tanggal = formData.get("tanggal") as string;
    const jumlah = Number(formData.get("jumlah"));
    const tahun = new Date(tanggal).getFullYear();

    const kotakAmalData = {
      tanggal: format(new Date(tanggal), "yyyy-MM-dd"),
      jumlah,
      tahun,
    };

    validateKotakAmalMasjidData(kotakAmalData);

    const result = await createKotakAmalService(kotakAmalData);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating kotak amal masjid from form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan data",
    };
  }
}

export async function updateKotakAmalMasjid(
  id: number,
  kotakAmalMasjid: Partial<Omit<KotakAmalMasjidData, "id" | "createdAt">>
): Promise<ActionResponse<KotakAmalMasjidData>> {
  try {
    validateId(id);

    if (!kotakAmalMasjid || Object.keys(kotakAmalMasjid).length === 0) {
      throw new Error("Data update tidak boleh kosong");
    }

    const result = await updateKotakAmalService(id, kotakAmalMasjid);
    return { success: true, data: result };
  } catch (error) {
    console.error("Server Action - Error update kotak amal masjid:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengupdate kotak amal masjid",
    };
  }
}

export async function updateKotakAmalMasjidFromForm(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const id = Number(formData.get("id"));
    const tanggal = formData.get("tanggal") as string;
    const jumlah = Number(formData.get("jumlah"));
    const tahun = Number(formData.get("tahun"));

    validateId(id);

    const updateData = {
      tanggal: format(new Date(tanggal), "yyyy-MM-dd"),
      jumlah,
      tahun,
    };

    const result = await updateKotakAmalService(id, updateData);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating kotak amal masjid from form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui data",
    };
  }
}

export async function deleteKotakAmalMasjid(
  id: number
): Promise<ActionResponse<boolean>> {
  try {
    validateId(id);

    const result = await deleteKotakAmalService(id);
    return { success: true, data: Boolean(result) };
  } catch (error) {
    console.error("Server Action - Error hapus kotak amal masjid:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus kotak amal masjid",
    };
  }
}

export async function deleteKotakAmalMasjidFromForm(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const id = Number(formData.get("id"));
    validateId(id);

    await deleteKotakAmalService(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting kotak amal masjid from form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus data",
    };
  }
}

export async function getTotalKotakAmalMasjid(tahun?: number) {
  try {
    const total = await getTotalKotakAmalMasjidService(tahun);
    return total;
  } catch (error) {
    console.error(
      "Server Action - Error mengambil total kotak amal masjid:",
      error
    );
    throw new Error("Gagal mengambil total kotak amal masjid");
  }
}

export async function getKotakAmalMasjidTahunan(tahun: number) {
  try {
    validateYear(tahun);

    const total = await getKotakAmalMasjidTahunanService(tahun);
    return total;
  } catch (error) {
    console.error(
      "Server Action - Error mengambil total kotak amal masjid tahunan:",
      error
    );
    throw new Error("Gagal mengambil total kotak amal masjid tahunan");
  }
}

export async function getKotakAmalMasjidTahunanByDate(tahun: number) {
  try {
    validateYear(tahun);

    const total = await getKotakAmalMasjidTahunanByDateService(tahun);
    return total;
  } catch (error) {
    console.error(
      "Server Action - Error mengambil total kotak amal masjid tahunan by date:",
      error
    );
    throw new Error("Gagal mengambil total kotak amal masjid tahunan");
  }
}

export async function getKotakAmalMasjidBulanan(tahun: number, bulan: number) {
  try {
    validateYear(tahun);
    validateMonth(bulan);

    const total = await getKotakAmalMasjidBulananService(tahun, bulan);
    return total;
  } catch (error) {
    console.error(
      "Server Action - Error mengambil total kotak amal masjid bulanan:",
      error
    );
    throw new Error("Gagal mengambil total kotak amal masjid bulanan");
  }
}

export async function getAvailableTahun() {
  try {
    const years = await getAvailableTahunService();
    return years;
  } catch (error) {
    console.error("Server Action - Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }
}
