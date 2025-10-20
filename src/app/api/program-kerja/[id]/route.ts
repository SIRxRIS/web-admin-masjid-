// File: src/app/api/program-kerja/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getProgramKerjaById, updateProgramKerja, deleteProgramKerja, UpdateProgramKerjaData } from '@/lib/services/supabase/program-kerja';
import { z } from 'zod';

// Schema untuk validasi input update
const updateProgramKerjaSchema = z.object({
  kategori: z.enum(['PENGURUS_MASJID', 'REMAS', 'MAJLIS_TALIM']).optional(),
  seksi: z.string().min(2).max(100).optional(),
  judul: z.string().min(10).max(1000).optional(),
  deskripsi: z.string().optional().nullable(),
  urutan: z.number().min(1).max(100).optional(),
  tahun: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET - Ambil program kerja berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID tidak valid',
        },
        { status: 400 }
      );
    }

    const { data, error } = await getProgramKerjaById(id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
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

// PUT - Update program kerja
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID tidak valid',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validasi input
    const validatedData = updateProgramKerjaSchema.parse(body);

    const { data, error } = await updateProgramKerja(id, validatedData as UpdateProgramKerjaData);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: error.includes('tidak ditemukan') ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Program kerja berhasil diperbarui',
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

    console.error('Error updating program kerja:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui program kerja',
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus program kerja
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID tidak valid',
        },
        { status: 400 }
      );
    }

    const { success, error } = await deleteProgramKerja(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: error?.includes('tidak ditemukan') ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Program kerja berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting program kerja:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus program kerja',
      },
      { status: 500 }
    );
  }
}