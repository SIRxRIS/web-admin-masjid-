// src/app/api/profile/update/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Prisma } from '@prisma/client';

// Allowed enums mirroring Prisma schema
const AllowedJabatan = [
  'DEVELOPER',
  'MAINTENANCE',
  'KETUA',
  'SEKRETARIS',
  'BENDAHARA',
  'PENGURUS',
  'HUMAS',
  'REMAS',
  'MAJLIS_TALIM',
] as const;
type Jabatan = typeof AllowedJabatan[number];

const AllowedRole = [
  'ADMIN',
  'KETUA',
  'SEKRETARIS',
  'BENDAHARA',
  'PENGURUS',
  'HUMAS_MEDIA',
  'REMAS_ADMIN',
  'MAJLIS_TALIM_ADMIN',
] as const;
type Role = typeof AllowedRole[number];

type Payload = {
  nama?: string;
  phone?: string; // Prisma expects String
  alamat?: string;
  jabatan?: Jabatan;
  role?: Role; // optional; can be auto-mapped from jabatan
};

function mapRoleFromJabatan(jabatan?: Jabatan): Role | undefined {
  switch (jabatan) {
    case 'KETUA':
      return 'KETUA';
    case 'SEKRETARIS':
      return 'SEKRETARIS';
    case 'BENDAHARA':
      return 'BENDAHARA';
    case 'PENGURUS':
      return 'PENGURUS';
    case 'HUMAS':
      return 'HUMAS_MEDIA';
    case 'REMAS':
      return 'REMAS_ADMIN';
    case 'MAJLIS_TALIM':
      return 'MAJLIS_TALIM_ADMIN';
    default:
      return undefined;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = (await request.json()) as Payload;

    // 1. Update tabel Profile di database
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...(body.nama !== undefined ? { nama: body.nama } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.alamat !== undefined ? { alamat: body.alamat } : {}),
      },
    });

    // 2. Sinkronkan perubahan ke Supabase Auth user_metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        nama: updatedProfile.nama,
        phone: updatedProfile.phone ?? undefined,
        alamat: updatedProfile.alamat ?? undefined,
        full_name: updatedProfile.nama, // Jaga agar full_name tetap sinkron
      },
    });

    if (updateError) {
      // Jika sinkronisasi gagal, log error tapi jangan gagalkan seluruh proses
      console.warn('Gagal menyinkronkan user_metadata:', updateError.message);
    }

    return NextResponse.json({ success: true, profile: updatedProfile });

  } catch (error) {
    console.error('API /api/profile/update error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2024') {
      return NextResponse.json(
        { error: 'Database timeout. Silakan coba lagi nanti.' },
        { status: 504 } // Gateway Timeout
      );
    }

    return NextResponse.json({ error: 'Kesalahan server internal' }, { status: 500 });
  }
}