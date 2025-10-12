// src/app/api/target-pemasukan/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createTargetPemasukanNotification } from '@/actions/notifications';
import { getDonasiBulanan } from '@/lib/services/supabase/dashboard/dashboard';

// Gunakan admin client (service role) agar bisa menulis meskipun RLS membatasi

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tahun = Number(searchParams.get('year'));
    const bulan = Number(searchParams.get('month'));

    if (!tahun || !bulan) {
      return NextResponse.json({ error: 'Parameter year dan month wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('target_pemasukan')
      .select('*')
      .eq('tahun', tahun)
      .eq('bulan', bulan)
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ target: data?.target ?? null, data });
  } catch (err) {
    console.error('Unhandled GET error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tahun = Number(body.year);
    const bulan = Number(body.month);
    const target = Number(body.target);

    if (!tahun || !bulan || !target || target <= 0) {
      return NextResponse.json({ error: 'Input tidak valid: year, month, dan target wajib diisi' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Upsert berdasarkan kombinasi (tahun, bulan)
    const { data, error } = await supabaseAdmin
      .from('target_pemasukan')
      .upsert(
        [{ tahun, bulan, target, updated_at: now }],
        { onConflict: 'tahun,bulan' }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger notifikasi untuk pengurus tentang target pemasukan
    try {
      const currentIncome = await getDonasiBulanan(tahun, bulan);
      const isAchieved = currentIncome >= target;
      
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const monthName = monthNames[bulan - 1];
      
      await createTargetPemasukanNotification(
        isAchieved,
        target,
        currentIncome,
        monthName,
        tahun
      );
    } catch (notifError) {
      console.error("Error creating target pemasukan notification:", notifError);
      // Jangan gagalkan proses utama jika notifikasi gagal
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unhandled POST error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}