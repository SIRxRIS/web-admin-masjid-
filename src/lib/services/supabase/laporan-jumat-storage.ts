// src/lib/services/supabase/laporan-jumat-storage.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";

export interface LaporanJumatMetadata {
  id?: string;
  tanggal: string;
  judul: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at?: string;
  uploaded_by?: string;
  is_public: boolean;
  saldo_kas_awal: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_kas_akhir: number;
  khatib?: string;
  muadzdzin?: string;
  imam?: string;
  ketua_pengurus?: string;
  bendahara?: string;
}

// Upload function moved to server action: /src/actions/laporan-jumat-upload.ts

/**
 * Get all public laporan Jumat for landing page (client-safe)
 */
export async function getPublicLaporanJumat(
  limit: number = 10,
  offset: number = 0
): Promise<{ success: boolean; data?: (LaporanJumatMetadata & { public_url: string })[]; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('laporan_jumat_files')
      .select('*')
      .eq('is_public', true)
      .order('tanggal', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Fetch error:', error);
      return { success: false, error: error.message };
    }

    // Add public URLs
    const reportsWithUrls = data.map(report => ({
      ...report,
      public_url: supabase.storage.from('reports').getPublicUrl(report.file_path).data.publicUrl
    }));

    return { success: true, data: reportsWithUrls };

  } catch (error) {
    console.error('Get public laporan error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal' 
    };
  }
}

/**
 * Get laporan Jumat by date range (admin only - SERVER SIDE ONLY)
 */
export async function getLaporanJumatByDateRange(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data?: (LaporanJumatMetadata & { public_url: string })[]; error?: string }> {
  try {
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from('laporan_jumat_files')
      .select('*')
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .order('tanggal', { ascending: false });

    if (error) {
      console.error('Fetch by date range error:', error);
      return { success: false, error: error.message };
    }

    // Add public URLs
    const reportsWithUrls = data.map(report => ({
      ...report,
      public_url: supabase.storage.from('reports').getPublicUrl(report.file_path).data.publicUrl
    }));

    return { success: true, data: reportsWithUrls };

  } catch (error) {
    console.error('Get laporan by date range error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal' 
    };
  }
}

/**
 * Delete laporan Jumat (admin only - SERVER SIDE ONLY)
 */
export async function deleteLaporanJumat(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseAdmin;
    
    // Get file path first
    const { data: reportData, error: fetchError } = await supabase
      .from('laporan_jumat_files')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('reports')
      .remove([reportData.file_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('laporan_jumat_files')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Delete laporan error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal' 
    };
  }
}

/**
 * Update laporan visibility (admin only - SERVER SIDE ONLY)
 */
export async function updateLaporanVisibility(
  id: string, 
  isPublic: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseAdmin;
    
    const { error } = await supabase
      .from('laporan_jumat_files')
      .update({ is_public: isPublic })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Update visibility error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal' 
    };
  }
}



/**
 * Get laporan statistics (SERVER SIDE ONLY)
 */
export async function getLaporanStatistics(): Promise<{
  success: boolean;
  data?: {
    total_reports: number;
    public_reports: number;
    total_size_mb: number;
    latest_report_date?: string;
  };
  error?: string;
}> {
  try {
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from('laporan_jumat_files')
      .select('is_public, file_size, tanggal');

    if (error) {
      return { success: false, error: error.message };
    }

    const stats = {
      total_reports: data.length,
      public_reports: data.filter(r => r.is_public).length,
      total_size_mb: Math.round(data.reduce((sum, r) => sum + r.file_size, 0) / (1024 * 1024) * 100) / 100,
      latest_report_date: data.length > 0 ? 
        data.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0].tanggal : 
        undefined
    };

    return { success: true, data: stats };

  } catch (error) {
    console.error('Get statistics error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal' 
    };
  }
}