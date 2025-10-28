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
      .from('laporan_jumat_files')
      .select('*')
      .eq('is_public', true)
      .order('tanggal', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate && endDate) {
      query = query.gte('tanggal', startDate).lte('tanggal', endDate);
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
      tanggal: report.tanggal,
      judul: report.judul,
      fileName: report.file_name,
      fileUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports/${report.file_path}`,
      saldoKasAwal: report.saldo_kas_awal,
      totalPemasukan: report.total_pemasukan,
      totalPengeluaran: report.total_pengeluaran,
      saldoKasAkhir: report.saldo_kas_akhir,
      khatib: report.khatib,
      muadzdzin: report.muadzdzin,
      imam: report.imam,
      ketuaPengurus: report.ketua_pengurus,
      bendahara: report.bendahara,
      uploadedAt: report.uploaded_at
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