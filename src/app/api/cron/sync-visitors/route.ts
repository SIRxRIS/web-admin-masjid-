import { NextRequest, NextResponse } from "next/server";
import { syncDailyVisitorData } from "@/lib/services/supabase/daily-visitor-sync";

export async function GET(request: NextRequest) {
  const authToken = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authToken !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncDailyVisitorData();
    return NextResponse.json({
      success: true,
      message: "Daily visitor data synced successfully",
      data: result,
    });
  } catch (error) {
    console.error("[API] Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync visitor data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
