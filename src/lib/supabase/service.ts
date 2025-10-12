// src/lib/supabase/service.ts
import { supabaseAdmin } from "./admin";
import { createClient } from "./client";

/**
 * Get the appropriate Supabase client based on the environment
 * - Server-side: Use admin client with service role key
 * - Client-side: Use browser client with anon key
 */
export function getSupabaseClient() {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    return supabaseAdmin;
  }
  
  // Client-side: use browser client
  return createClient();
}

/**
 * Get admin client for server-side operations that require elevated permissions
 * This should only be used in API routes or server components
 */
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should not be used on the client side');
  }
  return supabaseAdmin;
}

/**
 * Get client for browser operations
 * This should be used in client components
 */
export function getSupabaseBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('Browser client should not be used on the server side');
  }
  return createClient();
}