import { NextRequest, NextResponse } from 'next/server';
import { getVisiMisiById, updateVisiMisi, deleteVisiMisi, UpdateVisiMisiData } from '@/lib/services/supabase/visi-misi';
import { z } from 'zod';

// Schema untuk validasi input update
const updateVisiMisiSchema = z.object({
  kategori: z.enum(['MASJID', 'REMAS', 'MAJLIS_TALIM']).optional(),
  jenis: z.enum(['VISI', 'MISI']).optional(),
  konten: z.string().min(10).max(1000).optional(),
  divisi: z.string().optional().nullable(),
  urutan: z.number().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

// GET - Ambil visi misi berdasarkan ID
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

    const { data, error } = await getVisiMisiById(id);

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

// PUT - Update visi misi
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
    const validatedData = updateVisiMisiSchema.parse(body);

    const { data, error } = await updateVisiMisi(id, validatedData as UpdateVisiMisiData);

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
      message: 'Visi misi berhasil diperbarui',
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

    console.error('Error updating visi misi:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui visi misi',
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus visi misi
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

    const { success, error } = await deleteVisiMisi(id);

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
      message: 'Visi misi berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting visi misi:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus visi misi',
      },
      { status: 500 }
    );
  }
}