// src/lib/services/supabase/profile/profile.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ProfileData } from "@/lib/schema/profile/schema";
import { v4 as uuidv4 } from 'uuid';

export async function getProfiles(
  isComplete?: boolean
): Promise<ProfileData[]> {
  const supabase = supabaseAdmin;

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
  const supabase = supabaseAdmin;

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
  const supabase = supabaseAdmin;

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
  const supabase = supabaseAdmin;

  const now = new Date();

  const { data, error } = await supabase
    .from("profile")
    .insert([
      {
        id: uuidv4(),
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
  const supabase = supabaseAdmin;

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
  const supabase = supabaseAdmin;

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
  const supabase = supabaseAdmin;

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

export async function deleteProfile(id: string): Promise<void> {
  const supabase = supabaseAdmin;

  const { error } = await supabase.from("profile").delete().eq("id", id);

  if (error) {
    console.error("Error menghapus profile:", error);
    throw new Error("Gagal menghapus profile");
  }
}

export async function deleteProfileByUserId(userId: string): Promise<void> {
  const supabase = supabaseAdmin;

  const { error } = await supabase
    .from("profile")
    .delete()
    .eq("userId", userId);

  if (error) {
    console.error("Error menghapus profile by userId:", error);
    throw new Error("Gagal menghapus profile");
  }
}

export async function getProfilesByRole(role: string): Promise<ProfileData[]> {
  const supabase = supabaseAdmin;

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
  const supabase = supabaseAdmin;

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
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .or(
      `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,jabatan.ilike.%${searchTerm}%`
    );

  if (error) {
    console.error("Error searching profiles:", error);
    throw new Error("Gagal mencari profiles");
  }

  return data || [];
}

// API CLIENT FUNCTIONS - Menggunakan supabase admin melalui API endpoint

export async function createProfileViaAPI(
  profileData: Omit<ProfileData, "id" | "createdAt" | "updatedAt">
): Promise<ProfileData> {
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Gagal membuat profile');
    }

    return result.data;
  } catch (error) {
    console.error("Error membuat profile via API:", error);
    throw new Error("Gagal membuat profile");
  }
}

export async function getProfileByUserIdViaAPI(
  userId: string
): Promise<ProfileData | null> {
  try {
    const response = await fetch(`/api/profile?userId=${userId}`);
    const result = await response.json();

    if (!result.success) {
      return null;
    }

    return result.data?.[0] || null;
  } catch (error) {
    console.error("Error mengambil profile via API:", error);
    return null;
  }
}

// ADMIN FUNCTIONS - Menggunakan supabase admin langsung (untuk server-side)

export async function createProfileAdmin(
  profileData: Omit<ProfileData, "id" | "createdAt" | "updatedAt">
): Promise<ProfileData> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("profile")
    .insert([{
      id: uuidv4(),
      ...profileData
    }])
    .select()
    .single();

  if (error) {
    console.error("Error membuat profile dengan admin:", error);
    throw new Error("Gagal membuat profile");
  }

  return data;
}

export async function getProfileByUserIdAdmin(
  userId: string
): Promise<ProfileData | null> {
  const { data, error } = await supabaseAdmin
    .from("profile")
    .select("*")
    .eq("userId", userId)
    .single();

  if (error) {
    console.error("Error mengambil profile by userId dengan admin:", error);
    return null;
  }

  return data;
}
