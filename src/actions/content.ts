// src/actions/konten.ts
"use server";

import {
  createKontenWithFoto as createKontenWithFotoService,
  updateKontenWithOptionalFoto as updateKontenWithOptionalFotoService,
  getKontenData as getKontenDataService,
  getKontenById as getKontenByIdService,
  getKontenBySlug as getKontenBySlugService,
  deleteKonten as deleteKontenService,
  uploadMultipleFotosKonten as uploadMultipleFotosKontenService,
  updateGambarKonten as updateGambarKontenService,
  deleteGambarKonten as deleteGambarKontenService,
  getGambarKontenByKontenId as getGambarKontenByKontenIdService,
  createTagKonten as createTagKontenService,
  getTagKonten as getTagKontenService,
  updateTagKonten as updateTagKontenService,
  deleteTagKonten as deleteTagKontenService,
  addTagsToKonten as addTagsToKontenService,
  removeTagFromKonten as removeTagFromKontenService,
  getTagsByKontenId as getTagsByKontenIdService,
  getKontenByKategori as getKontenByKategoriService,
  searchKonten as searchKontenService,
  incrementViewCount as incrementViewCountService,
  getTotalKontenPublished as getTotalKontenPublishedService,
  // ✅ Import fungsi baru
  getKontenWithRelations as getKontenWithRelationsService,
  getKontenForPublic as getKontenForPublicService,
  getKontenBeranda as getKontenBerandaService,
} from "@/lib/services/supabase/konten";

// ✅ Perbaiki import types - gunakan yang benar dari schema
import {
  ContentFormValues,
  ContentFormInputValues,
  StatusKonten,
} from "@/components/admin/layout/content/form/content-schema";

import {
  GambarKontenFormValues,
  TagKontenFormValues,
} from "@/components/admin/layout/content/form/content-edit/edit-schema";

// ===== KONTEN UTAMA =====

export async function createKontenWithFoto(
  data: ContentFormInputValues, // ✅ Gunakan InputValues untuk create
  file?: File
) {
  try {
    if (!data) {
      throw new Error("Data konten tidak boleh kosong");
    }

    const result = await createKontenWithFotoService(data, file || null);
    return result;
  } catch (error) {
    console.error("Server Action - Error membuat konten:", error);
    throw new Error("Gagal membuat konten baru");
  }
}

// ✅ Perbaiki type parameter
export async function updateKontenWithOptionalFoto(
  id: number,
  updates: Partial<ContentFormValues>, // ✅ Gunakan ContentFormValues
  file?: File
) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID konten tidak valid");
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error("Data update tidak boleh kosong");
    }

    const result = await updateKontenWithOptionalFotoService(id, updates, file);
    return result;
  } catch (error) {
    console.error("Server Action - Error update konten:", error);
    throw new Error("Gagal mengupdate konten");
  }
}

export async function getKontenData() {
  try {
    const data = await getKontenDataService();
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil data konten:", error);
    throw new Error("Gagal mengambil data konten");
  }
}

export async function getKontenById(id: number) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID konten tidak valid");
    }

    const data = await getKontenByIdService(id);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil konten by ID:", error);
    throw new Error("Gagal mengambil data konten");
  }
}

export async function getKontenBySlug(slug: string) {
  try {
    if (!slug || slug.trim() === "") {
      throw new Error("Slug konten tidak valid");
    }

    const data = await getKontenBySlugService(slug);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil konten by slug:", error);
    throw new Error("Gagal mengambil data konten");
  }
}

export async function deleteKonten(id: number): Promise<boolean> {
  try {
    if (!id || id <= 0) {
      throw new Error("ID konten tidak valid");
    }

    const result = await deleteKontenService(id);
    return Boolean(result);
  } catch (error) {
    console.error("Server Action - Error hapus konten:", error);
    throw new Error("Gagal menghapus konten");
  }
}

// ✅ FUNGSI BARU - Konten dengan relasi
export async function getKontenWithRelations(id: number) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID konten tidak valid");
    }

    const data = await getKontenWithRelationsService(id);
    return data;
  } catch (error) {
    console.error(
      "Server Action - Error mengambil konten dengan relasi:",
      error
    );
    throw new Error("Gagal mengambil data konten dengan relasi");
  }
}

// ✅ FUNGSI BARU - Konten untuk public
export async function getKontenForPublic(limit = 10, offset = 0) {
  try {
    if (limit < 1 || limit > 50) {
      throw new Error("Limit harus antara 1-50");
    }

    if (offset < 0) {
      throw new Error("Offset tidak boleh negatif");
    }

    const data = await getKontenForPublicService(limit, offset);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil konten public:", error);
    throw new Error("Gagal mengambil konten public");
  }
}

// ✅ FUNGSI BARU - Konten beranda
export async function getKontenBeranda() {
  try {
    const data = await getKontenBerandaService();
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil konten beranda:", error);
    throw new Error("Gagal mengambil konten beranda");
  }
}

// ===== GAMBAR KONTEN =====

export async function uploadMultipleFotosKonten(
  kontenId: number,
  files: File[]
) {
  try {
    if (!kontenId || kontenId <= 0) {
      throw new Error("ID konten tidak valid");
    }

    if (!files || files.length === 0) {
      throw new Error("File gambar tidak boleh kosong");
    }

    const result = await uploadMultipleFotosKontenService(kontenId, files);
    return result;
  } catch (error) {
    console.error("Server Action - Error upload multiple fotos:", error);
    throw new Error("Gagal mengupload gambar konten");
  }
}

export async function updateGambarKonten(
  id: number,
  updates: GambarKontenFormValues
) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID gambar konten tidak valid");
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error("Data update tidak boleh kosong");
    }

    const result = await updateGambarKontenService(id, updates);
    return result;
  } catch (error) {
    console.error("Server Action - Error update gambar konten:", error);
    throw new Error("Gagal mengupdate gambar konten");
  }
}

export async function deleteGambarKonten(id: number): Promise<boolean> {
  try {
    if (!id || id <= 0) {
      throw new Error("ID gambar konten tidak valid");
    }

    const result = await deleteGambarKontenService(id);
    return Boolean(result);
  } catch (error) {
    console.error("Server Action - Error hapus gambar konten:", error);
    throw new Error("Gagal menghapus gambar konten");
  }
}

export async function getGambarKontenByKontenId(kontenId: number) {
  try {
    if (!kontenId || kontenId <= 0) {
      throw new Error("ID konten tidak valid");
    }

    const data = await getGambarKontenByKontenIdService(kontenId);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil gambar konten:", error);
    throw new Error("Gagal mengambil gambar konten");
  }
}

// ===== TAG KONTEN =====

export async function createTagKonten(tag: TagKontenFormValues) {
  try {
    if (!tag) {
      throw new Error("Data tag tidak boleh kosong");
    }

    if (!tag.nama || tag.nama.trim() === "") {
      throw new Error("Nama tag tidak boleh kosong");
    }

    const result = await createTagKontenService(tag);
    return result;
  } catch (error) {
    console.error("Server Action - Error membuat tag konten:", error);
    throw new Error("Gagal membuat tag konten baru");
  }
}

export async function getTagKonten() {
  try {
    const data = await getTagKontenService();
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil data tag konten:", error);
    throw new Error("Gagal mengambil data tag konten");
  }
}

export async function updateTagKonten(
  id: number,
  updates: TagKontenFormValues
) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID tag konten tidak valid");
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error("Data update tidak boleh kosong");
    }

    const result = await updateTagKontenService(id, updates);
    return result;
  } catch (error) {
    console.error("Server Action - Error update tag konten:", error);
    throw new Error("Gagal mengupdate tag konten");
  }
}

export async function deleteTagKonten(id: number): Promise<boolean> {
  try {
    if (!id || id <= 0) {
      throw new Error("ID tag konten tidak valid");
    }

    const result = await deleteTagKontenService(id);
    return Boolean(result);
  } catch (error) {
    console.error("Server Action - Error hapus tag konten:", error);
    throw new Error("Gagal menghapus tag konten");
  }
}

// ===== RELASI TAG DAN KONTEN =====

export async function addTagsToKonten(kontenId: number, tagIds: number[]) {
  try {
    if (!kontenId || kontenId <= 0) {
      throw new Error("ID konten tidak valid");
    }

    if (!tagIds || tagIds.length === 0) {
      throw new Error("Tag IDs tidak boleh kosong");
    }

    // Validasi semua tagIds adalah angka positif
    const invalidTagIds = tagIds.filter((id) => !id || id <= 0);
    if (invalidTagIds.length > 0) {
      throw new Error("Beberapa ID tag tidak valid");
    }

    const result = await addTagsToKontenService(kontenId, tagIds);
    return result;
  } catch (error) {
    console.error("Server Action - Error menambah tags ke konten:", error);
    throw new Error("Gagal menambahkan tags ke konten");
  }
}

export async function removeTagFromKonten(kontenId: number, tagId: number) {
  try {
    if (!kontenId || kontenId <= 0) {
      throw new Error("ID konten tidak valid");
    }

    if (!tagId || tagId <= 0) {
      throw new Error("ID tag tidak valid");
    }

    const result = await removeTagFromKontenService(kontenId, tagId);
    return result;
  } catch (error) {
    console.error("Server Action - Error menghapus tag dari konten:", error);
    throw new Error("Gagal menghapus tag dari konten");
  }
}

export async function getTagsByKontenId(kontenId: number) {
  try {
    if (!kontenId || kontenId <= 0) {
      throw new Error("ID konten tidak valid");
    }

    const data = await getTagsByKontenIdService(kontenId);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil tags by konten ID:", error);
    throw new Error("Gagal mengambil tags konten");
  }
}

// ===== FILTER DAN PENCARIAN =====

export async function getKontenByKategori(kategoriId: number) {
  try {
    if (!kategoriId || kategoriId <= 0) {
      throw new Error("ID kategori tidak valid");
    }

    const data = await getKontenByKategoriService(kategoriId);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil konten by kategori:", error);
    throw new Error("Gagal mengambil konten berdasarkan kategori");
  }
}

export async function searchKonten(query: string) {
  try {
    if (!query || query.trim() === "") {
      throw new Error("Query pencarian tidak boleh kosong");
    }

    // Sanitasi query untuk mencegah injection
    const sanitizedQuery = query.trim().replace(/[%_]/g, "\\$&");

    const data = await searchKontenService(sanitizedQuery);
    return data;
  } catch (error) {
    console.error("Server Action - Error pencarian konten:", error);
    throw new Error("Gagal melakukan pencarian konten");
  }
}

export async function incrementViewCount(id: number) {
  try {
    if (!id || id <= 0) {
      throw new Error("ID konten tidak valid");
    }

    const result = await incrementViewCountService(id);
    return result;
  } catch (error) {
    console.error("Server Action - Error increment view count:", error);
    throw new Error("Gagal menambah view count");
  }
}

// ===== STATISTIK =====

export async function getTotalKontenPublished() {
  try {
    const total = await getTotalKontenPublishedService();
    return total;
  } catch (error) {
    console.error(
      "Server Action - Error mengambil total konten published:",
      error
    );
    throw new Error("Gagal mengambil total konten published");
  }
}

// ===== UTILITAS TAMBAHAN =====

export async function getKontenWithPagination(
  page: number = 1,
  limit: number = 10,
  kategoriId?: number,
  status?: string
) {
  try {
    if (page < 1) {
      throw new Error("Nomor halaman tidak valid");
    }

    if (limit < 1 || limit > 100) {
      throw new Error("Limit harus antara 1-100");
    }

    // ✅ Gunakan getKontenForPublic untuk pagination yang lebih efisien
    if (status === StatusKonten.PUBLISHED && !kategoriId) {
      const offset = (page - 1) * limit;
      const data = await getKontenForPublicService(limit, offset);

      // Untuk total count, perlu query terpisah atau modifikasi service
      return {
        data,
        pagination: {
          page,
          limit,
          total: data.length, // Temporary - perlu implementasi count yang proper
          totalPages: Math.ceil(data.length / limit),
          hasNext: data.length === limit,
          hasPrev: page > 1,
        },
      };
    }

    // Fallback ke implementasi lama untuk kasus lain
    let data;

    if (kategoriId) {
      data = await getKontenByKategoriService(kategoriId);
    } else {
      data = await getKontenDataService();
    }

    // Filter berdasarkan status jika diperlukan
    if (status) {
      data = data.filter((konten) => konten.status === status);
    }

    // Implementasi pagination sederhana
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Server Action - Error pagination konten:", error);
    throw new Error("Gagal mengambil konten dengan pagination");
  }
}

export async function bulkUpdateKontenStatus(
  kontenIds: number[],
  status: StatusKonten
) {
  try {
    if (!kontenIds || kontenIds.length === 0) {
      throw new Error("ID konten tidak boleh kosong");
    }

    if (!status) {
      throw new Error("Status tidak boleh kosong");
    }

    // Validasi status adalah nilai enum yang valid
    if (!Object.values(StatusKonten).includes(status)) {
      throw new Error("Status tidak valid");
    }

    // Update satu per satu karena service layer belum mendukung bulk update
    const results = [];
    const errors = [];

    for (const id of kontenIds) {
      try {
        const result = await updateKontenWithOptionalFotoService(id, {
          status,
        });
        results.push(result);
      } catch (error) {
        console.error(`Error updating konten ${id}:`, error);
        errors.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: results.length,
      total: kontenIds.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Server Action - Error bulk update status:", error);
    throw new Error("Gagal melakukan bulk update status");
  }
}
