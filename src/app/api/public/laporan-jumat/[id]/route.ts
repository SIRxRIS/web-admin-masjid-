// src/app/api/public/laporan-jumat/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    
    // Get specific public report by ID
    const { data: report, error } = await supabase
      .from('laporan_jumat')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Report not found or not public' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Transform data for public API
    const publicReport = {
      id: report.id,
      tanggalLaporan: report.tanggal_laporan,
      fileName: report.file_name,
      fileUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports/${report.file_path}`,
      saldoKasJumatLalu: report.saldo_kas_jumat_lalu,
      kotakAmalJumat: report.kotak_amal_jumat,
      totalSumbangan: report.total_sumbangan,
      totalPengeluaran: report.total_pengeluaran,
      saldoKasHariIni: report.saldo_kas_hari_ini,
      kasBsi: report.kas_bsi,
      kasBankSulselbar: report.kas_bank_sulselbar,
      kasTunai: report.kas_tunai,
      khatib: report.khatib,
      muadzdzin: report.muadzdzin,
      imam: report.imam,
      ketuaPengurus: report.ketua_pengurus,
      bendahara: report.bendahara,
      createdAt: report.created_at
    };

    return NextResponse.json({
      success: true,
      data: publicReport
    });

  } catch (error) {
    console.error('Error fetching specific report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}