import { NextRequest, NextResponse } from "next/server";
import { getStatistikPemasukan } from "@/lib/services/supabase/pemasukan/pemasukan";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Ambil data statistik yang sudah ter-optimasi
    const statistikData = await getStatistikPemasukan(year);

    return NextResponse.json({
      monthlyData: statistikData.dataBulanan,
      totalTahunan: statistikData.totalTahunan,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in realtime update:", error);
    return NextResponse.json(
      { error: "Gagal mengambil update data" },
      { status: 500 }
    );
  }
}