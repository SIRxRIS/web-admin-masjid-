// src/lib/services/supabase/pengurus.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PengurusData = {
  id: number;
  no: number;
  nama: string;
  jabatan: string;
  periode: string;
  fotoUrl: string;
  createdAt: string;
  updatedAt: string;
};

async function uploadFotoPengurus(file: File): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `pengurus/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Failed to upload photo");
  }

  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);

  return publicUrlData?.publicUrl ?? "";
}

async function deleteOldFoto(fotoUrl: string) {
  const supabase = await createServerSupabaseClient();

  if (!fotoUrl) return;
  const path = fotoUrl.split("/public/")[1];

  const { error } = await supabase.storage.from("images").remove([path]);

  if (error) {
    console.error("Error deleting old photo:", error);
  }
}

export async function updatePengurusWithOptionalFoto(
  id: number,
  updates: Partial<
    Omit<PengurusData, "id" | "createdAt" | "updatedAt" | "fotoUrl">
  >,
  file?: File
) {
  const supabase = await createServerSupabaseClient();
  let fotoUrl: string | undefined;

  if (file) {
    const { data: oldData, error: oldDataError } = await supabase
      .from("Pengurus")
      .select("fotoUrl")
      .eq("id", id)
      .single();

    if (oldDataError) {
      console.error("Error fetching old pengurus data:", oldDataError);
      throw new Error("Failed to fetch old pengurus data");
    }
    if (oldData?.fotoUrl) {
      await deleteOldFoto(oldData.fotoUrl);
    }
    fotoUrl = await uploadFotoPengurus(file);
  }

  const { data, error } = await supabase
    .from("Pengurus")
    .update({
      ...updates,
      ...(fotoUrl ? { fotoUrl } : {}),
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating pengurus:", error);
    throw new Error("Failed to update pengurus");
  }

  return data?.[0];
}

export async function getPengurusData(): Promise<PengurusData[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("Pengurus")
    .select("*")
    .order("no", { ascending: true });

  if (error) {
    console.error("Error fetching pengurus data:", error);
    throw new Error("Failed to fetch pengurus data");
  }

  return data || [];
}

export async function createPengurusWithFoto(
  data: {
    no: number;
    nama: string;
    jabatan: string;
    periode: string;
  },
  file: File | null
) {
  const supabase = await createServerSupabaseClient();

  try {
    let fotoUrl = "/images/profile.png";

    if (file) {
      fotoUrl = await uploadFotoPengurus(file);
    }

    const now = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from("Pengurus")
      .insert([
        {
          ...data,
          fotoUrl,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating pengurus:", JSON.stringify(error, null, 2));
      throw new Error(
        "Failed to create pengurus: " + (error.message || "Unknown Error")
      );
    }

    if (!inserted || inserted.length === 0) {
      throw new Error("Failed to create pengurus: No data returned");
    }

    return inserted[0];
  } catch (error) {
    console.error("Error in createPengurusWithFoto:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred while creating pengurus");
  }
}

export async function deletePengurus(id: number) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("Pengurus").delete().eq("id", id);

  if (error) {
    console.error("Error deleting pengurus:", error);
    throw new Error("Failed to delete pengurus");
  }

  return { message: "Pengurus deleted successfully" };
}
