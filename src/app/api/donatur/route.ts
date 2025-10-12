import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateDonatur, deleteDonatur } from "@/lib/services/supabase/donatur";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, alamat, jumlah, bulan, tahun } = body;

    // Validate required fields
    if (!nama || !alamat || !jumlah || !bulan || !tahun) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the next number for this year
    const { data: lastDonatur, error: countError } = await supabaseAdmin
      .from("Donatur")
      .select("no")
      .eq("tahun", tahun)
      .order("no", { ascending: false })
      .limit(1);

    if (countError) {
      console.error("Error getting last donatur number:", countError);
      return NextResponse.json(
        { error: "Failed to get next number" },
        { status: 500 }
      );
    }

    const nextNo = lastDonatur && lastDonatur.length > 0 ? lastDonatur[0].no + 1 : 1;

    // Create donatur data
    const donaturData = {
      no: nextNo,
      nama,
      alamat,
      tahun,
      [bulan]: jumlah,
    };

    const { data, error } = await supabaseAdmin
      .from("Donatur")
      .insert(donaturData)
      .select()
      .single();

    if (error) {
      console.error("Error creating donatur:", error);
      return NextResponse.json(
        { error: "Failed to create donatur" },
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

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Gunakan service untuk validasi dan auto-sync pemasukan
    const updated = await updateDonatur(Number(id), payload);
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating donatur via API:", error);
    return NextResponse.json(
      { error: "Failed to update donatur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let id: number | null = null;
    // Terima id dari body atau query param
    try {
      const body = await request.json();
      if (body && body.id) id = Number(body.id);
    } catch (_) {
      // ignore body parse errors, may not have body
    }

    if (!id) {
      const url = new URL(request.url);
      const idParam = url.searchParams.get("id");
      if (idParam) id = Number(idParam);
    }

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const ok = await deleteDonatur(id);
    return NextResponse.json({ success: ok }, { status: 200 });
  } catch (error) {
    console.error("Error deleting donatur via API:", error);
    return NextResponse.json(
      { error: "Failed to delete donatur" },
      { status: 500 }
    );
  }
}