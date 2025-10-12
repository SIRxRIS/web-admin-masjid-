import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const roleParam = url.searchParams.get("role");
    const userId = url.searchParams.get("userId");

    if (!roleParam) {
      return NextResponse.json({ error: "Missing role" }, { status: 400 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        targetRoles: {
          has: roleParam as any,
        },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    const data = notifications.map((n) => ({
      ...n,
      isReadByUser: userId ? n.readBy.includes(userId) : undefined,
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil notifikasi" },
      { status: 500 }
    );
  }
}