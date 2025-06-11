// src/lib/services/supabase/inventaris/inventaris.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Inventaris = {
  id: number;
  no: number;
  namaBarang: string;
  fotoUrl?: string;
  kategori:
    | "PERLENGKAPAN"
    | "ELEKTRONIK"
    | "KEBERSIHAN"
    | "DOKUMEN"
    | "LAINNYA";
  jumlah: number;
  satuan: "UNIT" | "BUAH" | "LEMBAR" | "SET" | "LAINNYA";
  lokasi: string;
  kondisi: "BAIK" | "CUKUP" | "RUSAK";
  tanggalMasuk: Date;
  tahun: number;
  keterangan?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getInventarisData(
  tahunFilter?: number
): Promise<Inventaris[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("Inventaris")
    .select("*")
    .order("no", { ascending: true });

  if (tahunFilter) {
    query = query.eq("tahun", tahunFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data inventaris:", error);
    throw new Error("Gagal mengambil data inventaris");
  }

  return (data || []).map((item) => ({
    ...item,
    tanggalMasuk: new Date(item.tanggalMasuk),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));
}

export async function getAvailableTahun(): Promise<number[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Inventaris")
    .select("tahun")
    .order("tahun", { ascending: false });

  if (error) {
    console.error("Error mengambil data tahun:", error);
    throw new Error("Gagal mengambil data tahun");
  }

  return [...new Set(data.map((item) => item.tahun))];
}

export async function getInventarisById(
  id: number
): Promise<Inventaris | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Inventaris")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data inventaris:", error);
    throw new Error("Gagal mengambil data inventaris");
  }

  if (data) {
    return {
      ...data,
      tanggalMasuk: new Date(data.tanggalMasuk),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  return null;
}

export async function uploadFotoInventaris(file: File): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `inventaris/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Gagal upload foto:", uploadError);
    throw new Error("Gagal mengupload foto inventaris");
  }

  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function createInventaris(
  inventaris: Omit<Inventaris, "id" | "tahun" | "createdAt" | "updatedAt">,
  file?: File
): Promise<Inventaris> {
  const supabase = await createServerSupabaseClient();

  let fotoUrl = inventaris.fotoUrl;
  if (file) {
    fotoUrl = await uploadFotoInventaris(file);
  }

  const tahun = new Date(inventaris.tanggalMasuk).getFullYear();

  const { data: lastItem, error: lastItemError } = await supabase
    .from("Inventaris")
    .select("no")
    .eq("tahun", tahun)
    .order("no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastItemError) {
    console.error("Error mengambil nomor terakhir:", lastItemError);
    throw new Error("Gagal mengambil nomor terakhir");
  }

  const nextNo = lastItem ? (lastItem.no || 0) + 1 : 1;

  const { data, error } = await supabase
    .from("Inventaris")
    .insert([
      {
        ...inventaris,
        fotoUrl,
        tahun,
        no: nextNo,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error menambahkan inventaris:", error);
    throw new Error("Gagal menambahkan inventaris");
  }

  return {
    ...data,
    tanggalMasuk: new Date(data.tanggalMasuk),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

async function deleteOldFotoInventaris(fotoUrl: string) {
  const supabase = await createServerSupabaseClient();

  if (!fotoUrl) return;

  try {
    const path = fotoUrl.split("/public/")[1] || fotoUrl.split("images/")[1];

    if (!path) {
      console.error("Format URL foto tidak valid:", fotoUrl);
      return;
    }

    const { error } = await supabase.storage.from("images").remove([path]);

    if (error) {
      console.error("Error menghapus foto lama inventaris:", error);
    }
  } catch (err) {
    console.error("Kesalahan saat memproses URL foto:", err);
  }
}

export async function updateInventaris(
  id: number,
  inventaris: Partial<
    Omit<Inventaris, "id" | "tahun" | "createdAt" | "updatedAt">
  >,
  file?: File
): Promise<Inventaris> {
  const supabase = await createServerSupabaseClient();

  let fotoUrl = inventaris.fotoUrl;
  let dataToUpdate: any = { ...inventaris };

  if (inventaris.tanggalMasuk) {
    dataToUpdate.tahun = new Date(inventaris.tanggalMasuk).getFullYear();
  }

  if (file) {
    const { data: oldData, error: oldDataError } = await supabase
      .from("Inventaris")
      .select("fotoUrl")
      .eq("id", id)
      .single();

    if (oldDataError) {
      console.error("Gagal mengambil data inventaris lama:", oldDataError);
      throw new Error("Gagal mengambil data inventaris lama");
    }

    if (oldData?.fotoUrl) {
      await deleteOldFotoInventaris(oldData.fotoUrl);
    }

    fotoUrl = await uploadFotoInventaris(file);
    dataToUpdate.fotoUrl = fotoUrl;
  }

  const { data, error } = await supabase
    .from("Inventaris")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate inventaris:", error);
    throw new Error("Gagal mengupdate inventaris");
  }

  return {
    ...data,
    tanggalMasuk: new Date(data.tanggalMasuk),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

export async function deleteInventaris(id: number): Promise<void> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: inventarisToDelete, error: getError } = await supabase
      .from("Inventaris")
      .select("fotoUrl, tahun")
      .eq("id", id)
      .single();

    if (getError) throw getError;

    if (inventarisToDelete?.fotoUrl) {
      await deleteOldFotoInventaris(inventarisToDelete.fotoUrl);
    }

    const { error: deleteError } = await supabase
      .from("Inventaris")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    const { data: remainingItems, error: getRemainingError } = await supabase
      .from("Inventaris")
      .select("id")
      .eq("tahun", inventarisToDelete.tahun)
      .order("no", { ascending: true });

    if (getRemainingError) throw getRemainingError;

    if (remainingItems) {
      for (let i = 0; i < remainingItems.length; i++) {
        const { error: updateError } = await supabase
          .from("Inventaris")
          .update({ no: i + 1 })
          .eq("id", remainingItems[i].id);

        if (updateError) throw updateError;
      }
    }
  } catch (error) {
    console.error("Error menghapus inventaris:", error);
    throw new Error("Gagal menghapus inventaris");
  }
}
