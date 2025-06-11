// src/lib/services/supabase/emailWhitelist/emailWhitelist.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmailWhitelistData } from "@/components/admin/layout/emailWhiteList/schema"; // Sesuaikan path

export async function getEmailWhitelist(
  isActive?: boolean
): Promise<EmailWhitelistData[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("email_whitelist")
    .select("*")
    .order("addedAt", { ascending: false });

  if (isActive !== undefined) {
    query = query.eq("isActive", isActive);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error mengambil data email whitelist:", error);
    throw new Error("Gagal mengambil data email whitelist");
  }

  return data || [];
}

export async function getEmailWhitelistById(
  id: string
): Promise<EmailWhitelistData | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("email_whitelist")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error mengambil data email whitelist:", error);
    throw new Error("Gagal mengambil data email whitelist");
  }

  return data;
}

export async function createEmailWhitelist(
  whitelistData: Omit<EmailWhitelistData, "id" | "addedAt" | "updatedAt">
): Promise<EmailWhitelistData> {
  const supabase = await createServerSupabaseClient();

  const now = new Date();

  const { data, error } = await supabase
    .from("email_whitelist")
    .insert([
      {
        ...whitelistData,
        addedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error membuat email whitelist:", error);
    throw new Error("Gagal membuat email whitelist");
  }

  return data;
}

export async function updateEmailWhitelist(
  id: string,
  updateData: Partial<Omit<EmailWhitelistData, "id" | "addedAt">>
): Promise<EmailWhitelistData> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("email_whitelist")
    .update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate email whitelist:", error);
    throw new Error("Gagal mengupdate email whitelist");
  }

  return data;
}

export async function toggleEmailWhitelistStatus(
  id: string,
  isActive: boolean
): Promise<EmailWhitelistData> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("email_whitelist")
    .update({
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error mengupdate status email whitelist:", error);
    throw new Error("Gagal mengupdate status email whitelist");
  }

  return data;
}

export async function deleteEmailWhitelist(id: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("email_whitelist")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error menghapus email whitelist:", error);
    throw new Error("Gagal menghapus email whitelist");
  }

  return true;
}

export async function checkEmailWhitelist(
  email: string
): Promise<EmailWhitelistData | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("email_whitelist")
    .select("*")
    .eq("email", email)
    .eq("isActive", true)
    .maybeSingle();

  if (error) {
    console.error("Error memeriksa email whitelist:", error);
    throw new Error("Gagal memeriksa email whitelist");
  }

  return data;
}
