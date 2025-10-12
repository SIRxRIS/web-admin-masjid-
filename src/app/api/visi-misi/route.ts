import { NextRequest, NextResponse } from 'next/server';
import { getVisiMisiData, createVisiMisi, CreateVisiMisiData } from '@/lib/services/supabase/visi-misi';
import { z } from 'zod';

// Schema untuk validasi input
const visiMisiSchema = z.object({
  kategori: z.enum(['MASJID', 'REMAS', 'MAJLIS_TALIM']),
  jenis: z.enum(['VISI', 'MISI']),
  konten: z.string().min(10).max(1000),
  divisi: z.string().optional().nullable(),
  urutan: z.number().min(1).max(100),
  isActive: z.boolean(),
});

// GET - Ambil semua visi misi atau filter berdasarkan kategori
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori') || undefined;
    const jenis = searchParams.get('jenis') || undefined;

    const { data, error } = await getVisiMisiData(kategori, jenis);

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
    console.error('Error fetching visi misi:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data visi misi',
      },
      { status: 500 }
    );
  }
}

// POST - Tambah visi misi baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    const validatedData = visiMisiSchema.parse(body);

    const { data, error } = await createVisiMisi(validatedData as CreateVisiMisiData);

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
      message: 'Visi misi berhasil ditambahkan',
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

    console.error('Error creating visi misi:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan visi misi',
      },
      { status: 500 }
    );
  }
}