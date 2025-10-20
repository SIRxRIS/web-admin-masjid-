// File: src/lib/services/supabase/program-kerja.ts

import { supabaseAdmin } from "@/lib/supabase/admin";

// Types untuk ProgramKerja
export interface ProgramKerjaData {
  id: number;
  kategori: 'PENGURUS_MASJID' | 'REMAS' | 'MAJLIS_TALIM';
  seksi: string;
  programKerja: string;
  urutan: number;
  tahun?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateProgramKerjaData = Omit<ProgramKerjaData, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProgramKerjaData = Partial<Omit<ProgramKerjaData, 'id' | 'createdAt' | 'updatedAt'>>;

// SERVER SERVICE - Get all program kerja with optional filters
export async function getProgramKerjaData(
  kategori?: string,
  seksi?: string
): Promise<{
  data: ProgramKerjaData[] | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    let query = supabase
      .from("programkerja")
      .select("*");

    if (kategori) {
      query = query.eq("kategori", kategori);
    }

    if (seksi) {
      query = query.eq("seksi", seksi);
    }

    const { data, error } = await query
      .order("kategori", { ascending: true })
      .order("seksi", { ascending: true })
      .order("urutan", { ascending: true });

    if (error) {
      console.error("Error fetching program kerja data:", error);
      return { data: null, error: "Failed to fetch program kerja data" };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Get program kerja by ID
export async function getProgramKerjaById(id: number): Promise<{
  data: ProgramKerjaData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("programkerja")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching program kerja by ID:", error);
      return { data: null, error: "Failed to fetch program kerja" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Create new program kerja
export async function createProgramKerja(
  programKerjaData: CreateProgramKerjaData
): Promise<{
  data: ProgramKerjaData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    // Check if urutan already exists for the same kategori, seksi, and tahun
    let existingQuery = supabase
      .from("programkerja")
      .select("id")
      .eq("kategori", programKerjaData.kategori)
      .eq("seksi", programKerjaData.seksi)
      .eq("urutan", programKerjaData.urutan);

    // Handle tahun field - check for null/undefined values
    if (programKerjaData.tahun) {
      existingQuery = existingQuery.eq("tahun", programKerjaData.tahun);
    } else {
      existingQuery = existingQuery.is("tahun", null);
    }

    const { data: existingItem } = await existingQuery.single();

    if (existingItem) {
      const tahunText = programKerjaData.tahun ? ` tahun ${programKerjaData.tahun}` : '';
      return { 
        data: null, 
        error: `Urutan ${programKerjaData.urutan} sudah digunakan untuk ${programKerjaData.kategori} seksi ${programKerjaData.seksi}${tahunText}` 
      };
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("programkerja")
      .insert([
        {
          ...programKerjaData,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating program kerja:", error);
      return { data: null, error: "Failed to create program kerja" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Update program kerja
export async function updateProgramKerja(
  id: number,
  updateData: UpdateProgramKerjaData
): Promise<{
  data: ProgramKerjaData | null;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    // Get existing item first
    const { data: existingItem, error: fetchError } = await supabase
      .from("programkerja")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingItem) {
      return { data: null, error: "Program kerja tidak ditemukan" };
    }

    // If updating urutan, check for conflicts
    if (updateData.urutan && updateData.urutan !== existingItem.urutan) {
      const kategori = updateData.kategori || existingItem.kategori;
      const seksi = updateData.seksi || existingItem.seksi;
      const tahun = updateData.tahun !== undefined ? updateData.tahun : existingItem.tahun;

      let conflictQuery = supabase
        .from("programkerja")
        .select("id")
        .eq("kategori", kategori)
        .eq("seksi", seksi)
        .eq("urutan", updateData.urutan)
        .neq("id", id);

      // Handle tahun field - check for null/undefined values
      if (tahun) {
        conflictQuery = conflictQuery.eq("tahun", tahun);
      } else {
        conflictQuery = conflictQuery.is("tahun", null);
      }

      const { data: conflictingItem } = await conflictQuery.single();

      if (conflictingItem) {
        const tahunText = tahun ? ` tahun ${tahun}` : '';
        return { 
          data: null, 
          error: `Urutan ${updateData.urutan} sudah digunakan untuk ${kategori} seksi ${seksi}${tahunText}` 
        };
      }
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("programkerja")
      .update({
        ...updateData,
        updatedAt: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating program kerja:", error);
      return { data: null, error: "Failed to update program kerja" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Delete program kerja
export async function deleteProgramKerja(id: number): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = supabaseAdmin;

    // Check if item exists
    const { data: existingItem, error: fetchError } = await supabase
      .from("programkerja")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingItem) {
      return { success: false, error: "Program kerja tidak ditemukan" };
    }

    const { error } = await supabase
      .from("programkerja")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting program kerja:", error);
      return { success: false, error: "Failed to delete program kerja" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Service error:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}

// SERVER SERVICE - Get program kerja by kategori
export async function getProgramKerjaByKategori(kategori: string): Promise<{
  data: ProgramKerjaData[] | null;
  error: string | null;
}> {
  return getProgramKerjaData(kategori);
}

// SERVER SERVICE - Get program kerja by kategori and seksi
export async function getProgramKerjaByKategoriAndSeksi(
  kategori: string,
  seksi: string
): Promise<{
  data: ProgramKerjaData[] | null;
  error: string | null;
}> {
  return getProgramKerjaData(kategori, seksi);
}