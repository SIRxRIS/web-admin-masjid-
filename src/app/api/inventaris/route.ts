import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, kategori, kondisi, jumlah, satuan, tanggal_masuk, keterangan } = body;

    // Validate required fields
    if (!nama || !kategori || !kondisi || !jumlah || !satuan) {
      return NextResponse.json(
        { error: "Field nama, kategori, kondisi, jumlah, dan satuan wajib diisi" },
        { status: 400 }
      );
    }

    // Extract year from date if provided
    const tahun = tanggal_masuk ? new Date(tanggal_masuk).getFullYear() : new Date().getFullYear();

    // Get the next number
    const { data: lastInventaris, error: countError } = await supabaseAdmin
      .from("Inventaris")
      .select("no")
      .order("no", { ascending: false })
      .limit(1);

    if (countError) {
      console.error("Error getting last inventaris number:", countError);
      return NextResponse.json(
        { error: "Gagal mendapatkan nomor urut" },
        { status: 500 }
      );
    }

    const nextNo = lastInventaris && lastInventaris.length > 0 ? lastInventaris[0].no + 1 : 1;

    // Create inventaris data
    const inventarisData = {
      no: nextNo,
      nama,
      kategori,
      kondisi,
      jumlah,
      satuan,
      tanggal_masuk: tanggal_masuk || new Date().toISOString().split('T')[0],
      keterangan: keterangan || "",
      tahun,
    };

    const { data, error } = await supabaseAdmin
      .from("Inventaris")
      .insert(inventarisData)
      .select()
      .single();

    if (error) {
      console.error("Error creating inventaris:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan data inventaris" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data,
      message: "Data inventaris berhasil disimpan"
    }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori");
    const kondisi = searchParams.get("kondisi");
    const tahun = searchParams.get("tahun");

    let query = supabaseAdmin.from("Inventaris").select("*");

    if (kategori) {
      query = query.eq("kategori", kategori);
    }

    if (kondisi) {
      query = query.eq("kondisi", kondisi);
    }

    if (tahun) {
      query = query.eq("tahun", parseInt(tahun));
    }

    query = query.order("tanggal_masuk", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching inventaris:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data inventaris" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data 
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nama, kategori, kondisi, jumlah, satuan, keterangan } = body;

    // Validate required fields
    if (!id || !nama || !kategori || !kondisi || !jumlah || !satuan) {
      return NextResponse.json(
        { error: "Field id, nama, kategori, kondisi, jumlah, dan satuan wajib diisi" },
        { status: 400 }
      );
    }

    // Update inventaris data
    const updateData = {
      nama,
      kategori,
      kondisi,
      jumlah,
      satuan,
      keterangan: keterangan || "",
    };

    const { data, error } = await supabaseAdmin
      .from("Inventaris")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventaris:", error);
      return NextResponse.json(
        { error: "Gagal memperbarui data inventaris" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data,
      message: "Data inventaris berhasil diperbarui"
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID inventaris wajib diisi" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("Inventaris")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      console.error("Error deleting inventaris:", error);
      return NextResponse.json(
        { error: "Gagal menghapus data inventaris" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Data inventaris berhasil dihapus"
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}