// File: src/app/api/program-kerja/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getProgramKerjaData, createProgramKerja, CreateProgramKerjaData } from '@/lib/services/supabase/program-kerja';
import { z } from 'zod';

// Schema untuk validasi input
const programKerjaSchema = z.object({
  kategori: z.enum(['PENGURUS_MASJID', 'REMAS', 'MAJLIS_TALIM']),
  seksi: z.string().min(2).max(100),
  programKerja: z.string().min(10).max(1000),
  urutan: z.number().min(1).max(100),
  tahun: z.number().optional().nullable(),
  isActive: z.boolean(),
});

// GET - Ambil semua program kerja atau filter berdasarkan kategori/seksi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori') || undefined;
    const seksi = searchParams.get('seksi') || undefined;

    const { data, error } = await getProgramKerjaData(kategori, seksi);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching program kerja:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data program kerja',
      },
      { status: 500 }
    );
  }
}

// POST - Tambah program kerja baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    const validatedData = programKerjaSchema.parse(body);

    const { data, error } = await createProgramKerja(validatedData as CreateProgramKerjaData);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Program kerja berhasil ditambahkan',
      data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data tidak valid',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error creating program kerja:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan program kerja',
      },
      { status: 500 }
    );
  }
}