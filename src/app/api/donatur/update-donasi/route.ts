import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createTransaksiDonatur } from "@/lib/services/supabase/penagihan-donatur";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donaturId, bulan, tahun, nominal } = body;

    // Validate required fields
    if (!donaturId || !bulan || !tahun || nominal === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: donaturId, bulan, tahun, nominal" },
        { status: 400 }
      );
    }

    // Validate nominal is a number
    if (typeof nominal !== 'number' || nominal < 0) {
      return NextResponse.json(
        { error: "Nominal must be a non-negative number" },
        { status: 400 }
      );
    }

    // Get donatur data to verify it exists
    const { data: donatur, error: donaturError } = await supabaseAdmin
      .from("Donatur")
      .select("*")
      .eq("id", donaturId)
      .eq("tahun", tahun)
      .single();

    if (donaturError || !donatur) {
      return NextResponse.json(
        { error: "Donatur not found" },
        { status: 404 }
      );
    }

    // Update the donatur's monthly donation amount
    const updateData = {
      [bulan]: nominal
    };

    const { data: updatedDonatur, error: updateError } = await supabaseAdmin
      .from("Donatur")
      .update(updateData)
      .eq("id", donaturId)
      .eq("tahun", tahun)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating donatur:", updateError);
      return NextResponse.json(
        { error: "Failed to update donatur donation" },
        { status: 500 }
      );
    }

    // Create transaction record using the existing service
    try {
      const transactionData = {
        donaturId: parseInt(donaturId),
        tahun: tahun,
        jumlah: nominal,
        bulan: getMonthNumber(bulan),
        mode: "replace" as const // Replace existing amount
      };

      await createTransaksiDonatur(transactionData);
    } catch (transactionError) {
      console.error("Error creating transaction:", transactionError);
      // Don't fail the whole operation if transaction creation fails
      // The donatur update is more important
    }

    return NextResponse.json({
      success: true,
      data: updatedDonatur,
      message: "Donasi berhasil diupdate"
    });

  } catch (error) {
    console.error("Error in update-donasi API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to convert month string to number
function getMonthNumber(monthKey: string): number {
  const monthMap: { [key: string]: number } = {
    jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, des: 12
  };
  return monthMap[monthKey] || 1;
}