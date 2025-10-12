import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';

// Schema untuk validasi input profile
const profileSchema = z.object({
  userId: z.string().uuid(),
  nama: z.string().min(1).max(255),
  jabatan: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'BENDAHARA', 'SEKRETARIS', 'ANGGOTA']),
  fotoUrl: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  is_profile_complete: z.boolean().default(false),
});

const updateProfileSchema = profileSchema.partial().omit({ userId: true });

// GET - Ambil semua profile atau berdasarkan query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const isComplete = searchParams.get('isComplete');

    let query = supabaseAdmin
      .from('profile')
      .select('*')
      .order('createdAt', { ascending: false });

    if (userId) {
      query = query.eq('userId', userId);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (isComplete !== null) {
      query = query.eq('is_profile_complete', isComplete === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Gagal mengambil data profile',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data profile',
      },
      { status: 500 }
    );
  }
}

// POST - Buat profile baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    const validatedData = profileSchema.parse(body);

    // Cek apakah profile dengan userId sudah ada
    const { data: existingProfile } = await supabaseAdmin
      .from('profile')
      .select('id')
      .eq('userId', validatedData.userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          message: 'Profile untuk user ini sudah ada',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('profile')
      .insert([
        {
          ...validatedData,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Gagal membuat profile',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile berhasil dibuat',
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

    console.error('Error creating profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal membuat profile',
      },
      { status: 500 }
    );
  }
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID profile diperlukan',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validasi input
    const validatedData = updateProfileSchema.parse(body);

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('profile')
      .update({
        ...validatedData,
        updatedAt: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Gagal mengupdate profile',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile berhasil diupdate',
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

    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengupdate profile',
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID profile diperlukan',
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('profile')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting profile:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Gagal menghapus profile',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus profile',
      },
      { status: 500 }
    );
  }
}