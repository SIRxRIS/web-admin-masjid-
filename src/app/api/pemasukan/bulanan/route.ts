// src/app/api/pemasukan/bulanan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPemasukanBulanan } from '@/lib/services/supabase/rekap-tahunan';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json(
        { error: 'Parameter year dan month harus berupa angka valid' },
        { status: 400 }
      );
    }

    const jumlah = await getPemasukanBulanan(year, month);

    return NextResponse.json({
      jumlah,
      year,
      month,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error dalam API pemasukan bulanan:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}