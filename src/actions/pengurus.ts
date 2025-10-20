// src/actions/pengurus.ts
"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { deletePengurus } from "@/lib/services/supabase/pengurus";

// Helper functions untuk server actions
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

// SERVER ACTION - Create pengurus
export async function createPengurusAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const pengurusData = {
      no: Number(formData.get("no")),
      nama: formData.get("nama") as string,
      jabatan: formData.get("jabatan") as string,
      periode: formData.get("periode") as string,
      kategori: formData.get("kategori") as string || "MASJID",
    };

    const file = formData.get("foto") as File | null;

    // Validasi
    if (!pengurusData.nama || !pengurusData.jabatan || !pengurusData.periode) {
      return { success: false, error: "Nama, jabatan, dan periode harus diisi" };
    }

    // Upload foto jika ada
    let fotoUrl = "/images/profile.png";
    if (file && file.size > 0) {
      fotoUrl = await uploadFotoPengurus(file);
    }

    const now = new Date().toISOString();

    // Insert ke database
    const { data: inserted, error } = await supabase
      .from("Pengurus")
      .insert([
        {
          ...pengurusData,
          fotoUrl,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating pengurus:", error);
      return { success: false, error: "Gagal membuat pengurus baru" };
    }

    // Revalidate cache
    revalidatePath("/admin/manajemen/daftar-pengurus");
    
    return { success: true, data: inserted[0] };
  } catch (error) {
    console.error("Create pengurus action error:", error);
    return { success: false, error: "Gagal membuat pengurus baru" };
  }
}

// SERVER ACTION - Update pengurus
export async function updatePengurusAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const id = Number(formData.get("id"));
    const updates = {
      no: Number(formData.get("no")),
      nama: formData.get("nama") as string,
      jabatan: formData.get("jabatan") as string,
      periode: formData.get("periode") as string,
      kategori: formData.get("kategori") as string || "MASJID",
    };

    const file = formData.get("foto") as File | null;

    if (!id) {
      return { success: false, error: "ID pengurus tidak valid" };
    }

    // Handle foto update
    let fotoUrl: string | undefined;
    if (file && file.size > 0) {
      // Get old foto URL to delete
      const { data: oldData, error: oldDataError } = await supabase
        .from("Pengurus")
        .select("fotoUrl")
        .eq("id", id)
        .single();

      if (!oldDataError && oldData?.fotoUrl) {
        await deleteOldFoto(oldData.fotoUrl);
      }
      
      fotoUrl = await uploadFotoPengurus(file);
    }

    // Update database
    const { data, error } = await supabase
      .from("Pengurus")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
        ...(fotoUrl ? { fotoUrl } : {}),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating pengurus:", error);
      return { success: false, error: "Gagal mengupdate pengurus" };
    }

    // Revalidate cache
    revalidatePath("/admin/manajemen/daftar-pengurus");
    
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Update pengurus action error:", error);
    return { success: false, error: "Gagal mengupdate pengurus" };
  }
}

// SERVER ACTION - Delete pengurus
export async function deletePengurusAction(id: number) {
  try {
    if (!id) {
      return { success: false, error: "ID pengurus tidak valid" };
    }

    // Use service layer which uses supabaseAdmin to bypass RLS
    const result = await deletePengurus(id);

    if (!result.data) {
      return { success: false, error: result.error || "Gagal menghapus pengurus" };
    }

    // Revalidate cache
    revalidatePath("/admin/manajemen/daftar-pengurus");
    
    return { success: true };
  } catch (error) {
    console.error("Delete pengurus action error:", error);
    return { success: false, error: "Gagal menghapus pengurus" };
  }
}