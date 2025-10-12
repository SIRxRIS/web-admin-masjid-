import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, lokasi, jumlah, bulan, tahun } = body;

    // Validate required fields
    if (!nama || !lokasi || !jumlah || !bulan || !tahun) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the next number
    const { data: lastKotakAmal, error: countError } = await supabaseAdmin
      .from("KotakAmal")
      .select("no")
      .order("no", { ascending: false })
      .limit(1);

    if (countError) {
      console.error("Error getting last kotak amal number:", countError);
      return NextResponse.json(
        { error: "Failed to get next number" },
        { status: 500 }
      );
    }

    const nextNo = lastKotakAmal && lastKotakAmal.length > 0 ? lastKotakAmal[0].no + 1 : 1;

    // Create kotak amal data
    const kotakAmalData = {
      no: nextNo,
      nama,
      lokasi,
      tahun,
      [bulan]: jumlah,
    };

    const { data, error } = await supabaseAdmin
      .from("KotakAmal")
      .insert(kotakAmalData)
      .select()
      .single();

    if (error) {
      console.error("Error creating kotak amal:", error);
      return NextResponse.json(
        { error: "Failed to create kotak amal" },
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
      .from("KotakAmal")
      .update({ ...payload, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating kotak amal:", error);
      return NextResponse.json({ error: "Failed to update kotak amal" }, { status: 500 });
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
      .from("KotakAmal")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting kotak amal:", error);
      return NextResponse.json({ error: "Failed to delete kotak amal" }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}