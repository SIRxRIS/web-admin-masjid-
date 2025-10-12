// src/app/api/pemasukan/available-years/route.ts
import { NextResponse } from 'next/server';
import { getAvailableTahunPemasukan } from '@/lib/services/supabase/pemasukan/pemasukan';

export async function GET() {
  try {
    const years = await getAvailableTahunPemasukan();

    return NextResponse.json({
      years,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error dalam API available years:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
