import { NextRequest, NextResponse } from "next/server";
import { getCloudflareMonthlyVisitors } from "@/lib/services/cloudflare/analytics";

function parseParam(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

export async function GET(request: NextRequest) {
  const now = new Date();
  const url = new URL(request.url);
  const year = parseParam(url.searchParams.get("year"), now.getUTCFullYear());
  const month = parseParam(url.searchParams.get("month"), now.getUTCMonth() + 1);
  try {
    const result = await getCloudflareMonthlyVisitors(year, month);
    return NextResponse.json({
      visitors: result.visitors,
      range: result.range,
    });
  } catch (error) {
    console.error("Failed to fetch Cloudflare visitors: ", error);
    return NextResponse.json(
      { visitors: 0, range: { since: null, until: null } },
      { status: 200 }
    );
  }
}
