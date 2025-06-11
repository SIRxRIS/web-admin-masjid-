// src/lib/services/supabase/profile/profile.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileData } from "@/components/admin/layout/profile/schema";

export async function getProfiles(
  isComplete?: boolean
): Promise<ProfileData[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("profile")
    .select("*")
    .order("createdAt", { ascending: false });

  if (isComplete !== undefined) {
    query = query.eq("is_profile_complete", isComplete);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data profile:", error);
    throw new Error("Gagal mengambil data profile");
  }

  return data || [];
}

export async function getProfileById(id: string): Promise<ProfileData | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data profile:", error);
    throw new Error("Gagal mengambil data profile");
  }

  return data;
}

export async function getProfileByUserId(
  userId: string
): Promise<ProfileData | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("userId", userId)
    .single();

  if (error) {
    console.error("Error mengambil data profile by userId:", error);
    return null; // Return null jika tidak ditemukan
  }

  return data;
}

export async function createProfile(
  profileData: Omit<ProfileData, "id" | "createdAt" | "updatedAt">
): Promise<ProfileData> {
  const supabase = await createServerSupabaseClient();

  const now = new Date();

  const { data, error } = await supabase
    .from("profile")
    .insert([
      {
        ...profileData,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error membuat profile:", error);
    throw new Error("Gagal membuat profile");
  }

  return data;
}

export async function updateProfile(
  id: string,
  updateData: Partial<Omit<ProfileData, "id" | "createdAt">>
): Promise<ProfileData> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profile")
    .update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate profile:", error);
    throw new Error("Gagal mengupdate profile");
  }

  return data;
}

export async function updateProfileByUserId(
  userId: string,
  updateData: Partial<Omit<ProfileData, "id" | "userId" | "createdAt">>
): Promise<ProfileData> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profile")
    .update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    .eq("userId", userId)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate profile by userId:", error);
    throw new Error("Gagal mengupdate profile");
  }

  return data;
}

export async function toggleProfileComplete(
  id: string,
  isComplete: boolean
): Promise<ProfileData> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profile")
    .update({
      is_profile_complete: isComplete,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate status profile complete:", error);
    throw new Error("Gagal mengupdate status profile complete");
  }

  return data;
}

export async function deleteProfile(id: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("profile").delete().eq("id", id);

  if (error) {
    console.error("Error menghapus profile:", error);
    throw new Error("Gagal menghapus profile");
  }

  return true;
}

export async function getProfilesByRole(role: string): Promise<ProfileData[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("role", role)
    .order("nama", { ascending: true });

  if (error) {
    console.error("Error mengambil data profile by role:", error);
    throw new Error("Gagal mengambil data profile by role");
  }

  return data || [];
}

export async function getProfilesByJabatan(
  jabatan: string
): Promise<ProfileData[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("jabatan", jabatan)
    .order("nama", { ascending: true });

  if (error) {
    console.error("Error mengambil data profile by jabatan:", error);
    throw new Error("Gagal mengambil data profile by jabatan");
  }

  return data || [];
}

export async function searchProfiles(
  searchTerm: string
): Promise<ProfileData[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .or(
      `nama.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,alamat.ilike.%${searchTerm}%`
    )
    .order("nama", { ascending: true });

  if (error) {
    console.error("Error mencari profile:", error);
    throw new Error("Gagal mencari profile");
  }

  return data || [];
}
