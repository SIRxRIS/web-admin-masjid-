// src/actions/pemasukan.ts
"use server";

import {
  getPemasukanData as getPemasukanDataService,
  getAvailableTahun as getAvailableTahunService,
  createPemasukan as createPemasukanService,
  updatePemasukan as updatePemasukanService,
  deletePemasukan as deletePemasukanService,
  getPemasukanById as getPemasukanByIdService,
  getPemasukanBulanan as getPemasukanBulananService,
  getPemasukanTahunan as getPemasukanTahunanService,
  getPemasukanBySumber as getPemasukanBySumberService,
  getPemasukanByDonatur as getPemasukanByDonaturService,
  getPemasukanByDonaturWithDetail as getPemasukanByDonaturWithDetailService,
  getPemasukanByDonasiKhusus as getPemasukanByDonasiKhususService,
  getPemasukanByKotakAmal as getPemasukanByKotakAmalService,
  getPemasukanByKotakMasjid as getPemasukanByKotakMasjidService,
  refreshPemasukanForEntity as refreshPemasukanForEntityService,
  syncAllPemasukan as syncAllPemasukanService,
  type SumberPemasukan,
} from "@/lib/services/supabase/pemasukan/pemasukan";
import { type Pemasukan } from "@prisma/client";

// Server Actions untuk digunakan oleh Client Components
export async function getPemasukanData(tahunFilter?: number) {
  try {
    const data = await getPemasukanDataService(tahunFilter);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil data pemasukan:", error);
    throw new Error("Gagal mengambil data pemasukan");
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

export async function getPemasukanById(id: number) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pemasukan tidak valid");
    }

    const data = await getPemasukanByIdService(id);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan by ID:", error);
    throw new Error("Gagal mengambil data pemasukan");
  }
}

export async function createPemasukan(
  pemasukan: Omit<Pemasukan, "id" | "createdAt" | "updatedAt">
) {
  try {
    if (!pemasukan) {
      throw new Error("Data pemasukan tidak boleh kosong");
    }

    // Validasi field wajib
    if (!pemasukan.tanggal) {
      throw new Error("Tanggal pemasukan wajib diisi");
    }

    if (!pemasukan.sumber) {
      throw new Error("Sumber pemasukan wajib diisi");
    }

    if (!pemasukan.jumlah || pemasukan.jumlah <= 0) {
      throw new Error("Jumlah pemasukan harus lebih dari 0");
    }

    if (!pemasukan.tahun) {
      throw new Error("Tahun pemasukan wajib diisi");
    }

    const result = await createPemasukanService(pemasukan);
    return result;
  } catch (error) {
    console.error("Server Action - Error membuat pemasukan:", error);
    throw new Error("Gagal membuat pemasukan baru");
  }
}

export async function updatePemasukan(
  id: number,
  pemasukan: Partial<Omit<Pemasukan, "id" | "createdAt" | "updatedAt">>
) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pemasukan tidak valid");
    }

    if (!pemasukan || Object.keys(pemasukan).length === 0) {
      throw new Error("Data update tidak boleh kosong");
    }

    // Validasi field jika ada
    if (pemasukan.jumlah !== undefined && pemasukan.jumlah <= 0) {
      throw new Error("Jumlah pemasukan harus lebih dari 0");
    }

    const result = await updatePemasukanService(id, pemasukan);
    return result;
  } catch (error) {
    console.error("Server Action - Error update pemasukan:", error);
    throw new Error("Gagal mengupdate pemasukan");
  }
}

export async function deletePemasukan(id: number): Promise<boolean> {
  try {
    if (!id || id <= 0) {
      throw new Error("ID pemasukan tidak valid");
    }

    const result = await deletePemasukanService(id);
    // Pastikan return value adalah boolean
    return Boolean(result);
  } catch (error) {
    console.error("Server Action - Error hapus pemasukan:", error);
    throw new Error("Gagal menghapus pemasukan");
  }
}

export async function getPemasukanBulanan(tahun: number, bulan: number) {
  try {
    if (!tahun || tahun <= 0) {
      throw new Error("Tahun tidak valid");
    }

    if (!bulan || bulan < 1 || bulan > 12) {
      throw new Error("Bulan tidak valid (1-12)");
    }

    const total = await getPemasukanBulananService(tahun, bulan);
    return total;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan bulanan:", error);
    throw new Error("Gagal mengambil total pemasukan bulanan");
  }
}

export async function getPemasukanTahunan(tahun: number) {
  try {
    if (!tahun || tahun <= 0) {
      throw new Error("Tahun tidak valid");
    }

    const total = await getPemasukanTahunanService(tahun);
    return total;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan tahunan:", error);
    throw new Error("Gagal mengambil total pemasukan tahunan");
  }
}

export async function getPemasukanBySumber(tahun: number, sumber: string) {
  try {
    if (!tahun || tahun <= 0) {
      throw new Error("Tahun tidak valid");
    }

    if (!sumber) {
      throw new Error("Sumber pemasukan tidak boleh kosong");
    }

    const total = await getPemasukanBySumberService(tahun, sumber);
    return total;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan by sumber:", error);
    throw new Error("Gagal mengambil pemasukan berdasarkan sumber");
  }
}

export async function getPemasukanByDonatur(donaturId: number) {
  try {
    if (!donaturId || donaturId <= 0) {
      throw new Error("ID donatur tidak valid");
    }

    const data = await getPemasukanByDonaturService(donaturId);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan by donatur:", error);
    throw new Error("Gagal mengambil pemasukan berdasarkan donatur");
  }
}

export async function getPemasukanByDonaturWithDetail(donaturId: number) {
  try {
    if (!donaturId || donaturId <= 0) {
      throw new Error("ID donatur tidak valid");
    }

    const data = await getPemasukanByDonaturWithDetailService(donaturId);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan dengan detail donatur:", error);
    throw new Error("Gagal mengambil pemasukan dengan detail donatur");
  }
}

export async function getPemasukanByDonasiKhusus(donasiKhususId: number) {
  try {
    if (!donasiKhususId || donasiKhususId <= 0) {
      throw new Error("ID donasi khusus tidak valid");
    }

    const data = await getPemasukanByDonasiKhususService(donasiKhususId);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan by donasi khusus:", error);
    throw new Error("Gagal mengambil pemasukan berdasarkan donasi khusus");
  }
}

export async function getPemasukanByKotakAmal(kotakAmalId: number) {
  try {
    if (!kotakAmalId || kotakAmalId <= 0) {
      throw new Error("ID kotak amal tidak valid");
    }

    const data = await getPemasukanByKotakAmalService(kotakAmalId);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan by kotak amal:", error);
    throw new Error("Gagal mengambil pemasukan berdasarkan kotak amal");
  }
}

export async function getPemasukanByKotakMasjid(kotakMasjidId: number) {
  try {
    if (!kotakMasjidId || kotakMasjidId <= 0) {
      throw new Error("ID kotak masjid tidak valid");
    }

    const data = await getPemasukanByKotakMasjidService(kotakMasjidId);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil pemasukan by kotak masjid:", error);
    throw new Error("Gagal mengambil pemasukan berdasarkan kotak masjid");
  }
}

export async function refreshPemasukanForEntity(
  entityType: "donatur" | "kotakAmal" | "kotakMasjid" | "donasiKhusus",
  entityId: number
) {
  try {
    if (!entityType) {
      throw new Error("Tipe entitas tidak boleh kosong");
    }

    if (!entityId || entityId <= 0) {
      throw new Error("ID entitas tidak valid");
    }

    const validEntityTypes = ["donatur", "kotakAmal", "kotakMasjid", "donasiKhusus"];
    if (!validEntityTypes.includes(entityType)) {
      throw new Error("Tipe entitas tidak valid");
    }

    const result = await refreshPemasukanForEntityService(entityType, entityId);
    return Boolean(result);
  } catch (error) {
    console.error("Server Action - Error refresh pemasukan for entity:", error);
    throw new Error("Gagal refresh pemasukan untuk entitas");
  }
}

export async function syncAllPemasukan() {
  try {
    await syncAllPemasukanService();
    return true;
  } catch (error) {
    console.error("Server Action - Error sync semua pemasukan:", error);
    throw new Error("Gagal mensinkronkan semua data pemasukan");
  }
}