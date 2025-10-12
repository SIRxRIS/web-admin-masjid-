import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tanggal, jumlah } = body;

    // Validate required fields
    if (!tanggal || !jumlah) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract year from date
    const date = new Date(tanggal);
    const tahun = date.getFullYear();

    // Create kotak amal masjid data
    const kotakAmalMasjidData = {
      tanggal,
      jumlah,
      tahun,
    };

    const { data, error } = await supabaseAdmin
      .from("KotakAmalMasjid")
      .insert(kotakAmalMasjidData)
      .select()
      .single();

    if (error) {
      console.error("Error creating kotak amal masjid:", error);
      return NextResponse.json(
        { error: "Failed to create kotak amal masjid" },
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
      .from("KotakAmalMasjid")
      .update({ ...payload, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating kotak amal masjid:", error);
      return NextResponse.json({ error: "Failed to update kotak amal masjid" }, { status: 500 });
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
      .from("KotakAmalMasjid")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting kotak amal masjid:", error);
      return NextResponse.json({ error: "Failed to delete kotak amal masjid" }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}