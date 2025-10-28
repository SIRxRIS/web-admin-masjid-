"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

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
): Promise<{ success: boolean; data?: any; error?: string } | null> {
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

    try {
      const insertDataPromise = prisma.laporanJumatFiles.create({
        data: {
          tanggal: new Date(metadata.tanggal),
          judul: metadata.judul,
          fileName: metadata.file_name,
          filePath: filePath,
          fileSize: BigInt(pdfBlob.size),
          uploadedBy: metadata.uploaded_by,
          isPublic: metadata.is_public,
          saldoKasAwal: BigInt(metadata.saldo_kas_awal || 0),
          totalPemasukan: BigInt(metadata.total_pemasukan || 0),
          totalPengeluaran: BigInt(metadata.total_pengeluaran || 0),
          saldoKasAkhir: BigInt(metadata.saldo_kas_akhir || 0),
          khatib: metadata.khatib,
          muadzdzin: metadata.muadzdzin,
          imam: metadata.imam,
          ketuaPengurus: metadata.ketua_pengurus,
          bendahara: metadata.bendahara,
        },
      });

      const insertData = await Promise.race([
        insertDataPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database operation timeout after 30 seconds')), 30000)
        )
      ]);

      return {
        success: true,
        data: {
          ...insertData,
          public_url: urlData.publicUrl
        }
      };
    } catch (dbError) {
      await supabase.storage.from('reports').remove([filePath]);
      console.error('Database insert error:', dbError);
      return { 
        success: false, 
        error: `Gagal simpan metadata: ${dbError instanceof Error ? dbError.message : 'Kesalahan tidak dikenal'}` 
      };
    }

  } catch (error) {
    console.error('Upload laporan error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal' 
    };
  }
}