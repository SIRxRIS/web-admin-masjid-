// src/app/api/pengurus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPengurusWithFoto } from "@/lib/services/supabase/pengurus";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract data dari formData
    const nama = formData.get("nama") as string;
    const no = parseInt(formData.get("no") as string);
    const jabatan = formData.get("jabatan") as string;
    const periode = formData.get("periode") as string;
    const kategori = formData.get("kategori") as string || "MASJID";
    const file = formData.get("file") as File | null;

    // Validasi data
    if (!nama || !jabatan || !periode || isNaN(no)) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const pengurusData = {
      nama,
      no,
      jabatan,
      periode,
      kategori,
    };

    const result = await createPengurusWithFoto(pengurusData, file);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Data pengurus berhasil disimpan",
    });
  } catch (error) {
    console.error("Error creating pengurus:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data pengurus" },
      { status: 500 }
    );
  }
}
