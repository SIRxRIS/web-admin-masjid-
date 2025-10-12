import { NextResponse } from "next/server";
import { createTransaksiDonatur } from "@/lib/services/supabase/penagihan-donatur";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body may contain: { donaturId, tahun, jumlah, bulan?, bulanList?, mode? }
    const result = await createTransaksiDonatur(body);
    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Error" }, { status: 400 });
  }
}