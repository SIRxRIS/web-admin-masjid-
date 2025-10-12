// src/lib/services/supabase/pengeluaran/sync-helpers.ts
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Sync pengeluaran data to maintain consistency
 * This function can be used for any additional sync operations needed for pengeluaran
 */
export async function syncPengeluaranData(pengeluaranId?: number): Promise<void> {
  const supabase = supabaseAdmin;

  try {
    // For now, this is a placeholder for any future sync operations
    // Unlike pemasukan which syncs from multiple sources (donatur, kotak amal, etc.),
    // pengeluaran is typically entered directly, so sync operations might be different
    
    // Example: Update calculated fields, trigger notifications, etc.
    if (pengeluaranId) {
      // Get pengeluaran data
      const { data: pengeluaran, error: pengeluaranError } = await supabase
        .from("Pengeluaran")
        .select("*")
        .eq("id", pengeluaranId)
        .single();

      if (pengeluaranError) throw pengeluaranError;

      // Here you can add any sync logic needed, such as:
      // - Updating related tables
      // - Triggering notifications
      // - Updating calculated fields
      // - Logging changes
      
      console.log(`Pengeluaran ${pengeluaranId} synced successfully`);
    }
  } catch (error) {
    console.error("Error syncing pengeluaran data:", error);
    throw error;
  }
}

/**
 * Sync all pengeluaran data for a specific year
 * This can be useful for batch operations or data consistency checks
 */
export async function syncPengeluaranByYear(tahun: number): Promise<void> {
  const supabase = supabaseAdmin;

  try {
    // Get all pengeluaran for the year
    const { data: pengeluaranList, error: pengeluaranError } = await supabase
      .from("Pengeluaran")
      .select("id")
      .eq("tahun", tahun);

    if (pengeluaranError) throw pengeluaranError;

    // Sync each pengeluaran
    for (const pengeluaran of pengeluaranList || []) {
      await syncPengeluaranData(pengeluaran.id);
    }

    console.log(`All pengeluaran for year ${tahun} synced successfully`);
  } catch (error) {
    console.error("Error syncing pengeluaran by year:", error);
    throw error;
  }
}

/**
 * Cleanup orphaned or invalid pengeluaran data
 * This function can be used to maintain data integrity
 */
export async function cleanupPengeluaranData(): Promise<void> {
  const supabase = supabaseAdmin;

  try {
    // Example cleanup operations:
    // - Remove entries with invalid data
    // - Update calculated totals
    // - Fix data inconsistencies
    
    console.log("Pengeluaran data cleanup completed");
  } catch (error) {
    console.error("Error cleaning up pengeluaran data:", error);
    throw error;
  }
}