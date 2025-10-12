// src/app/api/public/laporan-jumat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('laporan_jumat')
      .select('*')
      .eq('is_public', true)
      .order('tanggal_laporan', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate && endDate) {
      query = query.gte('tanggal_laporan', startDate).lte('tanggal_laporan', endDate);
    }

    const { data: reports, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch reports', details: error.message },
        { status: 500 }
      );
    }

    // Transform data for public API
    const publicReports = reports?.map((report: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: publicReports,
      pagination: {
        limit,
        offset,
        total: publicReports?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in public laporan-jumat API:', error);
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