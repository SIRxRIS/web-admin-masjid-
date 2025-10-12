import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, tanggal, jumlah, keterangan } = body;

    // Validate required fields
    if (!nama || !tanggal || !jumlah) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the next number
    const { data: lastDonasiKhusus, error: countError } = await supabaseAdmin
      .from("DonasiKhusus")
      .select("no")
      .order("no", { ascending: false })
      .limit(1);

    if (countError) {
      console.error("Error getting last donasi khusus number:", countError);
      return NextResponse.json(
        { error: "Failed to get next number" },
        { status: 500 }
      );
    }

    const nextNo = lastDonasiKhusus && lastDonasiKhusus.length > 0 ? lastDonasiKhusus[0].no + 1 : 1;

    // Extract year from date
    const dateObj = new Date(tanggal);
    const tahun = dateObj.getFullYear();

    // Create donasi khusus data
    const donasiKhususData = {
      no: nextNo,
      nama,
      tanggal,
      tahun,
      jumlah,
      keterangan: keterangan || "",
    };

    const { data, error } = await supabaseAdmin
      .from("DonasiKhusus")
      .insert(donasiKhususData)
      .select()
      .single();

    if (error) {
      console.error("Error creating donasi khusus:", error);
      return NextResponse.json(
        { error: "Failed to create donasi khusus" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...payload } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("DonasiKhusus")
      .update({ ...payload, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating donasi khusus:", error);
      return NextResponse.json({ error: "Failed to update donasi khusus" }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const id = idParam ? Number(idParam) : null;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("DonasiKhusus")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting donasi khusus:", error);
      return NextResponse.json({ error: "Failed to delete donasi khusus" }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}