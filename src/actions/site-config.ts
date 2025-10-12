"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface SiteConfigData {
  id: string;
  key: string;
  value: string;
  description: string | null;
  category: string;
  dataType: string;
  isPublic: boolean;
  updatedBy: string | null;
  updatedAt: Date;
  createdAt: Date;
}

export async function getSiteConfigurations(category?: string): Promise<SiteConfigData[]> {
  try {
    const supabase = supabaseAdmin;
    
    let query = supabase
      .from("site_configuration")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching site configurations:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching site configurations:", error);
    return [];
  }
}

export async function getSiteConfigByKey(key: string): Promise<SiteConfigData | null> {
  try {
    const supabase = supabaseAdmin;
    
    const { data: config, error } = await supabase
      .from("site_configuration")
      .select("*")
      .eq("key", key)
      .single();

    if (error) {
      console.error("Error fetching site configuration:", error);
      return null;
    }

    return config;
  } catch (error) {
    console.error("Error fetching site configuration:", error);
    return null;
  }
}

export async function createSiteConfig(data: {
  key: string;
  value: string;
  description?: string;
  category?: string;
  dataType?: string;
  isPublic?: boolean;
  updatedBy?: string;
}): Promise<{ success: boolean; error?: string; data?: SiteConfigData }> {
  try {
    const supabase = supabaseAdmin;
    
    const configData = {
      key: data.key,
      value: data.value,
      description: data.description || null,
      category: data.category || "general",
      dataType: data.dataType || "string",
      isPublic: data.isPublic || false,
      updatedBy: data.updatedBy || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: newConfig, error } = await supabase
      .from("site_configuration")
      .insert(configData)
      .select()
      .single();

    if (error) {
      console.error("Error creating site configuration:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/site-config");
    return { success: true, data: newConfig };
  } catch (error) {
    console.error("Error creating site configuration:", error);
    return { success: false, error: "Failed to create configuration" };
  }
}

export async function updateSiteConfig(
  id: string,
  data: {
    value?: string;
    description?: string;
    category?: string;
    dataType?: string;
    isPublic?: boolean;
    updatedBy?: string;
  }
): Promise<{ success: boolean; error?: string; data?: SiteConfigData }> {
  try {
    const supabase = supabaseAdmin;
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const { data: updatedConfig, error } = await supabase
      .from("site_configuration")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating site configuration:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/site-config");
    return { success: true, data: updatedConfig };
  } catch (error) {
    console.error("Error updating site configuration:", error);
    return { success: false, error: "Failed to update configuration" };
  }
}

export async function deleteSiteConfig(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseAdmin;
    
    const { error } = await supabase
      .from("site_configuration")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting site configuration:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/site-config");
    return { success: true };
  } catch (error) {
    console.error("Error deleting site configuration:", error);
    return { success: false, error: "Failed to delete configuration" };
  }
}

export async function getConfigCategories(): Promise<string[]> {
  try {
    const supabase = supabaseAdmin;
    
    const { data: categories, error } = await supabase
      .from("site_configuration")
      .select("category")
      .not("category", "is", null);

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    const uniqueCategories = [...new Set(categories?.map(item => item.category) || [])];
    return uniqueCategories.sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function initializeDefaultConfigs(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseAdmin;
    
    const defaultConfigs = [
      {
        key: "site_name",
        value: "Masjid Management System",
        description: "Nama situs web",
        category: "general",
        dataType: "string",
        isPublic: true,
      },
      {
        key: "site_description",
        value: "Sistem manajemen masjid terpadu",
        description: "Deskripsi situs web",
        category: "general",
        dataType: "string",
        isPublic: true,
      },
      {
        key: "maintenance_mode",
        value: "false",
        description: "Mode maintenance situs",
        category: "system",
        dataType: "boolean",
        isPublic: false,
      },
    ];

    for (const config of defaultConfigs) {
      // Check if config already exists
      const { data: existing } = await supabase
        .from("site_configuration")
        .select("id")
        .eq("key", config.key)
        .single();

      if (!existing) {
        await supabase
          .from("site_configuration")
          .insert({
            ...config,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
      }
    }

    revalidatePath("/admin/site-config");
    return { success: true };
  } catch (error) {
    console.error("Error initializing default configs:", error);
    return { success: false, error: "Failed to initialize default configurations" };
  }
}