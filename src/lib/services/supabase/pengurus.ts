// src/lib/services/supabase/pengurus
import { supabaseAdmin } from "../../supabase/admin";
import type { PengurusData } from "../../schema/pengurus/schema";

// Helper function untuk upload foto
async function uploadFotoPengurus(file: File): Promise<string> {
  const supabase = supabaseAdmin;

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

// SERVER SERVICE - Create pengurus with foto
export async function createPengurusWithFoto(
  pengurusData: Omit<PengurusData, 'id' | 'fotoUrl' | 'createdAt' | 'updatedAt'>,
  file: File | null
): Promise<{
  data: PengurusData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    // Set default foto jika tidak ada file yang diupload
    let fotoUrl = "/images/profile.png";
    
    // Upload foto jika ada
    if (file && file.size > 0) {
      fotoUrl = await uploadFotoPengurus(file);
    }

    const now = new Date().toISOString();

    // Insert ke database
    const { data, error } = await supabase
      .from("Pengurus")
      .insert([
        {
          ...pengurusData,
          fotoUrl,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating pengurus:", error);
      return { data: null, error: "Failed to create pengurus" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Data fetching untuk Server Components
export async function getPengurusData(kategori?: string): Promise<{
  data: PengurusData[] | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    let query = supabase
      .from("Pengurus")
      .select("*");

    if (kategori) {
      query = query.eq("kategori", kategori);
    }

    const { data, error } = await query.order("no", { ascending: true });

    if (error) {
      console.error("Error fetching pengurus data:", error);
      return { data: null, error: "Failed to fetch pengurus data" };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Get pengurus by kategori
export async function getPengurusByKategori(kategori: string): Promise<{
  data: PengurusData[] | null;
  error: string | null;
}> {
  return getPengurusData(kategori);
}

// SERVER SERVICE - Get pengurus by ID
export async function getPengurusById(id: number): Promise<{
  data: PengurusData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("Pengurus")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching pengurus by ID:", error);
      return { data: null, error: "Failed to fetch pengurus" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Get available periods
export async function getAvailablePeriods(): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("Pengurus")
      .select("periode")
      .order("periode");

    if (error) {
      console.error("Error fetching periods:", error);
      return { data: null, error: "Failed to fetch periods" };
    }

    const periods: string[] = Array.from(new Set(data?.map((item: any) => item.periode) || []));
    return { data: periods, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Delete pengurus
export async function deletePengurus(id: number): Promise<{
  data: boolean;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    // Get pengurus data first to delete photo if exists
    const { data: pengurusData, error: fetchError } = await supabase
      .from("Pengurus")
      .select("fotoUrl")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching pengurus for deletion:", fetchError);
      return { data: false, error: "Failed to fetch pengurus data" };
    }

    // Delete photo from storage if it's not the default profile image
    if (pengurusData?.fotoUrl && !pengurusData.fotoUrl.includes("/images/profile.png")) {
      const filePath = pengurusData.fotoUrl.split("/").pop();
      if (filePath) {
        await supabase.storage
          .from("images")
          .remove([`pengurus/${filePath}`]);
      }
    }

    // Delete pengurus record
    const { error: deleteError } = await supabase
      .from("Pengurus")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting pengurus:", deleteError);
      return { data: false, error: "Failed to delete pengurus" };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: false, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Update pengurus with optional foto
export async function updatePengurusWithOptionalFoto(
  id: number,
  pengurusData: Partial<Omit<PengurusData, 'id' | 'createdAt' | 'updatedAt'>>,
  file?: File | null
): Promise<{
  data: PengurusData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    let updateData: any = {
      ...pengurusData,
      updatedAt: new Date().toISOString(),
    };

    // Upload foto baru jika ada
    if (file && file.size > 0) {
      // Get current pengurus data to delete old photo
      const { data: currentData } = await supabase
        .from("Pengurus")
        .select("fotoUrl")
        .eq("id", id)
        .single();

      // Delete old photo if it's not the default profile image
      if (currentData?.fotoUrl && !currentData.fotoUrl.includes("/images/profile.png")) {
        const oldFilePath = currentData.fotoUrl.split("/").pop();
        if (oldFilePath) {
          await supabase.storage
            .from("images")
            .remove([`pengurus/${oldFilePath}`]);
        }
      }

      // Upload new photo
      const newFotoUrl = await uploadFotoPengurus(file);
      updateData.fotoUrl = newFotoUrl;
    }

    const { data, error } = await supabase
      .from("Pengurus")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pengurus:", error);
      return { data: null, error: "Failed to update pengurus" };
    }

    return { data: data as PengurusData, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}