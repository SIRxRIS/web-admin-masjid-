"use server";

import { prisma } from "@/lib/prisma";
import { NotificationType, NotificationPriority, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  targetRoles: Role[];
  actionUrl?: string;
  relatedId?: string;
  relatedTable?: string;
  createdBy?: string;
  expiresAt?: Date;
}

// Membuat notifikasi baru
export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || NotificationPriority.MEDIUM,
        targetRoles: data.targetRoles,
        actionUrl: data.actionUrl,
        relatedId: data.relatedId,
        relatedTable: data.relatedTable,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt,
      },
    });

    revalidatePath("/");
    return { success: true, data: notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Gagal membuat notifikasi" };
  }
}

// Mendapatkan notifikasi berdasarkan role user
export async function getNotificationsByRole(userRole: Role, userId?: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        targetRoles: {
          has: userRole,
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
      take: 50, // Limit untuk performa
    });

    // Jika userId disediakan, tandai notifikasi mana yang sudah dibaca
    if (userId) {
      const notificationsWithReadStatus = notifications.map(notification => ({
        ...notification,
        isReadByUser: notification.readBy.includes(userId),
      }));
      return { success: true, data: notificationsWithReadStatus };
    }

    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Gagal mengambil notifikasi" };
  }
}

// Menandai notifikasi sebagai sudah dibaca
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { readBy: true }
    });

    if (!notification) {
      return { success: false, error: "Notifikasi tidak ditemukan" };
    }

    // Jika user belum membaca, tambahkan ke readBy array
    if (!notification.readBy.includes(userId)) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          readBy: {
            push: userId
          }
        }
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Gagal menandai notifikasi sebagai dibaca" };
  }
}

// Menghapus notifikasi (hanya untuk admin)
export async function deleteNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Gagal menghapus notifikasi" };
  }
}

// Mendapatkan jumlah notifikasi yang belum dibaca
export async function getUnreadNotificationCount(userRole: Role, userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        targetRoles: {
          has: userRole,
        },
        NOT: {
          readBy: {
            has: userId
          }
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    return { success: true, data: count };
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return { success: false, error: "Gagal mengambil jumlah notifikasi belum dibaca" };
  }
}

// Helper functions untuk membuat notifikasi spesifik

// Notifikasi untuk pengurus - Target pemasukan
export async function createTargetPemasukanNotification(
  isAchieved: boolean,
  targetAmount: number,
  actualAmount: number,
  month: string,
  year: number
) {
  const title = isAchieved 
    ? "🎉 Target Pemasukan Tercapai!" 
    : "⚠️ Target Pemasukan Belum Tercapai";
  
  const message = isAchieved
    ? `Target pemasukan bulan ${month} ${year} sebesar Rp ${targetAmount.toLocaleString()} telah tercapai dengan total Rp ${actualAmount.toLocaleString()}.`
    : `Target pemasukan bulan ${month} ${year} sebesar Rp ${targetAmount.toLocaleString()} belum tercapai. Saat ini: Rp ${actualAmount.toLocaleString()}.`;

  return createNotification({
    title,
    message,
    type: NotificationType.TARGET_PEMASUKAN,
    priority: isAchieved ? NotificationPriority.MEDIUM : NotificationPriority.HIGH,
    targetRoles: [Role.PENGURUS],
    actionUrl: "/admin/laporan-keuangan",
  });
}

// Notifikasi untuk pengurus - Donasi baru
export async function createDonasiBaruNotification(
  donorName: string,
  amount: number,
  type: string
) {
  return createNotification({
    title: "💰 Donasi Khusus Baru Masuk",
    message: `Donasi ${type} sebesar Rp ${amount.toLocaleString()} dari ${donorName} baru saja diterima.`,
    type: NotificationType.DONASI_BARU,
    priority: NotificationPriority.MEDIUM,
    targetRoles: [Role.PENGURUS],
    actionUrl: "/admin/keuangan/donasi",
  });
}

// Notifikasi untuk pengurus - Konten baru
export async function createKontenBaruNotification(
  contentTitle: string,
  contentType: string,
  createdBy: string
) {
  return createNotification({
    title: "📝 Konten Baru Ditambahkan",
    message: `${contentType} "${contentTitle}" baru saja ditambahkan oleh ${createdBy}.`,
    type: NotificationType.KONTEN_BARU,
    priority: NotificationPriority.LOW,
    targetRoles: [Role.PENGURUS],
    actionUrl: "/admin/konten",
  });
}

// Notifikasi untuk pengurus - Inventaris baru
export async function createInventarisBaruNotification(
  itemName: string,
  quantity: number,
  createdBy: string
) {
  return createNotification({
    title: "📦 Inventaris Baru Ditambahkan",
    message: `Item "${itemName}" (${quantity} unit) baru saja ditambahkan ke inventaris oleh ${createdBy}.`,
    type: NotificationType.INVENTARIS_BARU,
    priority: NotificationPriority.LOW,
    targetRoles: [Role.PENGURUS],
    actionUrl: "/admin/inventaris",
  });
}

// Notifikasi untuk admin - System health warning
export async function createSystemHealthWarning(
  issue: string,
  severity: "low" | "medium" | "high" | "critical"
) {
  const priorityMap = {
    low: NotificationPriority.LOW,
    medium: NotificationPriority.MEDIUM,
    high: NotificationPriority.HIGH,
    critical: NotificationPriority.URGENT,
  };

  return createNotification({
    title: "⚠️ System Health Warning",
    message: `Terdeteksi masalah sistem: ${issue}. Segera lakukan pengecekan.`,
    type: NotificationType.SYSTEM_HEALTH,
    priority: priorityMap[severity],
    targetRoles: [Role.ADMIN],
    actionUrl: "/admin/system-health",
  });
}

// Notifikasi untuk admin - Email whitelist baru
export async function createEmailWhitelistNotification(
  email: string,
  jabatan: string,
  role: string,
  addedBy: string
) {
  return createNotification({
    title: "✉️ Email Whitelist Baru",
    message: `Email ${email} dengan jabatan ${jabatan} (${role}) baru saja ditambahkan ke whitelist oleh ${addedBy}.`,
    type: NotificationType.EMAIL_WHITELIST,
    priority: NotificationPriority.MEDIUM,
    targetRoles: [Role.ADMIN],
    actionUrl: "/admin/email-whitelist",
  });
}