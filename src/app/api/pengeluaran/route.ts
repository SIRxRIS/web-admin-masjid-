import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tanggal, keterangan, jumlah, kategori } = body;

    // Validate required fields
    if (!tanggal || !keterangan || !jumlah) {
      return NextResponse.json(
        { error: "Field tanggal, keterangan, dan jumlah wajib diisi" },
        { status: 400 }
      );
    }

    // Extract year from date
    const date = new Date(tanggal);
    const tahun = date.getFullYear();
    const bulan = date.getMonth() + 1; // getMonth() returns 0-11

    // Get the next number for this year
    const { data: lastPengeluaran, error: countError } = await supabaseAdmin
      .from("Pengeluaran")
      .select("no")
      .eq("tahun", tahun)
      .order("no", { ascending: false })
      .limit(1);

    if (countError) {
      console.error("Error getting last pengeluaran number:", countError);
      return NextResponse.json(
        { error: "Gagal mendapatkan nomor urut" },
        { status: 500 }
      );
    }

    const nextNo = lastPengeluaran && lastPengeluaran.length > 0 ? lastPengeluaran[0].no + 1 : 1;

    // Create pengeluaran data
    const pengeluaranData = {
      no: nextNo,
      tanggal,
      keterangan,
      jumlah,
      kategori: kategori || "UMUM",
      tahun,
      bulan,
    };

    const { data, error } = await supabaseAdmin
      .from("Pengeluaran")
      .insert(pengeluaranData)
      .select()
      .single();

    if (error) {
      console.error("Error creating pengeluaran:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan data pengeluaran" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data,
      message: "Data pengeluaran berhasil disimpan"
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
    const tahun = searchParams.get("tahun");
    const kategori = searchParams.get("kategori");

    let query = supabaseAdmin.from("Pengeluaran").select("*");

    if (tahun) {
      query = query.eq("tahun", parseInt(tahun));
    }

    if (kategori) {
      query = query.eq("kategori", kategori);
    }

    query = query.order("tanggal", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching pengeluaran:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data pengeluaran" },
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
    const { id, tanggal, keterangan, jumlah, kategori } = body;
    if (!id || !tanggal || !keterangan || !jumlah) {
      return NextResponse.json(
        { error: "Field id, tanggal, keterangan, dan jumlah wajib diisi" },
        { status: 400 }
      );
    }

    const date = new Date(tanggal);
    const tahun = date.getFullYear();
    const bulan = date.getMonth() + 1;

    const updateData = {
      tanggal,
      keterangan,
      jumlah,
      kategori: kategori || "UMUM",
      tahun,
      bulan,
    };

    const { data, error } = await supabaseAdmin
      .from("Pengeluaran")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pengeluaran:", error);
      return NextResponse.json(
        { error: "Gagal memperbarui data pengeluaran" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
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
        { error: "ID pengeluaran wajib diisi" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("Pengeluaran")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      console.error("Error deleting pengeluaran:", error);
      return NextResponse.json(
        { error: "Gagal menghapus data pengeluaran" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Data pengeluaran berhasil dihapus" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}