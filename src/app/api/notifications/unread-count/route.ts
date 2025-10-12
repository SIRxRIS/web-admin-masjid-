import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const roleParam = url.searchParams.get("role");
    const userId = url.searchParams.get("userId");

    if (!roleParam || !userId) {
      return NextResponse.json(
        { error: "Missing role or userId" },
        { status: 400 }
      );
    }

    const count = await prisma.notification.count({
      where: {
        targetRoles: {
          has: roleParam as any,
        },
        NOT: {
          readBy: {
            has: userId,
          },
        },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    return NextResponse.json({ success: true, data: count }, { status: 200 });
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil jumlah notifikasi belum dibaca" },
      { status: 500 }
    );
  }
}