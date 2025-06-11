// src/actions/email-white-list.ts
"use server";

import {
  getEmailWhitelist as getEmailWhitelistService,
  getEmailWhitelistById as getEmailWhitelistByIdService,
  createEmailWhitelist as createEmailWhitelistService,
  updateEmailWhitelist as updateEmailWhitelistService,
  toggleEmailWhitelistStatus as toggleEmailWhitelistStatusService,
  deleteEmailWhitelist as deleteEmailWhitelistService,
  checkEmailWhitelist as checkEmailWhitelistService,
} from "@/lib/services/supabase/emailWhitelist/emailWhitelist";
import { EmailWhitelistData } from "@/components/admin/layout/emailWhiteList/schema";

// Server Action untuk mengambil semua data email whitelist
export async function getEmailWhitelist(isActive?: boolean) {
  try {
    const data = await getEmailWhitelistService(isActive);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil data email whitelist:", error);
    throw new Error("Gagal mengambil data email whitelist");
  }
}

// Server Action untuk mengambil email whitelist berdasarkan ID
export async function getEmailWhitelistById(id: string) {
  try {
    if (!id || id.trim() === "") {
      throw new Error("ID email whitelist tidak valid");
    }

    const data = await getEmailWhitelistByIdService(id);
    return data;
  } catch (error) {
    console.error("Server Action - Error mengambil email whitelist by ID:", error);
    throw new Error("Gagal mengambil data email whitelist");
  }
}

// Server Action untuk membuat email whitelist baru
export async function createEmailWhitelist(
  whitelistData: Omit<EmailWhitelistData, "id" | "addedAt" | "updatedAt">
) {
  try {
    if (!whitelistData) {
      throw new Error("Data email whitelist tidak boleh kosong");
    }

    if (!whitelistData.email || whitelistData.email.trim() === "") {
      throw new Error("Email tidak boleh kosong");
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(whitelistData.email)) {
      throw new Error("Format email tidak valid");
    }

    const result = await createEmailWhitelistService(whitelistData);
    return result;
  } catch (error) {
    console.error("Server Action - Error membuat email whitelist:", error);
    throw new Error("Gagal membuat email whitelist baru");
  }
}

// Server Action untuk mengupdate email whitelist
export async function updateEmailWhitelist(
  id: string,
  updateData: Partial<Omit<EmailWhitelistData, "id" | "addedAt">>
) {
  try {
    if (!id || id.trim() === "") {
      throw new Error("ID email whitelist tidak valid");
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("Data update tidak boleh kosong");
    }

    // Validasi email jika ada dalam update data
    if (updateData.email) {
      if (updateData.email.trim() === "") {
        throw new Error("Email tidak boleh kosong");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new Error("Format email tidak valid");
      }
    }

    const result = await updateEmailWhitelistService(id, updateData);
    return result;
  } catch (error) {
    console.error("Server Action - Error update email whitelist:", error);
    throw new Error("Gagal mengupdate email whitelist");
  }
}

// Server Action untuk toggle status email whitelist
export async function toggleEmailWhitelistStatus(
  id: string,
  isActive: boolean
) {
  try {
    if (!id || id.trim() === "") {
      throw new Error("ID email whitelist tidak valid");
    }

    if (typeof isActive !== "boolean") {
      throw new Error("Status isActive harus berupa boolean");
    }

    const result = await toggleEmailWhitelistStatusService(id, isActive);
    return result;
  } catch (error) {
    console.error("Server Action - Error toggle status email whitelist:", error);
    throw new Error("Gagal mengupdate status email whitelist");
  }
}

// Server Action untuk menghapus email whitelist
export async function deleteEmailWhitelist(id: string): Promise<boolean> {
  try {
    if (!id || id.trim() === "") {
      throw new Error("ID email whitelist tidak valid");
    }

    const result = await deleteEmailWhitelistService(id);
    // Pastikan return value adalah boolean
    return Boolean(result);
  } catch (error) {
    console.error("Server Action - Error hapus email whitelist:", error);
    throw new Error("Gagal menghapus email whitelist");
  }
}

// Server Action untuk memeriksa apakah email ada di whitelist
export async function checkEmailWhitelist(email: string) {
  try {
    if (!email || email.trim() === "") {
      throw new Error("Email tidak boleh kosong");
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format email tidak valid");
    }

    const result = await checkEmailWhitelistService(email);
    return result;
  } catch (error) {
    console.error("Server Action - Error check email whitelist:", error);
    throw new Error("Gagal memeriksa email whitelist");
  }
}