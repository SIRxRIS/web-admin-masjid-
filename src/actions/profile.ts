// src/actions/profile.ts
"use server";

import { createServerSupabaseClient } from "../lib/supabase/server";

type ProfileData = {
  nama: string;
  jabatan: string;
  role: string;
  phone?: string;
  alamat?: string;
};

export async function setupProfile(data: ProfileData) {
  const supabase = await createServerSupabaseClient();

  // Cek user (lebih aman daripada session)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tidak terautentikasi" };
  }

  // Cek apakah user sudah memiliki profil
  const { data: existingProfile } = await supabase
    .from("profile")
    .select("id")
    .eq("userId", user.id)
    .single();

  if (existingProfile) {
    return { error: "Profil sudah dibuat sebelumnya" };
  }

  // Buat profil baru
  const { data: profile, error } = await supabase
    .from("profile")
    .insert({
      userId: user.id,
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return { error: "Gagal membuat profil" };
  }

  return { success: true, profile };
}

export async function updateProfile(id: string, data: Partial<ProfileData>) {
  const supabase = await createServerSupabaseClient();

  // Cek user (lebih aman daripada session)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tidak terautentikasi" };
  }

  // Cek apakah user memiliki akses untuk mengubah profil
  const { data: profile } = await supabase
    .from("profile")
    .select("userId, role")
    .eq("id", id)
    .single();

  if (!profile) {
    return { error: "Profil tidak ditemukan" };
  }

  // Cek apakah user adalah pemilik profil atau admin
  if (profile.userId !== user.id) {
    // Cek apakah user adalah admin
    const { data: currentUserProfile } = await supabase
      .from("profile")
      .select("role")
      .eq("userId", user.id)
      .single();

    if (!currentUserProfile || currentUserProfile.role !== "ADMIN") {
      return { error: "Tidak memiliki izin" };
    }
  }

  // Update profil
  const { data: updatedProfile, error } = await supabase
    .from("profile")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "Gagal memperbarui profil" };
  }

  return { success: true, profile: updatedProfile };
}

export async function uploadProfilePhoto(id: string, file: File) {
  const supabase = await createServerSupabaseClient();

  // Cek user (lebih aman daripada session)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tidak terautentikasi" };
  }

  try {
    // Validasi
    if (!file) {
      return { error: "File tidak ditemukan" };
    }

    // Dapatkan akses ke profil
    const { data: profile } = await supabase
      .from("profile")
      .select("userId")
      .eq("id", id)
      .single();

    if (!profile) {
      return { error: "Profil tidak ditemukan" };
    }

    // Cek apakah user adalah pemilik profil atau admin
    if (profile.userId !== user.id) {
      // Cek apakah user adalah admin
      const { data: currentUserProfile } = await supabase
        .from("profile")
        .select("role")
        .eq("userId", user.id)
        .single();

      if (!currentUserProfile || currentUserProfile.role !== "ADMIN") {
        return { error: "Tidak memiliki izin" };
      }
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        error: "Format file tidak didukung. Silakan unggah file JPG atau PNG",
      };
    }

    // Validasi ukuran file (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { error: "Ukuran file terlalu besar. Maksimum 2MB" };
    }

    // Upload file ke Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;

    // Konversi File menjadi ArrayBuffer untuk diupload
    const arrayBuffer = await file.arrayBuffer();

    // Upload ke Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { error: "Gagal mengunggah file" };
    }

    // Dapatkan URL publik file
    const { data: publicUrl } = supabase.storage
      .from("public")
      .getPublicUrl(filePath);

    // Update profil dengan URL foto baru
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profile")
      .update({ fotoUrl: publicUrl.publicUrl })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile with photo URL:", updateError);
      return { error: "Gagal memperbarui profil dengan foto baru" };
    }

    return {
      success: true,
      profile: updatedProfile,
      fotoUrl: publicUrl.publicUrl,
    };
  } catch (error) {
    console.error("Server error:", error);
    return { error: "Terjadi kesalahan server" };
  }
}
