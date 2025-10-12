// src/lib/supabase.ts
export { createClient } from "./supabase/client";
export { createServerSupabaseClient } from "./supabase/server";
export { supabaseAdmin } from "./supabase/admin";

// For backward compatibility
export const supabase = null; // This should be replaced with proper client instance