import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId } = body || {};

    if (!notificationId || !userId) {
      return NextResponse.json(
        { error: "Missing notificationId or userId" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { readBy: true },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notifikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!notification.readBy.includes(userId)) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readBy: { push: userId } },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menandai notifikasi sebagai dibaca" },
      { status: 500 }
    );
  }
}