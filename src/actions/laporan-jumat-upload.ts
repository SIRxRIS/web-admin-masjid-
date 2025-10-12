"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

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

/**
 * Server action to upload PDF laporan Jumat ke Supabase Storage
 */
export async function uploadLaporanJumatPDFAction(
  pdfBlob: Blob,
  metadata: Omit<LaporanJumatMetadata, 'id' | 'uploaded_at' | 'file_path' | 'file_size'>
): Promise<{ success: boolean; data?: LaporanJumatMetadata; error?: string }> {
  try {
    const supabase = supabaseAdmin;
    
    // Generate unique file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${metadata.file_name}-${timestamp}.pdf`;
    const filePath = `laporan-jumat/${new Date(metadata.tanggal).getFullYear()}/${fileName}`;
    
    // Convert Blob to ArrayBuffer for server upload
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, uint8Array, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: `Gagal upload file: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(filePath);

    // Save metadata to database
    const reportMetadata: Omit<LaporanJumatMetadata, 'id'> = {
      ...metadata,
      file_path: filePath,
      file_size: pdfBlob.size,
      uploaded_at: new Date().toISOString(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from('laporan_jumat_files')
      .insert(reportMetadata)
      .select()
      .single();

    if (insertError) {
      // If database insert fails, clean up uploaded file
      await supabase.storage.from('reports').remove([filePath]);
      console.error('Database insert error:', insertError);
      return { success: false, error: `Gagal simpan metadata: ${insertError.message}` };
    }

    return {
      success: true,
      data: {
        ...insertData,
        public_url: urlData.publicUrl
      } as LaporanJumatMetadata & { public_url: string }
    };

  } catch (error) {
    console.error('Upload laporan error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal' 
    };
  }
}