// src/app/api/pemasukan/tahunan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPemasukanTahunan } from '@/lib/services/supabase/rekap-tahunan';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || '');

    if (isNaN(year)) {
      return NextResponse.json(
        { error: 'Parameter year harus berupa angka valid' },
        { status: 400 }
      );
    }

    const jumlah = await getPemasukanTahunan(year);

    return NextResponse.json({
      jumlah,
      year,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error dalam API pemasukan tahunan:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}