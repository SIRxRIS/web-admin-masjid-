// src/lib/services/supabase/visi-misi
import { supabaseAdmin } from "@/lib/supabase/admin";

// Types untuk VisiMisi
export interface VisiMisiData {
  id: number;
  kategori: 'MASJID' | 'REMAS' | 'MAJLIS_TALIM';
  jenis: 'VISI' | 'MISI';
  konten: string;
  divisi?: string | null; // Divisi/Seksi - optional field
  urutan: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateVisiMisiData = Omit<VisiMisiData, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVisiMisiData = Partial<Omit<VisiMisiData, 'id' | 'createdAt' | 'updatedAt'>>;

// SERVER SERVICE - Get all visi misi with optional filters
export async function getVisiMisiData(
  kategori?: string,
  jenis?: string
): Promise<{
  data: VisiMisiData[] | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;
    

    let query = supabase
      .from("visi_misi")
      .select("*");

    if (kategori) {
      query = query.eq("kategori", kategori);
    }

    if (jenis) {
      query = query.eq("jenis", jenis);
    }

    const { data, error } = await query
      .order("kategori", { ascending: true })
      .order("jenis", { ascending: true })
      .order("urutan", { ascending: true });

    if (error) {
      console.error("Error fetching visi misi data:", error);
      return { data: null, error: "Failed to fetch visi misi data" };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Get visi misi by ID
export async function getVisiMisiById(id: number): Promise<{
  data: VisiMisiData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("visi_misi")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching visi misi by ID:", error);
      return { data: null, error: "Failed to fetch visi misi" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Create new visi misi
export async function createVisiMisi(
  visiMisiData: CreateVisiMisiData
): Promise<{
  data: VisiMisiData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    // Check if urutan already exists for the same kategori, jenis, and divisi
    let existingQuery = supabase
      .from("visi_misi")
      .select("id")
      .eq("kategori", visiMisiData.kategori)
      .eq("jenis", visiMisiData.jenis)
      .eq("urutan", visiMisiData.urutan);

    // Handle divisi field - check for null/undefined values
    if (visiMisiData.divisi) {
      existingQuery = existingQuery.eq("divisi", visiMisiData.divisi);
    } else {
      existingQuery = existingQuery.is("divisi", null);
    }

    const { data: existingItem } = await existingQuery.single();

    if (existingItem) {
      const divisiText = visiMisiData.divisi ? ` divisi ${visiMisiData.divisi}` : '';
      return { 
        data: null, 
        error: `Urutan ${visiMisiData.urutan} sudah digunakan untuk ${visiMisiData.jenis} ${visiMisiData.kategori}${divisiText}` 
      };
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("visi_misi")
      .insert([
        {
          ...visiMisiData,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating visi misi:", error);
      return { data: null, error: "Failed to create visi misi" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Update visi misi
export async function updateVisiMisi(
  id: number,
  updateData: UpdateVisiMisiData
): Promise<{
  data: VisiMisiData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    // Get existing item first
    const { data: existingItem, error: fetchError } = await supabase
      .from("visi_misi")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingItem) {
      return { data: null, error: "Visi misi tidak ditemukan" };
    }

    // If updating urutan, check for conflicts
    if (updateData.urutan && updateData.urutan !== existingItem.urutan) {
      const kategori = updateData.kategori || existingItem.kategori;
      const jenis = updateData.jenis || existingItem.jenis;
      const divisi = updateData.divisi !== undefined ? updateData.divisi : existingItem.divisi;

      let conflictQuery = supabase
        .from("visi_misi")
        .select("id")
        .eq("kategori", kategori)
        .eq("jenis", jenis)
        .eq("urutan", updateData.urutan)
        .neq("id", id);

      // Handle divisi field - check for null/undefined values
      if (divisi) {
        conflictQuery = conflictQuery.eq("divisi", divisi);
      } else {
        conflictQuery = conflictQuery.is("divisi", null);
      }

      const { data: conflictingItem } = await conflictQuery.single();

      if (conflictingItem) {
        const divisiText = divisi ? ` divisi ${divisi}` : '';
        return { 
          data: null, 
          error: `Urutan ${updateData.urutan} sudah digunakan untuk ${jenis} ${kategori}${divisiText}` 
        };
      }
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("visi_misi")
      .update({
        ...updateData,
        updatedAt: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating visi misi:", error);
      return { data: null, error: "Failed to update visi misi" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Delete visi misi
export async function deleteVisiMisi(id: number): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    // Check if item exists
    const { data: existingItem, error: fetchError } = await supabase
      .from("visi_misi")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingItem) {
      return { success: false, error: "Visi misi tidak ditemukan" };
    }

    const { data, error } = await supabase
      .from("visi_misi")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting visi misi:", error);
      return { success: false, error: "Failed to delete visi misi" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Get visi misi by kategori
export async function getVisiMisiByKategori(kategori: string): Promise<{
  data: VisiMisiData[] | null;
  error: string | null;
}> {
  return getVisiMisiData(kategori);
}

// SERVER SERVICE - Get visi misi by kategori and jenis
export async function getVisiMisiByKategoriAndJenis(
  kategori: string,
  jenis: string
): Promise<{
  data: VisiMisiData[] | null;
  error: string | null;
}> {
  return getVisiMisiData(kategori, jenis);
}